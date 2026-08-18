import { expect, test } from '@playwright/test';

/**
 * Timing measurements, deliberately kept out of `tests/e2e`.
 *
 * The suite runs fully parallel, and a relative frame-budget measurement taken
 * while five other browser contexts are competing for the same cores measures
 * contention, not the page — it passed in isolation and failed in the pack.
 * `pnpm perf` runs this directory with a single worker.
 */
test.describe.configure({ mode: 'serial' });

test.describe('background performance', () => {
  test('costs almost none of the frame budget', async ({ page }) => {
    /**
     * An absolute frames-per-second floor measures the runner, not the site.
     * Headless WebKit on a shared CI runner has no GPU and delivers ~9 rAF
     * callbacks per second whatever the page contains, so a `> 40` assertion
     * failed on a background that is in fact free.
     *
     * What is worth protecting is the engine's *share* of the frame budget.
     * Measuring the same page twice — once with the loop running, once with
     * `?bg-static`, which draws a single frame and then idles — cancels the
     * runner out and leaves only the cost this code adds.
     */
    const cadence = async (url: string) => {
      await page.goto(url);
      await page.waitForTimeout(400);
      return page.evaluate(
        () =>
          new Promise<{ fps: number; longFrames: number; worst: number }>((resolve) => {
            let frames = 0;
            let longFrames = 0;
            let worst = 0;
            let last = performance.now();
            const start = last;

            const tick = (now: number) => {
              const gap = now - last;
              last = now;
              frames += 1;
              // The first frames after navigation are noise.
              if (frames > 5) {
                if (gap > 50) longFrames += 1;
                if (gap > worst) worst = gap;
              }
              if (now - start < 2500) requestAnimationFrame(tick);
              else resolve({ fps: frames / ((now - start) / 1000), longFrames, worst });
            };
            requestAnimationFrame(tick);
          }),
      );
    };

    const idle = await cadence('/?bg-static');
    const animated = await cadence('/');

    const retained = animated.fps / idle.fps;
    expect(
      retained,
      `idle ${idle.fps.toFixed(1)} fps → animated ${animated.fps.toFixed(1)} fps`,
    ).toBeGreaterThan(0.85);

    // The strict half, and the one that actually catches a regression: no
    // single frame may blow past the 50 ms mark.
    expect(animated.longFrames, `worst animated frame ${animated.worst.toFixed(1)}ms`).toBe(0);
  });
});
