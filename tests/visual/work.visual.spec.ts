import { expect, test } from '@playwright/test';
import { hideFixedOverlays, prepareForSnapshot } from '../support/scan';

/**
 * Work baselines. One card, the index grid, and one case study — enough to
 * catch a layout or typography regression without a baseline per project.
 */
test.describe('work', () => {
  for (const [label, width, height] of [
    ['desktop', 1440, 900],
    ['mobile', 390, 844],
  ] as const) {
    test(`project card — ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await prepareForSnapshot(page, '/work');
      await hideFixedOverlays(page);
      await expect(page.locator('article').first()).toHaveScreenshot(`card-${label}.png`);
    });

    test(`case study — ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await prepareForSnapshot(page, '/work/pawdoc');
      await hideFixedOverlays(page);
      await expect(page.locator('#case-study')).toHaveScreenshot(`case-study-${label}.png`);
    });
  }

  test('generated cover for a project with no capture', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await prepareForSnapshot(page, '/work/nova');
    await hideFixedOverlays(page);
    await expect(page.locator('#case-study')).toHaveScreenshot('case-study-generated.png');
  });
});
