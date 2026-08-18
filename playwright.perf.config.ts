import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config';

/**
 * Timing measurements, run alone.
 *
 * The main suite is fully parallel. A relative frame-budget measurement taken
 * while five other browser contexts compete for the same cores measures
 * contention rather than the page — it passed in isolation and failed in the
 * pack. One worker, one browser, no retries to average away a real regression.
 */
export default defineConfig({
  ...base,
  testDir: './tests/perf',
  testIgnore: undefined,
  workers: 1,
  fullyParallel: false,
  retries: 0,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
