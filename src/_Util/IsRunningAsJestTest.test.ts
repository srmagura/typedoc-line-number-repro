import { isRunningAsJestTest } from './IsRunningAsJestTest'

test('isRunningAsJestTest', () => {
    expect(isRunningAsJestTest()).toBe(true)
})
