import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import Downshift from '../'
import setA11yStatus from '../set-a11y-status'
import * as utils from '../utils'

jest.useFakeTimers()
jest.mock('../set-a11y-status')
jest.mock('../utils', () => {
  const realUtils = require.requireActual('../utils')
  return {
    ...realUtils,
    scrollIntoView: jest.fn(),
  }
})

afterEach(() => {
  utils.scrollIntoView.mockReset()
})

test('do not set state after unmount', () => {
  const handleStateChange = jest.fn()
  const childrenSpy = jest.fn(({getInputProps}) => (
    <div>
      <input {...getInputProps({'data-testid': 'input'})} />
      <button {...getInputProps({'data-testid': 'button'})}>Toggle</button>
    </div>
  ))
  const MyComponent = () => (
    <Downshift onStateChange={handleStateChange}>{childrenSpy}</Downshift>
  )
  const {queryByTestId, container, unmount} = render(<MyComponent />)
  const button = queryByTestId('button')
  document.body.appendChild(container)

  // blur toggle button
  fireEvent.blur(button)
  handleStateChange.mockClear()

  // unmount
  unmount()
  expect(handleStateChange).toHaveBeenCalledTimes(0)
})

test('handles mouse events properly to reset state', () => {
  const handleStateChange = jest.fn()
  const childrenSpy = jest.fn(({getInputProps}) => (
    <div>
      <input {...getInputProps({'data-testid': 'input'})} />
    </div>
  ))
  const MyComponent = () => (
    <Downshift onStateChange={handleStateChange}>{childrenSpy}</Downshift>
  )
  const {queryByTestId, container, unmount} = render(<MyComponent />)
  const input = queryByTestId('input')
  document.body.appendChild(container)

  // open the menu
  fireEvent.keyDown(input, {key: 'ArrowDown'})
  handleStateChange.mockClear()

  // mouse down and up on within the autocomplete node
  mouseDownAndUp(input)
  expect(handleStateChange).toHaveBeenCalledTimes(0)

  // mouse down and up on outside the autocomplete node
  mouseDownAndUp(document.body)
  expect(handleStateChange).toHaveBeenCalledTimes(1)

  childrenSpy.mockClear()
  // does not call our state change handler when no state changes
  mouseDownAndUp(document.body)
  expect(handleStateChange).toHaveBeenCalledTimes(1)
  // does not rerender when no state changes
  expect(childrenSpy).not.toHaveBeenCalled()

  // cleans up
  unmount()
  mouseDownAndUp(document.body)
  expect(handleStateChange).toHaveBeenCalledTimes(1)
})

test('handles state change for touchevent events', () => {
  const handleStateChange = jest.fn()
  const childrenSpy = jest.fn(({getToggleButtonProps}) => (
    <button {...getToggleButtonProps({'data-testid': 'button'})} />
  ))

  const MyComponent = () => (
    <Downshift onStateChange={handleStateChange}>{childrenSpy}</Downshift>
  )
  const {queryByTestId, container, unmount} = render(<MyComponent />)
  document.body.appendChild(container)

  const button = queryByTestId('button')

  // touch outside for coverage
  fireEvent.touchStart(document.body)
  fireEvent.touchEnd(document.body)

  // open menu
  fireEvent.click(button)
  jest.runAllTimers()

  expect(handleStateChange).toHaveBeenCalledTimes(1)

  // touchmove (scroll) outside downshift should not trigger state change
  fireEvent.touchStart(document.body)
  fireEvent.touchMove(document.body)
  fireEvent.touchEnd(document.body)

  jest.runAllTimers()
  expect(handleStateChange).toHaveBeenCalledTimes(1)

  // touch outside downshift
  fireEvent.touchStart(document.body)
  fireEvent.touchEnd(document.body)

  jest.runAllTimers()
  expect(handleStateChange).toHaveBeenCalledTimes(2)

  unmount()
})

test('props update causes the a11y status to be updated', () => {
  setA11yStatus.mockReset()
  const MyComponent = () => (
    <Downshift isOpen={false}>
      {({getInputProps, getItemProps, isOpen}) => (
        <div>
          <input {...getInputProps()} />
          {isOpen ? <div {...getItemProps({item: 'foo', index: 0})} /> : null}
        </div>
      )}
    </Downshift>
  )
  const {container, unmount} = render(<MyComponent />)
  render(<MyComponent isOpen={true} />, {container})
  jest.runAllTimers()
  expect(setA11yStatus).toHaveBeenCalledTimes(1)
  render(<MyComponent isOpen={false} />, {container})
  unmount()
  jest.runAllTimers()
  expect(setA11yStatus).toHaveBeenCalledTimes(1)
})

test('inputValue initializes properly if the selectedItem is controlled and set', () => {
  const childrenSpy = jest.fn(() => null)
  render(<Downshift selectedItem="foo">{childrenSpy}</Downshift>)
  expect(childrenSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      inputValue: 'foo',
    }),
  )
})

test('inputValue initializes properly if selectedItem is set to 0', () => {
  const childrenSpy = jest.fn(() => null)
  render(<Downshift selectedItem={0}>{childrenSpy}</Downshift>)
  expect(childrenSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      inputValue: '0',
    }),
  )
})

test('props update of selectedItem will update the inputValue state', () => {
  const childrenSpy = jest.fn(() => null)
  const {container} = render(
    <Downshift selectedItem={null}>{childrenSpy}</Downshift>,
  )
  childrenSpy.mockClear()
  render(<Downshift selectedItem="foo">{childrenSpy}</Downshift>, {container})
  expect(childrenSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      inputValue: 'foo',
    }),
  )
})

test('the callback is invoked on selected item only if it is a function', () => {
  let renderArg
  const childrenSpy = jest.fn(controllerArg => {
    renderArg = controllerArg
    return <div />
  })
  const callbackSpy = jest.fn(x => x)
  render(<Downshift selectedItem="foo">{childrenSpy}</Downshift>)

  childrenSpy.mockClear()
  callbackSpy.mockClear()
  renderArg.selectItem('foo', {}, callbackSpy)
  expect(callbackSpy).toHaveBeenCalledTimes(1)
  renderArg.selectItem('foo', {})
})

test('props update of selectedItem will not update inputValue state', () => {
  const onInputValueChangeSpy = jest.fn(() => null)
  const initialProps = {
    onInputValueChange: onInputValueChangeSpy,
    selectedItemChanged: (prevItem, item) => prevItem.id !== item.id,
    selectedItem: {id: '123', value: 'wow'},
    itemToString: i => (i ? i.value : ''),
    render: () => null,
  }
  const {container} = render(<Downshift {...initialProps} />)
  onInputValueChangeSpy.mockClear()
  render(
    <Downshift
      {...initialProps}
      selectedItem={{id: '123', value: 'not wow'}}
    />,
    {container},
  )
  expect(onInputValueChangeSpy).not.toHaveBeenCalled()
})

test('controlled highlighted index change scrolls the item into view', () => {
  // sadly, testing scroll is really difficult in a jsdom environment.
  // Perhaps eventually we'll add real integration tests with cypress
  // or something, but for now we'll just mock the implementation of
  // utils.scrollIntoView and ensure it's called with the proper arguments
  // assuming that the test suite for utils.scrollIntoView will ensure
  // this functionality doesn't break.
  const oneHundredItems = Array.from({length: 100})
  const renderFn = jest.fn(({getItemProps, getMenuProps}) => (
    <div>
      <div data-testid="menu" {...getMenuProps()}>
        {oneHundredItems.map((x, i) => (
          <div key={i} {...getItemProps({item: i})} data-testid={`item-${i}`} />
        ))}
      </div>
    </div>
  ))
  const {container, updateProps, queryByTestId} = setup({
    highlightedIndex: 1,
    render: renderFn,
  })
  document.body.appendChild(container)
  renderFn.mockClear()
  updateProps({highlightedIndex: 75})
  expect(renderFn).toHaveBeenCalledTimes(1)

  expect(utils.scrollIntoView).toHaveBeenCalledTimes(1)
  const menuDiv = queryByTestId('menu')
  expect(utils.scrollIntoView).toHaveBeenCalledWith(
    queryByTestId('item-75'),
    menuDiv,
  )
})

test('selecting an item calls onInputValueChange with reduced state', () => {
  const stateReducer = (_, changes) => ({
    ...changes,
    selectedItem: 'foo',
  })
  const onInputValueChangeSpy = jest.fn((_, stateAndHelpers) => stateAndHelpers)
  const {selectItem} = setup({
    stateReducer,
    onInputValueChange: onInputValueChangeSpy,
  })
  selectItem('bar')
  expect(onInputValueChangeSpy).toHaveReturnedWith(
    expect.objectContaining({selectedItem: 'foo'}),
  )
})

test('onInputValueChange is called when reduced state includes inputValue', () => {
  const stateReducer = (_, changes) => {
    return {
      ...changes,
      inputValue: 'baz',
    }
  }
  const onInputValueChangeSpy = jest.fn(() => null)
  const {openMenu} = setup({
    stateReducer,
    inputValue: 'foo',
    onInputValueChange: onInputValueChangeSpy,
  })
  openMenu()
  expect(onInputValueChangeSpy).toHaveBeenCalledTimes(1)
})

test('onInputValueChange is not called when reduced state does not include inputValue', () => {
  const stateReducer = (_, changes) => {
    delete changes.inputValue
    return changes
  }
  const onInputValueChangeSpy = jest.fn(() => null)
  const {selectItem} = setup({
    stateReducer,
    inputValue: 'foo',
    onInputValueChange: onInputValueChangeSpy,
  })
  selectItem('bar')
  expect(onInputValueChangeSpy).toHaveBeenCalledTimes(0)
})

function mouseDownAndUp(node) {
  fireEvent.mouseDown(node)
  fireEvent.mouseUp(node)
}

function setup({render: renderFn = () => <div />, ...props} = {}) {
  // eslint-disable-next-line prefer-const
  let container, renderArg
  const childrenSpy = jest.fn(controllerArg => {
    renderArg = controllerArg
    return renderFn(controllerArg)
  })
  const updateProps = newProps => {
    return render(
      <Downshift children={childrenSpy} {...props} {...newProps} />,
      {
        container,
      },
    )
  }
  const renderUtils = updateProps()
  container = renderUtils.container
  return {
    childrenSpy,
    updateProps,
    ...renderUtils,
    ...renderArg,
  }
}
