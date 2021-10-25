import { useRef, useEffect } from 'react'

/**
 * Stores and returns the previous value of something. Useful in niche situations.
 * Internally, it uses `useRef`.
 *
 * ```
 * const previousLocation = usePrevious(location)
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>()

    useEffect(() => {
        ref.current = value
    }, [value])

    return ref.current
}
