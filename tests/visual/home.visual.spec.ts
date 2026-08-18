import { expect, test } from '@playwright/test';

/**
 * Visual baselines. Animation is disabled by the shared expect config, and the
 * background engine is seeded from Phase 5 onward, so a diff here means a real
 * regression rather than noise (ROADMAP §13, determinism rule).
 */
test.describe('visual baselines', () => {
  for (const [label, width, height] of [
    ['desktop', 1440, 900],
    ['mobile', 390, 844],
  ] as const) {
    test(`home — ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot(`home-${label}.png`, { fullPage: true });
    });
  }
});
