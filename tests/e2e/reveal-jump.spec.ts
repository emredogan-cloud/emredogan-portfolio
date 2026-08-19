import { expect, test, type Page } from '@playwright/test';

/**
 * A reveal must survive being jumped over.
 *
 * `IntersectionObserver` reports a *change* in intersection. An element that
 * goes from "below the fold, not intersecting" to "above the viewport, not
 * intersecting" in a single frame never changes state, so the callback never
 * runs and the element stays at `opacity: 0` for the rest of the session.
 *
 * That is not a hypothetical. `scroll-behavior` is `auto` under
 * `prefers-reduced-motion: reduce`, so for those readers every in-page anchor
 * is an instant jump — click "Contact", scroll back up, and the About and Work
 * sections are blank. The reveal is a decoration; losing the content because
 * of it is the one outcome the design explicitly rules out.
 */
test.describe('reveals survive an instant jump', () => {
  /**
   * Waits until the reveal script has run.
   *
   * `.reveal-hidden` is applied by an effect, so immediately after `goto`
   * nothing is hidden yet — and a test that measured then would report a clean
   * page and pass without ever exercising the behaviour.
   */
  const waitForReveals = (page: Page) =>
    page.waitForFunction(() => document.querySelectorAll('.reveal-hidden').length > 0, null, {
      timeout: 10_000,
    });

  const hiddenAbove = (page: Page) =>
    page.evaluate(
      () =>
        [...document.querySelectorAll('.reveal-hidden')].filter(
          (el) => el.getBoundingClientRect().bottom < window.innerHeight,
        ).length,
    );

  test('following an anchor does not leave the sections it skipped blank', async ({ page }) => {
    // Reduced motion is what turns every anchor into an instant jump, so it is
    // the condition under which the bug is reachable by an ordinary click.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForReveals(page);
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Contact' })
      .click();
    await expect(page).toHaveURL(/#contact$/);

    // Everything the jump passed over is now above the fold and must be
    // readable, not an empty band.
    await expect.poll(() => hiddenAbove(page), { timeout: 5_000 }).toBe(0);
  });

  test('a jump to the bottom of a long page leaves nothing hidden behind it', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/about');
    await waitForReveals(page);
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }),
    );
    await expect.poll(() => hiddenAbove(page), { timeout: 5_000 }).toBe(0);
  });

  test('content below the fold still starts hidden, so the reveal still exists', async ({
    page,
  }) => {
    // The fix must not degenerate into "reveal everything at mount", which
    // would pass the tests above and delete the feature.
    await page.goto('/about');
    await waitForReveals(page);
    const belowFold = await page.evaluate(
      () =>
        [...document.querySelectorAll('.reveal-hidden')].filter(
          (el) => el.getBoundingClientRect().top >= window.innerHeight,
        ).length,
    );
    expect(belowFold).toBeGreaterThan(0);
  });
});
