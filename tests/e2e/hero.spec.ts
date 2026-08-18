import { expect, test } from '@playwright/test';

test.describe('hero', () => {
  test('the headline is one h1 and is in the initial HTML', async ({ page }) => {
    // The LCP candidate must not depend on hydration.
    const response = await page.goto('/');
    const html = (await response?.text()) ?? '';
    expect(html).toContain('Emre');
    expect(html).toContain('Full-Stack &amp; AI Developer');

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Emre Doğan');
  });

  test('every statistic states the method that produced it', async ({ page }) => {
    await page.goto('/');
    const stats = page.locator('dl dd');
    await expect(stats).toHaveCount(3);

    for (const stat of await stats.all()) {
      const text = (await stat.textContent()) ?? '';
      // A number with no stated provenance is the thing this site does not do.
      expect(text.length).toBeGreaterThan(40);
    }

    await expect(page.locator('[data-count-up]').first()).toHaveText('1,113');
    await expect(page.getByText('Counted with git rev-list')).toBeVisible();
  });

  test('the count-up ends on the true value and is readable to a screen reader', async ({
    page,
  }) => {
    await page.goto('/');
    const commits = page.locator('dl dd').first();
    // The accessible text is the final value from the first paint — the
    // animated digits are aria-hidden.
    await expect(commits).toContainText('1,113');
    await expect.poll(() => commits.locator('[data-count-up]').textContent()).toBe('1,113');
  });

  test('the count-up renders the final value immediately under reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const value = await page.locator('[data-count-up]').first().textContent();
    expect(value).toBe('1,113');
  });

  test('the count-up reserves its width so nothing shifts while counting', async ({ page }) => {
    await page.goto('/');
    const stat = page.locator('dl dd').first();
    const before = await stat.boundingBox();
    await page.waitForTimeout(700);
    const after = await stat.boundingBox();
    expect(after?.width).toBe(before?.width);
  });

  test('the portrait frame falls back to a monogram, not a broken image', async ({ page }) => {
    await page.goto('/');
    // No <img> is rendered while `hero.portrait` is null...
    await expect(page.locator('#home img')).toHaveCount(0);
    // ...and the placeholder is decorative, so it must not be announced.
    const monogram = page.locator('#home [aria-hidden="true"]', { hasText: 'ED' });
    await expect(monogram.first()).toBeAttached();
  });

  test('the primary call to action leads to the work section', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'View work' }).click();
    await expect(page).toHaveURL(/#work$/);
  });

  test('the technology list is exposed as a list, not loose text', async ({ page }) => {
    await page.goto('/');
    const list = page.getByRole('list', { name: 'Core technologies' });
    await expect(list.getByRole('listitem')).toHaveCount(7);
  });
});
