import * as React from 'react'
import {RenderResult} from '@testing-library/react'
import {
  A11yStatusMessageOptions,
  Environment,
  GetPropsWithRefKey,
  GetMenuPropsOptions,
  GetPropsCommonOptions,
  GetToggleButtonPropsOptions,
  GetLabelPropsOptions,
  GetMenuPropsReturnValue,
  GetItemPropsOptions,
  GetLabelPropsReturnValue,
} from '../../types'

/* Internal */

export interface GetItemIndexByCharacterKeyOptions<Item> {
  keysSoFar: string
  highlightedIndex: number
  items: Item[]
  itemToString(item: Item): string
  getItemNodeFromIndex(index: number): HTMLElement
}

export interface UseSelectDataTestIDs {
  toggleButton: string
  menu: string
  item: (index: number) => string
}

export type RenderItemOptions<Item> = UseSelectGetItemPropsOptions<Item> & {
  getItemProps: (options: UseSelectGetItemPropsOptions<Item>) => any
  dataTestIds: UseSelectDataTestIDs
  stringItem: string
  index: number
  item: Item
}

export interface DropdownSelectProps<Item>
  extends Partial<UseSelectProps<Item>> {
  renderItem?: (item: RenderItemOptions<Item>) => JSX.Element
  renderSpy?: jest.Mock
}

export interface RenderSelectOptions<Item> {
  uiCallback?: (ui: JSX.Element) => JSX.Element
  renderItem?: (item: RenderItemOptions<Item>) => JSX.Element
}

export interface DropdownSelectResult extends RenderResult {
  renderSpy: jest.Mock
}

export interface RenderSelectResult<Item>
  extends Omit<RenderResult, 'rerender'> {
  renderSpy: jest.Mock
  rerender: (
    p: Partial<UseSelectProps<Item>>,
    u: RenderSelectOptions<Item>,
  ) => void
  label: HTMLElement
  menu: HTMLElement
  toggleButton: HTMLElement
  getItemAtIndex: (index: number) => HTMLElement
  clickOnItemAtIndex: (index: number) => void
  mouseMoveItemAtIndex: (index: number) => void
  getItems: () => HTMLElement[]
  keyDownOnToggleButton: (key: string, options: unknown) => void
  clickOnToggleButton: () => void
  blurMenu: () => void
  getA11yStatusContainer: () => HTMLElement
  mouseLeaveMenu: () => void
  keyDownOnMenu: (key: string, options?: unknown) => void
  tab: (shiftKey?: boolean) => void
}

/* External */

export interface UseSelectState<Item> {
  highlightedIndex: number
  selectedItem: Item | null
  isOpen: boolean
  inputValue: string
}

export enum UseSelectStateChangeTypes {
  MenuKeyDownArrowDown = '__menu_keydown_arrow_down__',
  MenuKeyDownArrowUp = '__menu_keydown_arrow_up__',
  MenuKeyDownEscape = '__menu_keydown_escape__',
  MenuKeyDownHome = '__menu_keydown_home__',
  MenuKeyDownEnd = '__menu_keydown_end__',
  MenuKeyDownEnter = '__menu_keydown_enter__',
  MenuKeyDownSpaceButton = '__menu_keydown_space_button__',
  MenuKeyDownCharacter = '__menu_keydown_character__',
  MenuBlur = '__menu_blur__',
  MenuMouseLeave = '__menu_mouse_leave__',
  ItemMouseMove = '__item_mouse_move__',
  ItemClick = '__item_click__',
  ToggleButtonKeyDownCharacter = '__togglebutton_keydown_character__',
  ToggleButtonKeyDownArrowDown = '__togglebutton_keydown_arrow_down__',
  ToggleButtonKeyDownArrowUp = '__togglebutton_keydown_arrow_up__',
  ToggleButtonClick = '__togglebutton_click__',
  FunctionToggleMenu = '__function_toggle_menu__',
  FunctionOpenMenu = '__function_open_menu__',
  FunctionCloseMenu = '__function_close_menu__',
  FunctionSetHighlightedIndex = '__function_set_highlighted_index__',
  FunctionSelectItem = '__function_select_item__',
  FunctionSetInputValue = '__function_set_input_value__',
  FunctionReset = '__function_reset__',
}

export interface UseSelectProps<Item> {
  items: Item[]
  itemToString?: (item: Item | null) => string
  getA11yStatusMessage?: (options: A11yStatusMessageOptions<Item>) => string
  getA11ySelectionMessage?: (options: A11yStatusMessageOptions<Item>) => string
  circularNavigation?: boolean
  highlightedIndex?: number
  initialHighlightedIndex?: number
  defaultHighlightedIndex?: number
  isOpen?: boolean
  initialIsOpen?: boolean
  defaultIsOpen?: boolean
  selectedItem?: Item | null
  initialSelectedItem?: Item | null
  defaultSelectedItem?: Item | null
  id?: string
  labelId?: string
  menuId?: string
  toggleButtonId?: string
  getItemId?: (index: number) => string
  scrollIntoView?: (node: HTMLElement, menuNode: HTMLElement) => void
  stateReducer?: (
    state: UseSelectState<Item>,
    actionAndChanges: UseSelectStateChangeOptions<Item>,
  ) => Partial<UseSelectState<Item>>
  onSelectedItemChange?: (changes: UseSelectStateChange<Item>) => void
  onIsOpenChange?: (changes: UseSelectStateChange<Item>) => void
  onHighlightedIndexChange?: (changes: UseSelectStateChange<Item>) => void
  onStateChange?: (changes: UseSelectStateChange<Item>) => void
  environment?: Environment
}

export interface UseSelectStateChangeOptions<Item>
  extends UseSelectDispatchAction<Item> {
  changes: Partial<UseSelectState<Item>>
}

export interface UseSelectDispatchAction<Item> {
  type: UseSelectStateChangeTypes
  getItemNodeFromIndex?: (index: number) => HTMLElement
  shiftKey?: boolean
  key?: string
  index?: number
  highlightedIndex?: number
  selectedItem?: Item | null
  inputValue?: string
  props: UseSelectProps<Item>
}

export interface UseSelectStateChange<Item>
  extends Partial<UseSelectState<Item>> {
  type: UseSelectStateChangeTypes
}

export interface UseSelectGetMenuPropsOptions extends GetMenuPropsOptions {}

export interface UseSelectGetToggleButtonPropsOptions
  extends GetPropsWithRefKey,
    GetToggleButtonPropsOptions {}

export interface UseSelectGetLabelPropsOptions extends GetLabelPropsOptions {}

export type UseSelectGetItemPropsOptions<Item> = GetItemPropsOptions<Item>

export interface UseSelectGetLabelPropsReturnValue
  extends GetLabelPropsReturnValue {}

export interface UseSelectGetMenuPropsReturnValue
  extends GetMenuPropsReturnValue {
  // [refkey: string]: string
  tabIndex: string
  'aria-activedescendant'?: string
  onMouseLeave: (e: React.SyntheticEvent) => void
  onKeyDown: (e: React.SyntheticEvent) => void
  onBlur: (e: React.SyntheticEvent) => void
}

export interface UseSelectPropGetters<Item> {
  getToggleButtonProps: (
    options?: UseSelectGetToggleButtonPropsOptions,
    otherOptions?: GetPropsCommonOptions,
  ) => any
  getLabelProps: <T>(
    options?: T & UseSelectGetLabelPropsOptions,
  ) => T & UseSelectGetLabelPropsReturnValue
  getMenuProps: <T>(
    options?: T & UseSelectGetMenuPropsOptions,
    otherOptions?: GetPropsCommonOptions,
  ) => T & UseSelectGetMenuPropsReturnValue
  getItemProps: (options: UseSelectGetItemPropsOptions<Item>) => any
}

export interface UseSelectActions<Item> {
  reset: () => void
  openMenu: () => void
  closeMenu: () => void
  toggleMenu: () => void
  selectItem: (item: Item) => void
  setHighlightedIndex: (index: number) => void
}

export type UseSelectReturnValue<Item> = UseSelectState<Item> &
  UseSelectPropGetters<Item> &
  UseSelectActions<Item>

export interface UseSelectInterface {
  <Item>(props: UseSelectProps<Item>): UseSelectReturnValue<Item>
  stateChangeTypes: {
    MenuKeyDownArrowDown: UseSelectStateChangeTypes.MenuKeyDownArrowDown
    MenuKeyDownArrowUp: UseSelectStateChangeTypes.MenuKeyDownArrowUp
    MenuKeyDownEscape: UseSelectStateChangeTypes.MenuKeyDownEscape
    MenuKeyDownHome: UseSelectStateChangeTypes.MenuKeyDownHome
    MenuKeyDownEnd: UseSelectStateChangeTypes.MenuKeyDownEnd
    MenuKeyDownEnter: UseSelectStateChangeTypes.MenuKeyDownEnter
    MenuKeyDownSpaceButton: UseSelectStateChangeTypes.MenuKeyDownSpaceButton
    MenuKeyDownCharacter: UseSelectStateChangeTypes.MenuKeyDownCharacter
    MenuBlur: UseSelectStateChangeTypes.MenuBlur
    MenuMouseLeave: UseSelectStateChangeTypes.MenuMouseLeave
    ItemMouseMove: UseSelectStateChangeTypes.ItemMouseMove
    ItemClick: UseSelectStateChangeTypes.ItemClick
    ToggleButtonClick: UseSelectStateChangeTypes.ToggleButtonClick
    ToggleButtonKeyDownCharacter: UseSelectStateChangeTypes.ToggleButtonKeyDownCharacter
    ToggleButtonKeyDownArrowDown: UseSelectStateChangeTypes.ToggleButtonKeyDownArrowDown
    ToggleButtonKeyDownArrowUp: UseSelectStateChangeTypes.ToggleButtonKeyDownArrowUp
    FunctionToggleMenu: UseSelectStateChangeTypes.FunctionToggleMenu
    FunctionOpenMenu: UseSelectStateChangeTypes.FunctionOpenMenu
    FunctionCloseMenu: UseSelectStateChangeTypes.FunctionCloseMenu
    FunctionSetHighlightedIndex: UseSelectStateChangeTypes.FunctionSetHighlightedIndex
    FunctionSelectItem: UseSelectStateChangeTypes.FunctionSelectItem
    FunctionSetInputValue: UseSelectStateChangeTypes.FunctionSetInputValue
    FunctionReset: UseSelectStateChangeTypes.FunctionReset
  }
}
