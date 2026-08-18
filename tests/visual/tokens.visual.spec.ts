import { expect, test } from '@playwright/test';

/**
 * Baseline for the whole design system in one image. A token change that
 * alters any primitive — a radius, a surface, the CTA ramp — shows up as a
 * diff here before it reaches a real section.
 */
test.describe('design system', () => {
  for (const [label, width, height] of [
    ['desktop', 1440, 900],
    ['mobile', 390, 844],
  ] as const) {
    test(`token gallery — ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/dev/tokens');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot(`tokens-${label}.png`, { fullPage: true });
    });
  }
});
