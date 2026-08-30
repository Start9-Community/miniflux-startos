import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getNonLocalUrls } from '../utils'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  url: Value.dynamicSelect(async ({ effects }) => {
    const urls = await getNonLocalUrls(effects)

    return {
      name: i18n('URL'),
      values: urls.reduce(
        (obj, url) => ({ ...obj, [url]: url }),
        {} as Record<string, string>,
      ),
      default: '',
    }
  }),
})

export const setPrimaryUrl = sdk.Action.withInput(
  // id
  'set-primary-url',

  // metadata
  async () => ({
    name: i18n('Set Primary URL'),
    description: i18n(
      'Choose which of your Miniflux addresses is used for BASE_URL — the link Miniflux stamps into feed entries, WebSub callbacks, and OAuth2 redirects.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // pre-fill the input form with the current value
  async ({ effects }) => ({
    url: (await storeJson.read((s) => s.domain).once()) || undefined,
  }),

  // the execution function
  async ({ effects, input }) => storeJson.merge(effects, { domain: input.url }),
)
