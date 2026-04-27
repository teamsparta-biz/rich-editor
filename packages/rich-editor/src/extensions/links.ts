import type { Extension, Mark, Node } from '@tiptap/core'
import Link from '@tiptap/extension-link'
import type { LinksExtensionOptions } from '../types'

export function linksExtensionFactory(
  options?: LinksExtensionOptions,
): (Extension | Node | Mark)[] {
  return [
    Link.configure({
      openOnClick: options?.openOnClick ?? false,
      autolink: options?.autolink ?? true,
      defaultProtocol: options?.defaultProtocol ?? 'https',
      HTMLAttributes: options?.HTMLAttributes ?? {},
    }),
  ]
}
