---
"@teamsparta-biz/rich-editor": minor
---

horizontalRule 확장 추가 (`horizontalRule` 확장 키, 비-브레이킹)

- **horizontalRule 확장 신규**: `'horizontalRule'` 확장 키 추가. TipTap HorizontalRule 노드를 등록해 `---`·`***` 입력룰로 구분선(`<hr>`) 변환 + `setHorizontalRule` 명령을 제공한다. `HorizontalRuleExtensionOptions`(HTMLAttributes) 공개.
- **Toolbar 구분선 버튼**: 로드 시(`extensions`에 `'horizontalRule'` 포함) 툴바에 "구분선" 버튼을 노출해 `setHorizontalRule`을 실행한다(삽입형 노드라 활성 상태 없음).
- **hr 스타일**: `styles.css`에 `.rte-editor .ProseMirror hr` 추가 — 기존 회색 보더(`#d4d4d8`) 시각 언어와 일관, 선택 시 focus 토큰 색상.

`'horizontalRule'` 미포함 소비자는 거동 불변. 공개 API 시그니처는 optional 추가만 — 기존 키·props 무영향.
