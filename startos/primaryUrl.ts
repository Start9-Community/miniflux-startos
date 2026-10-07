import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiInterfaceId, uiMultiHostId } from './utils'

export const primaryUrl = sdk.setupPrimaryUrl({
  id: 'set-primary-url',
  hostId: uiMultiHostId,
  interfaceId: uiInterfaceId,
  metadata: {
    name: i18n('Set Primary URL'),
    description: i18n(
      'Choose the URL Miniflux uses in the links it builds to itself, such as links in Telegram and ntfy notifications and feed icons sent to reader apps. Passkeys work only at this address, so after a change they must be registered again.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  field: { name: i18n('URL'), description: null },
  get: storeJson.read((s) => s.domain),
  set: (effects, url) => storeJson.merge(effects, { domain: url }),
})
