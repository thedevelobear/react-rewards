import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  projects: [
    {
      name: 'node',
      extends: withRslibConfig(),
      include: ['src/**/test.{ts,tsx}'],
      // The adapter picks happy-dom for Rslib's `web` target. These run in Node.
      testEnvironment: 'node',
    },
    {
      name: 'dom',
      extends: withRslibConfig(),
      include: ['src/**/dom-test.{ts,tsx}'],
      testEnvironment: 'happy-dom',
    },
  ],
});
