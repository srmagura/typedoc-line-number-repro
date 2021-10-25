import { useRef, useEffect, useCallback, useContext } from 'react'
import { defaults, noop } from 'lodash'
import { CancellablePromise } from 'real-cancellable-promise'
import { ItiReactCoreContext } from '../../ItiReactCoreContext'

interface DoQueryInternalOptions {
    changeLoading: boolean
    handleErrors: boolean
}

const defaultDoQueryInternalOptions: DoQueryInternalOptions = {
    changeLoading: true,
    handleErrors: true,
}

export interface UseSimpleQueryProps<TQueryParams, TResult> {
    queryParams: TQueryParams

    query(queryParams: TQueryParams): CancellablePromise<TResult>
    shouldQueryImmediately(
        prevQueryParams: TQueryParams,
        queryParams: TQueryParams
    ): boolean

    onResultReceived(result: TResult): void
    onLoadingChange?(loading: boolean): void
    onError?(e: unknown): void

    debounceDelay?: number
    onQueryStarted?(): void

    /** Useful in uncommon scenarios to prevent unnecessary asynchronous updates to a component */
    shouldSkipQuery?(queryParams: TQueryParams): boolean
}

export interface UseSimpleQueryReturn {
    doQuery(options?: { changeLoading: boolean }): void
    doQueryAsync(options?: { changeLoading: boolean }): Promise<void>
}

/**
 * Perform a query on mount and whenever `queryParams` change.
 *
 * - `queryParams`: must be referentially stable, otherwise there will be an infinite
 *   loop. `useMemo` is helpful here.
 * - `query`: must be not depend on outside variables, e.g. props!!! Changing `query` does
 *   not cause the query to rerun.
 * - `shouldQueryImmediately`: provide a function here that takes in the previous query params
 *   and the current query params and return false if you want debouncing to occur.
 * - `onError`: only needs to be provided if this query has custom error-handling logic.
 *   If not provided, the `onError` from `ItiReactCoreContext` will be used.
 *
 * Example:
 * ```
 * const { doQuery, doQueryAsync } = useSimpleQuery<number, WorkDocDto>({
 *     queryParams: workDocId,
 *     query: (id) => api.workDoc.get({ id }),
 *     shouldQueryImmediately: (prev, cur) => true,
 *     onResultReceived: (workDoc) => {
 *         setWorkDoc(workDoc)
 *     }
 * })
 * ```
 *
 * @typeParam TQueryParams the parameters of the query
 * @typeParam TResult the type returned by the query
 *
 * @returns an object containing `doQuery` and `doQueryAsync` functions. `doQueryAsync`
 * must be called within a `try-catch`.
 */
export function useSimpleQuery<TQueryParams, TResult>(
    props: UseSimpleQueryProps<TQueryParams, TResult>
): UseSimpleQueryReturn {
    const itiReactCoreContext = useContext(ItiReactCoreContext)

    const { queryParams, debounceDelay, ...defaultedProps } = defaults(
        { ...props },
        {
            onLoadingChange: noop,
            onQueryStarted: noop,
            onError: itiReactCoreContext.onError,
            shouldSkipQuery: () => false,
            debounceDelay: 500,
        }
    )

    const queryRef = useRef(defaultedProps.query)
    const onQueryStartedRef = useRef(defaultedProps.onQueryStarted)
    const onLoadingChangeRef = useRef(defaultedProps.onLoadingChange)
    const onResultReceivedRef = useRef(defaultedProps.onResultReceived)
    const onErrorRef = useRef(defaultedProps.onError)
    const shouldQueryImmediatelyRef = useRef(defaultedProps.shouldQueryImmediately)
    const shouldSkipQueryRef = useRef(defaultedProps.shouldSkipQuery)

    useEffect(() => {
        queryRef.current = defaultedProps.query
        onQueryStartedRef.current = defaultedProps.onQueryStarted
        onLoadingChangeRef.current = defaultedProps.onLoadingChange
        onResultReceivedRef.current = defaultedProps.onResultReceived
        onErrorRef.current = defaultedProps.onError ?? itiReactCoreContext.onError
        shouldQueryImmediatelyRef.current = defaultedProps.shouldQueryImmediately
        shouldSkipQueryRef.current = defaultedProps.shouldSkipQuery
    })

    const queryPromiseRef = useRef<CancellablePromise<unknown>>(
        CancellablePromise.resolve()
    )

    const doQueryInternal = useCallback(
        async (options?: Partial<DoQueryInternalOptions>): Promise<void> => {
            if (shouldSkipQueryRef.current(queryParams)) return

            const { changeLoading, handleErrors } = defaults(
                options,
                defaultDoQueryInternalOptions
            )

            onQueryStartedRef.current()
            if (changeLoading) onLoadingChangeRef.current(true)

            try {
                // Do this inside try-catch since query may throw an exception instead
                // of returning a promise that rejects
                const promise = queryRef.current(queryParams)
                queryPromiseRef.current.cancel()
                queryPromiseRef.current = promise

                const result = await promise

                onResultReceivedRef.current(result)

                // Only call onLoadingChange(false) on successful queries to prevent the
                // following undesirable behavior:
                //
                // 1. query1 calls onLoadingChange(true)
                // 2. queryParams change while query1 is still in progress.
                // 3. query2 calls onLoadingChange(true) and cancels query1's promise
                // 4. The catch and finally blocks execute for query1. If we call
                //    onLoadingChange(false) in the finally block, this overwrites the
                //    onLoadingChange(true) from query2. Now loading=false even though
                //    a query is in progress.
                if (changeLoading) onLoadingChangeRef.current(false)
            } catch (e) {
                if (handleErrors) {
                    onErrorRef.current(e)
                } else {
                    throw e
                }
            }
        },
        [queryParams]
    )

    useEffect(
        () => (): void => {
            queryPromiseRef.current.cancel()
        },
        []
    )

    const doQueryInternalRef = useRef(doQueryInternal)
    useEffect(() => {
        doQueryInternalRef.current = doQueryInternal
    })

    const prevQueryParamsRef = useRef<TQueryParams>()

    useEffect(() => {
        const shouldQueryImmediatelyBool = prevQueryParamsRef.current
            ? shouldQueryImmediatelyRef.current(queryParams, prevQueryParamsRef.current)
            : true
        prevQueryParamsRef.current = queryParams

        if (shouldQueryImmediatelyBool) {
            void doQueryInternal()
            return undefined
        }

        const promise = CancellablePromise.delay(debounceDelay).then(
            () => doQueryInternalRef.current(),
            () => undefined // no-op
        )

        // This only cancels the delay, not the query.
        // So if the user stops typing for more than `debounceDelay`, the query
        // will be started and allowed to complete (unless queryParams changes
        // while the query is in progress).
        return promise.cancel
    }, [doQueryInternal, debounceDelay, queryParams])

    const doQuery = useCallback(
        (options: { changeLoading: boolean } = { changeLoading: true }): void => {
            void doQueryInternalRef.current({
                handleErrors: true,
                changeLoading: options.changeLoading,
            })
        },
        []
    )

    const doQueryAsync = useCallback(
        (options: { changeLoading: boolean } = { changeLoading: true }): Promise<void> =>
            doQueryInternalRef.current({
                handleErrors: false,
                changeLoading: options.changeLoading,
            }),
        []
    )

    return {
        doQuery,
        doQueryAsync,
    }
}
