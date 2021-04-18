import * as React from 'react'

/* Internal */

export interface GetNextIndexOptions {
  moveAmount: number
  baseIndex: number
  itemCount: number
  getItemNodeFromIndex: (index: number) => HTMLElement
  circular: boolean
}

/* External */

export interface DownshiftEvent<T = Element, E = Event>
  extends React.SyntheticEvent<T, E> {
  preventDownshiftDefault?: boolean
  nativeEvent: E & {preventDownshiftDefault?: boolean}
}

type Callback = () => void

export interface DownshiftState<Item> {
  highlightedIndex: number | null
  inputValue: string | null
  isOpen: boolean
  selectedItem: Item | null
}

export enum StateChangeTypes {
  unknown = '__autocomplete_unknown__',
  mouseUp = '__autocomplete_mouseup__',
  itemMouseEnter = '__autocomplete_item_mouseenter__',
  keyDownArrowUp = '__autocomplete_keydown_arrow_up__',
  keyDownArrowDown = '__autocomplete_keydown_arrow_down__',
  keyDownEscape = '__autocomplete_keydown_escape__',
  keyDownEnter = '__autocomplete_keydown_enter__',
  clickItem = '__autocomplete_click_item__',
  blurInput = '__autocomplete_blur_input__',
  changeInput = '__autocomplete_change_input__',
  keyDownSpaceButton = '__autocomplete_keydown_space_button__',
  clickButton = '__autocomplete_click_button__',
  blurButton = '__autocomplete_blur_button__',
  controlledPropUpdatedSelectedItem = '__autocomplete_controlled_prop_updated_selected_item__',
  touchEnd = '__autocomplete_touchend__',
}

export interface DownshiftProps<Item> {
  initialSelectedItem?: Item
  initialInputValue?: string
  initialHighlightedIndex?: number | null
  initialIsOpen?: boolean
  defaultHighlightedIndex?: number | null
  defaultIsOpen?: boolean
  itemToString?: (item: Item | null) => string
  selectedItemChanged?: (prevItem: Item, item: Item) => boolean
  getA11yStatusMessage?: (options: A11yStatusMessageOptions<Item>) => string
  onChange?: (
    selectedItem: Item | null,
    stateAndHelpers: ControllerStateAndHelpers<Item>,
  ) => void
  onSelect?: (
    selectedItem: Item | null,
    stateAndHelpers: ControllerStateAndHelpers<Item>,
  ) => void
  onStateChange?: (
    options: StateChangeOptions<Item>,
    stateAndHelpers: ControllerStateAndHelpers<Item>,
  ) => void
  onInputValueChange?: (
    inputValue: string,
    stateAndHelpers: ControllerStateAndHelpers<Item>,
  ) => void
  stateReducer?: (
    state: DownshiftState<Item>,
    changes: StateChangeOptions<Item>,
  ) => Partial<StateChangeOptions<Item>>
  itemCount?: number
  highlightedIndex?: number | null
  inputValue?: string | null
  isOpen?: boolean
  selectedItem?: Item | null
  children?: ChildrenFunction<Item>
  id?: string
  inputId?: string
  labelId?: string
  menuId?: string
  getItemId?: (index?: number) => string
  environment?: Environment
  onOuterClick?: (stateAndHelpers: ControllerStateAndHelpers<Item>) => void
  scrollIntoView?: (node: HTMLElement, menuNode: HTMLElement) => void
  onUserAction?: (
    options: StateChangeOptions<Item>,
    stateAndHelpers: ControllerStateAndHelpers<Item>,
  ) => void
  suppressRefError?: boolean
}

export interface Environment {
  addEventListener: typeof window.addEventListener
  removeEventListener: typeof window.removeEventListener
  document: Document
}

export interface A11yStatusMessageOptions<Item> {
  highlightedIndex: number | null
  inputValue: string
  isOpen: boolean
  itemToString: (item: Item | null) => string
  previousResultCount: number
  resultCount: number
  highlightedItem: Item
  selectedItem: Item | null
}

export interface StateChangeOptions<Item>
  extends Partial<DownshiftState<Item>> {
  type: StateChangeTypes
}

type StateChangeFunction<Item> = (
  state: DownshiftState<Item>,
) => Partial<StateChangeOptions<Item>>

export interface GetRootPropsOptions {
  refKey: string
}

export interface GetInputPropsOptions
  extends React.HTMLProps<HTMLInputElement> {
  disabled?: boolean
}

export interface GetLabelPropsOptions
  extends React.HTMLProps<HTMLLabelElement> {}

export interface GetToggleButtonPropsOptions
  extends React.HTMLProps<HTMLButtonElement> {
  disabled?: boolean
}

export interface GetMenuPropsOptions
  extends React.HTMLProps<HTMLElement>,
    GetPropsWithRefKey {
  ['aria-label']?: string
}

export interface GetPropsCommonOptions {
  suppressRefError?: boolean
}

export interface GetPropsWithRefKey {
  refKey?: string
}

export interface GetItemPropsOptionsGeneric
  extends React.HTMLProps<HTMLElement> {
  disabled?: boolean
}

export interface GetItemPropsOptionsWithIndex
  extends GetItemPropsOptionsGeneric {
  index: number
}

export interface GetItemPropsOptionsWithItem<Item>
  extends GetItemPropsOptionsGeneric {
  item: Item
}

export type GetItemPropsOptions<Item> =
  | GetItemPropsOptionsWithIndex
  | GetItemPropsOptionsWithItem<Item>
  | (GetItemPropsOptionsWithIndex & GetItemPropsOptionsWithItem<Item>)

export interface GetLabelPropsReturnValue {
  htmlFor: string
  id: string
}

export interface GetMenuPropsReturnValue {
  // [refkey: string]: string
  role: string
  id: string
  'aria-labelledby': string | null
}

export interface GetToggleButtonPropsReturnValue {
  type: string
  role: string
  'aria-label': string
  'aria-haspopup': boolean
  'data-toggle': boolean
  onPress?: (e: React.SyntheticEvent) => void
  onClick?: (e: React.SyntheticEvent) => void
  onKeyDown?: (e: React.SyntheticEvent) => void
  onKeyUp?: (e: React.SyntheticEvent) => void
  onBlur?: (e: React.SyntheticEvent) => void
}

export interface PropGetters<Item> {
  getRootProps: (
    options?: GetRootPropsOptions,
    otherOptions?: GetPropsCommonOptions,
  ) => any
  getToggleButtonProps: <T>(
    options?: T & GetToggleButtonPropsOptions,
  ) => T & GetToggleButtonPropsReturnValue
  getLabelProps: <T>(
    options?: T & GetLabelPropsOptions,
  ) => T & GetLabelPropsReturnValue
  getMenuProps: <T>(
    options?: T & GetMenuPropsOptions,
    otherOptions?: GetPropsCommonOptions,
  ) => GetMenuPropsReturnValue & T
  getInputProps: <T>(options?: T) => T & GetInputPropsOptions
  getItemProps: (options: GetItemPropsOptions<Item>) => any
}

export interface Actions<Item> {
  reset: (
    otherStateToSet?: Partial<StateChangeOptions<Item>>,
    cb?: Callback,
  ) => void
  openMenu: (cb?: Callback) => void
  closeMenu: (cb?: Callback) => void
  toggleMenu: (
    otherStateToSet?: Partial<StateChangeOptions<Item>>,
    cb?: Callback,
  ) => void
  selectItem: (
    item: Item,
    otherStateToSet?: Partial<StateChangeOptions<Item>>,
    cb?: Callback,
  ) => void
  selectItemAtIndex: (
    index: number,
    otherStateToSet?: Partial<StateChangeOptions<Item>>,
    cb?: Callback,
  ) => void
  selectHighlightedItem: (
    otherStateToSet?: Partial<StateChangeOptions<Item>>,
    cb?: Callback,
  ) => void
  setHighlightedIndex: (
    index: number,
    otherStateToSet?: Partial<StateChangeOptions<Item>>,
    cb?: Callback,
  ) => void
  clearSelection: (cb?: Callback) => void
  clearItems: () => void
  setItemCount: (count: number) => void
  unsetItemCount: () => void
  setState: (
    stateToSet: Partial<StateChangeOptions<Item>> | StateChangeFunction<Item>,
    cb?: Callback,
  ) => void
  // props
  itemToString: (item: Item | null) => string
}

export type ControllerStateAndHelpers<Item> = DownshiftState<Item> &
  PropGetters<Item> &
  Actions<Item>

export type ChildrenFunction<Item> = (
  options: ControllerStateAndHelpers<Item>,
) => React.ReactNode

export default class Downshift<Item = any> extends React.Component<
  DownshiftProps<Item>
> {
  static stateChangeTypes: {
    unknown: StateChangeTypes.unknown
    mouseUp: StateChangeTypes.mouseUp
    itemMouseEnter: StateChangeTypes.itemMouseEnter
    keyDownArrowUp: StateChangeTypes.keyDownArrowUp
    keyDownArrowDown: StateChangeTypes.keyDownArrowDown
    keyDownEscape: StateChangeTypes.keyDownEscape
    keyDownEnter: StateChangeTypes.keyDownEnter
    clickItem: StateChangeTypes.clickItem
    blurInput: StateChangeTypes.blurInput
    changeInput: StateChangeTypes.changeInput
    keyDownSpaceButton: StateChangeTypes.keyDownSpaceButton
    clickButton: StateChangeTypes.clickButton
    blurButton: StateChangeTypes.blurButton
    controlledPropUpdatedSelectedItem: StateChangeTypes.controlledPropUpdatedSelectedItem
    touchEnd: StateChangeTypes.touchEnd
  }
}
