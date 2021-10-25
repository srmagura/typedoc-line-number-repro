import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment-timezone'
import { noop } from 'lodash'
import { CancellablePromise } from 'real-cancellable-promise'
import { useSimpleAutoRefreshQuery } from './UseSimpleAutoRefreshQuery'
import { waitForHookUpdates } from '../../__TestHelpers__'

interface QueryParams {
    a: number
}
type Result = string

function query({ a }: QueryParams): CancellablePromise<Result> {
    return CancellablePromise.resolve(`[${a}]`)
}

it('returns functions that have stable identities', () => {
    const props = {
        query,
        shouldQueryImmediately: (): boolean => true,
        onLoadingChange: noop,
        onResultReceived: noop,
        refreshInterval: moment.duration(5, 'seconds'),
        onRefreshingChange: noop,
        onConnectionError: () => {
            throw new Error('connection error')
        },
        onOtherError: (e: unknown) => {
            throw e
        },
    }

    const { result, rerender } = renderHook(
        (props) => useSimpleAutoRefreshQuery<QueryParams, Result>(props),
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

it('supports temporarily disabling auto refresh', async () => {
    const onResultReceived = jest.fn()

    const props = {
        query,
        shouldQueryImmediately: (): boolean => true,
        onLoadingChange: noop,
        onResultReceived,
        refreshInterval: moment.duration(5, 'seconds'),
        onRefreshingChange: noop,
        onConnectionError: () => {
            throw new Error('connection error')
        },
        onOtherError: (e: unknown) => {
            throw e
        },
        queryParams: { a: 1 },
    }

    const { rerender } = renderHook(
        (props) => useSimpleAutoRefreshQuery<QueryParams, Result>(props),
        {
            initialProps: {
                ...props,
                enableAutoRefresh: true,
            },
        }
    )

    await waitForHookUpdates({ ms: 10000 })
    expect(onResultReceived).toHaveBeenCalledWith('[1]')
    onResultReceived.mockClear()

    await waitForHookUpdates({ ms: 10000 })
    expect(onResultReceived).toHaveBeenCalledWith('[1]')
    onResultReceived.mockClear()

    rerender({ ...props, enableAutoRefresh: false })

    await waitForHookUpdates({ ms: 10000 })
    onResultReceived.mockClear()

    await waitForHookUpdates({ ms: 10000 })
    expect(onResultReceived).not.toHaveBeenCalled()

    rerender({ ...props, enableAutoRefresh: true })
    await waitForHookUpdates({ ms: 10000 })
    expect(onResultReceived).toHaveBeenCalledWith('[1]')
})
