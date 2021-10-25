import { Validator } from './Validator'

const MAX_SAFE_INT32 = 2 ** 31 - 1
const MIN_SAFE_INT32 = -MAX_SAFE_INT32

function required(): Validator<string> {
    return (value) => {
        if (!value.trim()) return 'This field is required.'

        return undefined
    }
}

function minLength(minLength: number): Validator<string> {
    return (value) => {
        // trim because backend may trim value before checking length
        if (value && value.trim().length < minLength)
            return `The value must be at least ${minLength} characters.`

        return undefined
    }
}

function maxLength(maxLength: number): Validator<string> {
    return (value) => {
        if (value && value.length > maxLength)
            return `The value cannot be longer than ${maxLength} characters.`

        return undefined
    }
}

// Don't do: !isNaN(parseFloat(value)) since then isNumber('12b') === true
function isNumber(value: string): boolean {
    // 1st case: has digits to right of decimal (may have digits to the left)
    // 2nd case: has digits to the left of decimal only
    if (/^-?\d*\.\d+$/.test(value) || /^-?\d+\.?$/.test(value)) {
        const n = parseFloat(value)
        return Math.abs(n) <= Number.MAX_VALUE
    }

    return false
}

/** For a required numeric/integer input, you must also pass the required() validator */
function number(): Validator<string> {
    return (value) => {
        if (value && !isNumber(value)) return 'You must enter a number.'

        return undefined
    }
}

function isInteger(value: string): boolean {
    if (/^-?\d+$/.test(value)) {
        const n = parseInt(value)
        return n <= MAX_SAFE_INT32 && n >= MIN_SAFE_INT32
    }

    return false
}

function integer(): Validator<string> {
    return (value) => {
        if (value && !isInteger(value)) return 'You must enter a whole number.'

        return undefined
    }
}

function greaterThan(x: number): Validator<string> {
    return (value) => {
        if (value && !isNumber(value)) return 'You must enter a number.'
        if (value && parseFloat(value) <= x) return `The value must be greater than ${x}.`

        return undefined
    }
}

function greaterThanOrEqual(x: number): Validator<string> {
    return (value) => {
        if (value && !isNumber(value)) return 'You must enter a number.'
        if (value && parseFloat(value) < x)
            return `The value must be greater than or equal to ${x}.`

        return undefined
    }
}

function lessThan(x: number): Validator<string> {
    return (value) => {
        if (value && !isNumber(value)) return 'You must enter a number.'
        if (value && parseFloat(value) >= x) return `The value must be less than ${x}.`

        return undefined
    }
}

function lessThanOrEqual(x: number): Validator<string> {
    return (value) => {
        if (value && !isNumber(value)) return 'You must enter a number.'
        if (value && parseFloat(value) > x)
            return `The value must be less than or equal to ${x}.`

        return undefined
    }
}

// From HTML5 spec - https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/** Regex-based email validator that uses the regex from the HTML5 spec. */
function email(): Validator<string> {
    return (value) => {
        if (value && !emailRegex.test(value))
            return 'You must enter a valid email address.'

        return undefined
    }
}

function money(options?: { allowNegative?: boolean }): Validator<string> {
    const allowNegative = options?.allowNegative ?? false

    const defaultFeedback =
        'You must enter a valid dollar amount. Do not type the $ sign.'

    return (value) => {
        value = value.trim()
        if (!value) return undefined

        const _isNumber = isNumber(value)
        const hasAtMost2DecimalPlaces = /^-?\d*\.?\d{0,2}$/.test(value)
        const signIsAllowed = allowNegative || parseFloat(value) >= 0

        if (!_isNumber) return defaultFeedback
        if (!signIsAllowed) return 'Negative amounts are not allowed.'
        if (!hasAtMost2DecimalPlaces) return defaultFeedback

        return undefined
    }
}

/**
 * Validators for `string` values. Each property on this object is a function that returns
 * a `Validator<string>`.
 *
 * ```
 * const validators = [Validators.required(), Validators.integer(), Validators.greaterThan(0)]
 * ```
 */
export const Validators = {
    required,
    minLength,
    maxLength,
    number,
    integer,
    greaterThan,
    greaterThanOrEqual,
    lessThan,
    lessThanOrEqual,
    email,
    money,
}
