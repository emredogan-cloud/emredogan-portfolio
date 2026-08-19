import { devices, expect, test } from '@playwright/test';

/**
 * Responsive behaviour, measured rather than eyeballed.
 *
 * The widths are the roadmap's §10 table plus the three device widths that
 * dominate real traffic. Every page is checked at every one of them, because
 * overflow is almost always introduced by a single element on a single page and
 * spot-checking the home page at 390 px finds none of them.
 */
const WIDTHS = [320, 360, 390, 414, 480, 768, 1024, 1280, 1440, 1920, 2560] as const;
const PAGES = ['/', '/about', '/work', '/work/pawdoc'] as const;

test.describe('no horizontal overflow', () => {
  for (const width of WIDTHS) {
    test(`at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const path of PAGES) {
        await page.goto(path);
        // Settle the reveals first: an element can be within the viewport while
        // translated and only overflow once it lands.
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          if (doc.scrollWidth <= doc.clientWidth) return null;

          // Name the culprit rather than reporting a number nobody can act on.
          const limit = doc.clientWidth;

          // An element wider than the viewport is only a *cause* if nothing
          // above it clips. The marquee track is 2,016 px wide by design and
          // sits inside `overflow: hidden`; reporting it hides the real
          // culprit behind a false positive.
          const isClipped = (element: HTMLElement) => {
            for (let node = element.parentElement; node; node = node.parentElement) {
              const overflow = getComputedStyle(node).overflowX;
              if (overflow === 'hidden' || overflow === 'clip' || overflow === 'auto') return true;
            }
            return false;
          };

          for (const element of document.body.querySelectorAll<HTMLElement>('*')) {
            const box = element.getBoundingClientRect();
            if (box.right <= limit + 1 && box.left >= -1) continue;
            if (box.width === 0 || box.height === 0) continue;
            const style = getComputedStyle(element);
            if (style.position === 'fixed') continue;
            if (isClipped(element)) continue;
            return {
              scrollWidth: doc.scrollWidth,
              clientWidth: limit,
              tag: element.tagName.toLowerCase(),
              className: element.className.toString().slice(0, 90),
              right: Math.round(box.right),
            };
          }
          return {
            scrollWidth: doc.scrollWidth,
            clientWidth: limit,
            tag: '?',
            className: '',
            right: 0,
          };
        });

        expect(overflow, `${path} overflows at ${width}px: ${JSON.stringify(overflow)}`).toBeNull();
      }
    });
  }
});

test.describe('touch targets', () => {
  // WCAG 2.2 AA (2.5.8) sets 24×24 as the floor; the roadmap holds this site to
  // the 44×44 that actually feels right under a thumb.
  const MIN = 44;

  for (const width of [390, 768] as const) {
    test(`every control is at least ${MIN}px at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');

      const small = await page.evaluate((min) => {
        const results: { label: string; w: number; h: number }[] = [];
        const controls = document.querySelectorAll<HTMLElement>(
          'main a, main button, header a, header button, footer a, footer button',
        );
        for (const control of controls) {
          const box = control.getBoundingClientRect();
          if (box.width === 0 && box.height === 0) continue;
          // A link inside a paragraph is exempt under 2.5.8; these are
          // standalone controls only.
          if (control.closest('p') !== null) continue;

          // A stretched link's own box is small on purpose — the thing under
          // the thumb is the card it covers, via an inset `::before`. Measure
          // that instead of the anchor.
          const before = getComputedStyle(control, '::before');
          const stretched =
            before.position === 'absolute' && before.inset !== 'auto' && before.content !== 'none';
          const target = stretched ? (control.closest('article, li') ?? control) : control;
          const hit = target.getBoundingClientRect();
          if (hit.width >= min && hit.height >= min) continue;
          results.push({
            label: (control.textContent ?? control.getAttribute('aria-label') ?? '?')
              .trim()
              .slice(0, 40),
            w: Math.round(box.width),
            h: Math.round(box.height),
          });
        }
        return results;
      }, MIN);

      expect(small, `controls under ${MIN}px: ${JSON.stringify(small)}`).toEqual([]);
    });
  }
});

test.describe('mobile reading experience', () => {
  test('the hero fits a phone without scrolling past the primary action', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const cta = page.getByRole('link', { name: 'View work' });
    const box = await cta.boundingBox();
    expect(box, 'the primary call to action is missing').not.toBeNull();
    expect(box!.y + box!.height, 'the primary action is below the fold').toBeLessThan(844);
  });

  test('uses dynamic viewport units, so the browser chrome cannot clip it', async ({ page }) => {
    // `100vh` on iOS Safari is the height *without* the address bar, which
    // leaves the bottom of a full-height section permanently under it.
    await page.goto('/');
    const uses = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('*')].every((el) => {
        const height = el.style.height || el.style.minHeight;
        return !height.includes('100vh');
      }),
    );
    expect(uses, 'an element sets 100vh inline').toBe(true);
  });

  test('the message field asks for the right keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#contact');
    await expect(page.getByLabel(/^Email/i)).toHaveAttribute('type', 'email');
    await expect(page.getByLabel(/^Your name/i)).toHaveAttribute('autocomplete', 'name');
  });
});

/**
 * Device emulation.
 *
 * `test.use` here applies each device's viewport, device-pixel-ratio, touch
 * support and user agent while keeping the project's browser engine, so the
 * same three checks run on Chromium, Firefox and WebKit in CI. It is not a
 * substitute for a physical handset — nothing emulated reproduces a real
 * touch-and-scroll feel or a real GPU — and the phase record says so rather
 * than implying a device test that did not happen.
 */
for (const name of ['iPhone 15', 'Pixel 7', 'iPad Mini'] as const) {
  test.describe(name, () => {
    const device = devices[name];
    test.use({
      viewport: device.viewport,
      deviceScaleFactor: device.deviceScaleFactor,
      isMobile: device.isMobile,
      hasTouch: device.hasTouch,
    });

    test('lays out without a horizontal scrollbar', async ({ page }) => {
      for (const path of PAGES) {
        await page.goto(path);
        const fits = await page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        );
        expect(fits, `${path} overflows on ${name}`).toBe(true);
      }
    });

    test('opens the navigation and reaches a section', async ({ page }) => {
      await page.goto('/');
      const trigger = page.getByRole('button', { name: /open navigation/i });

      if (await trigger.isVisible()) {
        await trigger.click();
        await page.getByRole('dialog').getByRole('link', { name: 'Work' }).click();
      } else {
        await page
          .getByRole('navigation', { name: 'Primary' })
          .getByRole('link', { name: 'Work' })
          .click();
      }

      await expect(page).toHaveURL(/#work$/);
      await expect(page.locator('#work')).toBeInViewport();
    });

    test('the hero reads without the portrait crowding the text', async ({ page }) => {
      await page.goto('/');
      const heading = page.getByRole('heading', { level: 1 });
      const portrait = page.locator('#home img, #home .aspect-4\\/5').first();
      const headingBox = await heading.boundingBox();
      const portraitBox = await portrait.boundingBox();
      expect(headingBox).not.toBeNull();
      expect(portraitBox).not.toBeNull();

      const narrow = (device.viewport?.width ?? 0) < 1024;
      if (narrow) {
        // Stacked, text first — not a shrunken two-column layout.
        expect(portraitBox!.y, 'the portrait is not below the headline').toBeGreaterThan(
          headingBox!.y,
        );
      }
    });
  });
}
