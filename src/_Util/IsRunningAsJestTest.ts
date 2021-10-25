/**
 * Used to run different code if running in a Jest test.
 */
export function isRunningAsJestTest(): boolean {
    // Necessary to prevent ReferenceError
    if (typeof process === 'undefined') return false

    return typeof process?.env?.JEST_WORKER_ID !== 'undefined'
}
