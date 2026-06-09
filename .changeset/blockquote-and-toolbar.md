---
"@teamsparta-biz/rich-editor": minor
---

blockquote 확장 + 서식 툴바 추가 (비-브레이킹, optional 추가만)

- **blockquote 확장 신규**: `'blockquote'` 확장 키 추가. TipTap Blockquote 노드를 등록해 `> ` 입력룰로 인용문 변환 + `toggleBlockquote` 명령을 제공한다. 스타일은 기존 `styles.css`의 blockquote 규칙을 그대로 사용한다. `BlockquoteExtensionOptions`(HTMLAttributes) 공개.
- **Toolbar 컴포넌트 신규**: `Toolbar`(+`ToolbarProps`) export. 로드된 확장 기준으로 굵게/기울임/밑줄/취소선/제목 1~3/목록/인용/인라인코드 버튼을 노출하고 활성 상태를 반영한다. `<RichEditor toolbar />` prop으로 편집 모드(readOnly=false)에서 내장 렌더하거나, `onEditorReady`의 editor로 독립 배치 가능.
- **focus outline 토큰화**: `.rte-editor:focus-within` outline 색을 `var(--rte-focus-color, #3b82f6)`로 변경(기본값 동일, 소비자가 디자인 토큰으로 override 가능). 툴바 active 배경도 `--rte-toolbar-active-bg`로 override 가능.

공개 API 시그니처는 optional 추가만 — 기존 소비자 무영향.
