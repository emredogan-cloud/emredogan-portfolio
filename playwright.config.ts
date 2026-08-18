import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3000);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 45_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      // The animated background is seeded and frozen in visual tests, but
      // font hinting still differs by a hair between runs.
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'pnpm build && pnpm start',
        url: baseURL,
        reuseExistingServer: !isCI,
        timeout: 180_000,
      },
});
