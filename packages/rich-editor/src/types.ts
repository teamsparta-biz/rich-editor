import type { Editor } from '@tiptap/core'

export type { Editor }

/**
 * 확장 키.
 * Phase 11 단계에서는 'core' 하나만 유효.
 * Phase 12 이후 'headings' | 'lists' | ... 가 추가된다 (비-브레이킹 확장).
 */
export type ExtensionKey = 'core'

/**
 * 확장 스펙 — 공개 API 3원칙 중 "문자열 키 + 옵션"의 구체 타입.
 */
export interface ExtensionSpec<K extends ExtensionKey = ExtensionKey> {
  key: K
  options?: Record<string, unknown>
}

/**
 * 확장 인풋 — 문자열만으로도, 옵션 포함 객체로도 지정 가능.
 */
export type ExtensionInput = ExtensionKey | ExtensionSpec

/**
 * 직렬화 계층 인터페이스.
 * HtmlSerializer 외 Phase 12 이후 ProseMirror JSON Serializer 등이 같은 계약으로 추가된다.
 */
export interface Serializer {
  toHtml: (editor: Editor) => string
  fromHtml: (editor: Editor, html: string) => void
}

/**
 * `<RichEditor>` 공개 Props.
 *
 * 공개 API 1차 고정 (2026-04-22): 이 시그니처는 0.x minor bump에서 optional 추가만 허용,
 * 제거·축소는 major bump에서만 가능하다.
 */
export interface RichEditorProps {
  /** 초기 HTML. 기본값 '' */
  initialHtml?: string
  /** HTML 변경 시 호출 */
  onChangeHtml?: (html: string) => void
  /** 확장 입력. 기본값 ['core']. Phase 11은 'core'만 유효 */
  extensions?: ExtensionInput[]
  /** 편집 비활성 여부. 기본값 false */
  readOnly?: boolean
  /** 빈 문서 안내 문구. 기본값 '' */
  placeholder?: string
  /** 마운트 시 자동 포커스. 기본값 false */
  autofocus?: boolean
  /** 외부 스타일 override용 클래스. 'rte-editor'와 함께 적용됨 */
  className?: string
  /** editor 인스턴스 접근 콜백 (마운트 시 1회) */
  onEditorReady?: (editor: Editor) => void
}
