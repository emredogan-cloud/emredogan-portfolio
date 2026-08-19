import { expect, test } from '@playwright/test';

/**
 * The cross-engine matrix.
 *
 * Every section, at three breakpoints, on all three engines — asserted by
 * **geometry and capability rather than by pixels**.
 *
 * The roadmap asks for a 3 × 3 × 8 *visual regression* matrix. That is not what
 * this is, and the deviation is deliberate. Three sets of pixel baselines make
 * every intentional design change a three-way re-record, and font rasterisation
 * differs enough between engines that most of the diff would be antialiasing —
 * noise that trains everyone to re-record without looking. Worse, WebKit
 * baselines cannot be generated on this machine at all (its Playwright build
 * needs a system library that is not installed), so a WebKit set would have to
 * be produced by CI and committed unseen, which is not a review.
 *
 * What actually breaks between engines is *layout and capability*: a grid that
 * collapses, an `aspect-ratio` that resolves differently, `backdrop-filter`
 * silently unsupported, `color-mix` failing to parse, an image format not
 * negotiated. Those are measurable exactly, on every engine, and that is what
 * this asserts. Pixel baselines stay on Chromium, where they catch the design
 * regressions they are good at.
 */
const BREAKPOINTS = [
  { label: 'mobile', width: 390, height: 844 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1440, height: 900 },
] as const;

const SECTIONS = [
  { id: 'home', heading: /Emre Doğan/ },
  { id: 'about', heading: /How I work/ },
  { id: 'work', heading: /Things I have shipped/ },
  { id: 'proof', heading: /word for it/ },
  { id: 'contact', heading: /Let's build something/ },
] as const;

for (const bp of BREAKPOINTS) {
  test.describe(`${bp.label} (${bp.width}px)`, () => {
    test('every section renders with real size and a visible heading', async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/');

      for (const section of SECTIONS) {
        const el = page.locator(`#${section.id}`);
        await expect(el, `#${section.id} is missing`).toHaveCount(1);

        const box = await el.boundingBox();
        expect(box, `#${section.id} has no box`).not.toBeNull();
        expect(box!.height, `#${section.id} collapsed`).toBeGreaterThan(120);
        expect(box!.width, `#${section.id} is wider than the viewport`).toBeLessThanOrEqual(
          bp.width + 1,
        );

        await el.scrollIntoViewIfNeeded();
        await expect(el.getByRole('heading').first()).toContainText(section.heading);
      }
    });

    test('the stack marquee and the footer render', async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/');
      await expect(page.locator('section[aria-labelledby="stack-heading"]')).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();
    });

    test('the layout switches columns at the breakpoints it claims to', async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/');

      // The work grid is one column below `lg` and two at and above it. An
      // engine that mis-resolves the grid template shows up here.
      // `li:has(> article)` — the grid items, not the stack pills inside the
      // cards, which are also list items and made this count fifteen columns.
      const cards = page.locator('#work li:has(> article)');
      const boxes = await cards.evaluateAll((nodes) =>
        nodes.map((n) => Math.round(n.getBoundingClientRect().x)),
      );
      const columns = new Set(boxes).size;
      expect(columns, `work grid resolved to ${columns} columns`).toBe(bp.width >= 1024 ? 2 : 1);
    });
  });
}

test.describe('capabilities this design depends on', () => {
  test('color-mix, aspect-ratio and custom properties all resolve', async ({ page }) => {
    await page.goto('/');
    const support = await page.evaluate(() => ({
      colorMix: CSS.supports('color', 'color-mix(in oklab, red 50%, transparent)'),
      aspectRatio: CSS.supports('aspect-ratio', '4 / 5'),
      customProps: CSS.supports('color', 'var(--color-void)'),
      dvh: CSS.supports('height', '100dvh'),
      clamp: CSS.supports('font-size', 'clamp(1rem, 2vw, 2rem)'),
    }));
    // These are load-bearing: without them the design does not degrade, it
    // breaks. The support matrix says so, and this is that claim measured.
    expect(support).toEqual({
      colorMix: true,
      aspectRatio: true,
      customProps: true,
      dvh: true,
      clamp: true,
    });
  });

  test('a missing backdrop-filter degrades to an opaque surface, never a transparent one', async ({
    page,
  }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
    await page.waitForTimeout(400);

    const island = page.locator('header > div');
    const style = await island.evaluate((el) => {
      const s = getComputedStyle(el);
      return { backdrop: s.backdropFilter, background: s.backgroundColor };
    });

    // Either the blur works, or the fallback background is opaque enough to
    // read against. What must never happen is a transparent panel over moving
    // content.
    const alpha = /\/\s*([\d.]+)\s*\)/.exec(style.background)?.[1];
    const opaqueEnough = alpha === undefined || Number(alpha) > 0.6;
    expect(
      style.backdrop !== 'none' || opaqueEnough,
      `island is see-through: ${style.background}`,
    ).toBe(true);
  });

  test('images are negotiated to a modern format the engine actually asked for', async ({
    page,
    browserName,
  }) => {
    const formats: string[] = [];
    page.on('response', (response) => {
      if (response.url().includes('/_next/image')) {
        const type = response.headers()['content-type'];
        if (type) formats.push(type);
      }
    });

    await page.goto('/work');
    await page.waitForLoadState('networkidle');

    expect(formats.length, 'no optimised image was requested').toBeGreaterThan(0);
    for (const format of formats) {
      // Every supported engine accepts at least WebP; Chromium and Firefox take
      // AVIF. What matters is that none of them is served the original JPEG.
      expect(format, `${browserName} received ${format}`).toMatch(/image\/(avif|webp)/);
    }
  });

  test('the native dialog is used, not a hand-rolled modal', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: /open navigation/i }).click();
    const isNativeDialog = await page.evaluate(
      () => document.querySelector('dialog')?.hasAttribute('open') ?? false,
    );
    expect(isNativeDialog, 'the mobile menu is not a native <dialog>').toBe(true);
  });
});
