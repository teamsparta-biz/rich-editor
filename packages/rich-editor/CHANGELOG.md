# @teamsparta-biz/rich-editor

## 0.9.0

### Minor Changes

- 2fa8171: horizontalRule 확장 추가 (`horizontalRule` 확장 키, 비-브레이킹)

  - **horizontalRule 확장 신규**: `'horizontalRule'` 확장 키 추가. TipTap HorizontalRule 노드를 등록해 `---`·`***` 입력룰로 구분선(`<hr>`) 변환 + `setHorizontalRule` 명령을 제공한다. `HorizontalRuleExtensionOptions`(HTMLAttributes) 공개.
  - **Toolbar 구분선 버튼**: 로드 시(`extensions`에 `'horizontalRule'` 포함) 툴바에 "구분선" 버튼을 노출해 `setHorizontalRule`을 실행한다(삽입형 노드라 활성 상태 없음).
  - **hr 스타일**: `styles.css`에 `.rte-editor .ProseMirror hr` 추가 — 기존 회색 보더(`#d4d4d8`) 시각 언어와 일관, 선택 시 focus 토큰 색상.

  `'horizontalRule'` 미포함 소비자는 거동 불변. 공개 API 시그니처는 optional 추가만 — 기존 키·props 무영향.

## 0.8.0

### Minor Changes

- e939852: blockquote 확장 + 서식 툴바 추가 (비-브레이킹, optional 추가만)

  - **blockquote 확장 신규**: `'blockquote'` 확장 키 추가. TipTap Blockquote 노드를 등록해 `> ` 입력룰로 인용문 변환 + `toggleBlockquote` 명령을 제공한다. 스타일은 기존 `styles.css`의 blockquote 규칙을 그대로 사용한다. `BlockquoteExtensionOptions`(HTMLAttributes) 공개.
  - **Toolbar 컴포넌트 신규**: `Toolbar`(+`ToolbarProps`) export. 로드된 확장 기준으로 굵게/기울임/밑줄/취소선/제목 1~3/목록/인용/인라인코드 버튼을 노출하고 활성 상태를 반영한다. `<RichEditor toolbar />` prop으로 편집 모드(readOnly=false)에서 내장 렌더하거나, `onEditorReady`의 editor로 독립 배치 가능.
  - **focus outline 토큰화**: `.rte-editor:focus-within` outline 색을 `var(--rte-focus-color, #3b82f6)`로 변경(기본값 동일, 소비자가 디자인 토큰으로 override 가능). 툴바 active 배경도 `--rte-toolbar-active-bg`로 override 가능.

  공개 API 시그니처는 optional 추가만 — 기존 소비자 무영향.

## 0.7.0

### Minor Changes

- cecd89d: JSON I/O props 추가 (`initialJson` / `onChangeJson`, TipTap `JSONContent`)

  HTML round-trip 변환을 거치지 않고 본문을 구조화 JSON으로 저장·복원한다(PBL charter 본문 저장 경로). `JSONContent` 타입 re-export 추가. `initialJson` 제공 시 JSON 모드 우선이며 HTML 모드(`initialHtml`/`onChangeHtml`)와 병행 가능. comment 마크는 JSON에 네이티브 보존돼 round-trip 무손실.

## 0.6.0

### Minor Changes

- e0f707d: comment 인라인 앵커 마크 추가 (`comment` 확장 키)

  - `setComment(commentId)` / `unsetComment()` 명령 + `<span data-comment-id>` HTML round-trip
  - RichEditor props: `onCommentClick(commentId)`(클릭 콜백) · `onSelectionForComment(range)`(선택 트리거) · `activeCommentId`(활성 강조 decoration)
  - 시각 hook은 CSS 변수(`--rte-comment-bg`/`--rte-comment-active-bg`/`--rte-comment-border`)로 노출

  코멘트 책임 경계(에디터=앵커링·마킹·콜백, 소비자=데이터·UI·권한, Decision 2026-05-29) 준수. PBL charter 인라인 코멘트(본문 위치 앵커, 제출 스냅샷에 임베드돼 버전별 고정)의 선행 기반.

## 0.5.1

### Patch Changes

- 86bd804: taskList: TaskItem `data-checked` round-trip 보존 fix

  `data-type="taskItem"` 없이 `data-checked`만 있는 저장 HTML을 `setContent`로 불러올 때 체크 ON(`data-checked="true"`) 상태가 `getHTML()` 왕복에서 `false`로 손실되던 버그 수정. `RoundTripTaskItem`이 `li[data-checked]`를 parseHTML 규칙으로 매칭해 data-type 유무와 무관하게 checked 값을 보존한다. 공개 API·factory 시그니처 불변.

## 0.5.0

### Minor Changes

- a10dd25: marks 확장 추가 — Bold/Italic/Strike/inline Code/Underline/Highlight 6종을 단일 'marks' 키로 묶음. highlightColor 옵션으로 마커 색상 변경 가능 (default '#fef08a')

## 0.4.0

### Minor Changes

- 9bd609a: 릴리즈 자동화 도입 — Changesets PR + GitHub Actions + Vitest 회귀 게이트(B·E)
