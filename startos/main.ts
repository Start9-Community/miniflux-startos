import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import { pgDatabase, pgPort, pgUser, uiPort } from './utils'

const sqlString = (value: string) => `'${value.replace(/'/g, "''")}'`

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Miniflux!'))

  const pgPassword =
    (await storeJson.read((s) => s.pgPassword).const(effects)) ?? ''
  const adminUsername =
    (await storeJson.read((s) => s.adminUsername).const(effects)) ?? 'admin'
  const adminPassword =
    (await storeJson.read((s) => s.adminPassword).const(effects)) ?? ''
  const domain = (await storeJson.read((s) => s.domain).const(effects)) ?? ''

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

  return (
    sdk.Daemons.of(effects)
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
          display: null,
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
            DATABASE_URL: `postgres://${pgUser}:${pgPassword}@127.0.0.1:${pgPort}/${pgDatabase}?sslmode=disable`,
            RUN_MIGRATIONS: '1',
            // Miniflux only creates the account when it is missing; the
            // admin-password oneshot below keeps an existing one on the store's.
            CREATE_ADMIN: '1',
            ADMIN_USERNAME: adminUsername,
            ADMIN_PASSWORD: adminPassword,
            LISTEN_ADDR: `0.0.0.0:${uiPort}`,
            // Integration targets on a StartOS box (Karakeep, Wallabag, …) are
            // private addresses, which Miniflux's SSRF guard refuses silently.
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
      // Miniflux checks passwords with bcrypt; pgcrypto's crypt(…, gen_salt('bf'))
      // writes the same $2a$ format.
      .addOneshot('admin-password', {
        subcontainer: postgresSub,
        exec: {
          command: [
            'psql',
            '-h',
            '127.0.0.1',
            '-U',
            pgUser,
            '-d',
            pgDatabase,
            '-v',
            'ON_ERROR_STOP=1',
            '-q',
            '-c',
            'CREATE EXTENSION IF NOT EXISTS pgcrypto',
            '-c',
            `UPDATE users SET password = crypt(${sqlString(adminPassword)}, gen_salt('bf', 10)) WHERE username = ${sqlString(adminUsername)}`,
          ],
          env: { PGPASSWORD: pgPassword },
        },
        requires: ['miniflux'],
      })
  )
})
