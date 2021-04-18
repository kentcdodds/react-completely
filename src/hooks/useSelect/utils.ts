import PropTypes from 'prop-types'
import {defaultProps as commonDefaultProps} from '../utils'
import {noop} from '../../utils'
import {GetItemIndexByCharacterKeyOptions} from './types'
import {A11yStatusMessageOptions} from '../../types'

function getItemIndexByCharacterKey<Item>({
  keysSoFar,
  highlightedIndex,
  items,
  itemToString,
  getItemNodeFromIndex,
}: GetItemIndexByCharacterKeyOptions<Item>) {
  const lowerCasedKeysSoFar = keysSoFar.toLowerCase()

  for (let index = 0; index < items.length; index++) {
    const offsetIndex = (index + highlightedIndex + 1) % items.length

    if (
      itemToString(items[offsetIndex])
        .toLowerCase()
        .startsWith(lowerCasedKeysSoFar)
    ) {
      const element = getItemNodeFromIndex(offsetIndex)

      if (!(element && element.hasAttribute('disabled'))) {
        return offsetIndex
      }
    }
  }

  return highlightedIndex
}

const propTypes = {
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
  id: PropTypes.string,
  labelId: PropTypes.string,
  menuId: PropTypes.string,
  getItemId: PropTypes.func,
  toggleButtonId: PropTypes.string,
  stateReducer: PropTypes.func,
  onSelectedItemChange: PropTypes.func,
  onHighlightedIndexChange: PropTypes.func,
  onStateChange: PropTypes.func,
  onIsOpenChange: PropTypes.func,
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
 * Default implementation for status message. Only added when menu is open.
 * Will specift if there are results in the list, and if so, how many,
 * and what keys are relevant.
 *
 * @param {Object} param the downshift state and other relevant properties
 * @return {String} the a11y status message
 */
function getA11yStatusMessage<Item>({
  isOpen,
  resultCount,
  previousResultCount,
}: A11yStatusMessageOptions<Item>): string {
  if (!isOpen) {
    return ''
  }

  if (!resultCount) {
    return 'No results are available.'
  }

  if (resultCount !== previousResultCount) {
    return `${resultCount} result${
      resultCount === 1 ? ' is' : 's are'
    } available, use up and down arrow keys to navigate. Press Enter or Space Bar keys to select.`
  }

  return ''
}

const defaultProps = {
  ...commonDefaultProps,
  getA11yStatusMessage,
}

// eslint-disable-next-line import/no-mutable-exports
let validatePropTypes = noop as (
  options: any,
  callerName: string,
) => void
/* istanbul ignore next */
if (process.env.NODE_ENV !== 'production') {
  validatePropTypes = (options: any, callerName: string): void => {
    PropTypes.checkPropTypes(propTypes, options, 'prop', callerName)
  }
}

export {getItemIndexByCharacterKey, defaultProps, validatePropTypes}
