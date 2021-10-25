import moment from 'moment-timezone'

/**
 * A configurable function for formatting a moment.
 *
 * @param mo any moment object
 * @param options
 * - `onlyShowDateIfNotToday`: when true, does not display the day if `mo` is today
 * - `convertToLocal`: if `mo` should be converted to local time
 * - `dateTimeFormat`: format used if date & time are displayed
 * - `timeFormat`: format used if only time is displayed
 */
export function formatDateTimeConfigurable(
    mo: moment.Moment,
    options: {
        onlyShowDateIfNotToday: boolean
        convertToLocal: boolean
        dateTimeFormat: string
        timeFormat: string
    }
): string {
    if (options.convertToLocal) mo = moment(mo).local()

    const alwaysShowDate = !options.onlyShowDateIfNotToday
    const isToday = mo.isSame(moment(), 'day')

    if (!isToday || alwaysShowDate) {
        return mo.format(options.dateTimeFormat)
    }
    return mo.format(options.timeFormat)
}
