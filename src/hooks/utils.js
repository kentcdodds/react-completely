import PropTypes from 'prop-types'
import {useRef, useCallback, useReducer, useEffect} from 'react'
import {
  scrollIntoView,
  getNextWrappingIndex,
  getState,
  generateId,
  debounce,
  targetWithinDownshift,
  validateControlledUnchanged,
} from '../utils'
import setStatus from '../set-a11y-status'

const dropdownDefaultStateValues = {
  highlightedIndex: -1,
  isOpen: false,
  selectedItem: null,
  inputValue: '',
}

function callOnChangeProps(action, state, newState) {
  const {props, type} = action
  const changes = {}

  Object.keys(state).forEach(key => {
    invokeOnChangeHandler(key, action, state, newState)

    if (newState[key] !== state[key]) {
      changes[key] = newState[key]
    }
  })

  if (props.onStateChange && Object.keys(changes).length) {
    props.onStateChange({type, ...changes})
  }
}

function invokeOnChangeHandler(key, action, state, newState) {
  const {props, type} = action
  const handler = `on${capitalizeString(key)}Change`
  if (
    props[handler] &&
    newState[key] !== undefined &&
    newState[key] !== state[key]
  ) {
    props[handler]({type, ...newState})
  }
}

/**
 * Default state reducer that returns the changes.
 *
 * @param {Object} s state.
 * @param {Object} a action with changes.
 * @returns {Object} changes.
 */
function stateReducer(s, a) {
  return a.changes
}

/**
 * Returns a message to be added to aria-live region when item is selected.
 *
 * @param {Object} selectionParameters Parameters required to build the message.
 * @returns {string} The a11y message.
 */
function getA11ySelectionMessage(selectionParameters) {
  const {selectedItem, itemToString: itemToStringLocal} = selectionParameters

  return selectedItem
    ? `${itemToStringLocal(selectedItem)} has been selected.`
    : ''
}

/**
 * Debounced call for updating the a11y message.
 */
const updateA11yStatus = debounce((getA11yMessage, document) => {
  setStatus(getA11yMessage(), document)
}, 200)

export function getElementIds({
  id,
  labelId,
  menuId,
  getItemId,
  toggleButtonId,
}) {
  const uniqueId = id === undefined ? `downshift-${generateId()}` : id

  return {
    labelId: labelId || `${uniqueId}-label`,
    menuId: menuId || `${uniqueId}-menu`,
    getItemId: getItemId || (index => `${uniqueId}-item-${index}`),
    toggleButtonId: toggleButtonId || `${uniqueId}-toggle-button`,
  }
}

export function getItemIndex(index, item, items) {
  if (index !== undefined) {
    return index
  }
  if (items.length === 0) {
    return -1
  }
  return items.indexOf(item)
}

function itemToString(item) {
  return item ? String(item) : ''
}

function isItemDisabled() {
  return false
}

export function getPropTypesValidator(caller, propTypes) {
  // istanbul ignore next
  return function validate(options = {}) {
    Object.keys(propTypes).forEach(key => {
      PropTypes.checkPropTypes(propTypes, options, key, caller.name)
    })
  }
}

export function isAcceptedCharacterKey(key) {
  return /^\S{1}$/.test(key)
}

export function capitalizeString(string) {
  return `${string.slice(0, 1).toUpperCase()}${string.slice(1)}`
}

export function useLatestRef(val) {
  const ref = useRef(val)
  // technically this is not "concurrent mode safe" because we're manipulating
  // the value during render (so it's not idempotent). However, the places this
  // hook is used is to support memoizing callbacks which will be called
  // *during* render, so we need the latest values *during* render.
  // If not for this, then we'd probably want to use useLayoutEffect instead.
  ref.current = val
  return ref
}

/**
 * Computes the controlled state using a the previous state, props,
 * two reducers, one from downshift and an optional one from the user.
 * Also calls the onChange handlers for state values that have changed.
 *
 * @param {Function} reducer Reducer function from downshift.
 * @param {Object} initialState Initial state of the hook.
 * @param {Object} props The hook props.
 * @returns {Array} An array with the state and an action dispatcher.
 */
export function useEnhancedReducer(reducer, initialState, props) {
  const prevStateRef = useRef()
  const actionRef = useRef()
  const enhancedReducer = useCallback(
    (state, action) => {
      actionRef.current = action
      state = getState(state, action.props)

      const changes = reducer(state, action)
      const newState = action.props.stateReducer(state, {...action, changes})

      return newState
    },
    [reducer],
  )
  const [state, dispatch] = useReducer(enhancedReducer, initialState)
  const propsRef = useLatestRef(props)
  const dispatchWithProps = useCallback(
    action => dispatch({props: propsRef.current, ...action}),
    [propsRef],
  )
  const action = actionRef.current

  useEffect(() => {
    if (action && prevStateRef.current && prevStateRef.current !== state) {
      callOnChangeProps(
        action,
        getState(prevStateRef.current, action.props),
        state,
      )
    }

    prevStateRef.current = state
  }, [state, props, action])

  return [state, dispatchWithProps]
}

/**
 * Wraps the useEnhancedReducer and applies the controlled prop values before
 * returning the new state.
 *
 * @param {Function} reducer Reducer function from downshift.
 * @param {Object} initialState Initial state of the hook.
 * @param {Object} props The hook props.
 * @returns {Array} An array with the state and an action dispatcher.
 */
export function useControlledReducer(reducer, initialState, props) {
  const [state, dispatch] = useEnhancedReducer(reducer, initialState, props)

  return [getState(state, props), dispatch]
}

export const defaultProps = {
  isItemDisabled,
  itemToString,
  stateReducer,
  getA11ySelectionMessage,
  scrollIntoView,
  circularNavigation: false,
  environment:
    typeof window === 'undefined' /* istanbul ignore next (ssr) */
      ? {}
      : window,
}

export function getDefaultValue(
  props,
  propKey,
  defaultStateValues = dropdownDefaultStateValues,
) {
  const defaultPropKey = `default${capitalizeString(propKey)}`

  if (defaultPropKey in props) {
    return props[defaultPropKey]
  }

  return defaultStateValues[propKey]
}

export function getInitialValue(
  props,
  propKey,
  defaultStateValues = dropdownDefaultStateValues,
) {
  if (propKey in props) {
    return props[propKey]
  }

  const initialPropKey = `initial${capitalizeString(propKey)}`

  if (initialPropKey in props) {
    return props[initialPropKey]
  }
  return getDefaultValue(props, propKey, defaultStateValues)
}

export function getInitialState(props) {
  const selectedItem = getInitialValue(props, 'selectedItem')
  const isOpen = getInitialValue(props, 'isOpen')
  const highlightedIndex = getInitialValue(props, 'highlightedIndex')
  const inputValue = getInitialValue(props, 'inputValue')

  return {
    highlightedIndex:
      highlightedIndex < 0 && selectedItem && isOpen
        ? props.items.indexOf(selectedItem)
        : highlightedIndex,
    isOpen,
    selectedItem,
    inputValue,
  }
}

export function getHighlightedIndexOnOpen(
  props,
  state,
  offset,
  getItemNodeFromIndex,
) {
  const {items, initialHighlightedIndex, defaultHighlightedIndex} = props
  const {selectedItem, highlightedIndex} = state

  if (items.length === 0) {
    return -1
  }

  // initialHighlightedIndex will give value to highlightedIndex on initial state only.
  if (
    initialHighlightedIndex !== undefined &&
    highlightedIndex === initialHighlightedIndex
  ) {
    return initialHighlightedIndex
  }
  if (defaultHighlightedIndex !== undefined) {
    return defaultHighlightedIndex
  }
  if (selectedItem) {
    if (offset === 0) {
      return items.indexOf(selectedItem)
    }
    return getNextWrappingIndex(
      offset,
      items.indexOf(selectedItem),
      items.length,
      getItemNodeFromIndex,
      false,
    )
  }
  if (offset === 0) {
    return -1
  }
  return offset < 0 ? items.length - 1 : 0
}

/**
 * Reuse the movement tracking of mouse and touch events.
 *
 * @param {boolean} isOpen Whether the dropdown is open or not.
 * @param {Array<Object>} downshiftElementRefs Downshift element refs to track movement (toggleButton, menu etc.)
 * @param {Object} environment Environment where component/hook exists.
 * @param {Function} handleBlur Handler on blur from mouse or touch.
 * @returns {Object} Ref containing whether mouseDown or touchMove event is happening
 */
export function useMouseAndTouchTracker(
  isOpen,
  downshiftElementRefs,
  environment,
  handleBlur,
) {
  const mouseAndTouchTrackersRef = useRef({
    isMouseDown: false,
    isTouchMove: false,
  })

  useEffect(() => {
    // The same strategy for checking if a click occurred inside or outside downsift
    // as in downshift.js.
    const onMouseDown = () => {
      mouseAndTouchTrackersRef.current.isMouseDown = true
    }
    const onMouseUp = event => {
      mouseAndTouchTrackersRef.current.isMouseDown = false
      if (
        isOpen &&
        !targetWithinDownshift(
          event.target,
          downshiftElementRefs.map(ref => ref.current),
          environment.document,
        )
      ) {
        handleBlur()
      }
    }
    const onTouchStart = () => {
      mouseAndTouchTrackersRef.current.isTouchMove = false
    }
    const onTouchMove = () => {
      mouseAndTouchTrackersRef.current.isTouchMove = true
    }
    const onTouchEnd = event => {
      if (
        isOpen &&
        !mouseAndTouchTrackersRef.current.isTouchMove &&
        !targetWithinDownshift(
          event.target,
          downshiftElementRefs.map(ref => ref.current),
          environment.document,
          false,
        )
      ) {
        handleBlur()
      }
    }

    environment.addEventListener('mousedown', onMouseDown)
    environment.addEventListener('mouseup', onMouseUp)
    environment.addEventListener('touchstart', onTouchStart)
    environment.addEventListener('touchmove', onTouchMove)
    environment.addEventListener('touchend', onTouchEnd)

    return function cleanup() {
      environment.removeEventListener('mousedown', onMouseDown)
      environment.removeEventListener('mouseup', onMouseUp)
      environment.removeEventListener('touchstart', onTouchStart)
      environment.removeEventListener('touchmove', onTouchMove)
      environment.removeEventListener('touchend', onTouchEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, environment])

  return mouseAndTouchTrackersRef
}

/**
 * Custom hook that checks if getter props are called correctly.
 *
 * @param  {...any} propKeys Getter prop names to be handled.
 * @returns {Function} Setter function called inside getter props to set call information.
 */
export function useGetterPropsCalledChecker(...propKeys) {
  const isNotProduction = process.env.NODE_ENV !== 'production'
  const isInitialMountRef = useRef(true)
  const getterPropsCalledRef = useRef(
    propKeys.reduce((acc, propKey) => {
      acc[propKey] = {}
      return acc
    }, {}),
  )

  useEffect(() => {
    if (!isNotProduction) {
      return
    }

    Object.keys(getterPropsCalledRef.current).forEach(propKey => {
      const propCallInfo = getterPropsCalledRef.current[propKey]
      if (isInitialMountRef.current) {
        if (!Object.keys(propCallInfo).length) {
          // eslint-disable-next-line no-console
          console.error(
            `downshift: You forgot to call the ${propKey} getter function on your component / element.`,
          )
          return
        }
      }

      const {suppressRefError, refKey, elementRef} = propCallInfo

      if ((!elementRef || !elementRef.current) && !suppressRefError) {
        // eslint-disable-next-line no-console
        console.error(
          `downshift: The ref prop "${refKey}" from ${propKey} was not applied correctly on your element.`,
        )
      }
    })

    isInitialMountRef.current = false
  })

  const setGetterPropCallInfo = useCallback(
    (propKey, suppressRefError, refKey, elementRef) => {
      if (process.env.NODE_ENV !== 'production') {
        getterPropsCalledRef.current[propKey] = {
          suppressRefError,
          refKey,
          elementRef,
        }
      }
    },
    [],
  )

  return setGetterPropCallInfo
}

export function useA11yMessageSetter(
  getA11yMessage,
  dependencyArray,
  {
    isInitialMount,
    previousResultCount,
    highlightedIndex,
    items,
    environment,
    ...rest
  },
) {
  // Sets a11y status message on changes in state.
  useEffect(() => {
    if (isInitialMount) {
      return
    }

    updateA11yStatus(
      () =>
        getA11yMessage({
          highlightedIndex,
          highlightedItem: items[highlightedIndex],
          resultCount: items.length,
          previousResultCount,
          ...rest,
        }),
      environment.document,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencyArray)
}

export function useScrollIntoView({
  highlightedIndex,
  isOpen,
  itemRefs,
  getItemNodeFromIndex,
  menuElement,
  scrollIntoView: scrollIntoViewProp,
}) {
  // used not to scroll on highlight by mouse.
  const shouldScrollRef = useRef(true)
  // Scroll on highlighted item if change comes from keyboard.
  useEffect(() => {
    if (
      highlightedIndex < 0 ||
      !isOpen ||
      !Object.keys(itemRefs.current).length
    ) {
      return
    }

    if (shouldScrollRef.current === false) {
      shouldScrollRef.current = true
    } else {
      scrollIntoViewProp(getItemNodeFromIndex(highlightedIndex), menuElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightedIndex])

  return shouldScrollRef
}

export function useControlPropsValidator({isInitialMount, props, state}) {
  // used for checking when props are moving from controlled to uncontrolled.
  const prevPropsRef = useRef(props)

  useEffect(() => {
    if (isInitialMount) {
      return
    }

    validateControlledUnchanged(state, prevPropsRef.current, props)
    prevPropsRef.current = props
  }, [state, props, isInitialMount])
}
