import { Validators } from './Validators'

test('Validators.minLength', () => {
    const v = Validators.minLength(2)

    expect(v('ss')).toBeFalsy()

    expect(v(' s ')).toBeTruthy()
    expect(v('s')).toBeTruthy()
})

test('Validators.number', () => {
    const v = Validators.number()

    expect(v('12')).toBeFalsy()
    expect(v('1')).toBeFalsy()
    expect(v('1.')).toBeFalsy()
    expect(v('1.1')).toBeFalsy()
    expect(v('0.1')).toBeFalsy()
    expect(v('-0.1')).toBeFalsy()
    expect(v('-.1')).toBeFalsy()
    expect(v('-1.1')).toBeFalsy()
    expect(v('')).toBeFalsy()

    expect(v('-')).toBeTruthy()
    expect(v('.')).toBeTruthy()
    expect(v('-.')).toBeTruthy()
    expect(v('12b')).toBeTruthy()
    expect(v('b12')).toBeTruthy()
    expect(v('1.2.3')).toBeTruthy()
    expect(v('1..00')).toBeTruthy()

    const bigNumber = `1${'0'.repeat(400)}`
    expect(v(bigNumber)).toBeTruthy()
    expect(v(`-${bigNumber}`)).toBeTruthy()
})

test('Validators.integer', () => {
    const v = Validators.integer()

    expect(v('12')).toBeFalsy()
    expect(v('1')).toBeFalsy()
    expect(v('')).toBeFalsy()
    expect(v('-1')).toBeFalsy()

    expect(v('1.')).toBeTruthy()
    expect(v('1.1')).toBeTruthy()
    expect(v('0.1')).toBeTruthy()
    expect(v('-0.1')).toBeTruthy()
    expect(v('-.1')).toBeTruthy()
    expect(v('-1.1')).toBeTruthy()
    expect(v('-')).toBeTruthy()
    expect(v('.')).toBeTruthy()
    expect(v('-.')).toBeTruthy()
    expect(v('12b')).toBeTruthy()
    expect(v('b12')).toBeTruthy()
    expect(v('1.2.3')).toBeTruthy()
    expect(v('1..00')).toBeTruthy()
    expect(v('11111111111')).toBeTruthy()
    expect(v('-11111111111')).toBeTruthy()
})

describe('Validators.money', () => {
    test('allowNegative: false', () => {
        const v = Validators.money({ allowNegative: false })

        expect(v('13')).toBeFalsy()
        expect(v('13.')).toBeFalsy()
        expect(v('123133.99')).toBeFalsy()
        expect(v('1.5')).toBeFalsy()
        expect(v('1.50')).toBeFalsy()
        expect(v('.5')).toBeFalsy()
        expect(v('.57')).toBeFalsy()
        expect(v('0')).toBeFalsy()
        expect(v('')).toBeFalsy()

        expect(v('-13')).toBeTruthy()
        expect(v('-1.3')).toBeTruthy()
        expect(v('-.13')).toBeTruthy()
        expect(v('-0.13')).toBeTruthy()
        expect(v('-13')).toBeTruthy()
        expect(v('.')).toBeTruthy()
        expect(v('-.')).toBeTruthy()
        expect(v('1.2.3')).toBeTruthy()
        expect(v('1b')).toBeTruthy()
        expect(v('b1')).toBeTruthy()
        expect(v('1..00')).toBeTruthy()
        expect(v('1.555')).toBeTruthy()
        expect(v('1.5559')).toBeTruthy()
    })

    test('allowNegative: true', () => {
        const v = Validators.money({ allowNegative: true })

        expect(v('13')).toBeFalsy()
        expect(v('13.')).toBeFalsy()
        expect(v('123133.99')).toBeFalsy()
        expect(v('1.5')).toBeFalsy()
        expect(v('1.50')).toBeFalsy()
        expect(v('.5')).toBeFalsy()
        expect(v('.57')).toBeFalsy()
        expect(v('0')).toBeFalsy()
        expect(v('')).toBeFalsy()

        expect(v('-13')).toBeFalsy()
        expect(v('-1.3')).toBeFalsy()
        expect(v('-.13')).toBeFalsy()
        expect(v('-0.13')).toBeFalsy()
        expect(v('.')).toBeTruthy()
        expect(v('-.')).toBeTruthy()
        expect(v('1.2.3')).toBeTruthy()
        expect(v('1b')).toBeTruthy()
        expect(v('b1')).toBeTruthy()
        expect(v('1..00')).toBeTruthy()
        expect(v('1.555')).toBeTruthy()
        expect(v('1.5559')).toBeTruthy()
    })
})

test('Validators.email', () => {
    const v = Validators.email()

    expect(v('sam.magura@iticentral.com')).toBeFalsy()

    expect(v('<sam.magura@iticentral.com>')).toBeTruthy()
})
