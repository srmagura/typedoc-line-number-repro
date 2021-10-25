import { renderHook } from '@testing-library/react-hooks'
import { noop } from 'lodash'
import { useFieldValidity } from './UseFieldValidity'

it('returns an onChildValidChange function with a stable identity', () => {
    const { result, rerender } = renderHook((props) => useFieldValidity(props), {
        initialProps: {
            onValidChange: noop,
            defaultValue: { test: false },
        },
    })
    const onChildValidChange0 = result.current.onChildValidChange

    rerender({ onValidChange: noop, defaultValue: { test: true } })
    const onChildValidChange1 = result.current.onChildValidChange

    expect(onChildValidChange0).toBe(onChildValidChange1)
})
