import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'miniflux',
  title: 'Miniflux',
  // Matches upstream's Dockerfile OCI labels (org.opencontainers.image.licenses).
  license: 'Apache-2.0',
  // TODO: confirm/create this repo before publishing — following the Jolls/<name>-startos
  // convention used by this author's other packages (enshu-startos, navidrome-startos), but
  // https://github.com/Jolls/miniflux-startos did not exist as of packaging time.
  packageRepo: 'https://github.com/Jolls/miniflux-startos',
  upstreamRepo: 'https://github.com/miniflux/v2',
  marketingUrl: 'https://miniflux.app',
  donationUrl: 'https://miniflux.app/#donate',
  description: { short, long },
  // 'main' holds the PostgreSQL data directory and this package's own
  // store.json (generated passwords), under separate subpaths (main.ts).
  volumes: ['main'],
  images: {
    // Official multi-arch image, built from packaging/docker/alpine/Dockerfile
    // in the upstream repo. Confirmed on Docker Hub 2026-08-29: amd64 + arm64.
    miniflux: {
      source: { dockerTag: 'miniflux/miniflux:2.3.3' },
      arch: ['x86_64', 'aarch64'],
    },
    // Confirmed on Docker Hub 2026-08-29: postgres:18.6 ships amd64 and arm64.
    postgres: {
      source: { dockerTag: 'postgres:18.6' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
