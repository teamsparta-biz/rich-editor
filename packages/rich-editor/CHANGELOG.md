# @teamsparta-biz/rich-editor

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
