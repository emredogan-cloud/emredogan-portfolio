import { expect, test } from '@playwright/test';
import { hideFixedOverlays, prepareForSnapshot } from '../support/scan';

/**
 * Baselines at the widths where the layout actually changes.
 *
 * Not one full set per breakpoint: the home page already has region baselines
 * at 1440 and 390, and eleven more sets would be forty images that all move
 * together whenever a shared component changes — maintenance without signal.
 * These capture the three regions whose *composition* differs per breakpoint,
 * at the widths where the difference appears.
 */
const WIDTHS = [
  { label: '360', width: 360 },
  { label: '768', width: 768 },
  { label: '1024', width: 1024 },
  { label: '1920', width: 1920 },
] as const;

for (const { label, width } of WIDTHS) {
  test.describe(`${label}px`, () => {
    test('hero', async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await prepareForSnapshot(page, '/');
      await hideFixedOverlays(page);
      await expect(page.locator('#home')).toHaveScreenshot(`hero-${label}.png`);
    });

    test('work grid', async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await prepareForSnapshot(page, '/');
      await hideFixedOverlays(page);
      await expect(page.locator('#work')).toHaveScreenshot(`work-${label}.png`);
    });

    test('contact', async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await prepareForSnapshot(page, '/');
      await hideFixedOverlays(page);
      await expect(page.locator('#contact')).toHaveScreenshot(`contact-${label}.png`);
    });
  });
}
