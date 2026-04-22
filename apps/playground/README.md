# playground

> `@teamsparta/rich-editor`의 고도화·회귀 테스트·시연용 Vite + React 앱.

## 참조

| 주제 | 문서 |
|------|------|
| 모노레포 루트 | [../../README.md](../../README.md) |
| 대상 패키지 | [../../packages/rich-editor/README.md](../../packages/rich-editor/README.md) |

## 상태

**뼈대만 생성된 상태** (2026-04-22). 시연 시나리오·회귀 테스트 케이스는 `/service-plan` Phase C에서 확정.

## 소비 방식

- `package.json`의 dependency를 `"@teamsparta/rich-editor": "workspace:*"`로 둔다 → pnpm workspace가 소스 참조로 연결
- 패키지 변경 즉시 playground에 반영됨 (publish/install 사이클 불필요)

## 배포

- Vercel (URL 미정 — 접근 제어 방식 결정 후 생성)
- **보류 항목**: Basic Auth / Google SSO / 공개 중 결정 필요

## 환경변수

- 현재 없음 (접근 제어 결정 후 `.env.example` 추가)
