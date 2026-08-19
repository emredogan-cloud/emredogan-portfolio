import { expect, test } from '@playwright/test';
import { describeViolations, scan } from '../support/scan';

/**
 * The display modes a reader can turn on that this design does not control.
 *
 * A dark site built on gradients, `color-mix` and `background-clip: text` is
 * exactly the kind that breaks under Windows High Contrast or at 400 % zoom,
 * and neither is visible to anyone developing on a normal display. So both are
 * asserted rather than hoped for.
 */
test.describe('forced colors (Windows High Contrast)', () => {
  // `page.emulateMedia`, not `test.use({ forcedColors })`: the fixture form is
  // not in this Playwright version's typed options, and a test that does not
  // compile is a test that does not run.
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
  });

  test('the home page stays readable and has no violations', async ({ page }) => {
    await page.goto('/');
    const results = await scan(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });

  test('gradient text does not disappear', async ({ page }) => {
    // `background-clip: text` with a transparent fill is the classic failure:
    // forced colors replaces the background, the text keeps `color:
    // transparent`, and the word vanishes. The heading's accent word is the
    // canary.
    await page.goto('/');
    const accent = page.locator('.text-gradient-brand').first();
    await expect(accent).toBeVisible();

    const paint = await accent.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        color: style.color,
        clip: style.webkitBackgroundClip || style.backgroundClip,
        fill: style.webkitTextFillColor,
      };
    });

    // Under forced colors the fill must be a real colour, not transparent.
    expect(paint.fill).not.toBe('rgba(0, 0, 0, 0)');
    expect(paint.fill).not.toBe('transparent');
  });

  test('the primary call to action is still distinguishable', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: 'View work' });
    await expect(cta).toBeVisible();
    const border = await cta.evaluate((el) => getComputedStyle(el).borderStyle);
    // Forced colors flattens backgrounds, so a filled button needs a border to
    // remain a button rather than a run of text.
    expect(border).not.toBe('none');
  });

  test('the contact form is still usable', async ({ page }) => {
    await page.goto('/#contact');
    const results = await scan(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
    await expect(page.getByLabel(/^Your name/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send message/i })).toBeVisible();
  });
});

test.describe('400 % zoom (WCAG 1.4.10 reflow)', () => {
  // 1280×1024 at 400 % is a 320×256 CSS viewport, which is what the success
  // criterion actually requires: content reflows into one column with no
  // horizontal scrolling and nothing lost.
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 256 });
  });

  for (const path of ['/', '/about', '/work', '/work/pawdoc'] as const) {
    test(`${path} reflows without horizontal scrolling`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return { scroll: doc.scrollWidth, client: doc.clientWidth };
      });
      expect(
        overflow.scroll,
        `${path} scrolls sideways at 320 px: ${overflow.scroll} > ${overflow.client}`,
      ).toBeLessThanOrEqual(overflow.client + 1);
    });
  }

  test('no content is lost — the headline, the work and the form are all present', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('#work article')).toHaveCount(4);
    await page.goto('/#contact');
    await expect(page.getByLabel(/^Message/i)).toBeVisible();
  });
});

test.describe('increased contrast', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ contrast: 'more' });
  });

  test('the home page has no violations under prefers-contrast: more', async ({ page }) => {
    await page.goto('/');
    const results = await scan(page);
    expect(results.violations, describeViolations(results.violations)).toEqual([]);
  });
});
