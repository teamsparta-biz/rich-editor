#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PKG_ROOT = resolve(__dirname, '..')
const DIST_DIR = join(PKG_ROOT, 'dist')

const REQUIRED_FILES = ['index.d.ts', 'index.mjs', 'index.cjs', 'styles.css']
const SIZE_LIMIT_BYTES = 5 * 1024 * 1024

const failures = []
const passes = []

function check(label, fn) {
  try {
    fn()
    passes.push(label)
  } catch (err) {
    failures.push(`${label}: ${err.message}`)
  }
}

check('1) dist/ 4종 산출물 존재 + 크기 > 0', () => {
  if (!existsSync(DIST_DIR)) {
    throw new Error(`dist/ 디렉토리 없음 — pnpm build 필요`)
  }
  const missing = []
  const empty = []
  for (const name of REQUIRED_FILES) {
    const p = join(DIST_DIR, name)
    if (!existsSync(p)) {
      missing.push(name)
      continue
    }
    if (statSync(p).size === 0) empty.push(name)
  }
  if (missing.length > 0) throw new Error(`누락: ${missing.join(', ')}`)
  if (empty.length > 0) throw new Error(`0바이트: ${empty.join(', ')}`)
})

let totalSize = 0
check(`2) 4종 합 < 5MB (${SIZE_LIMIT_BYTES.toLocaleString()} bytes)`, () => {
  for (const name of REQUIRED_FILES) {
    const p = join(DIST_DIR, name)
    if (existsSync(p)) totalSize += statSync(p).size
  }
  if (totalSize >= SIZE_LIMIT_BYTES) {
    throw new Error(`합계 ${totalSize.toLocaleString()} bytes ≥ 한도`)
  }
})

check('3) pack --dry-run 결과가 files 필드와 일치 (best-effort)', () => {
  const pkgPath = join(PKG_ROOT, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  const declaredFiles = new Set(pkg.files ?? [])
  if (declaredFiles.size === 0) throw new Error(`package.json files 필드 없음`)

  // pnpm 9는 `pack --dry-run` 미지원이라 npm으로 폴백.
  // npm은 파일 목록을 stderr(npm notice)로 출력하므로 stdout+stderr 합쳐서 검사.
  const candidates = [
    ['pnpm', ['pack', '--dry-run']],
    ['npm', ['pack', '--dry-run']],
  ]
  let combined = ''
  const errors = []
  for (const [bin, args] of candidates) {
    const r = spawnSync(bin, args, {
      cwd: PKG_ROOT,
      encoding: 'utf8',
      shell: true,
    })
    const merged = `${r.stdout ?? ''}\n${r.stderr ?? ''}`
    if (r.status === 0 && /\bdist\b/i.test(merged)) {
      combined = merged
      break
    }
    errors.push(`${bin}(exit ${r.status}): ${(r.stderr || r.stdout || '').split('\n')[0]}`)
  }
  if (!combined) {
    throw new Error(`pnpm/npm pack --dry-run 모두 실패 — ${errors.join(' | ')}`)
  }

  // best-effort: 파일 목록에 dist/와 README.md 멘션 존재만 확인.
  const mentionsDist = /\bdist[\\/]/i.test(combined) || /\bdist\b/i.test(combined)
  const mentionsReadme = /README\.md/i.test(combined)
  if (declaredFiles.has('dist') && !mentionsDist) {
    throw new Error(`pack 출력에 dist/ 파일 없음`)
  }
  if (declaredFiles.has('README.md') && !mentionsReadme) {
    throw new Error(`pack 출력에 README.md 없음`)
  }
})

const summary = `dist size: ${totalSize.toLocaleString()} bytes`

if (failures.length === 0) {
  console.log(`PASS — ${passes.length}/${passes.length} 항목 통과`)
  for (const p of passes) console.log(`  ✓ ${p}`)
  console.log(summary)
  process.exit(0)
}

console.error(`FAIL — ${failures.length}/${passes.length + failures.length} 항목 실패`)
for (const p of passes) console.error(`  ✓ ${p}`)
for (const f of failures) console.error(`  ✗ ${f}`)
console.error(summary)
process.exit(1)
