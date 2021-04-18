import * as React from 'react'

import {render, fireEvent, screen} from '@testing-library/react'
import {renderHook, RenderHookResult} from '@testing-library/react-hooks'
import userEvent from '@testing-library/user-event'

import {defaultProps} from '../utils'
import {items} from '../testUtils'
import useSelect from '.'
import {
  DropdownSelectProps,
  UseSelectDataTestIDs,
  UseSelectProps,
  RenderSelectResult,
  UseSelectReturnValue,
  RenderSelectOptions,
} from './types'

jest.mock('../../utils', () => {
  const utils = jest.requireActual('../../utils')

  return {
    ...utils,
    generateId: () => 'test-id',
  }
})

jest.mock('../utils', () => {
  const utils = jest.requireActual('../utils')
  const hooksUtils = jest.requireActual('../../utils')

  return {
    ...utils,
    useGetterPropsCalledChecker: () => hooksUtils.noop,
  }
})

beforeEach(jest.resetAllMocks)
afterAll(jest.restoreAllMocks)

const dataTestIds: UseSelectDataTestIDs = {
  toggleButton: 'toggle-button-id',
  menu: 'menu-id',
  item: (index: number) => `item-id-${index}`,
}

export function renderUseSelect<Item>(
  props: Partial<UseSelectProps<Item>> = {},
): RenderHookResult<UseSelectProps<Item>, UseSelectReturnValue<Item>> {
  return renderHook(() => useSelect({items: items as any[], ...props}))
}

export function renderSelect<Item>(
  props: Partial<UseSelectProps<Item>> = {},
  {uiCallback, renderItem}: RenderSelectOptions<Item> = {},
): RenderSelectResult<Item> {
  const renderSpy = jest.fn()
  const ui = (
    <DropdownSelect renderItem={renderItem} renderSpy={renderSpy} {...props} />
  )
  const wrapper = render(uiCallback ? uiCallback(ui) : ui)
  const rerender = (
    p: Partial<UseSelectProps<Item>>,
    o: RenderSelectOptions<Item>,
  ): void =>
    wrapper.rerender(<DropdownSelect renderSpy={renderSpy} {...p} {...o} />)

  const label = screen.getByText(/choose an element/i)
  const menu = screen.getByRole('listbox')
  const toggleButton = screen.getByTestId(dataTestIds.toggleButton)

  const getItemAtIndex = (index: number): HTMLElement =>
    screen.getByTestId(dataTestIds.item(index))
  const getItems = () => screen.queryAllByRole('option')
  const clickOnItemAtIndex = (index: number): void => {
    userEvent.click(getItemAtIndex(index))
  }
  const clickOnToggleButton = (): void => {
    userEvent.click(toggleButton)
  }
  const mouseMoveItemAtIndex = (index: number) => {
    userEvent.hover(getItemAtIndex(index))
  }
  const keyDownOnToggleButton = (key: string, options = {}) => {
    fireEvent.keyDown(toggleButton, {key, ...options})
  }
  const keyDownOnMenu = (key: string, options = {}) => {
    fireEvent.keyDown(menu, {key, ...options})
  }
  const blurMenu = () => {
    fireEvent.blur(menu)
  }
  const getA11yStatusContainer = () => screen.queryByRole('status')
  const mouseLeaveMenu = () => {
    userEvent.unhover(menu)
  }
  const tab = (shiftKey = false) => {
    userEvent.tab({shift: shiftKey})
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
    keyDownOnToggleButton,
    clickOnToggleButton,
    blurMenu,
    getA11yStatusContainer,
    mouseLeaveMenu,
    keyDownOnMenu,
    tab,
  }
}

function DropdownSelect<Item>({
  renderSpy,
  renderItem,
  ...props
}: DropdownSelectProps<Item>) {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getItemProps,
  } = useSelect({items: items as any[], ...props})
  const {itemToString} = props.itemToString ? props : defaultProps

  renderSpy()

  return (
    <div>
      <label {...getLabelProps()}>Choose an element:</label>
      <button
        data-testid={dataTestIds.toggleButton}
        {...getToggleButtonProps()}
      >
        {selectedItem ? itemToString(selectedItem) : 'Elements'}
      </button>
      <ul data-testid={dataTestIds.menu} {...getMenuProps()}>
        {isOpen &&
          (props.items || items).map((item: any, index: number) => {
            const stringItem = itemToString(item)

            return renderItem ? (
              renderItem({index, item, getItemProps, dataTestIds, stringItem})
            ) : (
              <li
                data-testid={dataTestIds.item(index)}
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
