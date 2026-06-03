# Publish 가이드 — @teamsparta-biz/rich-editor

> GitHub Packages에 수동 publish하고, 외부 환경에서 설치·import를 검증하는 절차.
> 자동 release는 Changesets + GitHub Actions(`release.yml`)가 담당하며, 아래는 수동 publish·검증 기준입니다.

---

## 1. 사전 준비

### 1-1. GitHub Personal Access Token (PAT)

1. https://github.com/settings/tokens → **Generate new token (classic)**
2. Scopes:
   - `read:packages` (필수 — 설치용)
   - `write:packages` (publish 시 필수)
   - `repo` (패키지 metadata 접근)
3. 만료일은 팀 정책에 맞춰 설정
4. 토큰 값은 **한 번만 노출**되므로 즉시 안전하게 보관

### 1-2. 환경변수 주입

```bash
# Windows PowerShell
$env:GITHUB_TOKEN = "ghp_xxxxxxxxxxxx"

# Git Bash / Linux / macOS
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

영속화가 필요하면 `.env`(gitignore 대상) 또는 쉘 프로필에 등록. **repo에 토큰을 커밋하지 마세요.**

### 1-3. `.npmrc` 생성

```bash
cp packages/rich-editor/.npmrc.example packages/rich-editor/.npmrc
```

생성된 `.npmrc`는 `.gitignore`에 등록돼 있어 git에 올라가지 않습니다.

### 1-4. 조직 권한 확인

- `teamsparta-biz/rich-editor` 저장소에 push 가능한 멤버여야 publish 가능
- 조직의 Packages 설정이 활성화돼 있어야 함

---

## 2. Publish 실행

### 2-1. 사전 검증

```bash
cd C:/dev/rich-editor

# 1. Uncommitted 변경 없음 확인 (있으면 커밋 후 진행)
git status

# 2. GITHUB_TOKEN 세팅 확인
echo $GITHUB_TOKEN        # Git Bash
echo $env:GITHUB_TOKEN    # PowerShell

# 3. 빌드 (prepublishOnly 훅도 자동 실행하지만 미리 검증)
pnpm -C packages/rich-editor build

# 4. dist 산출물 확인 — 6종 모두 있어야 함
ls packages/rich-editor/dist
# → index.cjs, index.mjs, index.d.ts, index.cjs.map, index.mjs.map, styles.css

# 5. tarball 내용물 검수
cd packages/rich-editor && pnpm pack
tar -tzf teamsparta-biz-rich-editor-*.tgz
# → package/dist/..., package/package.json, package/README.md 만 있어야 함
rm teamsparta-biz-rich-editor-*.tgz && cd ../..
```

### 2-2. Publish

```bash
pnpm -C packages/rich-editor publish --no-git-checks --access restricted
```

- `--no-git-checks`: 커밋되지 않은 변경 없음을 위에서 이미 확인했으므로
- `--access restricted`: 조직 내부 비공개 패키지

성공 출력 예:
```
+ @teamsparta-biz/rich-editor@0.5.0
```

### 2-3. 게시 확인

- Web UI: https://github.com/teamsparta-biz/rich-editor/pkgs/npm/rich-editor
- CLI:
  ```bash
  pnpm view @teamsparta-biz/rich-editor --registry https://npm.pkg.github.com
  ```
- 게시한 버전이 표시되면 성공

### 2-4. 실패 시 진단

| 에러 | 원인 |
|------|------|
| `ERR_PNPM_FETCH_401` | PAT 권한 부족 또는 만료 |
| `ERR_PNPM_FETCH_403` | 조직 멤버가 아니거나 write 권한 없음 / 스코프≠org |
| `E404 Not Found` | registry URL 오타 또는 package.json `name` 스코프 오류 |
| `EEXIST` | 같은 버전이 이미 게시됨 — version을 올려야 함 |

**주의**: publish는 24시간 이내 unpublish만 가능하며, **같은 버전은 재사용 불가**. 실수로 publish했다면 다음 버전(patch)으로 재배포.

---

## 3. 외부 설치 검증

publish 직후 별도 폴더에서 실제 소비자 입장으로 설치·import가 동작하는지 확인합니다.

### 3-1. 검증 환경 구성

```bash
mkdir C:/dev/_verify-rich-editor
cd C:/dev/_verify-rich-editor
pnpm init
```

`.npmrc` 생성 (GitHub Packages는 public 패키지여도 설치 시 토큰 필요):
```
@teamsparta-biz:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### 3-2. peer 5종 + 본 패키지 설치

```bash
pnpm add react@^19 react-dom@^19 @tiptap/core@^2 @tiptap/react@^2 tailwindcss@^4
pnpm add @teamsparta-biz/rich-editor
```

### 3-3. dist 구조 확인

```bash
ls node_modules/@teamsparta-biz/rich-editor/dist/
# → index.mjs, index.cjs, index.d.ts, index.cjs.map, index.mjs.map, styles.css
```

### 3-4. 타입 참조 검증

`test.tsx` 작성:
```tsx
import { RichEditor, type RichEditorProps } from '@teamsparta-biz/rich-editor'
import '@teamsparta-biz/rich-editor/styles.css'

export const Demo = (props: RichEditorProps) => <RichEditor {...props} />
```

타입체크:
```bash
pnpm add -D typescript @types/react @types/react-dom
pnpm exec tsc --noEmit test.tsx --jsx react-jsx --moduleResolution bundler
```

에러 0건이어야 PASS.

### 3-5. 검증 환경 정리

```bash
cd C:/dev
rm -rf _verify-rich-editor
```

---

## 4. 자동 release (Changesets + GitHub Actions)

- 기능 PR에 `changeset` md를 동봉 → main 머지 시 `release.yml`이 Version PR(버전 bump + CHANGELOG)을 자동 생성
- Version PR 머지 → `release.yml`이 `pnpm changeset publish`로 GitHub Packages 게시 (CI는 자동 `GITHUB_TOKEN` 사용, 별도 secret 불필요)
- 설정 상세는 [`.github/SETUP.md`](../.github/SETUP.md) 참조

> 참고: GitHub Packages의 npm 레지스트리는 **public 패키지여도 설치 시 토큰이 필요**합니다(익명 설치 불가). 토큰 없는 공개 설치가 필요해지면 npmjs.com 게시를 별도 검토.
