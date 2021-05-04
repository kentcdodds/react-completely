import {getItemIndexByCharacterKey} from '../utils'
import reducer from '../reducer'

describe('getItemIndexByCharacterKey', () => {
  const items = ['a', 'b', 'aba', 'aab', 'bab']

  test('returns to check from start if from highlightedIndex does not find anything', () => {
    const index = getItemIndexByCharacterKey({
      keysSoFar: 'a',
      highlightedIndex: 3,
      items,
      itemToString: item => item,
      getItemNodeFromIndex: () => {},
    })
    expect(index).toBe(0)
  })

  test('checks from highlightedIndex position inclusively if there is more than one key', () => {
    const index = getItemIndexByCharacterKey({
      keysSoFar: 'aba',
      highlightedIndex: 2,
      items,
      itemToString: item => item,
      getItemNodeFromIndex: () => {},
    })
    expect(index).toBe(2)
  })

  test('checks from highlightedIndex position exclusively if there is only one key', () => {
    const index = getItemIndexByCharacterKey({
      keysSoFar: 'a',
      highlightedIndex: 2,
      items,
      itemToString: item => item,
      getItemNodeFromIndex: () => {},
    })
    expect(index).toBe(3)
  })

  test('skips disabled item and moves to next', () => {
    const keysSoFar = 'b'
    const highlightedIndex = 0
    const itemToString = item => item
    const getItemNodeFromIndex = index => ({hasAttribute: () => index === 1})

    expect(
      getItemIndexByCharacterKey({
        keysSoFar,
        highlightedIndex,
        items,
        itemToString,
        getItemNodeFromIndex,
      }),
    ).toEqual(4)
  })
})

test('reducer throws error if called without proper action type', () => {
  expect(() => {
    reducer({}, {type: 'super-bogus'})
  }).toThrowError('Reducer called without proper action type.')
})
