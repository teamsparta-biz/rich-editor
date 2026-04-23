import type { Extension, Mark, Node } from '@tiptap/core'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import type { ListsExtensionOptions } from '../types'

export function listsExtensionFactory(
  options?: ListsExtensionOptions,
): (Extension | Node | Mark)[] {
  const nestedLists = options?.nestedLists ?? true

  return [
    BulletList,
    OrderedList,
    nestedLists ? ListItem : ListItem.extend({ content: 'paragraph' }),
  ]
}
