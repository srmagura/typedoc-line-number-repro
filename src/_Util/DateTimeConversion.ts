/**
 * Converts hours & minutes to a decimal number of hours.
 *
 * ```
 * toDecimalHours(5, 30) // -> 5.5
 * ```
 *
 * @param hours should be an integer
 */
export function toDecimalHours(hours: number, minutes: number): number {
    return hours + minutes / 60
}

/**
 * Converts a decimal number of hours to integer hours & minutes.
 *
 * ```
 * toHoursAndMinutes(5.5) // -> { hours: 5, minutes: 30 }
 * ```
 */
export function toHoursAndMinutes(decimalHours: number): {
    hours: number
    minutes: number
} {
    const hours = Math.floor(decimalHours)
    const hoursDecimalPart = decimalHours % 1

    const decimalMinutes = hoursDecimalPart * 60
    const minutes = Math.round(decimalMinutes)

    return { hours, minutes }
}
