import { PropsWithChildren } from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { CancellablePromise, buildCancellablePromise } from 'real-cancellable-promise'
import { useAsyncValidator } from './UseAsyncValidator'
import { AsyncValidator, ASYNC_VALIDATION_PENDING } from '../Validator'
import { ItiReactCoreContext, ItiReactCoreContextData } from '../../ItiReactCoreContext'
import { testItiReactCoreContextData, waitForHookUpdates } from '../../__TestHelpers__'

it('uses the asyncValidator to determine validity', async () => {
    const asyncValidator: AsyncValidator<string> = (value: string) =>
        CancellablePromise.resolve(value ? undefined : 'myFeedback')

    let value = ''

    const { result, rerender } = renderHook(() =>
        useAsyncValidator<string>({
            value,
            synchronousValidatorsValid: true,
            asyncValidator,
            onError: (e) => {
                throw e
            },
            debounceDelay: 400,
        })
    )

    expect(result.current).toBe(ASYNC_VALIDATION_PENDING)

    await waitForHookUpdates()
    expect(result.current).toBe('myFeedback')

    value = '1'
    rerender()

    await waitForHookUpdates()
    expect(result.current).toBeUndefined()
})

it('does not have an infinite loop', async () => {
    const asyncValidator: jest.Mocked<AsyncValidator<string>> = jest.fn(() =>
        CancellablePromise.resolve('myFeedback')
    )

    const { rerender } = renderHook(() =>
        useAsyncValidator<string>({
            value: '',
            synchronousValidatorsValid: true,
            asyncValidator,
            onError: (e) => {
                throw e
            },
            debounceDelay: 0,
        })
    )

    await waitForHookUpdates({ updateCount: 3 })
    rerender()
    await waitForHookUpdates({ updateCount: 3 })

    expect(asyncValidator).toHaveBeenCalledTimes(1)
})

it('returns ASYNC_VALIDATION_PENDING while validation is in progress', async () => {
    const asyncValidator: AsyncValidator<string> = () =>
        buildCancellablePromise(async (capture) => {
            await capture(CancellablePromise.delay(1000))
            return undefined
        })

    let value = ''

    const { result, rerender } = renderHook(() =>
        useAsyncValidator<string>({
            value,
            synchronousValidatorsValid: true,
            asyncValidator,
            onError: (e) => {
                throw e
            },
            debounceDelay: 400,
        })
    )

    async function expectInvalidWhileInProgress(): Promise<void> {
        // asyncValidator in progress
        await waitForHookUpdates({ ms: 250 })
        expect(result.current).toBe(ASYNC_VALIDATION_PENDING)

        // asyncValidator complete
        await waitForHookUpdates({ ms: 1000 })
        expect(result.current).toBeUndefined()
    }

    await expectInvalidWhileInProgress()

    // Change value
    value = '1'
    rerender()

    // debouceDelay in progress
    await waitForHookUpdates({ ms: 250 })
    expect(result.current).toBe(ASYNC_VALIDATION_PENDING)

    await expectInvalidWhileInProgress()
})

it('returns ASYNC_VALIDATION_PENDING if asyncValidator is defined and synchronousValidatorsValid=false', async () => {
    const asyncValidator: AsyncValidator<unknown> = () => {
        throw new Error('Should never be called.')
    }

    let value = ''

    const { result, rerender } = renderHook(() =>
        useAsyncValidator<string>({
            value,
            synchronousValidatorsValid: false,
            asyncValidator,
            onError: (e) => {
                throw e
            },
            debounceDelay: 400,
        })
    )

    async function expectPending(): Promise<void> {
        for (let i = 0; i < 10; i++) {
            expect(result.current).toBe(ASYNC_VALIDATION_PENDING)

            // eslint-disable-next-line no-await-in-loop
            await waitForHookUpdates({ ms: 100 })
        }
    }

    await expectPending()

    // Change value
    value = '1'
    rerender()

    await expectPending()
})

it('returns undefined if asyncValidator is undefined', async () => {
    let value = ''

    const { result, rerender } = renderHook(() =>
        useAsyncValidator<string>({
            value,
            synchronousValidatorsValid: true,
            asyncValidator: undefined,
            onError: (e) => {
                throw e
            },
            debounceDelay: 400,
        })
    )
    expect(result.current).toBeUndefined()

    await waitForHookUpdates({ ms: 1000 })
    expect(result.current).toBeUndefined()

    // Change value
    value = '1'
    rerender()

    // wait until debouceDelay in progress
    await waitForHookUpdates({ ms: 250 })
    expect(result.current).toBeUndefined()

    // wait until debounceDelay ends
    await waitForHookUpdates({ ms: 250 })
    expect(result.current).toBeUndefined()
})

it('calls onError if the asyncValidator throws synchronously', async () => {
    const value = ''

    const error = new Error('test error')
    const asyncValidator: AsyncValidator<string> = () => {
        throw error
    }
    const onError = jest.fn()

    renderHook(() =>
        useAsyncValidator<string>({
            value,
            synchronousValidatorsValid: true,
            asyncValidator,
            onError,
            debounceDelay: 400,
        })
    )

    await waitForHookUpdates()
    expect(onError).toHaveBeenCalledWith(error)
})

it("calls onError prop if the asyncValidator's promise rejects and onError prop is provided", async () => {
    const value = ''

    const error = new Error('test error')
    const asyncValidator: AsyncValidator<string> = () => CancellablePromise.reject(error)
    const onError = jest.fn()

    renderHook(() =>
        useAsyncValidator<string>({
            value,
            synchronousValidatorsValid: true,
            asyncValidator,
            onError,
            debounceDelay: 400,
        })
    )

    await waitForHookUpdates()
    expect(onError).toHaveBeenCalledWith(error)
})

it("calls ItiReactCoreContext.onError if the asyncValidator's promise rejects and onError prop is undefined", async () => {
    const value = ''

    const error = new Error('test error')
    const asyncValidator: AsyncValidator<string> = () => CancellablePromise.reject(error)

    const onError = jest.fn()
    const contextData: ItiReactCoreContextData = {
        ...testItiReactCoreContextData,
        onError,
    }
    const wrapper = ({ children }: PropsWithChildren<unknown>): React.ReactElement => (
        <ItiReactCoreContext.Provider value={contextData}>
            {children}
        </ItiReactCoreContext.Provider>
    )

    renderHook(
        () =>
            useAsyncValidator<string>({
                value,
                synchronousValidatorsValid: true,
                asyncValidator,
                debounceDelay: 400,
            }),
        { wrapper }
    )

    await waitForHookUpdates()
    expect(onError).toHaveBeenCalledWith(error)
})
