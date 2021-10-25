import { normalizePhoneNumber, formatPhoneNumber } from './PhoneNumberUtil'

test('normalizePhoneNumber', () => {
    expect(normalizePhoneNumber('  9194122710  ')).toBe('19194122710')
    expect(normalizePhoneNumber('919-4122710')).toBe('19194122710')
    expect(normalizePhoneNumber('1(919)-4122710')).toBe('19194122710')
    expect(normalizePhoneNumber('19194122710')).toBe('19194122710')
})

test('formatPhoneNumber', () => {
    expect(formatPhoneNumber('  9194122710  ')).toBe('(919) 412-2710')
    expect(formatPhoneNumber('919-4122710')).toBe('(919) 412-2710')
    expect(formatPhoneNumber('1(919)-4122710')).toBe('(919) 412-2710')
    expect(formatPhoneNumber('19194122710')).toBe('(919) 412-2710')
})
