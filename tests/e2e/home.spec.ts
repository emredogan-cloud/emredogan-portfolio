import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('renders the identity, exactly one h1, and no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    page.on('pageerror', (e) => errors.push(e.message));

    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Emre');
    await expect(page.getByRole('link', { name: /GitHub/i })).toBeVisible();

    expect(errors, `console errors: ${errors.join(' | ')}`).toEqual([]);
  });

  test('exposes a working skip link as the first tab stop', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: /skip to content/i });
    await expect(skip).toBeFocused();
    await skip.press('Enter');
    await expect(page.locator('#content')).toBeVisible();
  });

  test('sets canonical, description and Open Graph metadata', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /emredogan\.work/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  });

  test('serves Person JSON-LD that parses', async ({ page }) => {
    await page.goto('/');
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const parsed = JSON.parse(raw ?? '{}');
    expect(JSON.stringify(parsed)).toContain('"Person"');
  });

  test('returns a designed 404 for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/does not exist/i);
  });

  test('never scrolls horizontally at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
