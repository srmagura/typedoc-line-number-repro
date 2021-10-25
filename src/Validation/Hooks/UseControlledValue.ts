import { useRef, useState } from 'react'
import { noop } from 'lodash'

/**
 * Acts like a controlled component when value and onChange are provided.
 * Acts like an uncontrolled component otherwise.
 */
export interface UseControlledValueProps<TValue> {
    value?: TValue
    onChange?(value: TValue): void

    defaultValue?: TValue

    // Value to use if neither value nor defaultValue are provided
    fallbackValue: TValue
}

/**
 * Allows an input to work as either a controlled or uncontrolled component depending
 * on which props are provided.
 */
export function useControlledValue<TValue>(options: UseControlledValueProps<TValue>): {
    value: TValue
    onChange(value: TValue): void
} {
    const isControlled = typeof options.value !== 'undefined'

    if (isControlled && typeof options.defaultValue !== 'undefined') {
        console.warn('value and defaultValue were provided. defaultValue is ignored.')
    }

    const startedAsControlledComponentRef = useRef(isControlled)

    if (startedAsControlledComponentRef.current !== isControlled) {
        const formatBoolean = (isControlled: boolean): string =>
            isControlled ? 'controlled' : 'uncontrolled'

        console.warn(
            `The input was changed from ${formatBoolean(
                startedAsControlledComponentRef.current
            )} to ${formatBoolean(isControlled)}. This is not allowed.`
        )
    }

    const defaultValue =
        typeof options.defaultValue !== 'undefined'
            ? options.defaultValue
            : options.fallbackValue

    // Only used when uncontrolled
    const [value, setValue] = useState<TValue>(defaultValue)

    if (isControlled && typeof options.value !== 'undefined') {
        // CONTROLLED COMPONENT
        return {
            value: options.value,
            onChange: options.onChange ?? noop,
        }
    }

    // UNCONTROLLED COMPONENT
    return {
        value,
        // TODO make onChange have a stable identity
        onChange: (v): void => {
            setValue(v)
            if (options.onChange) options.onChange(v)
        },
    }
}
