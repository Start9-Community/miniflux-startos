import { sdk } from '../sdk'
import { dependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { versionGraph } from '../versions'
import { actions } from '../actions'
import { restoreInit } from '../backups'
import { seedFiles } from './seedFiles'
import { seedPrimaryUrl, taskPrimaryUrl } from './primaryUrl'
import { watchAdminPassword } from './watchAdminPassword'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  setInterfaces,
  actions,
  dependencies,
  seedFiles,
  seedPrimaryUrl,
  taskPrimaryUrl,
  watchAdminPassword,
)

export const uninit = sdk.setupUninit(versionGraph)
