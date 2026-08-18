import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function scan(page: Page) {
  return new AxeBuilder({ page }).withTags(TAGS).analyze();
}

test.describe('accessibility', () => {
  test('home page has zero violations', async ({ page }) => {
    await page.goto('/');
    const results = await scan(page);
    expect(
      results.violations,
      results.violations.map((v) => `${v.id}: ${v.help}`).join('\n'),
    ).toEqual([]);
  });

  test('404 page has zero violations', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    const results = await scan(page);
    expect(
      results.violations,
      results.violations.map((v) => `${v.id}: ${v.help}`).join('\n'),
    ).toEqual([]);
  });

  test('home page has zero violations at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const results = await scan(page);
    expect(
      results.violations,
      results.violations.map((v) => `${v.id}: ${v.help}`).join('\n'),
    ).toEqual([]);
  });
});
