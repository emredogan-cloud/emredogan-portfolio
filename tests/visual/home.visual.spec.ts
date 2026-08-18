import { expect, test } from '@playwright/test';
import { prepareForSnapshot } from '../support/scan';

/**
 * Visual baselines, captured **per region rather than as one full-page image**.
 *
 * Two reasons, one of them forced:
 *
 *  1. `toHaveScreenshot({ fullPage: true })` rendered the entire middle of the
 *     document blank while `page.screenshot({ fullPage: true })` of the same
 *     page rendered correctly and `getComputedStyle` reported every element
 *     fully opaque. Full-page capture stitches beyond the viewport, and the
 *     stitch dropped composited subtrees. A baseline that is a picture of an
 *     empty page passes forever and catches nothing.
 *  2. Region baselines are better regardless: a hero change produces a hero
 *     diff, not a 2,900-pixel-tall diff of everything.
 */
const REGIONS = [
  { name: 'hero', selector: '#home' },
  { name: 'stack', selector: 'section[aria-labelledby="stack-heading"]' },
  { name: 'about', selector: '#about' },
  { name: 'work', selector: '#work' },
  { name: 'contact', selector: '#contact' },
  { name: 'footer', selector: 'footer' },
] as const;

const VIEWPORTS = [
  { label: 'desktop', width: 1440, height: 900 },
  { label: 'mobile', width: 390, height: 844 },
] as const;

for (const viewport of VIEWPORTS) {
  test.describe(`home — ${viewport.label}`, () => {
    for (const region of REGIONS) {
      test(region.name, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await prepareForSnapshot(page, '/');
        await expect(page.locator(region.selector)).toHaveScreenshot(
          `${region.name}-${viewport.label}.png`,
        );
      });
    }
  });
}

test.describe('navigation island', () => {
  test('resting state at the top of the page', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await prepareForSnapshot(page, '/');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(page.locator('header')).toHaveScreenshot('nav-top.png');
  });

  test('island state once scrolled', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await prepareForSnapshot(page, '/');
    await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'instant' }));
    await expect(page.locator('header > div')).toHaveClass(/rounded-\[var\(--radius-2xl\)\]/);
    await expect(page.locator('header')).toHaveScreenshot('nav-island.png');
  });
});

/**
 * Viewport composites.
 *
 * Region baselines capture an element's own box, which excludes the fixed
 * background canvas sitting behind everything at `z-index: -10` — so a
 * regression that blanked the sky entirely would not show up in any of them.
 * These capture the visible viewport instead, background included.
 *
 * Viewport capture rather than `fullPage`: full-page stitching drops
 * composited subtrees (see the note at the top of this file).
 */
test.describe('composite', () => {
  for (const [label, width, height] of [
    ['desktop', 1440, 900],
    ['mobile', 390, 844],
  ] as const) {
    test(`first viewport with the background — ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await prepareForSnapshot(page, '/');
      await expect(page).toHaveScreenshot(`viewport-${label}.png`);
    });
  }
});
