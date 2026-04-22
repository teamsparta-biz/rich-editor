import type { Editor } from '@tiptap/core'
import type { Serializer } from '../types'

const EMPTY_HTML_SIGNATURES = new Set(['', '<p></p>'])

export const htmlSerializer: Serializer = {
  toHtml(editor: Editor): string {
    const html = editor.getHTML()
    return EMPTY_HTML_SIGNATURES.has(html) ? '' : html
  },
  fromHtml(editor: Editor, html: string): void {
    editor.commands.setContent(html, false)
  },
}
