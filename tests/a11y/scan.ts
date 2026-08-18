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

  // Reveals are CSS transitions; wait for the longest one to finish.
  await page.waitForFunction(() => document.querySelectorAll('.reveal-hidden').length === 0, null, {
    timeout: 15_000,
  });
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
