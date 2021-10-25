import { renderHook } from '@testing-library/react-hooks'
import { useControlledValue } from '..'

it('is controlled when value but not onChange are passed', () => {
    let value = '1'

    const { result, rerender } = renderHook(() =>
        useControlledValue<string>({
            value,
            fallbackValue: '',
        })
    )

    expect(result.current.value).toBe('1')

    value = '2'
    rerender()
    expect(result.current.value).toBe('2')
})
