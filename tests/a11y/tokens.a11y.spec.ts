import { expect, test } from '@playwright/test';
import { describeViolations, scan } from './scan';

/**
 * Every primitive in one place, scanned in every state the gallery renders —
 * including a field in its error state, which is where label and description
 * wiring usually breaks.
 */
test('design-system primitives have zero accessibility violations', async ({ page }) => {
  await page.goto('/dev/tokens');
  const results = await scan(page);
  expect(results.violations, describeViolations(results.violations)).toEqual([]);
});
