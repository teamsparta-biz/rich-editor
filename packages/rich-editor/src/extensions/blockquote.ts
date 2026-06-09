import type { Extension, Mark, Node } from '@tiptap/core'
import Blockquote from '@tiptap/extension-blockquote'
import type { BlockquoteExtensionOptions } from '../types'

/**
 * blockquote factory — 인용문 블록 노드.
 * TipTap Blockquote는 `> ` 입력 시 인용문으로 감싸는 wrapping input rule과
 * `toggleBlockquote` 명령을 기본 제공한다. 별도 입력룰 정의 불요.
 * 스타일은 styles.css의 `.rte-editor .ProseMirror blockquote`가 담당한다.
 */
export function blockquoteExtensionFactory(
  options?: BlockquoteExtensionOptions,
): (Extension | Node | Mark)[] {
  return [
    Blockquote.configure({
      HTMLAttributes: options?.HTMLAttributes ?? {},
    }),
  ]
}
