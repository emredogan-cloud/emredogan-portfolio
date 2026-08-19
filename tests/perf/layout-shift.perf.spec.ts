import { expect, test, type BrowserContext, type Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

/**
 * Cumulative Layout Shift, measured with the same API the browser reports it
 * with (roadmap §7: < 0.02 target, 0.1 ceiling).
 *
 * This exists because a shift was found by accident: the marquee's pause
 * control was rendered only after hydration and pushed everything below it down
 * by 58 px on every load. Nothing failed — the page just moved under the
 * reader, and an anchored section landed in the wrong place. A general
 * measurement catches the next one on purpose.
 */
/**
 * Slows the network to roughly a poor 3G link.
 *
 * A developer machine loads every font before first paint, so a font-swap
 * shift is invisible locally and lands in CI instead — which is exactly what
 * happened when the mono face's preload was dropped: 0.0028 here, **0.1276**
 * on the runner. Measuring the slow case is the only way this test can find
 * that class of regression before a push.
 */
async function throttle(context: BrowserContext, page: Page): Promise<void> {
  const session = await context.newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 300,
    downloadThroughput: (400 * 1024) / 8,
    uploadThroughput: (400 * 1024) / 8,
  });
}

async function cumulativeLayoutShift(page: Page, url: string): Promise<number> {
  await page.goto(url, { waitUntil: 'commit' });

  await page.evaluate(() => {
    const state = window as unknown as { __cls: number };
    state.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
        };
        // Shifts within 500 ms of a user interaction are excluded from CLS,
        // because the user caused them.
        if (!shift.hadRecentInput) state.__cls += shift.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });

  await page.waitForLoadState('networkidle');
  // Fonts, the background canvas and hydration all settle in this window.
  await page.waitForTimeout(2_500);

  return page.evaluate(() => (window as unknown as { __cls: number }).__cls);
}

test.describe('layout stability', () => {
  for (const [label, path] of [
    ['home', '/'],
    ['work', '/work'],
    ['about', '/about'],
  ] as const) {
    test(`${label} settles without shifting`, async ({ page }) => {
      const cls = await cumulativeLayoutShift(page, path);
      expect(cls, `CLS ${cls.toFixed(4)}`).toBeLessThan(0.02);
    });

    test(`${label} settles without shifting on a slow connection`, async ({ page, context }) => {
      await throttle(context, page);
      const cls = await cumulativeLayoutShift(page, path);
      expect(cls, `CLS ${cls.toFixed(4)} on a throttled link`).toBeLessThan(0.02);
    });
  }

  test('the home page is stable at mobile width too', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const cls = await cumulativeLayoutShift(page, '/');
    expect(cls, `CLS ${cls.toFixed(4)}`).toBeLessThan(0.02);
  });
});
