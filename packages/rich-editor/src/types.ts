import type { Editor } from '@tiptap/core'

export type { Editor }

/**
 * 확장 키.
 * Phase 11: 'core'
 * Phase 12 B1: + 'headings' | 'lists' | 'links' | 'codeBlock' | 'taskList' (비-브레이킹 추가)
 * Phase 12 B2: + 'images' | 'tables' (후속)
 */
export type ExtensionKey =
  | 'core'
  | 'headings'
  | 'lists'
  | 'links'
  | 'codeBlock'
  | 'taskList'
  | 'images'

/**
 * 공개 옵션 타입.
 * 각 확장의 기본값·필드는 0.x 동안 동결 대상.
 */

export interface CoreExtensionOptions {
  placeholder?: string
}

export interface HeadingsExtensionOptions {
  levels?: (1 | 2 | 3 | 4 | 5 | 6)[]
}

export interface ListsExtensionOptions {
  nestedLists?: boolean
}

export interface LinksExtensionOptions {
  openOnClick?: boolean
  autolink?: boolean
  defaultProtocol?: 'http' | 'https'
  HTMLAttributes?: Record<string, unknown>
}

export interface CodeBlockExtensionOptions {
  languages?: string[]
  defaultLanguage?: string
}

export interface TaskListExtensionOptions {
  nestedTasks?: boolean
}

export interface ImageExtensionOptions {
  /** 업로드 훅. 미주입 시 이미지 삽입 거부. */
  imageUpload?: (file: File) => Promise<string>
  /** true면 `<figure><img><figcaption>` 구조. false면 `<img>`만. default `true` */
  allowCaption?: boolean
  /** 클립보드 이미지 붙여넣기 수용. default `true` */
  allowPaste?: boolean
  /** 파일 드래그앤드롭 수용. default `true` */
  allowDrop?: boolean
  /** 허용 MIME 타입. default `['image/png','image/jpeg','image/gif']` */
  acceptedTypes?: string[]
  /** 최대 바이트. 초과 시 삽입 거부. default 없음 */
  maxSize?: number
}

/**
 * 키별 옵션 매핑 — ExtensionSpec이 키에 따라 options 타입을 좁히는 근거.
 */
export interface ExtensionOptionsMap {
  core: CoreExtensionOptions
  headings: HeadingsExtensionOptions
  lists: ListsExtensionOptions
  links: LinksExtensionOptions
  codeBlock: CodeBlockExtensionOptions
  taskList: TaskListExtensionOptions
  images: ImageExtensionOptions
}

/**
 * 확장 스펙 — 공개 API 3원칙 중 "문자열 키 + 옵션"의 구체 타입.
 * 키별로 options 타입이 좁혀진다.
 */
export interface ExtensionSpec<K extends ExtensionKey = ExtensionKey> {
  key: K
  options?: ExtensionOptionsMap[K]
}

/**
 * 확장 인풋 — 문자열만으로도, 옵션 포함 객체로도 지정 가능.
 * `{ key: 'headings', options: { levels: [1, 2] } }`처럼 키와 옵션이 짝을 이룬다.
 */
export type ExtensionInput = ExtensionKey | { [K in ExtensionKey]: ExtensionSpec<K> }[ExtensionKey]

/**
 * 직렬화 계층 인터페이스.
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
  /** 확장 입력. 기본값 ['core']. */
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
