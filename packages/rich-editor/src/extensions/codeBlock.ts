import type { Extension, Mark, Node } from '@tiptap/core'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import type { CodeBlockExtensionOptions } from '../types'

/**
 * codeBlock factory — lowlight common 서브셋 등록 후 CodeBlockLowlight 반환.
 * lowlight 인스턴스는 factory 호출 시점에 생성하여 소비자가 여러 Editor를 띄울 때
 * 설정이 공유되지 않게 한다.
 */
export function codeBlockExtensionFactory(
  options?: CodeBlockExtensionOptions,
): (Extension | Node | Mark)[] {
  const lowlight = createLowlight(common)

  if (options?.languages && options.languages.length > 0) {
    const available = new Set(lowlight.listLanguages())
    for (const lang of options.languages) {
      if (!available.has(lang) && import.meta.env?.DEV) {
        console.warn(
          `[@teamsparta-biz/rich-editor] codeBlock: unknown language "${lang}" — skipped.`,
        )
      }
    }
  }

  return [
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: options?.defaultLanguage,
    }),
  ]
}
