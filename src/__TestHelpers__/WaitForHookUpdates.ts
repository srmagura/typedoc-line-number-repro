import { act } from '@testing-library/react-hooks'
import { waitForReactUpdatesFactory } from '../_Util'

export const waitForHookUpdates = waitForReactUpdatesFactory(act)
