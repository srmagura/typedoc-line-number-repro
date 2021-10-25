import { renderHook } from '@testing-library/react-hooks'
import { noop } from 'lodash'
import { CancellablePromise } from 'real-cancellable-promise'
import { useSimpleQuery } from './UseSimpleQuery'
import { waitForHookUpdates } from '../../__TestHelpers__'

interface QueryParams {
    a: number
}
type Result = string

function query({ a }: QueryParams): CancellablePromise<Result> {
    return CancellablePromise.resolve(`[${a}]`)
}

it('calls onResultReceived and onLoadingChange', async () => {
    const onResultReceived = jest.fn()
    const onLoadingChange = jest.fn()

    const { result } = renderHook(() =>
        useSimpleQuery<QueryParams, Result>({
            query,
            shouldQueryImmediately: () => true,
            onResultReceived,
            onLoadingChange,
            onError: (e) => {
                throw e
            },
            queryParams: { a: 1 },
        })
    )
    await result.current.doQueryAsync()

    expect(onResultReceived).toHaveBeenCalledWith('[1]')
    expect(onLoadingChange).toHaveBeenCalledWith(true)
    expect(onLoadingChange).toHaveBeenCalledWith(false)
})

it('returns doQuery and doQueryAsync functions with stable identities', () => {
    const props = {
        query,
        shouldQueryImmediately: (): boolean => true,
        onResultReceived: noop,
        onError: (e: unknown) => {
            throw e
        },
    }

    const { result, rerender } = renderHook(
        (props) => useSimpleQuery<QueryParams, Result>(props),
        {
            initialProps: {
                ...props,
                queryParams: { a: 1 },
            },
        }
    )
    const result0 = result.current

    rerender({ ...props, queryParams: { a: 2 } })
    const result1 = result.current

    expect(result0.doQuery).toBe(result1.doQuery)
    expect(result0.doQueryAsync).toBe(result1.doQueryAsync)
})

it('calls onError if query throws', async () => {
    const error = new Error('test error')
    const onError = jest.fn()

    renderHook(() =>
        useSimpleQuery<QueryParams, never>({
            queryParams: { a: 1 },
            query: () => {
                throw error
            },
            shouldQueryImmediately: (): boolean => true,
            onResultReceived: () => {
                throw new Error('onResultReceived got called')
            },
            onError,
        })
    )
    await waitForHookUpdates()

    expect(onError).toHaveBeenCalledWith(error)
})

it('calls onError if query returns a promise that rejects', async () => {
    const error = new Error('test error')
    const onError = jest.fn()

    renderHook(() =>
        useSimpleQuery<QueryParams, never>({
            queryParams: { a: 1 },
            query: () => CancellablePromise.reject(error),
            shouldQueryImmediately: (): boolean => true,
            onResultReceived: () => {
                throw new Error('onResultReceived got called')
            },
            onError,
        })
    )
    await waitForHookUpdates()

    expect(onError).toHaveBeenCalledWith(error)
})
