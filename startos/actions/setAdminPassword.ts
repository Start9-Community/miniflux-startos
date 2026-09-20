import { utils } from '@start9labs/start-sdk'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'

export const setAdminPassword = sdk.Action.withoutInput(
  'set-admin-password',

  async ({ effects }) => ({
    name: i18n('Set Admin Password'),
    description: i18n(
      'Generate a new password for the Miniflux admin account. Replaces the current one.',
    ),
    warning: (await storeJson.read((s) => s.adminPassword).const(effects))
      ? i18n('Replaces the current admin password.')
      : null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const adminPassword = utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 32,
    })
    await storeJson.merge(effects, { adminPassword })

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
            value:
              (await storeJson.read((s) => s.adminUsername).once()) ?? 'admin',
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single' as const,
            name: i18n('Password'),
            description: null,
            value: adminPassword,
            masked: true,
            copyable: true,
            qr: false,
          },
        ],
      },
    }
  },
)
