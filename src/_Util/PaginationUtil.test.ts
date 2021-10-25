import { resetPageIfFiltersChanged } from './PaginationUtil'

describe('resetPageIfFiltersChanged', () => {
    interface QueryParams {
        name: string
        page: number
        pageSize: number
    }

    const defaultQueryParams: QueryParams = {
        name: '',
        page: 2,
        pageSize: 10,
    }

    test('no change', () => {
        const updatedQueryParams = resetPageIfFiltersChanged(
            defaultQueryParams,
            defaultQueryParams,
            1
        )

        expect(updatedQueryParams.page).toBe(defaultQueryParams.page)
    })

    test('filter changed', () => {
        const updatedQueryParams = resetPageIfFiltersChanged(
            defaultQueryParams,
            { ...defaultQueryParams, name: 's' },
            1
        )

        expect(updatedQueryParams.page).toBe(1)
    })

    test('page changed', () => {
        const updatedQueryParams = resetPageIfFiltersChanged(
            defaultQueryParams,
            { ...defaultQueryParams, page: 3 },
            1
        )

        expect(updatedQueryParams.page).toBe(3)
    })

    test('pageSize changed', () => {
        const updatedQueryParams = resetPageIfFiltersChanged(
            defaultQueryParams,
            { ...defaultQueryParams, pageSize: 25 },
            1
        )

        expect(updatedQueryParams.page).toBe(defaultQueryParams.page)
    })
})
