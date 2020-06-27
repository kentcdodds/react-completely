import {useRef} from 'react'
import PropTypes from 'prop-types'
import {
  generateId,
  getA11yStatusMessage,
  isControlledProp,
  getState,
} from '../../utils'
import {
  getElementIds as getElementIdsCommon,
  defaultProps as defaultPropsCommon,
  getInitialState as getInitialStateCommon,
  useEnhancedReducer,
} from '../utils'
import {ControlledPropUpdatedSelectedItem} from './stateChangeTypes'

export function getElementIds({id, inputId, ...rest}) {
  const uniqueId = id === undefined ? `downshift-${generateId()}` : id

  return {
    inputId: inputId || `${uniqueId}-input`,
    ...getElementIdsCommon({id, ...rest}),
  }
}

export function getInitialState(props) {
  const initialState = getInitialStateCommon(props)
  const {selectedItem} = initialState
  let {inputValue} = initialState

  if (
    inputValue === '' &&
    selectedItem &&
    props.defaultInputValue === undefined &&
    props.initialInputValue === undefined &&
    props.inputValue === undefined
  ) {
    inputValue = props.itemToString(selectedItem)
  }

  return {
    ...initialState,
    inputValue,
  }
}

export const propTypes = {
  items: PropTypes.array.isRequired,
  itemToString: PropTypes.func,
  getA11yStatusMessage: PropTypes.func,
  getA11ySelectionMessage: PropTypes.func,
  circularNavigation: PropTypes.bool,
  highlightedIndex: PropTypes.number,
  defaultHighlightedIndex: PropTypes.number,
  initialHighlightedIndex: PropTypes.number,
  isOpen: PropTypes.bool,
  defaultIsOpen: PropTypes.bool,
  initialIsOpen: PropTypes.bool,
  selectedItem: PropTypes.any,
  initialSelectedItem: PropTypes.any,
  defaultSelectedItem: PropTypes.any,
  inputValue: PropTypes.string,
  defaultInputValue: PropTypes.string,
  initialInputValue: PropTypes.string,
  id: PropTypes.string,
  labelId: PropTypes.string,
  menuId: PropTypes.string,
  getItemId: PropTypes.func,
  inputId: PropTypes.string,
  toggleButtonId: PropTypes.string,
  selectedItemChanged: PropTypes.func,
  stateReducer: PropTypes.func,
  onSelectedItemChange: PropTypes.func,
  onHighlightedIndexChange: PropTypes.func,
  onStateChange: PropTypes.func,
  onIsOpenChange: PropTypes.func,
  onInputValueChange: PropTypes.func,
  environment: PropTypes.shape({
    addEventListener: PropTypes.func,
    removeEventListener: PropTypes.func,
    document: PropTypes.shape({
      getElementById: PropTypes.func,
      activeElement: PropTypes.any,
      body: PropTypes.any,
    }),
  }),
}

/**
 * The useCombobox version of useControlledReducer, which also
 * checks if the controlled prop selectedItem changed between
 * renders. If so, it will also update inputValue with its
 * string equivalent. It uses the common useEnhancedReducer to
 * compute the rest of the state.
 *
 * @param {Function} reducer Reducer function from downshift.
 * @param {Object} initialState Initial state of the hook.
 * @param {Object} props The hook props.
 * @returns {Array} An array with the state and an action dispatcher.
 */
export function useControlledReducer(reducer, initialState, props) {
  const previousSelectedItemRef = useRef()
  const [state, dispatch] = useEnhancedReducer(reducer, initialState, props)

  if (isControlledProp(props, 'selectedItem')) {
    if (
      props.selectedItemChanged(
        previousSelectedItemRef.current,
        props.selectedItem,
      )
    ) {
      dispatch({
        type: ControlledPropUpdatedSelectedItem,
        inputValue: props.itemToString(props.selectedItem),
      })
    }

    previousSelectedItemRef.current =
      state.selectedItem === previousSelectedItemRef.current
        ? props.selectedItem
        : state.selectedItem
  }

  return [getState(state, props), dispatch]
}

export const defaultProps = {
  ...defaultPropsCommon,
  selectedItemChanged: (prevItem, item) => prevItem !== item,
  getA11yStatusMessage,
  circularNavigation: true,
}
