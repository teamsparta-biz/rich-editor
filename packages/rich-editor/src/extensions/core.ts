import type { Extension, Mark, Node } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'
import Placeholder from '@tiptap/extension-placeholder'

export type CoreExtensionOptions = {
  placeholder?: string
}

export function coreExtensionFactory(
  options?: Record<string, unknown>,
): (Extension | Node | Mark)[] {
  const placeholderText =
    typeof options?.['placeholder'] === 'string' ? (options['placeholder'] as string) : ''

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
