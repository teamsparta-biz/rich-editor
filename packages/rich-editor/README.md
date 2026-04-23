# @teamsparta/rich-editor

> TipTap v2 기반 팀스파르타 공용 리치텍스트 에디터 React 라이브러리.

## 참조

| 주제 | 문서 |
|------|------|
| 모노레포 루트 | [../../README.md](../../README.md) |
| 기능명세서 | [../../docs/기능명세서.md](../../docs/기능명세서.md) |
| 배포·publish 가이드 | [../../docs/publish.md](../../docs/publish.md) |
| playground | [../../apps/playground/README.md](../../apps/playground/README.md) |

## 상태

**v0.2.0 (Phase 12 B1 릴리즈, 2026-04-24)** — 텍스트 계열 기본 확장 5종(`headings`·`lists`·`links`·`codeBlock`·`taskList`)이 추가되었습니다. 공개 API 1차 고정 Decision에 따라 **0.x minor bump에서 비-브레이킹 추가만 허용**되며, 기존 `'core'` 키와 props 시그니처는 불변입니다. 이미지·표는 v0.3.0(Phase 12 B2)에서 추가 예정.

## 설치

`.npmrc` 설정 (프로젝트 루트):

```
@teamsparta:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN`에는 `read:packages` 권한의 PAT을 환경변수로 주입. 설치:

```bash
pnpm add @teamsparta/rich-editor
```

peer 5종은 소비자 프로젝트에 이미 설치돼 있어야 합니다:

```bash
pnpm add react@^19 react-dom@^19 @tiptap/core@^2 @tiptap/react@^2 tailwindcss@^4
```

## 기본 사용

```tsx
import { useState } from 'react'
import { RichEditor } from '@teamsparta/rich-editor'
import '@teamsparta/rich-editor/styles.css'

export function Editor() {
  const [html, setHtml] = useState('<p>안녕하세요.</p>')

  return (
    <RichEditor
      initialHtml={html}
      onChangeHtml={setHtml}
      extensions={['headings', 'lists', 'links', 'codeBlock', 'taskList']}
      placeholder="내용을 입력하세요"
    />
  )
}
```

> `styles.css` import 필수. Tailwind 없이도 border·focus·placeholder·확장별 기본 스타일이 동작합니다.

옵션을 주입하는 스펙 객체 형태도 지원합니다:

```tsx
<RichEditor
  extensions={[
    { key: 'headings', options: { levels: [1, 2, 3, 4] } },
    { key: 'links', options: { HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } } },
    'codeBlock',
    'taskList',
  ]}
/>
```

## 공개 API

### `<RichEditor>` Props

| Prop | 타입 | 기본값 | 설명 |
|------|------|-------|------|
| `initialHtml` | `string` | `''` | 초기 HTML. 변경 감지되면 재주입 |
| `onChangeHtml` | `(html: string) => void` | — | HTML 변경 시 호출 |
| `extensions` | `ExtensionInput[]` | `['core']` | 확장 입력. 아래 "확장 키 카탈로그" 참조 |
| `readOnly` | `boolean` | `false` | 편집 비활성 |
| `placeholder` | `string` | `''` | 빈 문서 안내 문구 |
| `autofocus` | `boolean` | `false` | 마운트 시 자동 포커스 |
| `className` | `string` | — | 외부 스타일 override. `rte-editor`와 함께 적용 |
| `onEditorReady` | `(editor: Editor) => void` | — | TipTap editor 인스턴스 접근 (마운트 1회) |

### 확장 키 카탈로그 (v0.2.0 기준 6종)

| 키 | 포함 기능 | 주요 옵션 |
|----|----------|----------|
| `core` (기본 포함) | Document·Paragraph·Text·History·Placeholder | `placeholder?: string` — `<RichEditor placeholder>`로도 주입 가능 |
| `headings` | H1~H6 헤딩 | `levels?: (1\|2\|3\|4\|5\|6)[]` (default `[1,2,3]`) |
| `lists` | 순서·비순서 리스트 + 리스트 아이템 | `nestedLists?: boolean` (default `true`) |
| `links` | 인라인 링크 + autolink | `openOnClick?` / `autolink?` / `defaultProtocol?: 'http'\|'https'` / `HTMLAttributes?` |
| `codeBlock` | lowlight 신택스 하이라이팅 코드블록 | `languages?: string[]` / `defaultLanguage?: string` — lowlight common 서브셋 기본 등록 |
| `taskList` | 체크박스 태스크 리스트 | `nestedTasks?: boolean` (default `true`) |

각 키는 배열 요소로 `'headings'`처럼 문자열로 쓰거나 `{ key: 'headings', options: { ... } }` 스펙 객체로 쓸 수 있습니다. 동일 키를 여러 번 넣으면 뒤에 주입된 옵션이 적용됩니다.

### Export 목록

- 컴포넌트: `RichEditor`
- 유틸: `htmlSerializer` (HTML ↔ editor 상태 수동 변환)
- 타입:
  - `RichEditorProps` / `ExtensionKey` / `ExtensionSpec` / `ExtensionInput` / `ExtensionOptionsMap` / `Serializer` / `Editor` (TipTap re-export)
  - 옵션 타입 6종: `CoreExtensionOptions`, `HeadingsExtensionOptions`, `ListsExtensionOptions`, `LinksExtensionOptions`, `CodeBlockExtensionOptions`, `TaskListExtensionOptions`

### 서브패스

- `.` — 라이브러리 진입점
- `./styles.css` — 최소 CSS + 확장 팩 기본 스타일 (border·focus·placeholder·headings·lists·links·codeBlock·taskList)

## v0.2.0 한계

- 이미지·표는 v0.3.0(Phase 12 B2)에서 추가 예정
- AI 스트리밍 삽입 확장, 외부 포맷 임포터(docx·노션 HTML·Markdown)는 차후 과제
- 테스트 스위트(Vitest·Playwright)는 Phase 13 예정

## 소비자

- [pbl-edu](https://github.com/teamsparta-biz/pbl-edu) — 1차 타겟 (교안·프로젝트 차터·멘토링 로그)
- instructor-scheduler — 차후 `BlockEditor` 교체 후보

## 빌드·배포

- 빌드: Vite library mode(ESM+CJS) + tsup(`.d.ts`) + 최소 CSS 복사
- 배포: GitHub Packages (private) — `https://npm.pkg.github.com`
- Phase 11은 **수동 publish 1회**. Changesets·GitHub Actions 자동화는 Phase 13
- 세부 절차는 [../../docs/publish.md](../../docs/publish.md) 참조
