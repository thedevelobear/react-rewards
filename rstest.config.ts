import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  extends: withRslibConfig(),
  include: ['src/**/test.{ts,tsx}'],
  // The adapter picks happy-dom for Rslib's `web` target. Tests run in Node.
  testEnvironment: 'node',
});
