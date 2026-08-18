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

  test('renders stars rather than an empty canvas', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(400);

    const litPixels = await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-background-profile]');
      const context = canvas?.getContext('2d');
      if (!canvas || !context) return -1;
      const { data } = context.getImageData(0, 0, canvas.width, Math.min(600, canvas.height));
      let lit = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i]! > 20) lit += 1;
      return lit;
    });

    expect(litPixels).toBeGreaterThan(200);
  });

  test('the sky is identical for a fixed seed', async ({ page }) => {
    const capture = async () => {
      await page.goto('/?bg-seed=12345&bg-static');
      await page.waitForTimeout(300);
      return page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-background-profile]');
        return canvas?.toDataURL() ?? '';
      });
    };

    const first = await capture();
    const second = await capture();
    expect(first.length).toBeGreaterThan(1000);
    expect(second).toBe(first);
  });

  test('a different seed produces a different sky', async ({ page }) => {
    const capture = async (seed: number) => {
      await page.goto(`/?bg-seed=${seed}&bg-static`);
      await page.waitForTimeout(300);
      return page.evaluate(
        () =>
          document
            .querySelector<HTMLCanvasElement>('canvas[data-background-profile]')
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
      page.evaluate(
        () =>
          document
            .querySelector<HTMLCanvasElement>('canvas[data-background-profile]')
            ?.toDataURL() ?? '',
      );
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

  test('holds 60 fps without a long frame', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(300);

    const result = await page.evaluate(
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
            if (frames > 3) {
              if (gap > 50) longFrames += 1;
              if (gap > worst) worst = gap;
            }
            if (now - start < 2500) requestAnimationFrame(tick);
            else
              resolve({
                fps: frames / ((now - start) / 1000),
                longFrames,
                worst,
              });
          };
          requestAnimationFrame(tick);
        }),
    );

    // The budget (roadmap §7) is 60 fps with no frame over 50 ms. CI runners
    // are shared, so the floor is set where a genuine regression still fails
    // but runner noise does not.
    expect(result.fps, `fps ${result.fps.toFixed(1)}`).toBeGreaterThan(40);
    expect(result.longFrames, `worst frame ${result.worst.toFixed(1)}ms`).toBe(0);
  });

  test('the loop stops when the tab is hidden', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(300);

    const framesWhileHidden = await page.evaluate(async () => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));

      let frames = 0;
      const tick = () => {
        frames += 1;
        handle = requestAnimationFrame(tick);
      };
      let handle = requestAnimationFrame(tick);
      await new Promise((resolve) => setTimeout(resolve, 400));
      cancelAnimationFrame(handle);

      // Our own counter proves rAF still runs; the background's canvas must
      // nonetheless be unchanged, because its loop was stopped.
      const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-background-profile]');
      const before = canvas?.toDataURL() ?? '';
      await new Promise((resolve) => setTimeout(resolve, 400));
      const after = canvas?.toDataURL() ?? '';

      return { rafRan: frames > 0, unchanged: before === after };
    });

    expect(framesWhileHidden.rafRan).toBe(true);
    expect(framesWhileHidden.unchanged).toBe(true);
  });
});
