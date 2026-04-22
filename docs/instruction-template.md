# 지시 문서 템플릿

> `/service-design`이 태스크를 만들 때 사용하는 3계층 구조의 표준 템플릿.
> 실제 태스크 파일은 `workspace/rich-editor/task/[기획번호]-[순번]_태스크명.md`에 작성된다.

---

```markdown
---
plan: [기획번호]              # 예: 10 (마스터) 또는 11 (하위)
task: [기획번호]-[순번]        # 예: 10-10, 11-20
status: 대기                  # 대기 | 진행중 | 완료 | 보류 | 폐기
domains: []                   # knowledge/README.md의 허용 태그에서 선택
assignee:
created: YYYY-MM-DD
started:
completed:
---

# [태스크명]

> 한 줄 요약

---

## 1. 변경 기획 (Change Spec) — 무엇을, 왜

### 배경
- 이 태스크가 속한 기획서의 어느 부분을 구현하는가
- 관련 Decision 링크

### 목표
- 이 태스크 완료 시 달라지는 것
- 성공 기준 (측정 가능)

### 비목표
- 이 태스크에서 하지 않는 것

---

## 2. 상세 설계 (Detail Design) — 어떻게

### 공개 API 변경 (있으면)
- 추가/변경되는 컴포넌트 props, 타입, 확장 키

### 내부 구조
- 신규/수정되는 모듈, 파일 단위

### 저장 포맷 영향 (있으면)
- HTML 구조 변경, ProseMirror 스키마 확장

### 테스트 전략
- Vitest + jsdom 범위 / playground 시연 시나리오 / Playwright 통합 테스트

---

## 3. 구현 지시 (Implementation) — 어디를 어떻게

> 구현자가 이 섹션만 읽고 작업 가능해야 함.

### 파일 변경 목록

| 파일 | 작업 | 내용 |
|------|------|------|
| `packages/rich-editor/src/...` | 신규/수정/삭제 | ... |

### 단계

1. ...
2. ...
3. ...

### 검증

- [ ] `pnpm typecheck` 통과
- [ ] `pnpm test` 통과
- [ ] playground에서 시나리오 확인

---

## 완료 체크리스트

- [ ] 구현 완료
- [ ] 검증 통과 (실제 실행 확인)
- [ ] 기능명세서 갱신 (`docs/기능명세서.md`)
- [ ] 소비자(`pbl-edu` 등)에 영향 있으면 해당 프로젝트에 변경 공지
```
