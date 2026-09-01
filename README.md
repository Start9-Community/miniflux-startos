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
network namespace.

## Volume and Data Layout

A single volume, `main`, holds everything this package persists:

| Mount point (inside `postgres`) | Subpath on `main` | Contents                         |
| ------------------------------- | ----------------- | -------------------------------- |
| `/var/lib/postgresql`           | `postgresql`      | PostgreSQL data directory        |
| (not mounted into a container)  | `store.json`      | This package's own StartOS state |

The `miniflux` subcontainer mounts nothing — Miniflux keeps no state outside its database.

## File Models

- **`store.json`** (on `main`, StartOS-side state, never read by Miniflux itself): holds the
  generated PostgreSQL password, the generated admin username/password, whether the user has
  retrieved that password yet, and the chosen primary URL. Seeded once on install
  (`init/seedFiles.ts`); the admin password field is rewritten only by the **Set Admin Password**
  action, and the primary-URL field only by the **Set Primary URL** action or the install-time
  default-selection logic. A hand edit to this file is not read back by anything but this
  package's own `main.ts` on its next reactive run, and will be overwritten the next time the
  corresponding action runs.
- Miniflux itself owns no on-disk config file — every setting this package manages is delivered
  by environment variable (`DATABASE_URL`, `RUN_MIGRATIONS`, `CREATE_ADMIN`, `ADMIN_USERNAME`,
  `ADMIN_PASSWORD`, `LISTEN_ADDR`, `BASE_URL`), re-asserted on every daemon start from the current
  contents of `store.json`. `CREATE_ADMIN` in particular only ever creates the admin account
  once — Miniflux silently skips it if the username already exists — so it never overwrites a
  password rotated after install.

## Dependencies

None. PostgreSQL runs as an in-package sidecar, not a StartOS-level dependency.

## Network Access and Interfaces

| Interface id | Type | Port (internal) | Protocol | Purpose                                                                        |
| ------------ | ---- | --------------- | -------- | ------------------------------------------------------------------------------ |
| `ui`         | `ui` | 8080            | http     | The Miniflux web app and its REST API (same origin, no separate API interface) |

## Installation and First-Run Flow

On install, `init/seedFiles.ts` generates the PostgreSQL password and a random admin password
(username `admin`) before the daemon ever starts — Miniflux needs `CREATE_ADMIN` populated with
real credentials on its very first boot, so this can't wait on user interaction. The user never
sees this password until they run **Set Admin Password** (see Tasks below), and running it also
rotates it to a fresh value, so the credential nobody has seen is never the one that ships.

The primary URL defaults to whichever of the service's own non-local addresses looks like a
`.local` address, chosen automatically on install; the user can change it later with **Set
Primary URL**.

`INTEGRATION_ALLOW_PRIVATE_NETWORKS=1` is always set — upstream defaults this off as SSRF
hardening, but every third-party integration target reachable from a StartOS install (Karakeep,
Wallabag, etc.) is itself on a private/LAN address, and Miniflux's client otherwise refuses those
silently (no error surfaced in the integrations UI, the "Save" button on an entry just does
nothing).

## Actions

- **Set Admin Password** (`set-admin-password`) — Run this once after install to retrieve your
  login. It always generates a brand-new password and applies it through Miniflux's own REST API
  (`PUT /v1/users/{id}`, authenticated with the password currently on record), then returns the
  username and new password. Takes a few seconds; requires Miniflux to be running, since the
  application has no offline way to change an existing user's password. Safe to run repeatedly —
  each run invalidates the previous password. If the admin password was ever changed from inside
  Miniflux itself (rather than through this action), this action can no longer authenticate and
  will report a failure — in that case, use Miniflux's own account-recovery options.
- **Set Primary URL** (`set-primary-url`) — Pick which of the service's reachable addresses
  Miniflux uses for `BASE_URL`. This affects links stamped into feed entries, WebSub callback
  URLs, and OAuth2 redirect URLs — pick the address readers of those links will actually use.
  Takes effect on the next daemon restart; instant and idempotent.

## Tasks

- **Retrieve your admin login credentials** — raised on install and stays until **Set Admin
  Password** is run at least once (tracked by `store.json`'s `adminPasswordSeen` flag).
  Severity: `important`, deliberately not `critical` — the action that clears it requires
  Miniflux to be running (it calls the app's own API), so a `critical` task here would block
  the service from ever starting and lock the user out of clearing it.
- **Primary URL is no longer available. Select a new one.** — raised if the previously-selected
  primary URL (an interface address) disappears, e.g. a LAN address changes. Severity: `critical`.
  Clears when **Set Primary URL** is run with a currently-available address.

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
not a `pg_dump`. A restored instance comes back with its database, generated credentials, and
primary-URL choice intact; nothing needs to be re-entered.

## Limitations and Differences

1. Only the built-in local-account authentication is wired up. Miniflux's OAuth2/OIDC and
   reverse-proxy authentication options are present in the environment-variable surface upstream
   documents, but this package does not expose them as StartOS actions — set them by hand via a
   future package update if needed.
2. The admin password can only be rotated while Miniflux is running, since rotation goes through
   its own REST API rather than a config file or CLI flag (Miniflux's `-reset-password` CLI
   command requires an interactive terminal and cannot be scripted).

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
  - BASE_URL
dependencies: none
interfaces:
  ui: { type: ui, port: 8080 }
actions:
  - set-admin-password
  - set-primary-url
tasks:
  - { action: set-admin-password, severity: important }
  - { action: set-primary-url, severity: critical }
health_checks:
  - postgres
  - miniflux
```
