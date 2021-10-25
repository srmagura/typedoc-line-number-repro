import { formatPercent, formatDollars } from './FormatUtil'

test('formatDollars', () => {
    expect(formatDollars(null)).toBe('')
    expect(formatDollars(undefined)).toBe('')
    expect(formatDollars(12.0)).toBe('$12.00')
    expect(formatDollars(12.56)).toBe('$12.56')
    expect(formatDollars(-0.56)).toBe('−$0.56')
})

test('formatPercent', () => {
    expect(formatPercent(null, 'display')).toBe('')
    expect(formatPercent(undefined, 'display')).toBe('')
    expect(formatPercent(0.123456, 'display')).toBe('12.35%')
    expect(formatPercent(0.123456, 'display', 0)).toBe('12%')
    expect(formatPercent(-0.123456, 'display')).toBe('−12.35%')
    expect(formatPercent(0.46, 'display')).toBe('46%')

    expect(formatPercent(0.123456, 'userInput')).toBe('12.35')
    expect(formatPercent(0.123456, 'userInput', 0)).toBe('12')
    expect(formatPercent(-0.123456, 'userInput')).toBe('-12.35')
    expect(formatPercent(0.46, 'userInput')).toBe('46')
})
