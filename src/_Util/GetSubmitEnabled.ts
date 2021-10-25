/**
 * Returns a boolean indicating if a form's submit button should be enabled.
 *
 * Returns true if `formIsValid === true` or `showValidation === false`.
 *
 * This has the effect of disabling the submit button while async validation is in progress if validation is being shown.
 */
export function getSubmitEnabled(formIsValid: boolean, showValidation: boolean): boolean {
    return formIsValid || !showValidation
}
