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

  test('the sky is painted once and never redrawn by the loop', async ({ page }) => {
    // This is the property that took the software-rendered runner from 9 fps
    // back to full speed: the static layer must be untouched while the
    // animation runs.
    await page.goto('/');
    await page.waitForTimeout(400);

    const readStatic = () =>
      page.evaluate(
        () =>
          document
            .querySelector<HTMLCanvasElement>('canvas[data-background-layer="static"]')
            ?.toDataURL() ?? '',
      );
    const readLive = () =>
      page.evaluate(
        () =>
          document
            .querySelector<HTMLCanvasElement>('canvas[data-background-layer="live"]')
            ?.toDataURL() ?? '',
      );

    const staticBefore = await readStatic();
    const liveBefore = await readLive();
    await page.waitForTimeout(900);

    expect(await readStatic(), 'the sky must not be repainted').toBe(staticBefore);
    expect(await readLive(), 'the animated layer must be moving').not.toBe(liveBefore);
  });
});
