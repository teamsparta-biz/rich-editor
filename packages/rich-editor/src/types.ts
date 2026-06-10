import type { Editor, JSONContent } from '@tiptap/core'

export type { Editor, JSONContent }

/**
 * 확장 키.
 * Phase 11: 'core'
 * Phase 12 B1: + 'headings' | 'lists' | 'links' | 'codeBlock' | 'taskList' (비-브레이킹 추가)
 * Phase 12 B2: + 'images' | 'tables' (후속)
 * Phase 14: + 'marks' (인라인 마크 6종 Bold/Italic/Strike/inline Code/Underline/Highlight)
 * Phase(charter): + 'comment' (인라인 앵커 마크 — 협업 코멘트, marks 번들과 분리)
 * Phase 15: + 'blockquote' (인용문 블록 노드 — `> ` 입력룰·toggleBlockquote 명령)
 * Phase(14-60): + 'horizontalRule' (구분선 블록 노드 — `---`·`***` 입력룰·setHorizontalRule 명령)
 */
export type ExtensionKey =
  | 'core'
  | 'headings'
  | 'lists'
  | 'links'
  | 'codeBlock'
  | 'taskList'
  | 'images'
  | 'tables'
  | 'marks'
  | 'comment'
  | 'blockquote'
  | 'horizontalRule'

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

export interface BlockquoteExtensionOptions {
  /** blockquote 요소에 추가할 HTML 속성(className override 등). */
  HTMLAttributes?: Record<string, unknown>
}

export interface HorizontalRuleExtensionOptions {
  /** hr 요소에 추가할 HTML 속성(className override 등). */
  HTMLAttributes?: Record<string, unknown>
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

export interface TablesExtensionOptions {
  /** 셀 병합(mergeCells·splitCell) 명령 활성. default `true` */
  allowMerge?: boolean
  /** `insertTable` 기본 행 수. default `3` */
  defaultRows?: number
  /** `insertTable` 기본 열 수. default `3` */
  defaultCols?: number
}

export interface MarksExtensionOptions {
  /** Bold 마크 활성. default `true` */
  bold?: boolean
  /** Italic 마크 활성. default `true` */
  italic?: boolean
  /** Strike 마크 활성. default `true` */
  strike?: boolean
  /** inline Code 마크 활성. default `true` */
  code?: boolean
  /** Underline 마크 활성. default `true` */
  underline?: boolean
  /** Highlight 마크 활성. default `true` */
  highlight?: boolean
  /**
   * Highlight 마커 색상(CSS 값). default `'#fef08a'` (노랑).
   * multicolor=false 정책 — 단일 색상만 적용.
   */
  highlightColor?: string
}

/**
 * comment 확장 옵션.
 * 코멘트 기능 책임 경계(Decision 2026-05-29): 에디터는 앵커링·마킹·콜백만 제공,
 * 본체 데이터·UI·권한은 소비자 책임.
 */
export interface CommentExtensionOptions {
  /** comment span에 추가할 HTML 속성(className override 등). */
  HTMLAttributes?: Record<string, unknown>
  /**
   * @internal RichEditor가 주입한다. comment 마크 클릭 시 commentId 콜백.
   * 소비자는 `RichEditorProps.onCommentClick`을 사용한다.
   */
  onCommentClick?: (commentId: string) => void
  /**
   * @internal RichEditor가 주입한다. 활성 코멘트 강조용 현재 activeCommentId getter.
   * 소비자는 `RichEditorProps.activeCommentId`를 사용한다.
   */
  getActiveCommentId?: () => string | null | undefined
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
  tables: TablesExtensionOptions
  marks: MarksExtensionOptions
  comment: CommentExtensionOptions
  blockquote: BlockquoteExtensionOptions
  horizontalRule: HorizontalRuleExtensionOptions
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
  /** 초기 본문 JSON(TipTap doc). 주어지면 initialHtml보다 우선 — JSON 모드로 동작. */
  initialJson?: JSONContent
  /** 본문 변경 시 TipTap JSON 전달 (JSON 모드 저장 경로). onChangeHtml과 동시 사용 가능. */
  onChangeJson?: (json: JSONContent) => void
  /** 확장 입력. 기본값 ['core']. */
  extensions?: ExtensionInput[]
  /** 편집 비활성 여부. 기본값 false */
  readOnly?: boolean
  /** 빈 문서 안내 문구. 기본값 '' */
  placeholder?: string
  /** 마운트 시 자동 포커스. 기본값 false */
  autofocus?: boolean
  /**
   * 서식 툴바 표시 여부. 기본값 false. true면 편집(readOnly=false) 시 에디터 상단에
   * 로드된 확장 기준 서식 버튼(굵게·제목·목록·인용 등)을 노출한다. readOnly면 미표시.
   * 마크다운 단축키만으로는 발견성이 낮은 서식 기능을 버튼으로 제공한다.
   */
  toolbar?: boolean
  /** 외부 스타일 override용 클래스. 'rte-editor'와 함께 적용됨 */
  className?: string
  /** editor 인스턴스 접근 콜백 (마운트 시 1회) */
  onEditorReady?: (editor: Editor) => void
  /** comment 마크 클릭 시 해당 commentId 전달 (extensions에 'comment' 포함 시 동작) */
  onCommentClick?: (commentId: string) => void
  /** 비어있지 않은 선택 영역 변경 시 범위 전달 — 코멘트 작성 트리거 (extensions에 'comment' 포함 시) */
  onSelectionForComment?: (range: { from: number; to: number }) => void
  /** 강조할 활성 코멘트 id. 일치하는 commentId 마크에 rte-comment-active 데코 적용 */
  activeCommentId?: string | null
}
