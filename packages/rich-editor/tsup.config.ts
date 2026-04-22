import { defineConfig } from 'tsup'

/**
 * tsup은 Vite library mode의 `.d.ts` 출력을 보조한다.
 * - Vite: .mjs / .cjs / .css 번들
 * - tsup: .d.ts만 (dts.only=true), JS 출력 억제
 */
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: { only: true },
  outDir: 'dist',
  clean: false,
  sourcemap: false,
})
