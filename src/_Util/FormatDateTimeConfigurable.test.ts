import moment from 'moment-timezone'
import { formatDateTimeConfigurable } from './FormatDateTimeConfigurable'

const timeFormat = 'h:mm a'
const dateTimeFormat = `${timeFormat}, M/D/YY`

test('basic', () => {
    const mo = moment('2020-01-01T13:35:49')

    expect(
        formatDateTimeConfigurable(mo, {
            convertToLocal: false,
            onlyShowDateIfNotToday: false,
            timeFormat,
            dateTimeFormat,
        })
    ).toBe('1:35 pm, 1/1/20')

    expect(
        formatDateTimeConfigurable(mo, {
            convertToLocal: false,
            onlyShowDateIfNotToday: true,
            timeFormat,
            dateTimeFormat,
        })
    ).toBe('1:35 pm, 1/1/20')
})

test('onlyShowDateIfNotToday', () => {
    const todayMoment = moment().hour(13).minutes(35)
    const yesterdayMoment = moment(todayMoment).subtract(1, 'day')

    expect(
        formatDateTimeConfigurable(todayMoment, {
            convertToLocal: false,
            onlyShowDateIfNotToday: true,
            timeFormat,
            dateTimeFormat,
        })
    ).toBe('1:35 pm')

    expect(
        formatDateTimeConfigurable(yesterdayMoment, {
            convertToLocal: false,
            onlyShowDateIfNotToday: true,
            timeFormat,
            dateTimeFormat,
        })
    ).toMatch(/1:35 pm, \d{1,2}\/\d{1,2}\/\d{2}/)
})
