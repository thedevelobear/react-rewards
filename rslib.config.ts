import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [{ format: 'esm', syntax: 'es2022', dts: true }],
  source: {
    entry: { index: './src/index.ts' },
    // Leaves the tests and their helpers out of the declarations (ADR 0032).
    tsconfigPath: './tsconfig.build.json',
  },
  output: {
    target: 'web',
  },
});
