/* eslint-disable @typescript-eslint/explicit-module-boundary-types,
     @typescript-eslint/explicit-function-return-type, 
     @typescript-eslint/ban-ts-comment */
import { CancellablePromise } from 'real-cancellable-promise'

/**
 * To be used with Jest fake timers. Lets timers and React component async updates run.
 *
 * ```
 * import { act as reactAct } from '@testing-library/react'
 * import { act as hooksAct } from '@testing-library/react-hooks'
 * import { waitForReactUpdatesFactory } from '@interface-technologies/iti-react/src/TestHelpers'
 *
 * export const waitForReactUpdates = waitForReactUpdatesFactory(reactAct)
 * export const waitForHookUpdates = waitForReactUpdatesFactory(hooksAct)
 * ```
 */
export function waitForReactUpdatesFactory(
    act: (f: () => Promise<void>) => PromiseLike<void>
) {
    // Jest is an optional peerDependency
    // @ts-ignore
    if (!jest)
        throw new Error('waitForReactUpdatesFactory was called, but jest is not defined.')

    return async function waitForReactUpdates(options?: {
        updateCount?: number
        ms?: number
    }): Promise<void> {
        const updateCount = options?.updateCount ?? 1
        const ms = options?.ms ?? 2000

        async function wait(): Promise<void> {
            const p = CancellablePromise.delay(ms)

            // @ts-ignore
            jest.advanceTimersByTime(ms)
            await p
        }

        for (let i = 0; i < updateCount; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            await act(wait)
        }
    }
}
