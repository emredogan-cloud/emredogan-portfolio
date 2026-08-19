import { expect, test, type Page } from '@playwright/test';

const track = 'section[aria-labelledby="stack-heading"] .will-change-transform';

/** Reads the strip's current horizontal offset. */
async function offset(page: Page): Promise<number> {
  return page.locator(track).evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
}

/** The width of one copy of the strip — the distance after which it wraps. */
async function loopWidth(page: Page): Promise<number> {
  return page
    .locator(`${track} > ul`)
    .first()
    .evaluate((el) => (el as HTMLElement).offsetWidth);
}

/**
 * How far the strip has travelled leftwards, allowing for the wrap.
 *
 * Reading the raw offset and asserting "smaller than before" looks obvious and
 * is wrong. The offset is wrapped into `[-loopWidth, 0]`, so if the first
 * sample lands just before a wrap, the next one is *larger* — and getting back
 * below it takes a full loop, roughly fifteen seconds. The test then fails with
 * "it never moved" while the strip is moving perfectly well in front of you.
 * Measuring distance travelled removes the sampling accident.
 */
function travelled(from: number, to: number, loop: number): number {
  const raw = from - to;
  return raw >= 0 ? raw : raw + loop;
}

/**
 * Waits until the strip stops moving, then returns where it stopped.
 *
 * Frame-rate independent by construction: it watches for the offset to hold
 * still across consecutive samples instead of assuming how long the ramp takes
 * on this engine.
 *
 * **"Still" means still, not nearly still.** An earlier version accepted a
 * change under 0.5 px between 250 ms samples, which is 2 px/s — so it returned
 * while the strip was visibly decelerating, and the caller's "it has not moved
 * since" assertion then failed by 2 px on WebKit in CI. The velocity ramp is
 * exponential and asymptotic, so any loose threshold has that bug at some
 * frame rate.
 *
 * The engine gives an exact condition to wait for instead: below 0.05 px/s it
 * stops writing the transform altogether, and it writes with two decimals. So
 * a change under 0.01 px between samples means the write has stopped, not that
 * it has slowed down.
 *
 * The timeout is generous because the loop clamps each frame's delta to 50 ms.
 * On a headless engine delivering a handful of frames a second, the ramp's
 * 1.8 s of simulated time can take several times that in wall-clock — the
 * clamp is protecting a resumed tab from jumping, and a starved CI runner
 * looks exactly like a resumed tab.
 */
async function settleOffset(page: Page, timeout = 20_000): Promise<number> {
  const deadline = Date.now() + timeout;
  let previous = await offset(page);

  while (Date.now() < deadline) {
    await page.waitForTimeout(250);
    const current = await offset(page);
    if (Math.abs(current - previous) < 0.01) return current;
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

    const loop = await loopWidth(page);
    expect(loop, 'the strip has no width, so nothing can be measured').toBeGreaterThan(100);

    const first = await offset(page);
    await expect
      .poll(() => offset(page).then((now) => travelled(first, now, loop)), {
        message: 'the strip never advanced leftwards',
        timeout: 8_000,
        intervals: [150],
      })
      .toBeGreaterThan(20);
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

    // Wait for the actual condition rather than a fixed settle time: the
    // contract is "pausing stops it", and that has to hold at any frame rate.
    const settled = await settleOffset(page);
    await page.waitForTimeout(700);
    expect(Math.abs((await offset(page)) - settled)).toBeLessThan(1);

    // And it resumes.
    await control.click();
    await expect(control).toHaveAccessibleName(/^pause technology strip animation$/i);
    // Wrap-aware, for the same reason as the movement test above.
    const loop = await loopWidth(page);
    await expect
      .poll(() => offset(page).then((now) => travelled(settled, now, loop)), {
        message: 'the strip did not resume',
        timeout: 8_000,
        intervals: [150],
      })
      .toBeGreaterThan(5);
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
