import { expect, test } from '@playwright/test';
import type { CDPSession } from '@playwright/test';

/**
 * Memory, measured rather than assumed.
 *
 * This site runs a `requestAnimationFrame` loop over a canvas, an
 * `IntersectionObserver` per reveal, a scroll-spy, a scroll-state listener and
 * a marquee — every one of them a way to retain a detached node forever. The
 * roadmap's budget is a heap under 40 MB, hard limit 70 MB.
 *
 * Two measurement decisions, both of which the first version got wrong:
 *
 *  1. **Client-side navigation, not `page.goto`.** A full load tears down the
 *     JavaScript context, so the heap resets and a leak is invisible. The first
 *     version navigated that way, reported "+0.0 MB", and would have reported
 *     it for a component retaining every canvas it ever created.
 *  2. **CDP `Performance.getMetrics`, not `performance.memory`.** Chrome
 *     quantises `usedJSHeapSize` so heavily that it returned a flat
 *     10,000,000 — unchanged after allocating a two-million-element array.
 *     A metric that cannot move cannot fail. The CDP values are V8's own and
 *     come with node and listener counts, which are better leak signals than
 *     bytes anyway.
 */
interface Snapshot {
  heapMb: number;
  nodes: number;
  listeners: number;
  documents: number;
}

async function snapshot(session: CDPSession): Promise<Snapshot> {
  await session.send('HeapProfiler.collectGarbage');
  const { metrics } = await session.send('Performance.getMetrics');
  const value = (name: string) => metrics.find((m) => m.name === name)?.value ?? -1;
  return {
    heapMb: Number((value('JSHeapUsedSize') / 1_048_576).toFixed(2)),
    nodes: value('Nodes'),
    listeners: value('JSEventListeners'),
    documents: value('Documents'),
  };
}

test.describe('memory', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'needs CDP heap control');

  test('does not accumulate across client-side navigation', async ({ page, context }) => {
    const session = await context.newCDPSession(page);
    await session.send('Performance.enable');
    await page.goto('/');

    const round = async () => {
      const footer = page.getByRole('contentinfo');
      await footer.getByRole('link', { name: 'All projects' }).click();
      await page.waitForURL('**/work');
      await footer.getByRole('link', { name: 'About & experience' }).click();
      await page.waitForURL('**/about');
      await page.evaluate(() => window.scrollTo({ top: 2000, behavior: 'instant' }));
      await footer.getByRole('link', { name: 'Home' }).click();
      await page.waitForURL((url) => url.pathname === '/');
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 20)));
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
    };

    // Warm up. The first rounds load every route's chunk and fill the router
    // cache; none of that is a leak, and including it would drown the signal.
    for (let i = 0; i < 4; i += 1) await round();
    const warm = await snapshot(session);

    for (let i = 0; i < 8; i += 1) await round();
    const late = await snapshot(session);

    console.log(`warm: ${JSON.stringify(warm)}`);
    console.log(`late: ${JSON.stringify(late)}`);

    // The number the roadmap states.
    expect(late.heapMb, 'JS heap exceeds the 40 MB budget').toBeLessThan(40);

    // The shape. Eight further round trips create eight more canvases, rAF
    // loops and several hundred observers. If cleanup is missing this
    // compounds; if it works, it plateaus.
    expect(late.heapMb - warm.heapMb, 'the heap keeps growing').toBeLessThan(4);
    expect(late.listeners - warm.listeners, 'event listeners accumulate').toBeLessThan(40);
    expect(late.nodes - warm.nodes, 'DOM nodes accumulate').toBeLessThan(120);
    expect(late.documents, 'a document was retained').toBeLessThanOrEqual(2);
  });

  test('leaves exactly one background canvas behind, not one per visit', async ({ page }) => {
    // The concrete leak this guards: the background starts a rAF loop and a
    // `visibilitychange` listener on mount. Navigating away client-side must
    // stop both, or every return to the home page adds another loop painting a
    // canvas nobody can see.
    await page.goto('/');
    await page.waitForTimeout(500);
    expect(await page.locator('canvas[data-background-layer]').count()).toBe(2);

    const footer = page.getByRole('contentinfo');
    for (let i = 0; i < 5; i += 1) {
      await footer.getByRole('link', { name: 'All projects' }).click();
      await page.waitForURL('**/work');
      await footer.getByRole('link', { name: 'Home' }).click();
      await page.waitForURL((url) => url.pathname === '/');
    }
    await page.waitForTimeout(500);

    expect(
      await page.locator('canvas[data-background-layer]').count(),
      'a background canvas was left behind',
    ).toBe(2);
  });
});
