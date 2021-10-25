import { noop } from 'lodash'
import { useState, useEffect, useCallback, useRef } from 'react'
import produce from 'immer'

/** Tells us which form fields are valid. */
export interface FieldValidity {
    [name: string]: boolean
}

/**
 * @returns true if all entries in the `FieldValidity` object are valid, false otherwise
 */
function fieldValidityIsValid(fieldValidity: FieldValidity): boolean {
    return Object.values(fieldValidity).every((v) => v)
}

/**
 * Like [[`useFieldValidity`]], but lets you pass in whatever
 * `fieldValidityIsValid` function you want.
 *
 * Usually you'll want to use [[`useFieldValidity`]].
 */
export function useFieldValidityCore({
    onValidChange = noop,
    defaultValue = {},
    fieldValidityIsValid,
}: {
    onValidChange: ((valid: boolean) => void) | undefined
    defaultValue: FieldValidity | undefined
    fieldValidityIsValid: (fieldValidity: FieldValidity) => boolean
}): {
    onChildValidChange: (fieldName: string, valid: boolean) => void
    allFieldsValid: boolean
    fieldValidity: FieldValidity
} {
    const [fieldValidity, setFieldValidity] = useState<FieldValidity>(defaultValue)

    const onValidChangeRef = useRef(onValidChange)
    useEffect(() => {
        onValidChangeRef.current = onValidChange
    })

    const allFieldsValid = fieldValidityIsValid(fieldValidity)
    useEffect(() => {
        onValidChangeRef.current(allFieldsValid)
    }, [allFieldsValid])

    const onChildValidChange = useCallback((fieldName: string, valid: boolean): void => {
        setFieldValidity(
            produce((draft: FieldValidity) => {
                draft[fieldName] = valid
            })
        )
    }, [])

    return { onChildValidChange, allFieldsValid, fieldValidity }
}

/**
 * Keep tracks of a [[`FieldValidity`]] and returns a function to update the
 * the `FieldValidty`.
 *
 * You don't need to use this if there is only one validated input. In that case,
 * a simple `const [valid, setValid] = useState(false)` is sufficient.
 *
 * Top-level usage (e.g. when using `EasyFormDialog`):
 *
 * ```
 * const { onChildValidChange, allFieldsValid } = useFieldValidity()
 * ```
 *
 * Usage with `onValidChange` from props:
 *
 * ```
 * const { onChildValidChange } = useFieldValidity({ onValidChange })
 * ```
 */
export function useFieldValidity(options?: {
    onValidChange?: (valid: boolean) => void
    defaultValue?: FieldValidity
}): ReturnType<typeof useFieldValidityCore> {
    return useFieldValidityCore({
        onValidChange: options?.onValidChange,
        defaultValue: options?.defaultValue,
        fieldValidityIsValid,
    })
}
