/**
 * Converts `T | null | undefined` to `T | undefined`.
 */
export function nullToUndefined<T>(x: T | null | undefined): T | undefined {
    if (x == null) return undefined
    return x
}

/**
 * Converts `T | null | undefined` to `T | null`.
 */
export function undefinedToNull<T>(x: T | null | undefined): T | null {
    if (typeof x === 'undefined') return null
    return x
}
