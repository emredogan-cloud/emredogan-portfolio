import { expect, test } from '@playwright/test';

/**
 * The reduced-motion contract, asserted rather than assumed.
 *
 * The failure this guards against is not "the animation still plays" — it is
 * "the content never appears because the reveal never fired". Under reduced
 * motion, elements must be visible and readable without any scroll gesture
 * having to complete.
 */
test.describe('prefers-reduced-motion: reduce', () => {
  test('revealed content is visible and unmoved', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/dev/tokens');

    const first = page.getByText('Revealed at 0.00s.');
    await first.scrollIntoViewIfNeeded();
    await expect(first).toBeVisible();

    // No residual translate: the reduced variant animates opacity only.
    const transform = await first.evaluate((el) => getComputedStyle(el.closest('div')!).transform);
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(transform);
  });

  test('smooth scrolling is disabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const behavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(behavior).toBe('auto');
  });
});

test.describe('default motion preference', () => {
  test('smooth scrolling is enabled', async ({ page }) => {
    await page.goto('/');
    const behavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(behavior).toBe('smooth');
  });
});
