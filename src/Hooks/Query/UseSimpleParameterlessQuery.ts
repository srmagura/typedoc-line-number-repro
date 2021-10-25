import {
    useSimpleQuery,
    UseSimpleQueryProps,
    UseSimpleQueryReturn,
} from './UseSimpleQuery'

export type UseSimpleParameterlessQueryProps<TResult> = Pick<
    UseSimpleQueryProps<undefined, TResult>,
    'query' | 'onResultReceived' | 'onLoadingChange' | 'onError'
>

/**
 * Performs a query on mount. Use this when `query` doesn't depend on any outside
 * variables, e.g. props.
 *
 * Example:
 * ```
 * const { doQuery, doQueryAsync } = useSimpleParameterlessQuery<number>({
 *     query: api.workDoc.getCount,
 *     onResultReceived: (count) => {
 *         setCount(count)
 *     }
 * })
 * ```
 *
 * @typeParam TResult the type returned by the query
 */
export function useSimpleParameterlessQuery<TResult>({
    query,
    onResultReceived,
    onLoadingChange,
    onError,
}: UseSimpleParameterlessQueryProps<TResult>): UseSimpleQueryReturn {
    return useSimpleQuery<undefined, TResult>({
        queryParams: undefined,
        query,
        shouldQueryImmediately: () => true,

        onResultReceived,
        onLoadingChange,
        onError,
    })
}
