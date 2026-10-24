import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2022',
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
});
