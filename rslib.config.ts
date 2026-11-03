import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      // The supported browsers (ADR 0079). Syntax one of them lacks is
      // lowered, so new code can't raise the floor.
      syntax: [
        'chrome >= 87',
        'edge >= 87',
        'firefox >= 79',
        'safari >= 14.1',
        'ios_saf >= 14.5',
      ],
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
