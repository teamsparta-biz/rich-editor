import type { Extension, Mark, Node } from '@tiptap/core'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Code from '@tiptap/extension-code'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import type { MarksExtensionOptions } from '../types'

const DEFAULT_HIGHLIGHT_COLOR = '#fef08a'

export function marksExtensionFactory(
  options?: MarksExtensionOptions,
): (Extension | Node | Mark)[] {
  const bold = options?.bold ?? true
  const italic = options?.italic ?? true
  const strike = options?.strike ?? true
  const code = options?.code ?? true
  const underline = options?.underline ?? true
  const highlight = options?.highlight ?? true
  const highlightColor = options?.highlightColor ?? DEFAULT_HIGHLIGHT_COLOR

  const extensions: (Extension | Node | Mark)[] = []

  if (bold) extensions.push(Bold)
  if (italic) extensions.push(Italic)
  if (strike) extensions.push(Strike)
  if (code) extensions.push(Code)
  if (underline) extensions.push(Underline)
  if (highlight) {
    extensions.push(
      Highlight.configure({
        multicolor: false,
        HTMLAttributes: {
          style: `background-color: ${highlightColor}`,
        },
      }),
    )
  }

  return extensions
}
