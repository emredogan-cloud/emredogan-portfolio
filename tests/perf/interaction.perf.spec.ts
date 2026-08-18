import { expect, test, type Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

/**
 * Interaction latency — the INP budget (roadmap §7: < 150 ms target, 200 ms
 * ceiling), measured directly rather than inferred from a Lighthouse score.
 *
 * Each interaction is timed from the event to the next paint, which is what INP
 * actually measures. Run with a single worker, for the same reason the frame
 * budget is: a latency figure taken while five browser contexts fight for the
 * same cores is a measure of the runner.
 */
async function timeToNextPaint(page: Page, action: () => Promise<void>): Promise<number> {
  await page.evaluate(() => {
    (window as unknown as { __t0?: number }).__t0 = 0;
    document.addEventListener(
      'pointerdown',
      () => {
        (window as unknown as { __t0?: number }).__t0 = performance.now();
      },
      { once: true, capture: true },
    );
  });

  await action();

  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            const start = (window as unknown as { __t0?: number }).__t0 ?? 0;
            resolve(start === 0 ? -1 : performance.now() - start);
          }),
        );
      }),
  );
}

test.describe('interaction latency', () => {
  test('the marquee pause control responds within the INP budget', async ({ page }) => {
    await page.goto('/');
    const control = page.locator('button[aria-controls="tech-strip"]');
    await control.scrollIntoViewIfNeeded();

    const samples: number[] = [];
    for (let i = 0; i < 5; i += 1) {
      samples.push(await timeToNextPaint(page, () => control.click()));
    }

    const worst = Math.max(...samples);
    expect(worst, `samples: ${samples.map((s) => s.toFixed(1)).join(', ')}ms`).toBeLessThan(200);
  });

  test('opening the mobile menu responds within the INP budget', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const latency = await timeToNextPaint(page, () =>
      page.getByRole('button', { name: 'Open navigation' }).click(),
    );

    expect(latency, `${latency.toFixed(1)}ms`).toBeLessThan(200);
  });

  test('scrolling does not produce a long task', async ({ page }) => {
    await page.goto('/');

    const longTasks = await page.evaluate(
      () =>
        new Promise<number[]>((resolve) => {
          const tasks: number[] = [];
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) tasks.push(entry.duration);
          });
          try {
            observer.observe({ type: 'longtask', buffered: true });
          } catch {
            resolve([]); // Not supported (WebKit); nothing to assert.
            return;
          }

          let y = 0;
          const step = () => {
            y += 60;
            window.scrollTo({ top: y, behavior: 'instant' });
            if (y < document.body.scrollHeight - window.innerHeight) {
              requestAnimationFrame(step);
            } else {
              setTimeout(() => {
                observer.disconnect();
                resolve(tasks);
              }, 200);
            }
          };
          requestAnimationFrame(step);
        }),
    );

    // The scroll-spy and the header both run on IntersectionObserver
    // specifically so scrolling costs nothing. A long task here means one of
    // them started reading layout.
    const over50 = longTasks.filter((duration) => duration > 50);
    expect(over50, `long tasks: ${over50.map((d) => d.toFixed(0)).join(', ')}ms`).toEqual([]);
  });
});
