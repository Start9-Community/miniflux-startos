import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.looseObject({
  // Internal PostgreSQL password. Generated once on install (init/seedFiles.ts);
  // no .catch() default on purpose — it must be a real random value, never a
  // static fallback that every install would otherwise share.
  pgPassword: z.string().optional().catch(undefined),
  // Miniflux admin account. Generated once on install so CREATE_ADMIN can
  // bootstrap it on the very first daemon start (main.ts) — Miniflux's own
  // admin-creation logic silently skips if the username already exists, so
  // this is the only password that ever reaches that env var. Rotation goes
  // through the running app's own API (actions/setAdminPassword.ts) because
  // that logic never overwrites an existing user's password.
  adminUsername: z.string().catch('admin'),
  adminPassword: z.string().optional().catch(undefined),
  // Flips to true once the user has retrieved the generated credentials via
  // the Set Admin Password action, so the install-time critical task clears.
  adminPasswordSeen: z.boolean().catch(false),
  // Full URL (e.g. https://miniflux.mydomain.local) used for Miniflux's
  // BASE_URL, which anchors links in feed entries, WebSub callbacks, and
  // OAuth2 redirects. Picked from the service's own interfaces
  // (init/taskSetPrimaryUrl.ts, actions/setPrimaryUrl.ts).
  domain: z.string().catch(''),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: './store.json' },
  shape,
)
