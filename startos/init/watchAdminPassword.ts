import { setAdminPassword } from '../actions/setAdminPassword'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// The admin account is created silently on install (seedFiles.ts) so
// CREATE_ADMIN has a password to bootstrap with — the user has never seen it,
// so surface a task until they retrieve it via the action. Must be
// 'important', not 'critical': the action that clears it requires Miniflux
// to already be running (it calls the app's own API), and a critical task
// blocks the service from starting — 'critical' here would deadlock the
// user out of ever clearing it.
export const watchAdminPassword = sdk.setupOnInit(async (effects) => {
  const seen = await storeJson.read((s) => s.adminPasswordSeen).const(effects)

  if (!seen) {
    await sdk.action.createOwnTask(effects, setAdminPassword, 'important', {
      reason: i18n('Retrieve your admin login credentials'),
    })
  }
})
