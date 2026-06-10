import type { Extension, Mark, Node } from '@tiptap/core'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import type { HorizontalRuleExtensionOptions } from '../types'

/**
 * horizontalRule factory — 구분선(<hr>) 블록 노드.
 * TipTap HorizontalRule은 `---`·`***` 입력 시 구분선으로 변환하는 입력룰과
 * `setHorizontalRule` 명령을 기본 제공한다. 별도 입력룰 정의 불요(blockquote 선례 원칙).
 * 스타일은 styles.css의 `.rte-editor .ProseMirror hr`가 담당한다.
 */
export function horizontalRuleExtensionFactory(
  options?: HorizontalRuleExtensionOptions,
): (Extension | Node | Mark)[] {
  return [
    HorizontalRule.configure({
      HTMLAttributes: options?.HTMLAttributes ?? {},
    }),
  ]
}
