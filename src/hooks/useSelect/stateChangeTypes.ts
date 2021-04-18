import productionEnum from '../../productionEnum.macro'

export const MenuKeyDownArrowDown = productionEnum(
  '__menu_keydown_arrow_down__',
)
export const MenuKeyDownArrowUp = productionEnum('__menu_keydown_arrow_up__')
export const MenuKeyDownEscape = productionEnum('__menu_keydown_escape__')
export const MenuKeyDownHome = productionEnum('__menu_keydown_home__')
export const MenuKeyDownEnd = productionEnum('__menu_keydown_end__')
export const MenuKeyDownEnter = productionEnum('__menu_keydown_enter__')
export const MenuKeyDownSpaceButton = productionEnum(
  '__menu_keydown_space_button__',
)
export const MenuKeyDownCharacter = productionEnum('__menu_keydown_character__')
export const MenuBlur = productionEnum('__menu_blur__')
export const MenuMouseLeave = productionEnum('__menu_mouse_leave__')

export const ItemMouseMove = productionEnum('__item_mouse_move__')
export const ItemClick = productionEnum('__item_click__')

export const ToggleButtonClick = productionEnum('__togglebutton_click__')
export const ToggleButtonKeyDownArrowDown = productionEnum(
  '__togglebutton_keydown_arrow_down__',
)
export const ToggleButtonKeyDownArrowUp = productionEnum(
  '__togglebutton_keydown_arrow_up__',
)
export const ToggleButtonKeyDownCharacter = productionEnum(
  '__togglebutton_keydown_character__',
)

export const FunctionToggleMenu = productionEnum('__function_toggle_menu__')
export const FunctionOpenMenu = productionEnum('__function_open_menu__')
export const FunctionCloseMenu = productionEnum('__function_close_menu__')
export const FunctionSetHighlightedIndex = productionEnum(
  '__function_set_highlighted_index__',
)
export const FunctionSelectItem = productionEnum('__function_select_item__')
export const FunctionSetInputValue = productionEnum(
  '__function_set_input_value__',
)
export const FunctionReset = productionEnum('__function_reset__')
