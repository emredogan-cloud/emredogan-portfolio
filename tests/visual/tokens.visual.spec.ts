import { expect, test } from '@playwright/test';
import { prepareForSnapshot } from '../support/scan';

/**
 * Design-system baseline.
 *
 * Captured as one element rather than a full page for the reason documented in
 * `home.visual.spec.ts`: full-page capture drops composited subtrees.
 */
test.describe('design system', () => {
  for (const [label, width, height] of [
    ['desktop', 1440, 900],
    ['mobile', 390, 844],
  ] as const) {
    test(`token gallery — ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await prepareForSnapshot(page, '/dev/tokens');
      await expect(page.locator('main')).toHaveScreenshot(`tokens-${label}.png`);
    });
  }
});
