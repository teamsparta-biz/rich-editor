# Publish 가이드 — @teamsparta-biz/rich-editor

> 공개 npm 레지스트리(npmjs.com)에 publish하고, 외부 환경에서 설치·import를 검증하는 절차.
> 자동 release는 Changesets + GitHub Actions(`release.yml`)가 담당하며, 아래는 수동 publish·검증 기준입니다.

---

## 0. 사전 조건 (1회)

- **npm org `teamsparta-biz`** 가 npmjs.com에 존재하고, publish 하는 계정이 해당 org의 멤버여야 합니다. (`@teamsparta-biz` 스코프 공개 패키지의 전제)
- 패키지는 **public**으로 게시됩니다 (`package.json`의 `publishConfig.access: "public"`, `.changeset/config.json`의 `access: "public"`).
- `package.json`의 `license` 가 공개 배포 정책에 맞는지 확인하세요 (현재 `UNLICENSED` — 공개 배포라면 실제 라이선스로 교체 검토).

---

## 1. 사전 준비

### 1-1. npm Access Token

1. https://www.npmjs.com/settings/~/tokens → **Generate New Token → Granular Access Token** (또는 Automation 토큰)
2. 권한: `@teamsparta-biz` 스코프에 대한 **Read and write**
3. 토큰 값은 **한 번만 노출**되므로 즉시 안전하게 보관

### 1-2. 환경변수 주입

```bash
# Windows PowerShell
$env:NPM_TOKEN = "npm_xxxxxxxxxxxx"

# Git Bash / Linux / macOS
export NPM_TOKEN=npm_xxxxxxxxxxxx
```

영속화가 필요하면 `.env`(gitignore 대상) 또는 쉘 프로필에 등록. **repo에 토큰을 커밋하지 마세요.**

### 1-3. `.npmrc` 생성 (publish용)

```bash
cp packages/rich-editor/.npmrc.example packages/rich-editor/.npmrc
```

생성된 `.npmrc`는 `.gitignore`에 등록돼 있어 git에 올라가지 않습니다. (공개 패키지 **설치**에는 `.npmrc`·인증이 필요 없습니다 — publish 시에만 필요)

---

## 2. Publish 실행

### 2-1. 사전 검증

```bash
cd C:/dev/rich-editor

# 1. Uncommitted 변경 없음 확인 (있으면 커밋 후 진행)
git status

# 2. NPM_TOKEN 세팅 확인
echo $NPM_TOKEN        # Git Bash
echo $env:NPM_TOKEN    # PowerShell

# 3. 빌드 (prepublishOnly 훅도 자동 실행하지만 미리 검증)
pnpm -C packages/rich-editor build

# 4. dist 산출물 확인
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
pnpm -C packages/rich-editor publish --no-git-checks --access public
```

- `--no-git-checks`: 커밋되지 않은 변경 없음을 위에서 이미 확인했으므로
- `--access public`: 공개 스코프 패키지 게시 (`@teamsparta-biz/...` 공개)

> `pnpm -C <dir> publish`가 EUSAGE로 실패하면(pnpm 일부 버전) `cd packages/rich-editor && pnpm publish --access public` 또는 `pnpm changeset publish`로 대체합니다.

### 2-3. 게시 확인

- Web UI: https://www.npmjs.com/package/@teamsparta-biz/rich-editor
- CLI:
  ```bash
  npm view @teamsparta-biz/rich-editor
  ```

### 2-4. 실패 시 진단

| 에러 | 원인 |
|------|------|
| `E401 Unauthorized` | NPM_TOKEN 누락/만료 또는 `.npmrc` 미설정 |
| `E403 Forbidden` | org `teamsparta-biz` 멤버가 아니거나 write 권한 없음 / 스코프 불일치 |
| `E404 Not Found` | registry/스코프 오타 또는 org 미존재 |
| `EEXIST` / `403 cannot publish over` | 같은 버전이 이미 게시됨 — version을 올려야 함 |

**주의**: publish는 72시간 이내(특정 조건) unpublish만 가능하며, **같은 버전은 재사용 불가**. 실수로 publish했다면 다음 버전(patch)으로 재배포.

---

## 3. 외부 설치 검증

publish 직후 별도 폴더에서 실제 소비자 입장으로 설치·import가 동작하는지 확인합니다. 공개 패키지이므로 `.npmrc`·인증 없이 설치됩니다.

### 3-1. 검증 환경 구성

```bash
mkdir C:/dev/_verify-rich-editor
cd C:/dev/_verify-rich-editor
pnpm init
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
- Version PR 머지 → `release.yml`이 `pnpm changeset publish`로 npmjs 게시
- CI publish 인증은 저장소 secret `NPM_TOKEN` 사용 (설정은 [`.github/SETUP.md`](../.github/SETUP.md) 참조)
