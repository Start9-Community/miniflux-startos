<p align="center">
  <img src="icon.svg" alt="Miniflux Logo" width="21%">
</p>

# Miniflux on StartOS

> Everything not listed in this document should behave the same as upstream Miniflux.
> If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable — see the Documentation section of
> `instructions.md` for links.

Miniflux is a minimalist, opinionated RSS/Atom/JSON feed reader. This package runs it against a
PostgreSQL sidecar and wires its admin account and public address into StartOS. See
[the upstream project](https://github.com/miniflux/v2) for the application itself.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

Two subcontainers make up this package, both unmodified upstream images run with their own
entrypoints (`sdk.useEntrypoint()`) — this package adds no custom scripts or Dockerfile.

| Subcontainer | Image                              | Purpose                                                  |
| ------------ | ---------------------------------- | -------------------------------------------------------- |
| `postgres`   | Official `postgres` image          | Database backing Miniflux's feeds, entries, and accounts |
| `miniflux`   | Official `miniflux/miniflux` image | The Miniflux application itself                          |

Architectures: x86_64, aarch64. `postgres` binds to `127.0.0.1` only and is never exposed via any
interface — `miniflux` reaches it over loopback, since both subcontainers share this package's
network namespace. A third step, the `admin-password` oneshot, runs `psql` in the `postgres`
subcontainer after Miniflux is healthy on every start.

## Volume and Data Layout

A single volume, `main`, holds everything this package persists:

| Mount point (inside `postgres`) | Subpath on `main` | Contents                         |
| ------------------------------- | ----------------- | -------------------------------- |
| `/var/lib/postgresql`           | `postgresql`      | PostgreSQL data directory        |
| (not mounted into a container)  | `store.json`      | This package's own StartOS state |

The `miniflux` subcontainer mounts nothing — Miniflux keeps no state outside its database.

## File Models

- **`store.json`** (on `main`, StartOS-side state, never read by Miniflux itself): holds the
  generated PostgreSQL password, the admin username and password, and the chosen primary URL.
  The Postgres password is seeded once on install (`init/seedFiles.ts`); the admin password is
  written only by **Set Admin Password**, and the primary-URL field only by **Set Primary URL** or
  the install-time default-selection logic. The admin password is re-asserted on every start (see
  below), so a hand edit to it takes effect on the next start; the other keys are read back by
  `main.ts` on its next reactive run and overwritten the next time the corresponding action runs.
- Miniflux itself owns no on-disk config file — every setting this package manages is delivered
  by environment variable (`DATABASE_URL`, `RUN_MIGRATIONS`, `CREATE_ADMIN`, `ADMIN_USERNAME`,
  `ADMIN_PASSWORD`, `LISTEN_ADDR`, `INTEGRATION_ALLOW_PRIVATE_NETWORKS`, `BASE_URL`), re-asserted
  on every daemon start from the current contents of `store.json`. `CREATE_ADMIN` only creates
  the admin account when it is missing, so `ADMIN_PASSWORD` alone would apply on the first start
  and never again; the `admin-password` oneshot writes the store's password into Miniflux's
  `users` table after every start, which is what makes the store authoritative.

## Dependencies

None. PostgreSQL runs as an in-package sidecar, not a StartOS-level dependency.

## Network Access and Interfaces

| Interface id | Type | Port (internal) | Protocol | Purpose                                                                        |
| ------------ | ---- | --------------- | -------- | ------------------------------------------------------------------------------ |
| `ui`         | `ui` | 8080            | http     | The Miniflux web app and its REST API (same origin, no separate API interface) |

## Installation and First-Run Flow

On install, `init/seedFiles.ts` generates the PostgreSQL password, and `init/watchAdminPassword.ts`
raises a critical task pointing at **Set Admin Password**, so the service cannot start until the
user has run it and holds the password. The first start then creates the admin account
(username `admin`) with that password through Miniflux's `CREATE_ADMIN`.

The primary URL defaults to whichever of the service's own non-local addresses looks like a
`.local` address, chosen automatically on install; the user can change it later with **Set
Primary URL**.

`INTEGRATION_ALLOW_PRIVATE_NETWORKS=1` is always set — upstream defaults this off as SSRF
hardening, but every third-party integration target reachable from a StartOS install (Karakeep,
Wallabag, etc.) is itself on a private/LAN address, and Miniflux's client otherwise refuses those
silently (no error surfaced in the integrations UI, the "Save" button on an entry just does
nothing).

## Actions

- **Set Admin Password** (`set-admin-password`) — Run it once after install, and again whenever
  the password should change or has been forgotten. It generates a fresh password, stores it, and
  returns the username and password; nothing is applied by the action itself. On a running
  service the store change restarts the daemons, and the `admin-password` oneshot writes the
  bcrypt hash of the stored password into the `users` row (via `psql` in the `postgres`
  subcontainer, using pgcrypto's `crypt(…, gen_salt('bf'))`, the same `$2a$` format Miniflux
  writes) — so the new password works within a few seconds; on a stopped service it applies at
  the next start. Safe to run repeatedly — each run invalidates the previous password. A
  confirmation warning appears once a password exists.
- **Set Primary URL** (`set-primary-url`) — Pick which of the service's reachable addresses
  Miniflux uses for `BASE_URL`. This affects links stamped into feed entries, WebSub callback
  URLs, and OAuth2 redirect URLs — pick the address readers of those links will actually use.
  The daemon restarts on the change; instant and idempotent.

## Tasks

- **Set the admin password before signing in to Miniflux** — raised on install and whenever
  `store.json` has no admin password. Severity: `critical` — the service does not start until
  **Set Admin Password** has been run once. It cannot return on its own; only removing the
  password from `store.json` by hand would raise it again.
- **Primary URL is no longer available. Select a new one.** — raised if the previously-selected
  primary URL (an interface address) disappears. Severity: `critical`. Clears when **Set Primary
  URL** is run with a currently-available address. Expect it after a restore from backup: the
  interface's assigned port changes with the reinstall, so the stored URL no longer matches.

## Health Checks

- **`postgres`** (internal, not shown to the user) — runs `pg_isready` against the database.
  Reports `loading` until the database accepts connections.
- **`miniflux` / Web Interface** — fetches `/healthcheck` on the app's own port. A failure here
  after a successful start usually means the database connection was lost or migrations failed
  partway; check the `miniflux` subcontainer's logs.

## Backups and Restore

Strategy: whole-volume snapshot (`sdk.Backups.ofVolumes('main')`). StartOS always stops the
service (including the `postgres` sidecar) before backing up, so the PostgreSQL data directory is
copied in a consistent, cold state — this is a plain filesystem backup of Postgres's own files,
not a `pg_dump`. A restored instance comes back stopped with its database and credentials intact. Its
interface is assigned a new port on reinstall, so the stored primary URL no longer matches and
the **Primary URL is no longer available** task holds the service until **Set Primary URL** is
run again.

## Limitations and Differences

1. Only the built-in local-account authentication is wired up. Miniflux's OAuth2/OIDC and
   reverse-proxy authentication options are present in the environment-variable surface upstream
   documents, but this package does not expose them as StartOS actions.
2. The admin password is owned by StartOS: a password changed from inside Miniflux is overwritten
   with the stored one on the next start. Change it with **Set Admin Password** instead.

---

## Quick Reference for AI Consumers

```yaml
package_id: 'miniflux'
image: docker.io/miniflux/miniflux
architectures: [x86_64, aarch64]
subcontainers: [postgres, miniflux]
volumes:
  main: { postgresql: /var/lib/postgresql, store.json: null }
file_models:
  - store.json
startos_managed_env_vars:
  - DATABASE_URL
  - RUN_MIGRATIONS
  - CREATE_ADMIN
  - ADMIN_USERNAME
  - ADMIN_PASSWORD
  - LISTEN_ADDR
  - INTEGRATION_ALLOW_PRIVATE_NETWORKS
  - BASE_URL
dependencies: none
interfaces:
  ui: { type: ui, port: 8080 }
actions:
  - set-admin-password
  - set-primary-url
tasks:
  - { action: set-admin-password, severity: critical }
  - { action: set-primary-url, severity: critical }
health_checks:
  - postgres
  - miniflux
```
