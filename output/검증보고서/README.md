# 검증 보고서

> rich-editor의 release 직전 안정성 검증 결과를 release마다 1파일로 누적합니다.

## 표준

- 검증 절차 표준: [Decision: 2026-04-27_release-검증-7영역-표준](../../../../G:/내%20드라이브/claude_root/workspace/rich-editor/context/knowledge/decisions/2026-04-27_release-검증-7영역-표준.md)
- 7영역(A~G) 모두 PASS여야 publish GO
- A 영역은 `pnpm -C packages/rich-editor check:dist`로 자동화

## 파일 명명

```
v<버전>_안정성검증.md
```

예: `v0.3.0_안정성검증.md`, `v0.4.0_안정성검증.md`

## 작성 흐름

1. release 후보 빌드 → `pnpm check:dist` 실행
2. 본 폴더에 `v<버전>_안정성검증.md` 생성 (frontmatter + 7영역 표)
3. 영역별 PASS/FAIL 기록 (A·E는 자동/grep, B·C·F·G는 사람 회귀)
4. 사용자 GO/NO-GO 결정 기록
5. publish 후 D 영역 결과 추가
6. `status: 완료` + 보고서 마감
