import { expect, test } from '@playwright/test';
import { hideFixedOverlays, prepareForSnapshot } from '../support/scan';

/**
 * About baselines.
 *
 * Captured per region rather than as one full-page shot: `toHaveScreenshot`
 * with `fullPage` drops composited subtrees and produced blank bands through
 * the middle of the page (see PHASE_06_COMPLETE.md).
 *
 * The home page's About section is not here — it is already a region in
 * `home.visual.spec.ts`, and two baselines of the same element diverge the
 * moment someone updates one of them.
 */
test.describe('about', () => {
  for (const [label, width, height] of [
    ['desktop', 1440, 900],
    ['mobile', 390, 844],
  ] as const) {
    test(`timeline — ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await prepareForSnapshot(page, '/about');
      await hideFixedOverlays(page);
      await expect(page.locator('#timeline')).toHaveScreenshot(`timeline-${label}.png`);
    });

    test(`credentials — ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await prepareForSnapshot(page, '/about');
      await hideFixedOverlays(page);
      await expect(page.locator('#credentials')).toHaveScreenshot(`credentials-${label}.png`);
    });
  }
});
