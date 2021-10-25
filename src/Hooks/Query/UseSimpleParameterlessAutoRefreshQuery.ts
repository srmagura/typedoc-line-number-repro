import {
    AutoRefreshOptions,
    useSimpleAutoRefreshQuery,
} from './UseSimpleAutoRefreshQuery'
import { UseSimpleQueryProps, UseSimpleQueryReturn } from './UseSimpleQuery'

export type UseSimpleParameterlessAutoRefreshQueryProps<TResult> = Pick<
    UseSimpleQueryProps<undefined, TResult>,
    'query' | 'onResultReceived' | 'onLoadingChange'
> &
    AutoRefreshOptions

/**
 * Performs a query on mount and repeats the query according to `refreshInterval`.
 * Use this when `query` doesn't depend on any outside variables, e.g. props.
 *
 * Example:
 * ```
 * const { doQuery, doQueryAsync } = useParameterlessAutoRefreshQuery<WorkDocDto>({
 *     query: api.workDoc.getcount,
 *     onResultReceived: (count) => {
 *         setCount(count)
 *         dispatch(setShowBackendUnreachableAlert(false))
 *     },
 *     refreshInterval: moment.duration(1, 'minute'),
 *     onConnectionError: () => dispatch(setShowBackendUnreachableAlert(true))
 * })
 * ```
 *
 * @typeParam TResult the type returned by the query
 */
export function useSimpleParameterlessAutoRefreshQuery<TResult>(
    props: UseSimpleParameterlessAutoRefreshQueryProps<TResult>
): UseSimpleQueryReturn {
    return useSimpleAutoRefreshQuery<undefined, TResult>({
        ...props,
        queryParams: undefined,
        shouldQueryImmediately: () => true,
    })
}
