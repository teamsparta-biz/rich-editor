# 릴리즈 인프라 셋업 가이드

`@teamsparta-biz/rich-editor`의 CI / 자동 publish 파이프라인 (`ci.yml` · `release.yml`)을 동작시키기 위한 저장소 측 설정. 패키지는 **공개 npm 레지스트리(npmjs.com)** 에 게시됩니다.

## 1. Actions 권한 (필수)

`Settings → Actions → General → Workflow permissions`

- [x] **Read and write permissions** 선택
- [x] **Allow GitHub Actions to create and approve pull requests** 체크

→ Changesets action이 버전 bump 커밋과 Version PR을 만들 수 있게 해준다. 둘 중 하나라도 빠지면 Version PR 자동 생성이 실패한다.

## 2. publish 인증 — npm 토큰 (필수)

npmjs.com 게시는 자동 `GITHUB_TOKEN`으로 불가능하므로 **npm Access Token을 저장소 secret으로 등록**한다.

1. npm 토큰 발급 — https://www.npmjs.com/settings/~/tokens
   - Granular Access Token(권장) 또는 Automation 토큰
   - 권한: `@teamsparta-biz` 스코프에 **Read and write**
   - 전제: npm org `teamsparta-biz` 가 존재하고 토큰 소유 계정이 멤버일 것
2. `Settings → Secrets and variables → Actions → New repository secret`
   - Name: `NPM_TOKEN`
   - Value: 발급한 npm 토큰
3. `release.yml`이 `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`, `registry-url: https://registry.npmjs.org`로 이 토큰을 사용한다.

전제:
- `packages/rich-editor/package.json`의 `publishConfig.access`가 `public` ✅
- `.changeset/config.json`의 `access`가 `public` ✅

## 3. Branch protection (선택, 첫 시연 후 권장)

`Settings → Branches → Add branch protection rule → main`

- [x] **Require status checks to pass before merging**
- [x] required check에 `verify` 추가 (`ci.yml`의 job 이름)

→ 회귀 테스트 FAIL인 PR의 머지를 차단한다.

## 4. 자동 release 흐름 (동작 확인용)

```
기능 PR (changeset md 동봉) ──머지──▶ main push
                                        │
                              release.yml 트리거
                                        │
                         build + test PASS
                                        │
              changeset md 감지 ─▶ Version PR 자동 생성
                  (package.json bump + CHANGELOG)
                                        │
                          사용자 Version PR 머지
                                        │
                              main push 재트리거
                                        │
              changeset md 없음 ─▶ publish step 실행
                  (prepublishOnly: build + check:dist + test 게이트)
                                        │
                    pnpm publish ─▶ npmjs 게시 (public)
```

### 사후 확인
- npmjs 패키지 페이지에 새 버전 표시: https://www.npmjs.com/package/@teamsparta-biz/rich-editor
- `npm view @teamsparta-biz/rich-editor versions`
