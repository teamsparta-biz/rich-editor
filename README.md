# rich-editor

> TipTap v2 기반 팀스파르타 공용 리치텍스트 에디터 라이브러리 + playground 데모 사이트

## 참조

| 주제 | 문서 |
|------|------|
| 기능명세서 | [docs/기능명세서.md](docs/기능명세서.md) |
| 개선 이력 | [docs/improvement-plan.md](docs/improvement-plan.md) |
| publish 가이드 | [docs/publish.md](docs/publish.md) |

## 정체성

React 리치텍스트 에디터 **라이브러리**. 단독 서비스가 아니라 팀스파르타 내부 서비스들이 의존하는 공용 패키지입니다.

## 구조 (pnpm monorepo)

```
rich-editor/
├── packages/
│   └── rich-editor/         # @teamsparta-biz/rich-editor (library)
└── apps/
    └── playground/          # 데모/회귀 테스트 사이트 (Vercel 배포)
```

playground는 패키지를 `workspace:*`로 소스 참조 → 저장 즉시 반영.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 에디터 코어 | TipTap v2 (ProseMirror 기반) |
| 언어 | TypeScript (strict) |
| 프레임워크 | React 19 |
| 라이브러리 빌드 | Vite library mode + tsup 보조 (ESM + CJS + .d.ts) |
| 모노레포 | pnpm workspace |
| playground | Vite + React 19 + Tailwind 4 |
| 패키지 배포 | GitHub Packages — `@teamsparta-biz/rich-editor` |
| playground 배포 | Vercel |

## 배포

| 항목 | 위치 |
|------|------|
| 패키지 registry | GitHub Packages — `https://npm.pkg.github.com` |
| 패키지명 | `@teamsparta-biz/rich-editor` |
| GitHub | `teamsparta-biz/rich-editor` (public) |

설치·인증 절차는 [패키지 README](packages/rich-editor/README.md) 또는 [docs/publish.md](docs/publish.md)를 참조하세요.

## 사용처

팀스파르타 내부 서비스들이 교안·콘텐츠 저작 및 운영 도구의 본문 편집기로 사용합니다. 공개 API는 여러 소비처가 **동일 호출 시그니처**로 사용할 수 있도록 설계되었습니다.

## 상태

- 현재 **v0.5.0** — 확장 팩 8종 + 인라인 마크(6종) 제공. 패키지 상세·확장 카탈로그는 [패키지 README](packages/rich-editor/README.md)를 참조하세요.
