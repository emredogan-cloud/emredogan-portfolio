import { defineConfig, devices } from '@playwright/test';

/**
 * Tests run on their own port.
 *
 * Sharing 3000 with a hand-started `pnpm start` is a trap: Next reads the
 * build once at boot, so a server left running from an earlier build keeps
 * serving stale chunks while `reuseExistingServer` happily adopts it. The
 * symptom is a 500 on a hashed chunk and a page that never hydrates, which
 * looks exactly like a hydration bug and is not one. A dedicated port makes
 * that collision impossible.
 */
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
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
        command: `pnpm build && pnpm start --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: !isCI,
        timeout: 180_000,
      },
});
