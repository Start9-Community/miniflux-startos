import { T } from '@start9labs/start-sdk'
import { sdk } from './sdk'

// Miniflux's own HTTP port (packaging/docker/alpine/Dockerfile EXPOSE 8080 /
// LISTEN_ADDR=0.0.0.0:8080 default).
export const uiPort = 8080

// Host id (the `sdk.MultiHost.of` group) and interface id for the web UI,
// shared between interfaces.ts, the primary-URL action/init watcher, and the
// admin-password action (which calls the running daemon's own API).
export const uiMultiHostId = 'ui'
export const uiInterfaceId = 'ui'

// PostgreSQL sidecar: fixed internal port, not exposed via any interface.
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
