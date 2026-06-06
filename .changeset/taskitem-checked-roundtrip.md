---
"@teamsparta-biz/rich-editor": patch
---

taskList: TaskItem `data-checked` round-trip 보존 fix

`data-type="taskItem"` 없이 `data-checked`만 있는 저장 HTML을 `setContent`로 불러올 때 체크 ON(`data-checked="true"`) 상태가 `getHTML()` 왕복에서 `false`로 손실되던 버그 수정. `RoundTripTaskItem`이 `li[data-checked]`를 parseHTML 규칙으로 매칭해 data-type 유무와 무관하게 checked 값을 보존한다. 공개 API·factory 시그니처 불변.
