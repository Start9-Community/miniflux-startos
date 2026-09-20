import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  pgPassword: z.string().optional().catch(undefined),
  adminUsername: z.string().catch('admin'),
  adminPassword: z.string().optional().catch(undefined),
  // Full URL for Miniflux's BASE_URL, picked from the service's own interfaces.
  domain: z.string().catch(''),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: './store.json' },
  shape,
)
