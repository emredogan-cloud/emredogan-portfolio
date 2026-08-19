import { expect, test } from '@playwright/test';
import { describeViolations, scan } from '../support/scan';

test.describe('accessibility — about', () => {
  for (const [label, width, height] of [
    ['desktop', 1440, 900],
    ['mobile', 390, 844],
  ] as const) {
    test(`about page has zero violations — ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/about');
      const results = await scan(page);
      expect(results.violations, describeViolations(results.violations)).toEqual([]);
    });
  }
});
