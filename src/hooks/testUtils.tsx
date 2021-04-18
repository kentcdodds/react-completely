import React from 'react'
import {act} from '@testing-library/react'
import {RenderItemOptions} from './useSelect/types'

export const items = [
  'Neptunium',
  'Plutonium',
  'Americium',
  'Curium',
  'Berkelium',
  'Californium',
  'Einsteinium',
  'Fermium',
  'Mendelevium',
  'Nobelium',
  'Lawrencium',
  'Rutherfordium',
  'Dubnium',
  'Seaborgium',
  'Bohrium',
  'Hassium',
  'Meitnerium',
  'Darmstadtium',
  'Roentgenium',
  'Copernicium',
  'Nihonium',
  'Flerovium',
  'Moscovium',
  'Livermorium',
  'Tennessine',
  'Oganesson',
]

export const defaultIds = {
  labelId: 'downshift-test-id-label',
  menuId: 'downshift-test-id-menu',
  getItemId: (index: number) => `downshift-test-id-item-${index}`,
  toggleButtonId: 'downshift-test-id-toggle-button',
  inputId: 'downshift-test-id-input',
}

export const waitForDebouncedA11yStatusUpdate = () =>
  act(() => {
    jest.advanceTimersByTime(200)
  })

export const MemoizedItem = React.memo(function Item<Item>({
  index,
  item,
  getItemProps,
  dataTestIds,
  stringItem,
  ...rest
}: RenderItemOptions<Item> & {index: number; item: Item}): JSX.Element {
  return (
    <li
      data-testid={dataTestIds.item(index)}
      key={`${stringItem}${index}`}
      {...getItemProps({item, index, ...rest})}
    >
      {stringItem}
    </li>
  )
})
