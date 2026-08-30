import { sdk } from '../sdk'
import { setAdminPassword } from './setAdminPassword'
import { setPrimaryUrl } from './setPrimaryUrl'

export const actions = sdk.Actions.of()
  .addAction(setAdminPassword)
  .addAction(setPrimaryUrl)
