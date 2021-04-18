/* eslint-disable jest/no-disabled-tests */
import * as React from 'react'
import {renderHook, act as hooksAct} from '@testing-library/react-hooks'
import {
  act as reactAct,
  fireEvent,
  screen,
  createEvent,
} from '@testing-library/react'
import {renderUseSelect, renderSelect} from '../testUtils'
import {defaultIds, items} from '../../testUtils'
// eslint-disable-next-line import/default
import * as utils from '../../utils'
import * as stateChangeTypes from '../stateChangeTypes'
import useSelect from '..'

describe('getMenuProps', () => {
  describe('hook props', () => {
    test('assign default value to aria-labelledby', () => {
      const {result} = renderUseSelect()
      const menuProps = result.current.getMenuProps()

      expect(menuProps['aria-labelledby']).toEqual(`${defaultIds.labelId}`)
    })

    test('assign custom value passed by user to aria-labelledby', () => {
      const props = {
        labelId: 'my-custom-label-id',
      }
      const {result} = renderUseSelect(props)
      const menuProps = result.current.getMenuProps()

      expect(menuProps['aria-labelledby']).toEqual(`${props.labelId}`)
    })

    test('assign default value to id', () => {
      const {result} = renderUseSelect()
      const menuProps = result.current.getMenuProps()

      expect(menuProps.id).toEqual(`${defaultIds.menuId}`)
    })

    test('assign custom value passed by user to id', () => {
      const props = {
        menuId: 'my-custom-menu-id',
      }
      const {result} = renderUseSelect(props)
      const menuProps = result.current.getMenuProps()

      expect(menuProps.id).toEqual(`${props.menuId}`)
    })

    test("assign 'listbox' to role", () => {
      const {result} = renderUseSelect()
      const menuProps = result.current.getMenuProps()

      expect(menuProps.role).toEqual('listbox')
    })

    test("assign '-1' to tabindex", () => {
      const {result} = renderUseSelect()
      const menuProps = result.current.getMenuProps()

      expect(menuProps.tabIndex).toEqual(-1)
    })

    test('assign id of highlighted item to aria-activedescendant if item is highlighted and menu is open', () => {
      const {result} = renderUseSelect({highlightedIndex: 2, isOpen: true})
      const menuProps = result.current.getMenuProps()

      expect(menuProps['aria-activedescendant']).toEqual(
        defaultIds.getItemId(2),
      )
    })

    test('do not assign aria-activedescendant if item is highlighted and menu is closed', () => {
      const {result} = renderUseSelect({highlightedIndex: 2})
      const menuProps = result.current.getMenuProps()

      expect(menuProps['aria-activedescendant']).toBeUndefined()
    })

    test('do not assign aria-activedescendant if no item is highlighted', () => {
      const {result} = renderUseSelect()
      const menuProps = result.current.getMenuProps()

      expect(menuProps['aria-activedescendant']).toBeUndefined()
    })
  })

  describe('user props', () => {
    test('are passed down', () => {
      const {result} = renderUseSelect()

      expect(result.current.getMenuProps({foo: 'bar'})).toHaveProperty(
        'foo',
        'bar',
      )
    })

    test('custom ref passed by the user is used', () => {
      const {result} = renderUseSelect()
      const refFn = jest.fn()
      const menuNode = {}

      hooksAct(() => {
        const {ref} = result.current.getMenuProps({ref: refFn})

        ref(menuNode)
      })

      expect(refFn).toHaveBeenCalledTimes(1)
      expect(refFn).toHaveBeenCalledWith(menuNode)
    })

    test('custom ref with custom name passed by the user is used', () => {
      const {result} = renderUseSelect()
      const refFn = jest.fn()
      const menuNode = {}

      hooksAct(() => {
        const {blablaRef} = result.current.getMenuProps({
          refKey: 'blablaRef',
          blablaRef: refFn,
        })

        blablaRef(menuNode)
      })

      expect(refFn).toHaveBeenCalledTimes(1)
      expect(refFn).toHaveBeenCalledWith(menuNode)
    })

    test('event handler onMouseLeave is called along with downshift handler', () => {
      const userOnMouseLeave = jest.fn()
      const {result} = renderUseSelect({
        initialHighlightedIndex: 2,
        initialIsOpen: true,
      })

      hooksAct(() => {
        const {onMouseLeave} = result.current.getMenuProps({
          onMouseLeave: userOnMouseLeave,
        })

        onMouseLeave({})
      })

      expect(userOnMouseLeave).toHaveBeenCalledTimes(1)
      expect(result.current.highlightedIndex).toBe(-1)
    })

    test("event handler onMouseLeave is called without downshift handler if 'preventDownshiftDefault' is passed in user event", () => {
      const userOnMouseLeave = jest.fn(event => {
        event.preventDownshiftDefault = true
      })
      const {result} = renderUseSelect({
        initialHighlightedIndex: 2,
        initialIsOpen: true,
      })

      hooksAct(() => {
        const {onMouseLeave} = result.current.getMenuProps({
          onMouseLeave: userOnMouseLeave,
        })

        onMouseLeave({})
      })

      expect(userOnMouseLeave).toHaveBeenCalledTimes(1)
      expect(result.current.highlightedIndex).toBe(2)
    })

    test('event handler onKeyDown is called along with downshift handler', () => {
      const userOnKeyDown = jest.fn()
      const {result} = renderUseSelect({initialIsOpen: true})

      hooksAct(() => {
        const {onKeyDown} = result.current.getMenuProps({
          onKeyDown: userOnKeyDown,
        })

        onKeyDown({key: 'Escape'})
      })

      expect(userOnKeyDown).toHaveBeenCalledTimes(1)
      expect(result.current.isOpen).toBe(false)
    })

    test("event handler onKeyDown is called without downshift handler if 'preventDownshiftDefault' is passed in user event", () => {
      const userOnKeyDown = jest.fn(event => {
        event.preventDownshiftDefault = true
      })
      const {result} = renderUseSelect({initialIsOpen: true})

      hooksAct(() => {
        const {onKeyDown} = result.current.getMenuProps({
          onKeyDown: userOnKeyDown,
        })

        onKeyDown({key: 'Escape'})
      })

      expect(userOnKeyDown).toHaveBeenCalledTimes(1)
      expect(result.current.isOpen).toBe(true)
    })

    test('event handler onBlur is called along with downshift handler', () => {
      const userOnBlur = jest.fn()
      const {result} = renderUseSelect({initialIsOpen: true})

      hooksAct(() => {
        const {onBlur} = result.current.getMenuProps({
          onBlur: userOnBlur,
        })

        onBlur({})
      })

      expect(userOnBlur).toHaveBeenCalledTimes(1)
      expect(result.current.isOpen).toBe(false)
    })

    test("event handler onBlur is called without downshift handler if 'preventDownshiftDefault' is passed in user event", () => {
      const userOnBlur = jest.fn(event => {
        event.preventDownshiftDefault = true
      })
      const {result} = renderUseSelect({initialIsOpen: true})

      hooksAct(() => {
        const {onBlur} = result.current.getMenuProps({
          onBlur: userOnBlur,
        })

        onBlur({})
      })

      expect(userOnBlur).toHaveBeenCalledTimes(1)
      expect(result.current.isOpen).toBe(true)
    })
  })

  describe('initial focus', () => {
    test('is grabbed when isOpen is passed as true', () => {
      const {menu} = renderSelect({isOpen: true})

      expect(menu).toHaveFocus()
    })

    test('is grabbed when initialIsOpen is passed as true', () => {
      const {menu} = renderSelect({initialIsOpen: true})

      expect(menu).toHaveFocus()
    })

    test('is grabbed when defaultIsOpen is passed as true', () => {
      const {menu} = renderSelect({defaultIsOpen: true})

      expect(menu).toHaveFocus()
    })

    test('is not grabbed when initial open is set to default (false)', () => {
      const {menu} = renderSelect()

      expect(menu).not.toHaveFocus()
    })
  })

  describe('event handlers', () => {
    describe('on keydown', () => {
      describe('character key', () => {
        beforeEach(() => jest.useFakeTimers())
        afterEach(() => {
          reactAct(() => {
            jest.runAllTimers()
          })
        })
        afterAll(jest.useRealTimers)

        const startsWithCharacter = (option: string, character: string) => {
          return option.toLowerCase().startsWith(character.toLowerCase())
        }

        test('should highlight the first item that starts with that key', () => {
          const char = 'c'
          const expectedIndex = defaultIds.getItemId(
            items.indexOf(items.find(item => startsWithCharacter(item, char))),
          )
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
          })

          keyDownOnMenu(char)

          expect(menu).toHaveAttribute('aria-activedescendant', expectedIndex)
        })

        test('should highlight the second item that starts with that key after typing it twice', () => {
          const char = 'c'
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
          })

          keyDownOnMenu(char)
          expect(menu).toHaveAttribute(
            'aria-activedescendant',
            defaultIds.getItemId(3),
          )
          reactAct(() => {
            jest.runOnlyPendingTimers()
          })
          keyDownOnMenu(char)

          expect(menu).toHaveAttribute(
            'aria-activedescendant',
            defaultIds.getItemId(5),
          )
        })

        test('should highlight the first item again if the items are depleated', () => {
          const char = 'b'
          const expectedIndex = defaultIds.getItemId(
            items.indexOf(items.find(item => startsWithCharacter(item, char))),
          )
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
          })

          keyDownOnMenu(char)
          reactAct(() => {
            jest.runOnlyPendingTimers()
          })
          keyDownOnMenu(char)
          reactAct(() => {
            jest.runOnlyPendingTimers()
          })
          keyDownOnMenu(char)

          expect(menu).toHaveAttribute('aria-activedescendant', expectedIndex)
        })

        test('should not highlight anything if no item starts with that key', () => {
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
          })

          keyDownOnMenu('x')

          expect(menu).not.toHaveAttribute('aria-activedescendant')
        })

        test('should highlight the first item that starts with the keys typed in rapid succession', () => {
          const chars = ['c', 'a']
          const expectedIndex = defaultIds.getItemId(
            items.indexOf(
              items.find(item => startsWithCharacter(item, chars.join(''))),
            ),
          )

          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
          })

          keyDownOnMenu(chars[0])
          reactAct(() => {
            jest.advanceTimersByTime(200)
          })
          keyDownOnMenu(chars[1])

          expect(menu).toHaveAttribute('aria-activedescendant', expectedIndex)
        })

        test('should become first character after timeout passes', () => {
          const chars = ['c', 'a', 'l']
          const expectedIndex = defaultIds.getItemId(
            items.indexOf(
              items.find(item => startsWithCharacter(item, chars[2])),
            ),
          )
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
          })

          keyDownOnMenu(chars[0])
          reactAct(() => {
            jest.advanceTimersByTime(200)
          })
          keyDownOnMenu(chars[1])
          reactAct(() => {
            jest.runOnlyPendingTimers()
          })
          keyDownOnMenu(chars[2])

          expect(menu).toHaveAttribute('aria-activedescendant', expectedIndex)
        })

        /* Here we just want to make sure the keys cleanup works. */
        test('should not go to the second option starting with the key if timeout did not pass', () => {
          const char = 'c'
          const expectedIndex = defaultIds.getItemId(
            items.indexOf(items.find(item => startsWithCharacter(item, char))),
          )
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
          })

          keyDownOnMenu(char)
          reactAct(() => {
            jest.advanceTimersByTime(200)
          }) // wait some time but not enough to trigger debounce.
          keyDownOnMenu(char)

          // highlight should stay on the first item starting with 'C'
          expect(menu).toHaveAttribute('aria-activedescendant', expectedIndex)
        })

        test('should not attempt update after unmount', () => {
          const consoleErrorSpy = jest.spyOn(console, 'error')
          const char = 'c'
          const {keyDownOnMenu, unmount} = renderSelect({
            isOpen: true,
          })

          // Enter key twice to queue up debounced call
          keyDownOnMenu(char)
          keyDownOnMenu(char)
          unmount()
          jest.runAllTimers()

          expect(consoleErrorSpy).not.toHaveBeenCalled()
        })
      })

      describe('arrow up', () => {
        test('it prevents the default event behavior', () => {
          const {menu} = renderSelect()
          const keyDownEvent = createEvent.keyDown(menu, {key: 'ArrowUp'})

          fireEvent(menu, keyDownEvent)

          expect(keyDownEvent.defaultPrevented).toBe(true)
        })

        test('it does not highlight anything if there are no options', () => {
          const {keyDownOnMenu, menu, getItems} = renderSelect({
            isOpen: true,
            items: [],
          })

          keyDownOnMenu('ArrowUp')

          expect(menu).not.toHaveAttribute('aria-activedescendant')
          expect(getItems()).toHaveLength(0)
        })

        test('it highlights the last option number if none is highlighted', () => {
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
          })

          keyDownOnMenu('ArrowUp')

          expect(menu).toHaveAttribute(
            'aria-activedescendant',
            defaultIds.getItemId(items.length - 1),
          )
        })

        test('it highlights the previous item', () => {
          const initialHighlightedIndex = 2
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
            initialHighlightedIndex,
          })

          keyDownOnMenu('ArrowUp')

          expect(menu).toHaveAttribute(
            'aria-activedescendant',
            defaultIds.getItemId(initialHighlightedIndex - 1),
          )
        })

        test('with shift it highlights the 5th previous item', () => {
          const initialHighlightedIndex = 6
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
            initialHighlightedIndex,
          })

          keyDownOnMenu('ArrowUp', {shiftKey: true})

          expect(menu).toHaveAttribute(
            'aria-activedescendant',
            defaultIds.getItemId(initialHighlightedIndex - 5),
          )
        })

        test('with shift it highlights the first item if not enough items remaining', () => {
          const initialHighlightedIndex = 2
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
            initialHighlightedIndex,
          })

          keyDownOnMenu('ArrowUp', {shiftKey: true})

          expect(menu).toHaveAttribute(
            'aria-activedescendant',
            defaultIds.getItemId(0),
          )
        })

        test('will stop at 0 if circularNavigatios is falsy', () => {
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
            initialHighlightedIndex: 0,
          })

          keyDownOnMenu('ArrowUp')

          expect(menu).toHaveAttribute(
            'aria-activedescendant',
            defaultIds.getItemId(0),
          )
        })

        test('will continue from 0 to last item if circularNavigatios is truthy', () => {
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
            initialHighlightedIndex: 0,
            circularNavigation: true,
          })

          keyDownOnMenu('ArrowUp')

          expect(menu).toHaveAttribute(
            'aria-activedescendant',
            defaultIds.getItemId(items.length - 1),
          )
        })
      })

      describe('arrow down', () => {
        test('it prevents the default event behavior', () => {
          const {menu} = renderSelect()
          const keyDownEvent = createEvent.keyDown(menu, {key: 'ArrowDown'})

          fireEvent(menu, keyDownEvent)

          expect(keyDownEvent.defaultPrevented).toBe(true)
        })

        test('it does not highlight anything if there are no options', () => {
          const {keyDownOnMenu, menu, getItems} = renderSelect({
            isOpen: true,
            items: [],
          })

          keyDownOnMenu('ArrowDown')

          expect(menu).not.toHaveAttribute('aria-activedescendant')
          expect(getItems()).toHaveLength(0)
        })

        test("it highlights option number '0' if none is highlighted", () => {
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
          })

          keyDownOnMenu('ArrowDown')

          expect(menu).toHaveAttribute(
            'aria-activedescendant',
            defaultIds.getItemId(0),
          )
        })
        test('it highlights the next item', () => {
          const initialHighlightedIndex = 2
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
            initialHighlightedIndex,
          })

          keyDownOnMenu('ArrowDown')

          expect(menu).toHaveAttribute(
            'aria-activedescendant',
            defaultIds.getItemId(initialHighlightedIndex + 1),
          )
        })

        test('with shift it highlights the next 5th item', () => {
          const initialHighlightedIndex = 2
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
            initialHighlightedIndex,
          })

          keyDownOnMenu('ArrowDown', {shiftKey: true})

          expect(menu).toHaveAttribute(
            'aria-activedescendant',
            defaultIds.getItemId(initialHighlightedIndex + 5),
          )
        })

        test('with shift it highlights last item if not enough next items remaining', () => {
          const initialHighlightedIndex = items.length - 2
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
            initialHighlightedIndex,
          })

          keyDownOnMenu('ArrowDown', {shiftKey: true})

          expect(menu).toHaveAttribute(
            'aria-activedescendant',
            defaultIds.getItemId(items.length - 1),
          )
        })

        test('will stop at last item if circularNavigatios is falsy', () => {
          const initialHighlightedIndex = items.length - 1
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
            initialHighlightedIndex,
          })

          keyDownOnMenu('ArrowDown')

          expect(menu).toHaveAttribute(
            'aria-activedescendant',
            defaultIds.getItemId(items.length - 1),
          )
        })

        test('will continue from last item to 0 if circularNavigatios is truthy', () => {
          const initialHighlightedIndex = items.length - 1
          const {keyDownOnMenu, menu} = renderSelect({
            isOpen: true,
            initialHighlightedIndex,
            circularNavigation: true,
          })

          keyDownOnMenu('ArrowDown')

          expect(menu).toHaveAttribute(
            'aria-activedescendant',
            defaultIds.getItemId(0),
          )
        })
      })

      test('end it highlights the last option number', () => {
        const {keyDownOnMenu, menu} = renderSelect({
          isOpen: true,
          initialHighlightedIndex: 2,
        })

        keyDownOnMenu('End')

        expect(menu).toHaveAttribute(
          'aria-activedescendant',
          defaultIds.getItemId(items.length - 1),
        )
      })

      test('end it prevents the default event behavior', () => {
        const {menu} = renderSelect()
        const keyDownEvent = createEvent.keyDown(menu, {key: 'End'})

        fireEvent(menu, keyDownEvent)

        expect(keyDownEvent.defaultPrevented).toBe(true)
      })

      test('home it highlights the first option number', () => {
        const {keyDownOnMenu, menu} = renderSelect({
          isOpen: true,
          initialHighlightedIndex: 2,
        })

        keyDownOnMenu('Home')

        expect(menu).toHaveAttribute(
          'aria-activedescendant',
          defaultIds.getItemId(0),
        )
      })

      test('home it prevents the default event behavior', () => {
        const {menu} = renderSelect()
        const keyDownEvent = createEvent.keyDown(menu, {key: 'Home'})

        fireEvent(menu, keyDownEvent)

        expect(keyDownEvent.defaultPrevented).toBe(true)
      })

      test('escape it has the menu closed', () => {
        const {keyDownOnMenu, getItems} = renderSelect({
          initialIsOpen: true,
        })

        keyDownOnMenu('Escape')

        expect(getItems()).toHaveLength(0)
      })

      test('escape it has the focus moved to toggleButton', () => {
        const {keyDownOnMenu, toggleButton} = renderSelect({
          initialIsOpen: true,
        })

        keyDownOnMenu('Escape')

        expect(toggleButton).toHaveFocus()
      })

      test('enter it closes the menu and selects highlighted item', () => {
        const initialHighlightedIndex = 2
        const {keyDownOnMenu, getItems, toggleButton} = renderSelect({
          initialIsOpen: true,
          initialHighlightedIndex,
        })

        keyDownOnMenu('Enter')

        expect(getItems()).toHaveLength(0)
        expect(toggleButton).toHaveTextContent(items[initialHighlightedIndex])
      })

      test('enter selects highlighted item and resets to user defaults', () => {
        const defaultHighlightedIndex = 2
        const {keyDownOnMenu, getItems, menu, toggleButton} = renderSelect({
          defaultHighlightedIndex,
          defaultIsOpen: true,
        })

        keyDownOnMenu('Enter')

        expect(toggleButton).toHaveTextContent(items[defaultHighlightedIndex])
        expect(getItems()).toHaveLength(items.length)
        expect(menu).toHaveAttribute(
          'aria-activedescendant',
          defaultIds.getItemId(defaultHighlightedIndex),
        )
      })

      test('enter it has the focus moved on the toggleButton', () => {
        const {keyDownOnMenu, toggleButton} = renderSelect({
          initialIsOpen: true,
        })

        keyDownOnMenu('Enter')

        expect(toggleButton).toHaveFocus()
      })

      test('enter it prevents the default event behavior', () => {
        const {menu} = renderSelect()
        const keyDownEvent = createEvent.keyDown(menu, {key: 'Enter'})

        fireEvent(menu, keyDownEvent)

        expect(keyDownEvent.defaultPrevented).toBe(true)
      })

      test('space it closes the menu and selects highlighted item', () => {
        const initialHighlightedIndex = 2
        const {keyDownOnMenu, toggleButton, getItems} = renderSelect({
          initialIsOpen: true,
          initialHighlightedIndex,
        })

        keyDownOnMenu(' ')

        expect(getItems()).toHaveLength(0)
        expect(toggleButton).toHaveTextContent(items[initialHighlightedIndex])
      })

      test('space it selects highlighted item and resets to user defaults', () => {
        const defaultHighlightedIndex = 2
        const {keyDownOnMenu, toggleButton, menu, getItems} = renderSelect({
          defaultHighlightedIndex,
          defaultIsOpen: true,
        })

        keyDownOnMenu(' ')

        expect(toggleButton).toHaveTextContent(items[defaultHighlightedIndex])
        expect(getItems()).toHaveLength(items.length)
        expect(menu).toHaveAttribute(
          'aria-activedescendant',
          defaultIds.getItemId(defaultHighlightedIndex),
        )
      })

      test('space it has the focus moved on the toggleButton', () => {
        const {keyDownOnMenu, toggleButton} = renderSelect({
          initialIsOpen: true,
        })

        keyDownOnMenu(' ')

        expect(toggleButton).toHaveFocus()
      })

      test('space it prevents the default event behavior', () => {
        const {menu} = renderSelect()
        const keyDownEvent = createEvent.keyDown(menu, {key: ' '})

        fireEvent(menu, keyDownEvent)

        expect(keyDownEvent.defaultPrevented).toBe(true)
      })

      test('tab it closes the menu and does not select highlighted item', () => {
        const {toggleButton, tab, getItems} = renderSelect(
          {initialIsOpen: true, initialHighlightedIndex: 2},
          {
            uiCallback: ui => (
              <>
                <div tabIndex={0}>First element</div>
                {ui}
                <div tabIndex={0}>Second element</div>
              </>
            ),
          },
        )

        tab()

        expect(getItems()).toHaveLength(0)
        expect(toggleButton).toHaveTextContent('Elements')
      })

      test('shift+tab it closes the menu', () => {
        const {toggleButton, tab, getItems} = renderSelect(
          {initialIsOpen: true, initialHighlightedIndex: 2},
          {
            uiCallback: ui => (
              <>
                <div tabIndex={0}>First element</div>
                {ui}
                <div tabIndex={0}>Second element</div>
              </>
            ),
          },
        )

        tab(true)

        expect(getItems()).toHaveLength(0)
        expect(toggleButton).toHaveTextContent('Elements')
      })

      test("other than the ones supported don't affect anything", () => {
        const {keyDownOnMenu, toggleButton, getItems, menu} = renderSelect({
          initialIsOpen: true,
        })

        keyDownOnMenu('Alt')
        keyDownOnMenu('Control')

        expect(menu).toHaveFocus()
        expect(toggleButton).toHaveTextContent('Elements')
        expect(toggleButton).not.toHaveAttribute('aria-activedescendant')
        expect(getItems()).toHaveLength(items.length)
      })
    })

    describe('on mouse leave', () => {
      test('the highlightedIndex should be reset', () => {
        const {mouseLeaveMenu, menu} = renderSelect({
          initialIsOpen: true,
          initialHighlightedIndex: 2,
        })

        mouseLeaveMenu()

        expect(menu).not.toHaveAttribute('aria-activedescendant')
      })
    })

    describe('blur', () => {
      test('should not select highlighted item but close the menu', () => {
        const initialHighlightedIndex = 2
        const {getItems, blurMenu, toggleButton} = renderSelect({
          initialIsOpen: true,
          initialHighlightedIndex,
        })

        blurMenu()

        expect(getItems()).toHaveLength(0)
        expect(toggleButton).toHaveTextContent('Element')
      })

      test('by focusing another element should behave as a normal blur', () => {
        const {toggleButton, getItems} = renderSelect(
          {initialIsOpen: true, initialHighlightedIndex: 2},
          {
            uiCallback: ui => (
              <>
                {ui}
                <div tabIndex={0}>Second element</div>
              </>
            ),
          },
        )

        screen.getByText(/Second element/).focus()

        expect(getItems()).toHaveLength(0)
        expect(toggleButton).toHaveTextContent('Element')
      })

      test('by mouse is not triggered if target is within downshift', () => {
        const stateReducer = jest.fn().mockImplementation(s => s)
        const {toggleButton, container} = renderSelect({
          isOpen: true,
          stateReducer,
        })
        document.body.appendChild(container)

        fireEvent.mouseDown(toggleButton)
        fireEvent.mouseUp(toggleButton)

        expect(stateReducer).not.toHaveBeenCalled()

        fireEvent.mouseDown(document.body)
        fireEvent.mouseUp(document.body)

        expect(stateReducer).toHaveBeenCalledTimes(1)
        expect(stateReducer).toHaveBeenCalledWith(
          expect.objectContaining({}),
          expect.objectContaining({type: stateChangeTypes.MenuBlur}),
        )
      })

      test('by touch is not triggered if target is within downshift', () => {
        const stateReducer = jest.fn().mockImplementation(s => s)
        const {container, toggleButton} = renderSelect({
          isOpen: true,
          stateReducer,
        })
        document.body.appendChild(container)

        fireEvent.touchStart(toggleButton)
        fireEvent.touchMove(toggleButton)
        fireEvent.touchEnd(toggleButton)

        expect(stateReducer).not.toHaveBeenCalled()

        fireEvent.touchStart(document.body)
        fireEvent.touchEnd(document.body)

        expect(stateReducer).toHaveBeenCalledTimes(1)
        expect(stateReducer).toHaveBeenCalledWith(
          expect.objectContaining({}),
          expect.objectContaining({type: stateChangeTypes.MenuBlur}),
        )
      })
    })
  })

  describe('non production errors', () => {
    beforeEach(() => {
      const {useGetterPropsCalledChecker} = jest.requireActual('../../utils')
      jest
        .spyOn(utils, 'useGetterPropsCalledChecker')
        .mockImplementation(useGetterPropsCalledChecker)
      jest.spyOn(console, 'error').mockImplementation(jest.fn())
    })

    test('will be displayed if getMenuProps is not called', () => {
      renderHook(() => {
        const {getToggleButtonProps} = useSelect({items})
        getToggleButtonProps({}, {suppressRefError: true})
      })

      // eslint-disable-next-line no-console
      expect(
        (console.error as jest.Mock).mock.calls[0][0],
      ).toMatchInlineSnapshot(
        `"downshift: You forgot to call the getMenuProps getter function on your component / element."`,
      )
    })

    test('will not be displayed if getMenuProps is not called on subsequent renders', () => {
      let firstRender = true
      const {rerender} = renderHook(() => {
        const {getToggleButtonProps, getMenuProps} = useSelect({items})
        getToggleButtonProps({}, {suppressRefError: true})

        // eslint-disable-next-line jest/no-if
        if (firstRender) {
          firstRender = false
          getMenuProps({}, {suppressRefError: true})
        }
      })

      rerender()

      // eslint-disable-next-line no-console
      expect(console.error).not.toHaveBeenCalled()
    })

    test('will be displayed if element ref is not set and suppressRefError is false', () => {
      renderHook(() => {
        const {getMenuProps, getToggleButtonProps} = useSelect({
          items,
        })

        getToggleButtonProps({}, {suppressRefError: true})
        getMenuProps()
      })

      // eslint-disable-next-line no-console
      expect(
        (console.error as jest.Mock).mock.calls[0][0],
      ).toMatchInlineSnapshot(
        `"downshift: The ref prop \\"ref\\" from getMenuProps was not applied correctly on your element."`,
      )
    })

    // this test will cover also the equivalent getToggleButtonProps case.
    test('will not be displayed if element ref is not set and suppressRefError is true', () => {
      renderHook(() => {
        const {getMenuProps, getToggleButtonProps} = useSelect({
          items,
        })

        getToggleButtonProps({}, {suppressRefError: true})
        getMenuProps({}, {suppressRefError: true})
      })

      // eslint-disable-next-line no-console
      expect(console.error).not.toHaveBeenCalled()
    })

    test('will not be displayed if called with a correct ref', () => {
      const refFn = jest.fn()
      const menuNode = {}

      renderHook(() => {
        const {getToggleButtonProps, getMenuProps} = useSelect({
          items,
        })

        getToggleButtonProps({}, {suppressRefError: true})

        const {ref} = getMenuProps({
          ref: refFn,
        })
        ref(menuNode)
      })

      // eslint-disable-next-line no-console
      expect(console.error).not.toHaveBeenCalled()
    })
  })
})
