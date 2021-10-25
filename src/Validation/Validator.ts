import React from 'react'
import { CancellablePromise } from 'real-cancellable-promise'

/**
 * If the value is valid, a validator should return something falsy
 * (`undefined`, `null`, or `''`). If the value is invalid, the validator should
 * return validation feedback which will be displayed to the user. The
 * validation feedback can be a string or a `ReactNode` (e.g. a JSX element).
 *
 * There are two special values of `ValidatorOutput`:
 *
 * - [[`ASYNC_VALIDATION_PENDING`]]: The value should be considered invalid
 *   because async validation is in progress
 * - [[`INVALID_NO_FEEDBACK`]]: The value is invalid but no feedback should be
 *   displayed **because the reason why the input is invalid is being displayed
 *   somewhere else.**
 */
export type ValidatorOutput = string | undefined | null | React.ReactNode

export const ASYNC_VALIDATION_PENDING = 'ASYNC_VALIDATION_PENDING'
export const INVALID_NO_FEEDBACK = 'INVALID_NO_FEEDBACK'

/** The "contract" that all validators must implement. */
export type Validator<TValue> = (value: TValue) => ValidatorOutput

/** The "contract" that all async validators must implement. */
export type AsyncValidator<TValue> = (
    input: TValue
) => CancellablePromise<ValidatorOutput>

/**
 * Takes in multiple `ValidatorOutput`'s and returns the first invalid one, or
 * `undefined` if all are valid.
 */
export function combineValidatorOutput(outputs: ValidatorOutput[]): ValidatorOutput {
    for (const output of outputs) {
        if (output) {
            return output
        }
    }

    return undefined
}

/**
 * Applies multiple validators to a value and returns the combined result. Thin wrapper
 * around [[`combineValidatorOutput`]].
 */
export function getCombinedValidatorOutput<TValue>(
    value: TValue,
    validators: Validator<TValue>[]
): ValidatorOutput {
    return combineValidatorOutput(validators.map((v) => v(value)))
}
