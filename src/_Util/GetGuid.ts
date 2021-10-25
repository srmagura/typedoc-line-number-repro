/* eslint-disable */

/**
 * Return a GUID. Great for React keys when there is no database ID that can be used.
 *
 * Callers: do not pass a value for the `a` argument
 *
 * Source: https://gist.github.com/jed/982883
 */
export function getGuid(a?: any): string {
    return a
        ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
        : (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, getGuid)
}
