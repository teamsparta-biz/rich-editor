# @teamsparta-biz/rich-editor

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
