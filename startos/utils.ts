import { T } from '@start9labs/start-sdk'
import { sdk } from './sdk'

export const uiPort = 8080

export const uiMultiHostId = 'ui'
export const uiInterfaceId = 'ui'

export const pgPort = 5432
export const pgUser = 'miniflux'
export const pgDatabase = 'miniflux'

export function getNonLocalUrls(effects: T.Effects): Promise<string[]> {
  return sdk.host
    .getOwn(effects, uiMultiHostId, (host) => {
      const iface =
        host &&
        Object.values(host.bindings)
          .flatMap((b) => Object.values(b.interfaces))
          .find((i) => i.id === uiInterfaceId)
      return iface ? iface.addressInfo.nonLocal.format() : []
    })
    .const()
}
