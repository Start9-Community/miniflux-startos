# Updating the upstream version

Upstream is tracked as a prebuilt Docker image, `miniflux/miniflux`, pinned by tag in
`startos/manifest/index.ts` (`images.miniflux.source.dockerBuild.buildArgs.IMAGE`). Keep the
CA-store layer until the upstream image meets the removal criteria in
[issue #6](https://github.com/Start9-Community/miniflux-startos/issues/6). The `postgres` image is pinned
independently and does not need to move in lockstep with Miniflux — bump it separately, on its own
schedule, checking Docker Hub for the architectures it ships (`x86_64`, `aarch64`) each time.

## Determining the upstream version

- List releases: `gh api repos/miniflux/v2/releases --paginate --jq '.[] | select(.draft == false and .prerelease == false) | .tag_name'`
  (tags have no `v` prefix, e.g. `2.3.4`). Choose the newest stable tag with a published image;
  do not rely on GitHub's "Latest" designation.
- Confirm the tag is published as a multi-arch image on Docker Hub before pinning it:
  `curl -s https://hub.docker.com/v2/repositories/miniflux/miniflux/tags/<tag> | jq '.images[].architecture'`
  — must include both `amd64` and `arm64`.

## Applying the bump

1. Update `images.miniflux.source.dockerBuild.buildArgs.IMAGE` in `startos/manifest/index.ts`
   to the new image tag. Remove the CA-store layer only when issue #6's criteria are met.
2. Bump the version in `startos/versions/current.ts` to match (`<upstream-version>:0`) and update
   its release notes, including a link to upstream's full notes. If the outgoing `current.ts`
   has a nonempty migration, preserve it in a historical version file first; otherwise bump
   in place — see `../start-technologies/projects/start-sdk/docs/src/versions.md`.
3. Before bumping, diff upstream's `internal/config/options.go` (env var options) between the
   old and new tag for anything this package relies on: `RUN_MIGRATIONS`,
   `CREATE_ADMIN`/`ADMIN_USERNAME`/`ADMIN_PASSWORD`, `DATABASE_URL`, `LISTEN_ADDR`,
   `INTEGRATION_ALLOW_PRIVATE_NETWORKS`, `BASE_URL` — and `internal/crypto/crypto.go` plus the
   `users` table migrations for the password column and its bcrypt hashing, which the
   `admin-password` oneshot in `startos/main.ts` writes directly. A renamed option or a changed
   hash scheme breaks the package silently until someone hits it.
4. Rebuild (`make`) and reinstall on a real StartOS box — confirm the daemon starts, migrations
   run, and a password from **Set Admin Password** still logs in on the new version.
