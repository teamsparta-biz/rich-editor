# rich-editor

> TipTap v2 기반 팀스파르타 공용 리치텍스트 에디터 라이브러리 + playground 데모 사이트

## 참조

| 주제 | 문서 |
|------|------|
| 기능명세서 | [docs/기능명세서.md](docs/기능명세서.md) |
| 지시 문서 템플릿 | [docs/instruction-template.md](docs/instruction-template.md) |
| 개선 이력 | [docs/improvement-plan.md](docs/improvement-plan.md) |
| 워크스페이스 프로젝트 | `workspace/rich-editor/` (Google Drive) |
| 초기 아키텍처 결정 | `workspace/rich-editor/context/session/raw/2026-04-22_프로젝트-시작.md` |

## 정체성

React 리치텍스트 에디터 **라이브러리**. 단독 서비스가 아니라 `pbl-edu`·`instructor-scheduler` 등 내부 서비스가 의존하는 공용 패키지.

## 구조 (pnpm monorepo)

```
rich-editor/
├── packages/
│   └── rich-editor/         # @teamsparta/rich-editor (library)
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
| 패키지 배포 | GitHub Packages (private) — `@teamsparta/rich-editor` |
| playground 배포 | Vercel |

> 세부 버전·빌드 설정은 `/service-plan` → `/service-design` 태스크에서 확정합니다 (현재 뼈대는 **최소 스캐폴딩**).

## 배포

| 항목 | 위치 |
|------|------|
| 패키지 registry | GitHub Packages — `https://npm.pkg.github.com` |
| 패키지명 | `@teamsparta/rich-editor` |
| playground URL | (미정 — 기획 단계에서 접근 제어 방식 확정 후 Vercel 프로젝트 생성) |
| GitHub | `teamsparta-biz/rich-editor` |

## 소비자 (설계 시 고려 대상)

| 소비자 | 단계 | 용도 |
|--------|------|------|
| `pbl-edu` | 1차 릴리즈 타겟 | 교안·프로젝트 차터·멘토링 로그 편집 |
| `instructor-scheduler` | 차후 | 현재 미사용 `BlockEditor`(BlockNote 래퍼) 대체 후보 |

1차 공개 API는 두 소비자가 **동일 호출 시그니처**로 사용 가능하도록 설계.

## 개발 경로 규칙

- **코드 수정/커밋/푸시**: `C:/dev/rich-editor` (이 폴더)에서 수행
- **Google Drive 사본**(`tools/services/rich-editor/`): 참조 전용, `git pull`로 동기화
- 이유: Google Drive 한글 경로에서 Node.js 빌드 불가, `.git/` 내부 `desktop.ini` 오염

## 상태

- 2026-04-22: 모노레포 뼈대 생성 (최소 스캐폴딩). `/service-plan rich-editor`로 기능 기획 진입 예정.
