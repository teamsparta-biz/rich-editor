# @teamsparta/rich-editor

> TipTap v2 기반 팀스파르타 공용 리치텍스트 에디터 React 라이브러리.

## 참조

| 주제 | 문서 |
|------|------|
| 모노레포 루트 | [../../README.md](../../README.md) |
| 기능명세서 | [../../docs/기능명세서.md](../../docs/기능명세서.md) |
| playground | [../../apps/playground/README.md](../../apps/playground/README.md) |

## 상태

**뼈대만 생성된 상태** (2026-04-22). 공개 API·확장 팩·빌드 설정은 `/service-plan rich-editor` → `/service-design`으로 확정 후 구현.

## 공개 API (목표 — 미구현)

```tsx
import { RichEditor } from '@teamsparta/rich-editor'

<RichEditor
  initialHtml={value}
  onChangeHtml={setValue}
  extensions={['headings', 'lists', 'links', 'images', 'tables', 'codeBlock']}
  readOnly={false}
/>
```

## 빌드·배포 (예정)

- Vite library mode + tsup 보조 → ESM + CJS + `.d.ts`
- GitHub Packages (private): `https://npm.pkg.github.com`
- 배포 트리거: `packages/rich-editor/package.json`의 `version` 변경 + GitHub Actions (세부는 `/service-design` 배포 태스크에서 확정)
