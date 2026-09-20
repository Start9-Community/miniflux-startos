import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'miniflux',
  title: 'Miniflux',
  license: 'Apache-2.0',
  packageRepo: 'https://github.com/Start9-Community/miniflux-startos',
  upstreamRepo: 'https://github.com/miniflux/v2',
  marketingUrl: 'https://miniflux.app',
  donationUrl: 'https://miniflux.app/#donations',
  description: { short, long },
  volumes: ['main'],
  images: {
    miniflux: {
      source: { dockerTag: 'miniflux/miniflux:2.3.3' },
      arch: ['x86_64', 'aarch64'],
    },
    postgres: {
      source: { dockerTag: 'postgres:18.6' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
