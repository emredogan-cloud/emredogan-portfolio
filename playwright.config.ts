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
  // Timing tests live in `tests/perf` and are run separately with a single
  // worker (`pnpm perf`); including them here would measure worker contention.
  testIgnore: /tests\/perf\//,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  /*
   * 90 s on CI, 45 s locally.
   *
   * Not a way to hide a slow site — the same suites finish in ~70 s locally.
   * The WebKit job on a shared GitHub runner shares two cores with two workers
   * and a Node server, and `page.goto` alone was exceeding 45 s once the
   * cross-browser and security-header suites roughly doubled the number of
   * navigations that job performs. The product's own timing budgets are
   * asserted in `tests/perf`, which runs single-worker for exactly this
   * reason; this number governs how long a starved runner may take before a
   * test is called failed.
   */
  timeout: isCI ? 90_000 : 45_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      // The animated background is seeded and frozen in visual tests, but
      // font hinting still differs by a hair between runs.
      //
      // 0.003, down from 0.01. On a 768×1400 dark screenshot, 1 % is eleven
      // thousand pixels — enough to absorb the entire navigation island
      // appearing, disappearing or moving, which is exactly what it did:
      // baselines containing a stale header kept passing because only its text
      // and its one bright button cleared the per-pixel threshold. A tolerance
      // that can swallow a whole UI element is not a tolerance, it is a hole.
      maxDiffPixelRatio: 0.003,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  use: {
    baseURL,
    navigationTimeout: isCI ? 60_000 : 30_000,
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
