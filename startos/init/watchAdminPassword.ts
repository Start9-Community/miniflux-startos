import { setAdminPassword } from '../actions/setAdminPassword'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// The admin account is created silently on install (seedFiles.ts) so
// CREATE_ADMIN has a password to bootstrap with — the user has never seen it,
// so surface a critical task until they retrieve it via the action.
export const watchAdminPassword = sdk.setupOnInit(async (effects) => {
  const seen = await storeJson.read((s) => s.adminPasswordSeen).const(effects)

  if (!seen) {
    await sdk.action.createOwnTask(effects, setAdminPassword, 'critical', {
      reason: i18n('Retrieve your admin login credentials'),
    })
  }
})
