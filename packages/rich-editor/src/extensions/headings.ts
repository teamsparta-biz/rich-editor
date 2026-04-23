import type { Extension, Mark, Node } from '@tiptap/core'
import Heading from '@tiptap/extension-heading'
import type { HeadingsExtensionOptions } from '../types'

export function headingsExtensionFactory(
  options?: HeadingsExtensionOptions,
): (Extension | Node | Mark)[] {
  const levels = options?.levels ?? [1, 2, 3]
  return [Heading.configure({ levels })]
}
