# 릴리즈 인프라 셋업 가이드

`@teamsparta/rich-editor`의 CI / 자동 publish 파이프라인 (`ci.yml` · `release.yml`)을 동작시키기 위한 저장소 측 설정.

## 1. Actions 권한 (필수)

`Settings → Actions → General → Workflow permissions`

- [x] **Read and write permissions** 선택
- [x] **Allow GitHub Actions to create and approve pull requests** 체크

→ Changesets action이 버전 bump 커밋과 Version PR을 만들 수 있게 해준다. 둘 중 하나라도 빠지면 Version PR 자동 생성이 실패한다.

## 2. publish 인증 — 두 방식

### (A) GITHUB_TOKEN (현재 채택, 추가 설정 없음)

같은 org(`teamsparta-biz`) 저장소이므로 워크플로우의 자동 `GITHUB_TOKEN`만으로 GitHub Packages publish가 가능하다. `release.yml`의 `permissions: packages: write`가 그 근거다. **별도 secret 등록 불필요.**

전제:
- `packages/rich-editor/package.json`의 `repository.url`이 이 저장소를 정확히 가리킬 것 (현재 `git+https://github.com/teamsparta-biz/rich-editor.git` ✅)
- `publishConfig.registry`가 `https://npm.pkg.github.com` ✅

### (B) PAT (`NPM_PUBLISH_TOKEN`) — 필요 시 전환

조직 정책상 `GITHUB_TOKEN`으로 publish가 막히면 PAT로 교체한다.

1. PAT 발급 — scopes: `write:packages`, `read:packages`
2. `Settings → Secrets and variables → Actions → New repository secret`
   - Name: `NPM_PUBLISH_TOKEN`
   - Value: 발급한 PAT
3. `release.yml`의 `NODE_AUTH_TOKEN`을 `${{ secrets.NPM_PUBLISH_TOKEN }}`으로 변경

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
                    pnpm publish ─▶ GitHub Packages 게시
```

### 사후 확인
- GitHub Packages 웹 UI에 새 버전 표시
- `pnpm view @teamsparta/rich-editor --registry https://npm.pkg.github.com versions`
