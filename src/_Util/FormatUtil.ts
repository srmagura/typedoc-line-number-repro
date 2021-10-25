import { round } from 'lodash'

/**
 * Formats a dollar amount. Supports negative values.
 */
export function formatDollars(amount: number | null | undefined): string {
    if (typeof amount !== 'number') return ''

    const absoluteValue = `$${amount.toFixed(2).replace('-', '')}`

    // this is a unicode minus sign, not a hyphen
    return (amount < 0 ? '−' : '') + absoluteValue
}

/**
 * Formats a number as a percent. An input value of `1` means 100%.
 *
 * Supports negative values.
 *
 * @param purpose `'display'` if this percentage will be displayed, `'userInput'` if
 * percent will be used as the default value for a text input.
 * @param precision
 */
export function formatPercent(
    amount: number | null | undefined,
    purpose: 'display' | 'userInput',
    precision = 2
): string {
    if (typeof amount !== 'number') return ''

    amount *= 100
    const numberString = round(amount, precision).toString()

    if (purpose === 'display') {
        return `${numberString.replace('-', '−')}%`
    }
    return numberString
}
