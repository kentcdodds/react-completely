import {renderUseSelect} from '../testUtils'
import {defaultIds} from '../../testUtils'

describe('getLabelProps', () => {
  test('should have a default id assigned', () => {
    const {result} = renderUseSelect()
    const labelProps = result.current.getLabelProps()

    expect(labelProps.id).toEqual(defaultIds.labelId)
  })

  test('should have custom id if set by the user', () => {
    const props = {
      labelId: 'my-custom-label-id',
    }
    const {result} = renderUseSelect(props)
    const labelProps = result.current.getLabelProps()

    expect(labelProps.id).toEqual(props.labelId)
  })

  test('should assign htmlFor with the value of the toggleButton id', () => {
    const props = {
      toggleButtonId: 'my-custom-toggle-button-id',
    }
    const {result} = renderUseSelect(props)
    const labelProps = result.current.getLabelProps()

    expect(labelProps.htmlFor).toEqual(props.toggleButtonId)
  })

  test('passes props downwards', () => {
    const {result} = renderUseSelect()
    const props = {foo: 'bar'}
    const labelProps = result.current.getLabelProps(props)

    expect(labelProps).toEqual(expect.objectContaining({foo: 'bar'}))
  })
})
