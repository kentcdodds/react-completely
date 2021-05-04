/* Internal Types */

export interface GetItemIndexByCharacterKeyOptions<Item> {
  keysSoFar: string
  highlightedIndex: number
  items: Item[]
  itemToString(item: Item | null): string
  getItemNodeFromIndex(index: number): HTMLElement | undefined
}
