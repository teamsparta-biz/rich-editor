import type { Extension, Mark, Node } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'
import Placeholder from '@tiptap/extension-placeholder'
import type { CoreExtensionOptions } from '../types'

export function coreExtensionFactory(
  options?: CoreExtensionOptions,
): (Extension | Node | Mark)[] {
  const placeholderText = options?.placeholder ?? ''

  return [
    Document,
    Paragraph,
    Text,
    History,
    Placeholder.configure({
      placeholder: placeholderText,
    }),
  ]
}
