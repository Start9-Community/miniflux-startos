import { utils } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { uiPort } from '../utils'

// Miniflux's CREATE_ADMIN bootstrap (main.ts) only ever creates the admin
// account once — it silently skips if the username already exists — so
// rotating the password has to go through Miniflux's own REST API instead of
// rewriting store.json and restarting. The `miniflux` and `postgres`
// subcontainers share this package's loopback network namespace, so
// 127.0.0.1 here reaches the running daemon directly, same as `main.ts`
// dialing Postgres at 127.0.0.1:5432.
export const setAdminPassword = sdk.Action.withoutInput(
  // id
  'set-admin-password',

  // metadata
  async () => ({
    name: i18n('Set Admin Password'),
    description: i18n(
      'View your Miniflux admin login, or generate a new password to replace the current one.',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  // handler
  async ({ effects }) => {
    const store = await storeJson.read().once()
    const username = store?.adminUsername || 'admin'
    const oldPassword = store?.adminPassword

    if (!oldPassword) {
      throw new Error(
        'No admin password is on record for this install. Restart Miniflux and try again.',
      )
    }

    const newPassword = utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 32,
    })

    const authHeader = `Basic ${Buffer.from(`${username}:${oldPassword}`).toString('base64')}`
    const base = `http://127.0.0.1:${uiPort}`

    const meRes = await fetch(`${base}/v1/me`, {
      headers: { Authorization: authHeader },
    })
    if (!meRes.ok) {
      throw new Error(
        `Could not authenticate as the current admin (HTTP ${meRes.status}). If the password was changed from within Miniflux itself, this action can no longer apply a new one.`,
      )
    }
    const me = (await meRes.json()) as { id: number }

    const updateRes = await fetch(`${base}/v1/users/${me.id}`, {
      method: 'PUT',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: newPassword }),
    })
    if (!updateRes.ok) {
      throw new Error(
        `Failed to set the new password (HTTP ${updateRes.status}).`,
      )
    }

    await storeJson.merge(effects, {
      adminPassword: newPassword,
      adminPasswordSeen: true,
    })

    return {
      version: '1' as const,
      title: i18n('Login Credentials'),
      message: i18n('Use these credentials to sign in.'),
      result: {
        type: 'group' as const,
        value: [
          {
            type: 'single' as const,
            name: i18n('Username'),
            description: null,
            value: username,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single' as const,
            name: i18n('Password'),
            description: null,
            value: newPassword,
            masked: true,
            copyable: true,
            qr: false,
          },
        ],
      },
    }
  },
)
