import { useContext, useRef, useEffect, useState, useCallback } from 'react'
import { defaults, noop } from 'lodash'
import moment from 'moment-timezone'
import {
    useSimpleQuery,
    UseSimpleQueryProps,
    UseSimpleQueryReturn,
} from './UseSimpleQuery'
import { ItiReactCoreContext } from '../../ItiReactCoreContext'

declare function setTimeout(func: () => void, delay: number): number
declare function clearTimeout(timer: number | undefined): void

/* connectionErrorThreshold was added because single API calls can fail in certain
 * cases when the user actually does have an internet connection. The case that we've
 * observed is when the computer has been asleep. The AutoRefreshUpdater will typically
 * query immediately after the computer resumes, and the request will fail because
 * network IO hasn't been re-enabled yet.
 */

export interface AutoRefreshOptions {
    refreshInterval?: moment.Duration
    enableAutoRefresh?: boolean
    onRefreshingChange?: (refreshing: boolean) => void

    onConnectionError(): void
    onOtherError?(e: unknown): void
}

export type UseSimpleAutoRefreshQueryProps<TQueryParams, TResult> = Pick<
    UseSimpleQueryProps<TQueryParams, TResult>,
    | 'queryParams'
    | 'query'
    | 'shouldQueryImmediately'
    | 'onResultReceived'
    | 'onLoadingChange'
    | 'debounceDelay'
> &
    AutoRefreshOptions

/**
 * Performs a query on mount and repeats the query according to `refreshInterval`.
 *
 * Example:
 * ```
 * const { doQuery, doQueryAsync } = useParameterlessAutoRefreshQuery<WorkDocId, WorkDocDto>({
 *     queryParams: workDocId,
 *     query: (id) => api.workDoc.get({ id }),
 *     shouldQueryImmediately: (prev, cur) => true,
 *     onResultReceived: (workDoc) => {
 *         setWorkDoc(workDoc)
 *         dispatch(setShowBackendUnreachableAlert(false))
 *     },
 *     refreshInterval: dayjs.duration(1, 'minute'),
 *     onConnectionError: () => dispatch(setShowBackendUnreachableAlert(true))
 * })
 * ```
 *
 * @typeParam TQueryParams the parameters of the query
 * @typeParam TResult the type returned by the query
 */
export function useSimpleAutoRefreshQuery<TQueryParams, TResult>(
    props: UseSimpleAutoRefreshQueryProps<TQueryParams, TResult>
): UseSimpleQueryReturn {
    const itiReactCoreContext = useContext(ItiReactCoreContext)
    const { defaultRefreshInterval, isConnectionError, connectionErrorThreshold } =
        itiReactCoreContext.useSimpleAutoRefreshQuery

    const {
        refreshInterval,
        enableAutoRefresh,
        onRefreshingChange,
        onConnectionError,
        onOtherError,
    } = defaults(
        { ...props },
        {
            onRefreshingChange: noop,
            enableAutoRefresh: true,
            onOtherError: itiReactCoreContext.onError,
            refreshInterval: defaultRefreshInterval,
            startAutoRefreshOnMount: true,
        }
    )

    const autoRefreshTimerRef = useRef<number>()

    const [shouldRestartTimer, setShouldRestartTimer] = useState(false)

    // So that onConnectionError is called immediately if the initial query fails
    const consecutiveConnectionErrorCountRef = useRef(connectionErrorThreshold - 1)

    const onError = useCallback(
        (e: unknown): void => {
            if (isConnectionError(e)) {
                consecutiveConnectionErrorCountRef.current += 1

                if (
                    consecutiveConnectionErrorCountRef.current >= connectionErrorThreshold
                ) {
                    onConnectionError()
                }
            } else {
                onOtherError(e)
            }
        },
        [isConnectionError, connectionErrorThreshold, onConnectionError, onOtherError]
    )

    const onQueryStarted = useCallback(() => {
        if (enableAutoRefresh) setShouldRestartTimer(true)
    }, [enableAutoRefresh])

    const { doQuery, doQueryAsync } = useSimpleQuery({
        queryParams: props.queryParams,
        query: props.query,
        shouldQueryImmediately: props.shouldQueryImmediately,
        onResultReceived: props.onResultReceived,
        onLoadingChange: props.onLoadingChange,
        debounceDelay: props.debounceDelay,
        onQueryStarted,
        onError,
    })

    const firstTimeRef = useRef(true)

    // Immediately perform the query if enableAutoRefresh goes from false to true
    useEffect(() => {
        if (enableAutoRefresh && !firstTimeRef.current) doQuery()

        firstTimeRef.current = false
    }, [enableAutoRefresh, doQuery])

    const refresh = useCallback(async (): Promise<void> => {
        onRefreshingChange(true)

        try {
            await doQueryAsync({ changeLoading: false })
            consecutiveConnectionErrorCountRef.current = 0

            // See note in useParameterizedQuery about onLoadingChange for why
            // onRefreshingChange(false) should NOT be called in a finally block
            onRefreshingChange(false)
        } catch (e) {
            onError(e)
        }
    }, [doQueryAsync, onRefreshingChange, onError])

    const refreshIntervalMilliseconds = refreshInterval.asMilliseconds()

    useEffect(() => {
        if (shouldRestartTimer) {
            setShouldRestartTimer(false)
            clearTimeout(autoRefreshTimerRef.current)

            autoRefreshTimerRef.current = setTimeout(() => {
                void refresh()
            }, refreshIntervalMilliseconds)
        }
    }, [shouldRestartTimer, refresh, refreshIntervalMilliseconds])

    // Final cleanup
    useEffect(
        () => (): void => {
            clearTimeout(autoRefreshTimerRef.current)
        },
        []
    )

    return { doQuery, doQueryAsync }
}
