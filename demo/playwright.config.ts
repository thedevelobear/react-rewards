import { defineConfig, devices } from '@playwright/test';

const port = 4173;
const ci = Boolean(process.env.CI);

/**
 * Browser tests against the built demo (ADR 0006). `pnpm e2e` at the root
 * builds the library and the demo first.
 */
export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.ts',
  forbidOnly: ci,
  reporter: ci ? 'github' : 'list',
  use: {
    // biome-ignore lint/style/useNamingConvention: Playwright's option name.
    baseURL: `http://localhost:${port}`,
    viewport: { width: 1000, height: 800 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm preview --port ${port} --strict-port`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !ci,
  },
});
