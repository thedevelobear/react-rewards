import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/main.tsx',
      // The bare page the browser specs open (ADR 0045).
      fixtures: './src/fixtures/main.tsx',
    },
  },
  html: {
    // The site's template applies the stored theme before the first paint.
    template: ({ entryName }) =>
      entryName === 'index' ? './index.html' : undefined,
    title: ({ entryName }) =>
      entryName === 'fixtures' ? 'react-rewards fixtures' : 'react-rewards',
  },
});
