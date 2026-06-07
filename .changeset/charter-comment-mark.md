---
'@teamsparta-biz/rich-editor': minor
---

comment 인라인 앵커 마크 추가 (`comment` 확장 키)

- `setComment(commentId)` / `unsetComment()` 명령 + `<span data-comment-id>` HTML round-trip
- RichEditor props: `onCommentClick(commentId)`(클릭 콜백) · `onSelectionForComment(range)`(선택 트리거) · `activeCommentId`(활성 강조 decoration)
- 시각 hook은 CSS 변수(`--rte-comment-bg`/`--rte-comment-active-bg`/`--rte-comment-border`)로 노출

코멘트 책임 경계(에디터=앵커링·마킹·콜백, 소비자=데이터·UI·권한, Decision 2026-05-29) 준수. PBL charter 인라인 코멘트(본문 위치 앵커, 제출 스냅샷에 임베드돼 버전별 고정)의 선행 기반.
