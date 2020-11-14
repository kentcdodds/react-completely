import * as React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'
import userEvent from '@testing-library/user-event'
import {defaultProps} from '../utils'
import {items} from '../testUtils'
import useCombobox from '.'

const dataTestIds = {
  toggleButton: 'toggle-button-id',
  item: index => `item-id-${index}`,
  input: 'input-id',
}

jest.mock('../../utils', () => {
  const utils = jest.requireActual('../../utils')

  return {
    ...utils,
    generateId: () => 'test-id',
  }
})

/* istanbul ignore next */
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}))
// eslint-disable-next-line no-console
beforeEach(() => console.error.mockReset())
// eslint-disable-next-line no-console
afterAll(() => console.error.mockRestore())

const renderCombobox = (props, uiCallback) => {
  const renderSpy = jest.fn()
  const ui = <DropdownCombobox renderSpy={renderSpy} {...props} />
  const wrapper = render(uiCallback ? uiCallback(ui) : ui)
  const rerender = newProps =>
    wrapper.rerender(<DropdownCombobox renderSpy={renderSpy} {...newProps} />)
  const label = screen.getByText(/choose an element/i)
  const menu = screen.getByRole('listbox')
  const toggleButton = screen.getByTestId(dataTestIds.toggleButton)
  const input = screen.getByTestId(dataTestIds.input)
  const combobox = screen.getByRole('combobox')
  const getItemAtIndex = index => screen.getByTestId(dataTestIds.item(index))
  const getItems = () => screen.queryAllByRole('option')
  const clickOnItemAtIndex = index => {
    fireEvent.click(getItemAtIndex(index))
  }
  const clickOnToggleButton = () => {
    fireEvent.click(toggleButton)
  }
  const mouseMoveItemAtIndex = index => {
    fireEvent.mouseMove(getItemAtIndex(index))
  }
  const getA11yStatusContainer = () => screen.queryByRole('status')
  const mouseLeaveMenu = () => {
    fireEvent.mouseLeave(menu)
  }
  const changeInputValue = inputValue => {
    userEvent.type(input, inputValue)
  }
  const focusInput = () => {
    fireEvent.focus(input)
  }
  const keyDownOnInput = (key, options = {}) => {
    if (document.activeElement !== input) {
      focusInput()
    }

    fireEvent.keyDown(input, {key, ...options})
  }
  const blurInput = () => {
    fireEvent.blur(input)
  }

  return {
    ...wrapper,
    renderSpy,
    rerender,
    label,
    menu,
    toggleButton,
    getItemAtIndex,
    clickOnItemAtIndex,
    mouseMoveItemAtIndex,
    getItems,
    clickOnToggleButton,
    getA11yStatusContainer,
    mouseLeaveMenu,
    input,
    combobox,
    changeInputValue,
    keyDownOnInput,
    blurInput,
    focusInput,
  }
}

const DropdownCombobox = ({renderSpy, ...props}) => {
  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({items, ...props})
  const {itemToString} = props.itemToString ? props : defaultProps

  renderSpy()

  return (
    <div>
      <label {...getLabelProps()}>Choose an element:</label>
      <div data-testid={dataTestIds.combobox} {...getComboboxProps()}>
        <input data-testid={dataTestIds.input} {...getInputProps()} />
        <button
          data-testid={dataTestIds.toggleButton}
          {...getToggleButtonProps()}
        >
          Toggle
        </button>
      </div>
      <ul data-testid={dataTestIds.menu} {...getMenuProps()}>
        {isOpen &&
          (props.items || items).map((item, index) => {
            const stringItem =
              item instanceof Object ? itemToString(item) : item
            return (
              <li
                data-testid={dataTestIds.item(index)}
                style={
                  highlightedIndex === index ? {backgroundColor: 'blue'} : {}
                }
                key={`${stringItem}${index}`}
                {...getItemProps({item, index})}
              >
                {stringItem}
              </li>
            )
          })}
      </ul>
    </div>
  )
}

const renderUseCombobox = props => {
  return renderHook(() => useCombobox({items, ...props}))
}

export {renderUseCombobox, dataTestIds, renderCombobox}
