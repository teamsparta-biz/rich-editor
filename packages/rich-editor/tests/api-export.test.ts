import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DTS_PATH = resolve(process.cwd(), 'dist', 'index.d.ts')

/**
 * 검증 대상 — `2026-04-22_공개-API-시그니처-확정` Decision의 동결 시그니처.
 * 본 테스트가 FAIL하면 어떤 식별자가 어떤 형태로 누락되었는지 메시지에 명시된다.
 */

const OPTION_INTERFACES = [
  'CoreExtensionOptions',
  'HeadingsExtensionOptions',
  'ListsExtensionOptions',
  'LinksExtensionOptions',
  'CodeBlockExtensionOptions',
  'TaskListExtensionOptions',
  'ImageExtensionOptions',
  'TablesExtensionOptions',
  'MarksExtensionOptions',
] as const

const CORE_TYPES = [
  'RichEditorProps', // interface
  'ExtensionKey', // type alias
  'ExtensionInput', // type alias
  'ExtensionSpec', // interface
  'ExtensionOptionsMap', // interface
  'Serializer', // interface
  'Editor', // re-export from @tiptap/core
] as const

const VALUE_EXPORTS = [
  'RichEditor', // declare function
  'htmlSerializer', // declare const
] as const

function isInExportBlock(content: string, id: string): boolean {
  // export { ... id ... } — `[^}]`는 newline 포함 임의 문자라 multiline 묶음 export도 매칭한다
  const re = new RegExp(String.raw`export\s*\{[^}]*\b${id}\b[^}]*\}`)
  return re.test(content)
}

describe('E 회귀 — 공개 API export 라인 (dist/index.d.ts)', () => {
  it('dist/index.d.ts 존재 — pnpm build 선행 필수', () => {
    expect(existsSync(DTS_PATH), `dist/index.d.ts 없음 — pnpm build를 먼저 실행하세요`).toBe(true)
  })

  it('옵션 인터페이스 9종 + 핵심 타입 7종 + 값 export 2종 (총 18개) 모두 검출', () => {
    const content = readFileSync(DTS_PATH, 'utf8')
    const missing: string[] = []

    // 옵션 인터페이스 9종 — interface 정의 + export 포함
    for (const id of OPTION_INTERFACES) {
      const definedRe = new RegExp(String.raw`\binterface\s+${id}\b`)
      if (!definedRe.test(content)) {
        missing.push(`옵션 인터페이스 "${id}": "interface ${id}" 선언 누락`)
        continue
      }
      if (!isInExportBlock(content, id)) {
        missing.push(`옵션 인터페이스 "${id}": export 묶음에 포함되지 않음`)
      }
    }

    // 핵심 타입 7종
    for (const id of CORE_TYPES) {
      if (id === 'Editor') {
        // Editor는 @tiptap/core에서 re-export
        const reExportRe = /export\s*\{\s*Editor\s*\}\s*from\s*['"]@tiptap\/core['"]/
        if (!reExportRe.test(content)) {
          missing.push(
            `핵심 타입 "Editor": "export { Editor } from '@tiptap/core'" re-export 누락`,
          )
        }
        continue
      }
      const definedRe = new RegExp(String.raw`\b(interface|type)\s+${id}\b`)
      if (!definedRe.test(content)) {
        missing.push(`핵심 타입 "${id}": "interface ${id}" 또는 "type ${id}" 선언 누락`)
        continue
      }
      if (!isInExportBlock(content, id)) {
        missing.push(`핵심 타입 "${id}": export 묶음에 포함되지 않음`)
      }
    }

    // 값 export 2종
    for (const id of VALUE_EXPORTS) {
      const declaredRe = new RegExp(String.raw`declare\s+(function|const|class)\s+${id}\b`)
      if (!declaredRe.test(content)) {
        missing.push(
          `값 export "${id}": "declare function ${id}" 또는 "declare const ${id}" 선언 누락`,
        )
        continue
      }
      if (!isInExportBlock(content, id)) {
        missing.push(`값 export "${id}": export 묶음에 포함되지 않음`)
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `공개 API export 누락 ${missing.length}건:\n  - ${missing.join('\n  - ')}`,
      )
    }
  })
})
