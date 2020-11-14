import {act} from '@testing-library/react-hooks'
import {renderUseSelect, renderSelect} from '../testUtils'
import {items, defaultIds} from '../../testUtils'

describe('getItemProps', () => {
  test('throws error if no index or item has been passed', () => {
    const {result} = renderUseSelect()

    expect(result.current.getItemProps).toThrowError(
      'Pass either item or item index in getItemProps!',
    )
  })

  describe('hook props', () => {
    test("assign 'option' to role", () => {
      const {result} = renderUseSelect()

      expect(result.current.getItemProps({index: 0}).role).toEqual('option')
    })

    test('assign default value to id', () => {
      const {result} = renderUseSelect()

      expect(result.current.getItemProps({index: 0}).id).toEqual(
        `${defaultIds.getItemId(0)}`,
      )
    })

    test('assign custom value passed by user to id', () => {
      const getItemId = index => `my-custom-item-id-${index}`
      const {result} = renderUseSelect({getItemId})

      expect(result.current.getItemProps({index: 0}).id).toEqual(getItemId(0))
    })

    test("assign 'true' to aria-selected if item is highlighted", () => {
      const {result} = renderUseSelect({highlightedIndex: 2})
      const itemProps = result.current.getItemProps({index: 2})

      expect(itemProps['aria-selected']).toEqual('true')
    })

    test("assign 'false' to aria-selected if item is not highlighted", () => {
      const {result} = renderUseSelect({highlightedIndex: 1})
      const itemProps = result.current.getItemProps({index: 2})

      expect(itemProps['aria-selected']).toEqual('false')
    })

    test('omit event handlers when disabled', () => {
      const {result} = renderUseSelect()
      const itemProps = result.current.getItemProps({
        index: 0,
        disabled: true,
      })

      expect(itemProps.onMouseMove).toBeUndefined()
      expect(itemProps.onClick).toBeUndefined()
      // eslint-disable-next-line jest-dom/prefer-enabled-disabled
      expect(itemProps.disabled).toBe(true)
    })

    test('omit event handlers when isItemDisabled it true', () => {
      const {result} = renderUseSelect({isItemDisabled: () => true})

      const itemProps = result.current.getItemProps({index: 0})
      expect(itemProps.onMouseMove).toBeUndefined()
      expect(itemProps.onClick).toBeUndefined()
    })
  })

  describe('user props', () => {
    test('are passed down', () => {
      const {result} = renderUseSelect()

      expect(
        result.current.getItemProps({index: 0, foo: 'bar'}),
      ).toHaveProperty('foo', 'bar')
    })

    test('event handler onClick is called along with downshift handler', () => {
      const userOnClick = jest.fn()
      const {result} = renderUseSelect({initialIsOpen: true})

      act(() => {
        const {onClick} = result.current.getItemProps({
          index: 0,
          onClick: userOnClick,
        })

        onClick({})
      })

      expect(userOnClick).toHaveBeenCalledTimes(1)
      expect(result.current.isOpen).toBe(false)
      expect(result.current.selectedItem).not.toBeNull()
    })

    test('event handler onMouseMove is called along with downshift handler', () => {
      const userOnMouseMove = jest.fn()
      const {result} = renderUseSelect({initialIsOpen: true})

      act(() => {
        const {onMouseMove} = result.current.getItemProps({
          index: 1,
          onMouseMove: userOnMouseMove,
        })

        onMouseMove({})
      })

      expect(userOnMouseMove).toHaveBeenCalledTimes(1)
      expect(result.current.highlightedIndex).toBe(1)
    })

    test("event handler onClick is called without downshift handler if 'preventDownshiftDefault' is passed in user event", () => {
      const userOnClick = jest.fn(event => {
        event.preventDownshiftDefault = true
      })
      const {result} = renderUseSelect({initialIsOpen: true})

      act(() => {
        const {onClick} = result.current.getItemProps({
          index: 0,
          onClick: userOnClick,
        })

        onClick({})
      })

      expect(userOnClick).toHaveBeenCalledTimes(1)
      expect(result.current.isOpen).toBe(true)
      expect(result.current.selectedItem).toBeNull()
    })

    test("event handler onMouseMove is called without downshift handler if 'preventDownshiftDefault' is passed in user event", () => {
      const userOnMouseMove = jest.fn(event => {
        event.preventDownshiftDefault = true
      })
      const {result} = renderUseSelect({initialIsOpen: true})

      act(() => {
        const {onMouseMove} = result.current.getItemProps({
          index: 1,
          onMouseMove: userOnMouseMove,
        })

        onMouseMove({})
      })

      expect(userOnMouseMove).toHaveBeenCalledTimes(1)
      expect(result.current.highlightedIndex).toBe(-1)
    })
  })

  describe('event handlers', () => {
    describe('on mouse over', () => {
      test('it highlights the item', () => {
        const index = 1
        const {mouseMoveItemAtIndex, menu, getItemAtIndex} = renderSelect({
          isOpen: true,
        })

        mouseMoveItemAtIndex(index)

        expect(menu).toHaveAttribute(
          'aria-activedescendant',
          defaultIds.getItemId(index),
        )
        expect(getItemAtIndex(index)).toHaveAttribute('aria-selected', 'true')
      })

      test('it removes highlight from the previously highlighted item', () => {
        const index = 1
        const previousIndex = 2
        const {mouseMoveItemAtIndex, menu, getItemAtIndex} = renderSelect({
          isOpen: true,
          initialHighlightedIndex: previousIndex,
        })

        mouseMoveItemAtIndex(index)

        expect(menu).not.toHaveAttribute(
          'aria-activedescendant',
          defaultIds.getItemId(previousIndex),
        )
        expect(getItemAtIndex(previousIndex)).toHaveAttribute(
          'aria-selected',
          'false',
        )
        expect(menu).toHaveAttribute(
          'aria-activedescendant',
          defaultIds.getItemId(index),
        )
        expect(getItemAtIndex(index)).toHaveAttribute('aria-selected', 'true')
      })

      it('keeps highlight on multiple events', () => {
        const index = 1
        const {mouseMoveItemAtIndex, menu, getItemAtIndex} = renderSelect({
          isOpen: true,
        })

        mouseMoveItemAtIndex(index)
        mouseMoveItemAtIndex(index)
        mouseMoveItemAtIndex(index)

        expect(menu).toHaveAttribute(
          'aria-activedescendant',
          defaultIds.getItemId(index),
        )
        expect(getItemAtIndex(index)).toHaveAttribute('aria-selected', 'true')
      })
    })

    describe('on click', () => {
      test('it selects the item', () => {
        const index = 1
        const {clickOnItemAtIndex, toggleButton, getItems} = renderSelect({
          initialIsOpen: true,
        })

        clickOnItemAtIndex(index)

        expect(getItems()).toHaveLength(0)
        expect(toggleButton).toHaveTextContent(items[index])
      })

      test('it selects the item and resets to user defined defaults', () => {
        const index = 1
        const {clickOnItemAtIndex, menu, toggleButton, getItems} = renderSelect(
          {
            defaultIsOpen: true,
            defaultHighlightedIndex: 2,
          },
        )

        clickOnItemAtIndex(index)

        expect(toggleButton).toHaveTextContent(items[index])
        expect(getItems()).toHaveLength(items.length)
        expect(menu).toHaveAttribute(
          'aria-activedescendant',
          defaultIds.getItemId(2),
        )
      })
    })
  })

  describe('scrolling', () => {
    test('is performed by the menu to the item if highlighted and not 100% visible', () => {
      const scrollIntoView = jest.fn()
      const {keyDownOnMenu} = renderSelect({
        initialIsOpen: true,
        scrollIntoView,
      })

      keyDownOnMenu('End')

      expect(scrollIntoView).toHaveBeenCalledTimes(1)
    })
  })
})
