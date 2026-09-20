# Updating the upstream version

Upstream is tracked as a prebuilt Docker image, `miniflux/miniflux`, pinned by tag in
`startos/manifest/index.ts` (`images.miniflux.source.dockerTag`). The `postgres` image is pinned
independently and does not need to move in lockstep with Miniflux — bump it separately, on its own
schedule, checking Docker Hub for the architectures it ships (`x86_64`, `aarch64`) each time.

## Determining the upstream version

- Latest release: `gh release view -R miniflux/v2 --json tagName -q .tagName` (tags have no `v`
  prefix, e.g. `2.3.3`).
- Confirm the tag is published as a multi-arch image on Docker Hub before pinning it:
  `curl -s https://hub.docker.com/v2/repositories/miniflux/miniflux/tags/<tag> | jq '.images[].architecture'`
  — must include both `amd64` and `arm64`.

## Applying the bump

1. Update `images.miniflux.source.dockerTag` in `startos/manifest/index.ts` to the new tag.
2. Bump the version in `startos/versions/current.ts` to match (`<upstream-version>:0`) and update
   its release notes. Add a new version file only if this release also needs a migration — see
   `start-technologies/projects/start-sdk/docs/src/versions.md`.
3. Before bumping, diff upstream's `internal/config/options.go` (env var options) between the
   old and new tag for anything this package relies on: `RUN_MIGRATIONS`,
   `CREATE_ADMIN`/`ADMIN_USERNAME`/`ADMIN_PASSWORD`, `DATABASE_URL`, `LISTEN_ADDR`,
   `INTEGRATION_ALLOW_PRIVATE_NETWORKS`, `BASE_URL` — and `internal/crypto/crypto.go` plus the
   `users` table migrations for the password column and its bcrypt hashing, which the
   `admin-password` oneshot in `startos/main.ts` writes directly. A renamed option or a changed
   hash scheme breaks the package silently until someone hits it.
4. Rebuild (`make`) and reinstall on a real StartOS box — confirm the daemon starts, migrations
   run, and a password from **Set Admin Password** still logs in on the new version.
