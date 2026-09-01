import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import { pgDatabase, pgPort, pgUser, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Miniflux!'))

  // Generated once on install by init/seedFiles.ts.
  const pgPassword =
    (await storeJson.read((s) => s.pgPassword).const(effects)) ?? ''
  const adminUsername =
    (await storeJson.read((s) => s.adminUsername).const(effects)) ?? 'admin'
  const adminPassword =
    (await storeJson.read((s) => s.adminPassword).const(effects)) ?? ''
  // Selected by the user via the "Set Primary URL" action (init/taskSetPrimaryUrl.ts
  // seeds a default on install). Reactive so BASE_URL — and therefore the daemon —
  // updates if the choice changes later.
  const domain = (await storeJson.read((s) => s.domain).const(effects)) ?? ''

  const databaseUrl = `postgres://${pgUser}:${pgPassword}@127.0.0.1:${pgPort}/${pgDatabase}?sslmode=disable`

  const postgresSub = sdk.SubContainer.of(
    effects,
    { imageId: 'postgres' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: 'postgresql',
      mountpoint: '/var/lib/postgresql',
      readonly: false,
    }),
    'postgres-sub',
  )

  const minifluxSub = sdk.SubContainer.of(
    effects,
    { imageId: 'miniflux' },
    sdk.Mounts.of(),
    'miniflux-sub',
  )

  return sdk.Daemons.of(effects)
    .addDaemon('postgres', {
      subcontainer: postgresSub,
      exec: {
        command: sdk.useEntrypoint(['-c', 'listen_addresses=127.0.0.1']),
        env: {
          POSTGRES_USER: pgUser,
          POSTGRES_PASSWORD: pgPassword,
          POSTGRES_DB: pgDatabase,
        },
      },
      ready: {
        display: null, // internal sidecar, not shown to the user
        fn: async () => {
          const result = await postgresSub.exec([
            'pg_isready',
            '-q',
            '-h',
            '127.0.0.1',
            '-d',
            pgDatabase,
            '-U',
            pgUser,
          ])
          if (result.exitCode !== 0) {
            return {
              result: 'loading',
              message: i18n('Waiting for PostgreSQL to be ready'),
            }
          }
          return {
            result: 'success',
            message: i18n('PostgreSQL is ready'),
          }
        },
      },
      requires: [],
    })
    .addDaemon('miniflux', {
      subcontainer: minifluxSub,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          DATABASE_URL: databaseUrl,
          // Idempotent — Miniflux tracks its own migration version in the
          // database and only applies what's missing, so this is safe on
          // every start.
          RUN_MIGRATIONS: '1',
          // Bootstraps the initial admin account from store.json. Miniflux
          // silently skips this if the username already exists, so it never
          // overwrites a password the user has since rotated via the Set
          // Admin Password action (actions/setAdminPassword.ts).
          CREATE_ADMIN: '1',
          ADMIN_USERNAME: adminUsername,
          ADMIN_PASSWORD: adminPassword,
          LISTEN_ADDR: `0.0.0.0:${uiPort}`,
          // Every third-party integration target reachable from a StartOS
          // install (Karakeep, Wallabag, etc.) sits on a LAN/private address
          // by nature — Miniflux's integration HTTP client refuses those by
          // default (SSRF hardening aimed at public internet-facing installs)
          // and the failure is silent in the UI. Safe to allow broadly here:
          // integrations are opt-in per-service credentials the user enters
          // themselves, not attacker-controlled input.
          INTEGRATION_ALLOW_PRIVATE_NETWORKS: '1',
          BASE_URL: domain || 'http://localhost',
        },
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkWebUrl(
            effects,
            `http://127.0.0.1:${uiPort}/healthcheck`,
            {
              successMessage: i18n('Miniflux is ready'),
              errorMessage: i18n('Miniflux is not ready'),
            },
          ),
      },
      requires: ['postgres'],
    })
})
