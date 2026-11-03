import { readFileSync } from 'node:fs';
import { defineConfig } from '@rslib/core';

// The supported browsers, which `pnpm compat:check` reads too (ADR 0079).
const browsers = readFileSync(
  new URL('./browsers.browserslistrc', import.meta.url),
  'utf8'
)
  .split('\n')
  .map((line) => line.replace(/#.*/, '').trim())
  .filter(Boolean);

export default defineConfig({
  lib: [
    {
      format: 'esm',
      // Syntax one of the supported browsers lacks is lowered, so new code
      // can't raise the floor.
      syntax: browsers,
      dts: true,
      // For React Server Components. The build is one file, so this marks
      // every export as client code, not just the hook.
      banner: { js: "'use client';" },
    },
  ],
  source: {
    entry: { index: './src/index.ts' },
    // Leaves the tests and their helpers out of the declarations (ADR 0032).
    tsconfigPath: './tsconfig.build.json',
  },
  output: {
    target: 'web',
  },
  tools: {
    // Lowers only the forms those browsers get wrong, not whole features.
    swc: { env: { bugfixes: true } },
  },
});
