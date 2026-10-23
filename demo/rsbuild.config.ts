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
  output: {
    // Relative URLs, so the site works under GitHub Pages' project path.
    // './' would make the CSS's font URLs relative to the CSS file's folder
    // (ADR 0049).
    assetPrefix: 'auto',
  },
  html: {
    // The site's template applies the stored theme before the first paint.
    template: ({ entryName }) =>
      entryName === 'index' ? './index.html' : undefined,
    title: ({ entryName }) =>
      entryName === 'fixtures' ? 'react-rewards fixtures' : 'react-rewards',
  },
});
