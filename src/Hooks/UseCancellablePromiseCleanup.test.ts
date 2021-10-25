import { renderHook } from '@testing-library/react-hooks'
import { useCancellablePromiseCleanup } from './UseCancellablePromiseCleanup'

it('returns a capture function with a stable identity', () => {
    const { result, rerender } = renderHook(() => useCancellablePromiseCleanup())
    const result0 = result.current

    rerender()
    const result1 = result.current

    expect(result0).toBe(result1)
})
