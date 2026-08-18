import { expect, test } from '@playwright/test';

test.describe('background', () => {
  test('is invisible to assistive technology and cannot intercept a click', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas[data-background-profile]');
    await expect(canvas).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas).toHaveCSS('pointer-events', 'none');
    await expect(canvas).toHaveCSS('z-index', '-10');

    // A control sitting over the canvas must still be clickable.
    await page.getByRole('link', { name: 'View work' }).click();
    await expect(page).toHaveURL(/#work$/);
  });

  test('reports the profile it selected, so a test can assert the right contract', async ({
    page,
  }) => {
    // Which profile applies depends on the machine, and headless engines
    // differ — WebKit reports `prefers-reduced-motion: reduce` on CI and
    // correctly gets the still field. Publishing the decision lets other tests
    // branch on it instead of assuming one environment.
    await page.goto('/');
    await expect(page.locator('canvas[data-background-profile]')).toHaveAttribute(
      'data-background-profile',
      /^(static|low|standard|high)$/,
    );
  });

  test('renders stars rather than an empty canvas', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(400);

    // Counted per layer. The sky lives on the static canvas; the live canvas
    // holds only the twinkling minority and any meteors currently in flight.
    const lit = await page.evaluate(() => {
      const count = (layer: string) => {
        const canvas = document.querySelector<HTMLCanvasElement>(
          `canvas[data-background-layer="${layer}"]`,
        );
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return -1;
        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
        let total = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i]! > 20) total += 1;
        return total;
      };
      return { static: count('static'), live: count('live') };
    });

    // A blank sky is the failure this guards against, so the bar is set to
    // "unmistakably drawn" rather than to a precise count that would drift
    // with viewport size and device-pixel ratio.
    expect(lit.static, 'the star field is empty').toBeGreaterThan(100);
    // The static layer must carry the bulk of the field; if the split ever
    // regresses and everything ends up on the animated canvas, the per-frame
    // cost that forced the two-layer design comes straight back.
    expect(lit.static).toBeGreaterThan(lit.live);
  });

  test('the sky is identical for a fixed seed', async ({ page }) => {
    // Read the *static* layer: that is where the field lives. Reading the
    // animated layer under `bg-static` would compare two blank canvases and
    // pass regardless of whether seeding works at all.
    const capture = async () => {
      await page.goto('/?bg-seed=12345&bg-static');
      await page.waitForTimeout(300);
      return page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>(
          'canvas[data-background-layer="static"]',
        );
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return { url: '', lit: -1 };
        const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
        let lit = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i]! > 20) lit += 1;
        return { url: canvas.toDataURL(), lit };
      });
    };

    const first = await capture();
    const second = await capture();
    expect(first.lit, 'nothing was drawn, so the comparison is meaningless').toBeGreaterThan(100);
    expect(second.url).toBe(first.url);
  });

  test('a different seed produces a different sky', async ({ page }) => {
    const capture = async (seed: number) => {
      await page.goto(`/?bg-seed=${seed}&bg-static`);
      await page.waitForTimeout(300);
      return page.evaluate(
        () =>
          document
            .querySelector<HTMLCanvasElement>('canvas[data-background-layer="static"]')
            ?.toDataURL() ?? '',
      );
    };
    expect(await capture(111)).not.toBe(await capture(222));
  });

  test('the CSS sky is present underneath, so the page is never flat black', async ({ page }) => {
    await page.goto('/');
    const gradient = page.locator('.background-gradient');
    await expect(gradient).toHaveCount(1);
    const image = await gradient.evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(image).toContain('radial-gradient');
  });

  test('reduced motion produces a still field, not a slower one', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForTimeout(300);

    await expect(page.locator('canvas[data-background-profile]')).toHaveAttribute(
      'data-background-profile',
      'static',
    );

    // Nothing moves: two captures a second apart must be identical.
    const snapshot = () =>
      page.evaluate(() => {
        const layers = document.querySelectorAll<HTMLCanvasElement>(
          'canvas[data-background-layer]',
        );
        return [...layers].map((canvas) => canvas.toDataURL()).join('|');
      });
    const before = await snapshot();
    await page.waitForTimeout(1000);
    expect(await snapshot()).toBe(before);
  });

  test('the canvas bitmap respects the device-pixel-ratio cap', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(300);
    const ratio = await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-background-profile]');
      if (!canvas || canvas.clientWidth === 0) return -1;
      return canvas.width / canvas.clientWidth;
    });
    expect(ratio).toBeGreaterThan(0);
    expect(ratio).toBeLessThanOrEqual(2);
  });

  test('the loop stops when the tab is hidden', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(600);

    const profile = await page
      .locator('canvas[data-background-profile]')
      .getAttribute('data-background-profile');
    test.skip(profile === 'static', 'nothing to stop on a still profile');

    const frames = () =>
      page.evaluate(() =>
        Number(
          document.querySelector<HTMLCanvasElement>('canvas[data-background-layer="live"]')
            ?.dataset['frame'] ?? '0',
        ),
      );

    // Confirm it is running before claiming it stopped. The engine publishes
    // its counter every 250 ms, so this resolves in well under a second on any
    // engine — the generous timeout is only for a contended runner.
    const running = await frames();
    await expect.poll(frames, { timeout: 8_000, intervals: [150] }).toBeGreaterThan(running);

    const stillRan = await page.evaluate(async () => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));

      // Prove rAF itself is still being serviced, so a frozen counter means
      // the engine stopped rather than the browser pausing everything.
      let ownFrames = 0;
      const tick = () => {
        ownFrames += 1;
        handle = requestAnimationFrame(tick);
      };
      let handle = requestAnimationFrame(tick);
      await new Promise((resolve) => setTimeout(resolve, 800));
      cancelAnimationFrame(handle);
      return ownFrames;
    });

    expect(stillRan, 'requestAnimationFrame was not being serviced').toBeGreaterThan(0);

    const frozen = await frames();
    await page.waitForTimeout(600);
    expect(await frames(), 'the loop kept running while hidden').toBe(frozen);
  });

  test('the sky is painted once while the loop keeps running', async ({ page }) => {
    // The property the two-canvas split exists to guarantee: the animation
    // advances without ever repainting the sky.
    //
    // Liveness is read from the engine's own frame counter rather than by
    // diffing canvas pixels. Pixel diffing does not survive three engines —
    // WebKit's `toDataURL` did not reflect changes, and on the `low` profile
    // there are no twinkling stars, so between meteors the animated layer is
    // legitimately blank and identical to itself.
    await page.goto('/');
    await page.waitForTimeout(400);

    const profile = await page
      .locator('canvas[data-background-profile]')
      .getAttribute('data-background-profile');

    const readStatic = () =>
      page.evaluate(
        () =>
          document
            .querySelector<HTMLCanvasElement>('canvas[data-background-layer="static"]')
            ?.toDataURL() ?? '',
      );
    const frames = () =>
      page.evaluate(() =>
        Number(
          document.querySelector<HTMLCanvasElement>('canvas[data-background-layer="live"]')
            ?.dataset['frame'] ?? '0',
        ),
      );

    const staticBefore = await readStatic();

    if (profile === 'static') {
      // A still profile must never advance at all.
      await page.waitForTimeout(1_500);
      expect(await frames(), 'a still profile must not animate').toBe(0);
    } else {
      const before = await frames();
      await expect
        .poll(frames, {
          message: `the loop never advanced (profile: ${profile})`,
          timeout: 8_000,
          intervals: [200],
        })
        .toBeGreaterThan(before);
    }

    expect(await readStatic(), 'the sky must not be repainted').toBe(staticBefore);
  });
});
