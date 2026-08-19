import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * Scrolls the whole page so every scroll-reveal has fired, then returns to the
 * top.
 *
 * Without this, axe scans a page where below-fold content still sits at
 * `opacity: 0` and reports it as a colour-contrast failure. Those reports are
 * technically accurate and practically useless: nobody reads the page in that
 * state. Worse, they would mask a *real* contrast failure in a revealed card,
 * because the whole rule would be drowning in noise.
 *
 * Scanning the settled page tests the state a user actually experiences — and
 * still catches genuine contrast problems in revealed content, which is the
 * point.
 */
export async function settlePage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    // IntersectionObserver callbacks are delivered asynchronously at the end of
    // a frame. Scrolling in a tight rAF loop outruns them, and an element that
    // was never *observed* as visible stays hidden — so each step waits long
    // enough for the observer to fire before moving on.
    const settleFrame = () =>
      new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 60)));

    // `behavior: 'instant'` is required: the document sets
    // `scroll-behavior: smooth`, so a plain `scrollTo` starts an *animation*.
    // Each step would then be cancelled by the next one and the page would
    // never actually pass the elements it is supposed to reveal.
    const jumpTo = (y: number) => window.scrollTo({ top: y, behavior: 'instant' });

    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      jumpTo(y);
      await settleFrame();
    }
    jumpTo(0);
    await settleFrame();
  });

  // Every reveal has been triggered...
  await page.waitForFunction(() => document.querySelectorAll('.reveal-hidden').length === 0, null, {
    timeout: 15_000,
  });

  // ...but triggered is not finished. `toHaveScreenshot` cancels in-flight
  // animations, and a transition cancelled part-way does not necessarily land
  // on the value the DOM reports — which is how a full-page baseline ended up
  // being a picture of an empty page while `getComputedStyle` insisted every
  // element was fully opaque. Waiting on the actual animation objects removes
  // the ambiguity.
  //
  // Only CSS *transitions* are waited on. The scroll-progress bar is a
  // scroll-driven animation whose `playState` is `running` for the life of the
  // document, so waiting on every animation never returns.
  await page.waitForFunction(
    () =>
      document
        .getAnimations()
        .filter((animation) => animation instanceof CSSTransition)
        .every((animation) => animation.playState !== 'running'),
    null,
    { timeout: 15_000 },
  );
}

/** Runs axe against the settled page with the project's WCAG tag set. */
export async function scan(page: Page) {
  await settlePage(page);
  return new AxeBuilder({ page }).withTags(TAGS).analyze();
}

/** Formats violations into something readable in a CI log. */
export function describeViolations(
  violations: Awaited<ReturnType<typeof scan>>['violations'],
): string {
  return violations
    .map((v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target).join('\n  ')}`)
    .join('\n');
}

/**
 * Prepares a page for a deterministic visual baseline.
 *
 * Runs under `prefers-reduced-motion: reduce`, where the stylesheet collapses
 * every transition to 0.01 ms. That is not a convenience — it is what makes
 * the baseline reproducible. `toHaveScreenshot` stabilises by capturing
 * repeatedly until two frames match, and it manipulates in-flight animations
 * while doing so; against CSS transitions that produced a full-page image with
 * the entire middle of the document blank, while `page.screenshot` of the very
 * same page rendered correctly and `getComputedStyle` reported every element
 * fully opaque.
 *
 * With no transitions in play there is nothing to stabilise, and the baseline
 * captures what it is actually for: layout, typography, colour and spacing.
 * The *motion* itself is covered where it belongs — `tests/e2e/reveal.spec.ts`
 * and `tests/e2e/reduced-motion.spec.ts` assert the reveal behaviour directly.
 */
export async function prepareForSnapshot(page: Page, url: string): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  // Pin the star field. Without a fixed seed the background differs on every
  // run and every baseline is a false positive; `bg-static` additionally stops
  // the clock so meteors cannot drift between the capture and the comparison.
  const target = new URL(url, 'http://127.0.0.1');
  target.searchParams.set('bg-seed', '20260818');
  target.searchParams.set('bg-static', '1');
  await page.goto(`${target.pathname}${target.search}`);
  await page.waitForLoadState('networkidle');
  await settlePage(page);
  await decodeImages(page);
}

/**
 * Waits until every image has actually been decoded, not merely downloaded.
 *
 * `networkidle` says the bytes arrived; it says nothing about whether the
 * decoder has produced a bitmap. Under a loaded runner the work section's
 * covers were still undecoded when the baseline was captured, so that one test
 * failed in a full-suite run and passed on its own — the signature of a race,
 * and the kind of flake that gets a real regression waved through as "just the
 * visual test again".
 *
 * `decode()` on an already-decoded image resolves immediately, and a failed
 * decode is swallowed here: a broken image is the business of the tests that
 * assert on images, not of every baseline.
 */
async function decodeImages(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await Promise.all([...document.images].map((image) => image.decode().catch(() => undefined)));
  });
}

/**
 * Hides the fixed overlays for a region baseline.
 *
 * A `position: fixed` header sits wherever the viewport happens to be when
 * Playwright scrolls an element into view, so it lands at a different height
 * inside the captured region from one run to the next. The result is a
 * baseline that fails intermittently on a band of pixels that has nothing to
 * do with the region under test — and a flaky visual test is worse than none,
 * because it teaches everyone to re-record without looking.
 *
 * The header is not going untested: it has its own baselines (`nav-top`,
 * `nav-island`) and appears in the viewport composites, which is where it
 * belongs.
 */
export async function hideFixedOverlays(page: Page): Promise<void> {
  // `display: none`, not `visibility: hidden`. The island's inner panel
  // carries `transition-all`, and `all` includes `visibility` — so hiding it
  // starts a 350 ms transition and the element is still painted when the
  // screenshot is taken. Taking it out of the box tree has no such window, and
  // the header is `position: fixed`, so removing it shifts nothing.
  await page.addStyleTag({
    content: 'header, .scroll-progress { display: none !important; }',
  });
}
