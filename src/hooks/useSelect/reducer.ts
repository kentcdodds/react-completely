import {getNextWrappingIndex, getNextNonDisabledIndex} from '../../utils'
import {getHighlightedIndexOnOpen, getDefaultValue} from '../utils'
import commonReducer from '../reducer'
import {getItemIndexByCharacterKey} from './utils'
import * as stateChangeTypes from './stateChangeTypes'
import {UseSelectState, UseSelectDispatchAction} from './types'

// eslint-disable-next-line complexity
export default function downshiftSelectReducer<Item>(
  state: UseSelectState<Item>,
  action: UseSelectDispatchAction<Item>,
): UseSelectState<Item> {
  const {type, props, shiftKey} = action
  let changes: Partial<UseSelectState<Item>>

  switch (type) {
    case stateChangeTypes.ItemClick:
      changes = {
        isOpen: getDefaultValue(props, 'isOpen'),
        highlightedIndex: getDefaultValue(props, 'highlightedIndex'),
        selectedItem: props.items[action.index],
      }

      break
    case stateChangeTypes.ToggleButtonKeyDownCharacter:
      {
        const lowercasedKey = action.key
        const inputValue = `${state.inputValue}${lowercasedKey}`
        const itemIndex = getItemIndexByCharacterKey({
          getItemNodeFromIndex: action.getItemNodeFromIndex,
          items: props.items,
          itemToString: props.itemToString,
          highlightedIndex: state.selectedItem
            ? props.items.indexOf(state.selectedItem)
            : -1,
          keysSoFar: inputValue,
        })

        changes = {
          inputValue,
          ...(itemIndex >= 0 && {
            selectedItem: props.items[itemIndex],
          }),
        }
      }

      break
    case stateChangeTypes.ToggleButtonKeyDownArrowDown:
      changes = {
        highlightedIndex: getHighlightedIndexOnOpen(
          props,
          state,
          1,
          action.getItemNodeFromIndex,
        ),
        isOpen: true,
      }

      break
    case stateChangeTypes.ToggleButtonKeyDownArrowUp:
      changes = {
        highlightedIndex: getHighlightedIndexOnOpen(
          props,
          state,
          -1,
          action.getItemNodeFromIndex,
        ),
        isOpen: true,
      }

      break
    case stateChangeTypes.MenuKeyDownEnter:
    case stateChangeTypes.MenuKeyDownSpaceButton:
      changes = {
        isOpen: getDefaultValue(props, 'isOpen'),
        highlightedIndex: getDefaultValue(props, 'highlightedIndex'),
        ...(state.highlightedIndex >= 0 && {
          selectedItem: props.items[state.highlightedIndex],
        }),
      }

      break
    case stateChangeTypes.MenuKeyDownHome:
      changes = {
        highlightedIndex: getNextNonDisabledIndex({
          moveAmount: 1,
          baseIndex: 0,
          itemCount: props.items.length,
          getItemNodeFromIndex: action.getItemNodeFromIndex,
          circular: false,
        }),
      }

      break
    case stateChangeTypes.MenuKeyDownEnd:
      changes = {
        highlightedIndex: getNextNonDisabledIndex({
          moveAmount: -1,
          baseIndex: props.items.length - 1,
          itemCount: props.items.length,
          getItemNodeFromIndex: action.getItemNodeFromIndex,
          circular: false,
        }),
      }

      break
    case stateChangeTypes.MenuKeyDownEscape:
      changes = {
        isOpen: false,
        highlightedIndex: -1,
      }

      break
    case stateChangeTypes.MenuBlur:
      changes = {
        isOpen: false,
        highlightedIndex: -1,
      }

      break
    case stateChangeTypes.MenuKeyDownCharacter:
      {
        const lowercasedKey = action.key
        const inputValue = `${state.inputValue}${lowercasedKey}`
        const highlightedIndex = getItemIndexByCharacterKey({
          getItemNodeFromIndex: action.getItemNodeFromIndex,
          items: props.items,
          itemToString: props.itemToString,
          highlightedIndex: state.highlightedIndex,
          keysSoFar: inputValue,
        })

        changes = {
          inputValue,
          ...(highlightedIndex >= 0 && {
            highlightedIndex,
          }),
        }
      }
      break
    case stateChangeTypes.MenuKeyDownArrowDown:
      changes = {
        highlightedIndex: getNextWrappingIndex({
          moveAmount: shiftKey ? 5 : 1,
          baseIndex: state.highlightedIndex,
          itemCount: props.items.length,
          getItemNodeFromIndex: action.getItemNodeFromIndex,
          circular: props.circularNavigation,
        }),
      }

      break
    case stateChangeTypes.MenuKeyDownArrowUp:
      changes = {
        highlightedIndex: getNextWrappingIndex({
          moveAmount: shiftKey ? -5 : -1,
          baseIndex: state.highlightedIndex,
          itemCount: props.items.length,
          getItemNodeFromIndex: action.getItemNodeFromIndex,
          circular: props.circularNavigation,
        }),
      }
      break

    case stateChangeTypes.FunctionSelectItem:
      changes = {
        selectedItem: action.selectedItem,
      }

      break
    default:
      return commonReducer(state, action, stateChangeTypes)
  }

  return {
    ...state,
    ...changes,
  }
}
