import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: [],
  dts: { only: true },
  outDir: 'dist',
  clean: false,
  sourcemap: false,
})
