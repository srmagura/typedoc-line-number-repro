import { isEqual, omit } from 'lodash'

/**
 * Returns the total numbers of pages based on the number of items and the page size.
 */
export function getTotalPages(itemCount: number, pageSize: number): number {
    return Math.ceil(itemCount / pageSize)
}

/**
 * Returns a page of items, given the page number (which starts at 1) and the page size.
 */
export function getPage<T>(allItems: T[], page: number, pageSize: number): T[] {
    const start = (page - 1) * pageSize
    return allItems.slice(start, start + pageSize)
}

/**
 * Compares the filters between the current query params and the new query params
 * and resets to the first page if any of the filters have changed.
 *
 * Part of `usePaginationHelpers`. Usually not used directly.
 *
 * @param selectFilters determines which properties of the query params object are
 * considered filters. By default, everything other than `page` and `pageSize` is
 * considered a filter.
 */
export function resetPageIfFiltersChanged<
    TQueryParams extends { page: number; pageSize?: number }
>(
    queryParams: TQueryParams,
    newQueryParams: TQueryParams,
    firstPage: 0 | 1 = 1,
    selectFilters: (queryParams: TQueryParams) => Partial<TQueryParams> = (queryParams) =>
        omit(queryParams, ['page', 'pageSize']) as Partial<TQueryParams>
): TQueryParams {
    if (!isEqual(selectFilters(queryParams), selectFilters(newQueryParams))) {
        return { ...newQueryParams, page: firstPage }
    }

    return newQueryParams
}

/**
 * Use this whenever doing server-side paging to account for items being deleted
 * while the user has the list open. Without this function, the user could see an empty
 * page because the number of items, and thus the total number of pages, has decreased.
 *
 * Part of `usePaginationHelpers`. Usually not used directly.
 */
export function preventNonExistentPage({
    page,
    pageHasItems,
    onPageChange,
    firstPage = 1,
}: {
    page: number
    pageHasItems: boolean
    onPageChange: (page: number) => void
    firstPage?: 0 | 1
}): void {
    if (page !== firstPage && !pageHasItems) {
        onPageChange(page - 1)
    }
}
