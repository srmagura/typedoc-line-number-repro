/**
 * Returns a postal code with the space or hyphen removed.
 */
export function normalizePostalCode(postalCode: string | null | undefined): string {
    if (!postalCode) return ''
    return postalCode.replace(' ', '').replace('-', '')
}

/**
 * @returns true if the postal code is Canadian e.g. A1A 1A1
 */
export function isCanadianPostalCode(postalCode: string | null | undefined): boolean {
    if (!postalCode) return false
    return normalizePostalCode(postalCode).length === 6
}

/**
 * Normalizes and converts a postal code to a string. Handles 5 & 9 digit US postal codes
 * and Canadian postal codes.
 */
export function formatPostalCode(postalCode: string | null | undefined): string {
    if (!postalCode) return ''
    postalCode = normalizePostalCode(postalCode)

    switch (postalCode.length) {
        case 9:
            return `${postalCode.substr(0, 5)}-${postalCode.substr(5)}`
        case 6:
            // Canadian postal code
            return `${postalCode.substr(0, 3)} ${postalCode.substr(3)}`
        default:
        case 5:
            return postalCode
    }
}

/**
 * Formats the "city state zip" part of an address.
 */
export function formatAddressLine3(partialAddress: {
    city: string | null | undefined
    state: string | null | undefined
    postalCode: string | null | undefined
}): string {
    const postalCode = formatPostalCode(partialAddress.postalCode)

    // building the line3 string this way because all fields are nullable
    const stateZipParts = [partialAddress.state, postalCode].filter((s) => !!s)
    const stateZip = stateZipParts.join(' ')

    const line3Parts = [partialAddress.city, stateZip].filter((s) => !!s)

    const separator = !isCanadianPostalCode(partialAddress.postalCode) ? ', ' : ' '
    return line3Parts.join(separator)
}
