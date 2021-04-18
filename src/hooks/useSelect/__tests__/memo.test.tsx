import React from 'react'
import {renderUseSelect, renderSelect} from '../testUtils'
import {items, defaultIds, MemoizedItem} from '../../testUtils'
import {RenderItemOptions} from '../types'

test('functions are memoized', () => {
  const {result, rerender} = renderUseSelect()
  const firstRenderResult = result.current
  rerender()
  const secondRenderResult = result.current
  expect(firstRenderResult).toEqual(secondRenderResult)
})

test('will skip disabled items after component rerenders and items are memoized', () => {
  function renderItem<Item>(props: RenderItemOptions<Item>): JSX.Element {
    return (
      <MemoizedItem
        key={props.index}
        disabled={props.index === items.length - 2}
        {...props as any} // ToDo: FIX THIS.
      />
    )
  }

  const {keyDownOnMenu, menu, rerender} = renderSelect<string>(
    {
      isOpen: true,
      initialHighlightedIndex: items.length - 1,
    },
    {renderItem},
  )

  rerender({isOpen: true}, {renderItem})
  keyDownOnMenu('ArrowUp')

  expect(menu).toHaveAttribute(
    'aria-activedescendant',
    defaultIds.getItemId(items.length - 3),
  )
})
