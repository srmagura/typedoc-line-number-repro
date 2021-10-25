import { hasIErrorProperties, IError } from './IError'

enum ErrorType {
    MY_TYPE = 'MY_TYPE',
}

test('hasIErrorProperties', () => {
    expect(
        hasIErrorProperties<ErrorType>({ type: ErrorType.MY_TYPE, message: 'myMessage' })
    ).toBe(true)
    expect(hasIErrorProperties<ErrorType>({ message: 'myMessage' })).toBe(false)
})

test('createIError', () => {
    const ierror = new IError<ErrorType>({
        type: ErrorType.MY_TYPE,
        message: 'myMessage',
        diagnosticInfo: 'myDiagnosticInfo',
        data: { x: 1 },
    })

    expect(ierror.type).toBe(ErrorType.MY_TYPE)
    expect(ierror.message).toBe('myMessage')
    expect(ierror.diagnosticInfo).toBe('myDiagnosticInfo')
    expect(ierror.handled).toBe(false)
    expect(ierror.data.x).toBe(1)
    expect(ierror.stack?.length).toBeGreaterThan(0)
})
