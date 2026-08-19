import { expect, test } from '@playwright/test';
import { describeViolations, scan } from '../support/scan';

test.describe('accessibility — contact', () => {
  test('the form in its error state has zero violations', async ({ page }) => {
    // Scanned in the state that usually breaks: an error state adds
    // `aria-invalid`, `aria-describedby` and a live region all at once, and
    // a clean page proves nothing about any of them.
    await page.goto('/#contact');
    await page.getByLabel(/^Your name/i).fill('A');
    await page.getByLabel(/^Email/i).fill('nope');
    await page.getByLabel(/^Message/i).fill('short');
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.locator('form [role="status"]')).toContainText(/highlighted/i);

    const results = await scan(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  test('the form after a failed delivery has zero violations', async ({ page }) => {
    await page.goto('/#contact');
    await page.getByLabel(/^Your name/i).fill('Ada Lovelace');
    await page.getByLabel(/^Email/i).fill('ada@example.com');
    await page.getByLabel(/^Message/i).fill('A message long enough to pass the schema check.');
    await page.waitForTimeout(3_200);
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.locator('form [role="status"]')).toContainText(/inbox/i, { timeout: 15_000 });

    const results = await scan(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  test('the proof section has zero violations at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#proof');
    const results = await scan(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });
});
