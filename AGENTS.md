# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Fix a defect you spot rather than reporting it** — you have the package open and the
context to be sure. File **a GitHub issue on this repo** only when the call isn't yours to
make: you can't pin the cause down, two defensible fixes exist, or it's too large to ride on
the work in hand. An open issue is a report, not a queue — implement one when you're asked
to or when it's labelled `Approved`, then close it with `Closes #<n>`.

Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- Admin-password rotation (`startos/actions/setAdminPassword.ts`) talks to Miniflux's own REST
  API over loopback rather than exec'ing a CLI: Miniflux's `-reset-password` flag requires a real
  interactive terminal (checked with `term.IsTerminal`), which a scripted `exec` can't satisfy,
  and `CREATE_ADMIN` silently no-ops once the username already exists. If a future upstream
  release adds a non-interactive password-reset path, prefer it over the API call.
- The `miniflux` and `postgres` subcontainers share this package's loopback network namespace
  (same pattern as `enshu-startos` and `arx-startos`) — `main.ts` and the admin-password action
  both reach each other over `127.0.0.1`, never a bridge address.
- See `UPDATING.md` before bumping the upstream image tag — the admin-password action depends on
  two specific Miniflux API routes that a release could change.
