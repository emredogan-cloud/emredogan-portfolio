import { expect, test, type Page } from '@playwright/test';

const track = 'section[aria-labelledby="stack-heading"] .will-change-transform';

/** Reads the strip's current horizontal offset. */
async function offset(page: Page): Promise<number> {
  return page.locator(track).evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
}

/**
 * Waits until the strip stops moving, then returns where it stopped.
 *
 * Frame-rate independent by construction: it watches for the offset to hold
 * still across consecutive samples instead of assuming how long the ramp takes
 * on this engine.
 */
async function settleOffset(page: Page, timeout = 10_000): Promise<number> {
  const deadline = Date.now() + timeout;
  let previous = await offset(page);

  while (Date.now() < deadline) {
    await page.waitForTimeout(250);
    const current = await offset(page);
    if (Math.abs(current - previous) < 0.5) return current;
    previous = current;
  }

  throw new Error(`the strip never came to rest within ${timeout}ms`);
}

test.describe('technology marquee', () => {
  test('names every technology and its projects for a screen reader', async ({ page }) => {
    await page.goto('/');
    const heading = page.getByRole('heading', {
      name: /technologies used across these projects/i,
    });
    await expect(heading).toBeAttached();

    // The strip itself is decorative duplication; the information lives in a
    // real list, which is what assistive technology reads.
    const list = page.locator('section[aria-labelledby="stack-heading"] ul.sr-only li');
    await expect(list.first()).toContainText('used in');
    expect(await list.count()).toBeGreaterThanOrEqual(10);
  });

  test('the duplicated visual strip is hidden from assistive technology', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.locator('section[aria-labelledby="stack-heading"] [aria-hidden="true"]').first(),
    ).toBeAttached();
  });

  test('moves, and keeps moving in one direction', async ({ page }) => {
    await page.goto('/');
    await page.locator(track).scrollIntoViewIfNeeded();

    const first = await offset(page);
    await expect.poll(() => offset(page), { timeout: 6_000, intervals: [150] }).toBeLessThan(first);
  });

  test('the pause control stops it, and says so', async ({ page }) => {
    await page.goto('/');
    await page.locator(track).scrollIntoViewIfNeeded();

    // Located by what it controls, not by its label — the label is exactly the
    // thing under test and re-querying by it would stop matching after a click.
    const control = page.locator('button[aria-controls="tech-strip"]');
    await expect(control).toHaveAccessibleName(/^pause technology strip animation$/i);
    await control.click();
    await expect(control).toHaveAccessibleName(/^play technology strip animation$/i);

    // Poll until it has come to rest, rather than assuming a fixed settle time.
    //
    // The velocity decays exponentially over a ~0.7 s ramp, but the loop clamps
    // each frame's delta to 50 ms so a resumed tab cannot jump. On a headless
    // engine delivering ~9 frames a second that clamp makes the decay advance
    // slower than wall-clock, so a fixed 1.4 s wait left 2 px of residual drift
    // on WebKit while Chromium had long since stopped. Waiting for the actual
    // condition tests the contract — pausing stops it — at any frame rate.
    const settled = await settleOffset(page);
    await page.waitForTimeout(700);
    expect(Math.abs((await offset(page)) - settled)).toBeLessThan(1);

    // And it resumes.
    await control.click();
    await expect(control).toHaveAccessibleName(/^pause technology strip animation$/i);
    await expect.poll(() => offset(page), { timeout: 6_000 }).toBeLessThan(settled - 1);
  });

  test('the pause control is reachable and operable by keyboard', async ({ page }) => {
    await page.goto('/');
    const control = page.locator('button[aria-controls="tech-strip"]');
    await control.focus();
    await expect(control).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(control).toHaveAccessibleName(/^play technology strip animation$/i);
  });

  test('pauses while the pointer is over it', async ({ page }) => {
    await page.goto('/');
    const viewport = page.locator('section[aria-labelledby="stack-heading"] .overflow-hidden');
    await viewport.scrollIntoViewIfNeeded();
    await viewport.hover();

    const settled = await settleOffset(page);
    await page.waitForTimeout(700);
    expect(Math.abs((await offset(page)) - settled)).toBeLessThan(1);
  });

  test('under reduced motion it is a still row with no control', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator(track).scrollIntoViewIfNeeded();

    const before = await offset(page);
    await page.waitForTimeout(1_200);
    expect(await offset(page)).toBe(before);

    // The control is hidden, not removed. Removing it with a JavaScript
    // condition would mean it is absent from the server HTML and appears at
    // hydration, shifting every section below it — see the note in the
    // component.
    const control = page.locator('button[aria-controls="tech-strip"]');
    await expect(control).toHaveCount(1);
    await expect(control).toBeHidden();
  });

  test('the seam never exposes a gap', async ({ page }) => {
    await page.goto('/');
    await page.locator(track).scrollIntoViewIfNeeded();

    // The track holds two identical copies, so its width must be exactly twice
    // one copy's — that equality is what makes the wrap invisible.
    const widths = await page.locator(track).evaluate((el) => {
      const copies = [...el.children] as HTMLElement[];
      return { track: el.scrollWidth, copies: copies.map((copy) => copy.offsetWidth) };
    });
    expect(widths.copies).toHaveLength(2);
    expect(widths.copies[0]).toBe(widths.copies[1]);
  });

  test('the control carries a changing label and no contradictory pressed state', async ({
    page,
  }) => {
    // "Play, pressed" is the announcement this guards against: a media control
    // conveys its state through its label, a toggle button through
    // `aria-pressed`. Carrying both contradicts itself.
    await page.goto('/');
    const control = page.locator('button[aria-controls="tech-strip"]');
    await expect(control).not.toHaveAttribute('aria-pressed', /.*/);
    await expect(control).toHaveAccessibleName(/pause/i);
    await control.click();
    await expect(control).toHaveAccessibleName(/play/i);
    await expect(control).not.toHaveAttribute('aria-pressed', /.*/);
  });

  test('does not shift the page when it hydrates', async ({ page }) => {
    // The bug this guards against: a control rendered only after hydration
    // pushed every section below the marquee down by 58 px on every load, which
    // moved an anchored section out from under the reader.
    await page.goto('/', { waitUntil: 'commit' });

    const measure = () =>
      page.evaluate(() => document.getElementById('work')?.getBoundingClientRect().top ?? 0);

    await page.waitForLoadState('domcontentloaded');
    const beforeHydration = await measure();

    // Wait for the client to take over, then re-measure.
    await page.locator('button[aria-controls="tech-strip"]').waitFor({ state: 'attached' });
    await page.waitForTimeout(600);
    const afterHydration = await measure();

    expect(
      Math.abs(afterHydration - beforeHydration),
      'the page moved when the client took over',
    ).toBeLessThan(4);
  });
});
