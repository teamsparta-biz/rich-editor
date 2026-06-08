---
'@teamsparta-biz/rich-editor': minor
---

JSON I/O props 추가 (`initialJson` / `onChangeJson`, TipTap `JSONContent`)

HTML round-trip 변환을 거치지 않고 본문을 구조화 JSON으로 저장·복원한다(PBL charter 본문 저장 경로). `JSONContent` 타입 re-export 추가. `initialJson` 제공 시 JSON 모드 우선이며 HTML 모드(`initialHtml`/`onChangeHtml`)와 병행 가능. comment 마크는 JSON에 네이티브 보존돼 round-trip 무손실.
