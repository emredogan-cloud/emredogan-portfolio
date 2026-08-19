import { expect, test } from '@playwright/test';
import { describeViolations, scan } from '../support/scan';

test.describe('accessibility', () => {
  test('home page has zero violations', async ({ page }) => {
    await page.goto('/');
    const results = await scan(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  test('404 page has zero violations', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    const results = await scan(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  /**
   * `/work` and a case study were not scanned until Phase 11, and Lighthouse
   * found a heading-order violation on `/work` that axe would have caught the
   * day it was written. Every prerendered route is scanned now.
   */
  for (const path of ['/work', '/work/pawdoc', '/about']) {
    test(`${path} has zero violations`, async ({ page }) => {
      await page.goto(path);
      const results = await scan(page);
      expect(results.violations, describeViolations(results.violations)).toEqual([]);
    });
  }

  test('home page has zero violations at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const results = await scan(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });
});
