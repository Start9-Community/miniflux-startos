export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Miniflux!': 0,
  'Web Interface': 1,
  'Waiting for PostgreSQL to be ready': 2,
  'PostgreSQL is ready': 3,
  'Miniflux is ready': 4,
  'Miniflux is not ready': 5,
  // interfaces.ts
  'The Miniflux feed reader and admin UI': 6,
  // actions/setAdminPassword.ts
  'Set Admin Password': 7,
  'View your Miniflux admin login, or generate a new password to replace the current one.': 8,
  'Login Credentials': 9,
  'Use these credentials to sign in.': 10,
  Username: 11,
  Password: 12,
  // actions/setPrimaryUrl.ts
  'Set Primary URL': 13,
  'Choose which of your Miniflux addresses is used for BASE_URL — the link Miniflux stamps into feed entries, WebSub callbacks, and OAuth2 redirects.': 14,
  URL: 15,
  // init/taskSetPrimaryUrl.ts
  'Primary URL is no longer available. Select a new one.': 16,
  // init/watchAdminPassword.ts
  'Retrieve your admin login credentials': 17,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
