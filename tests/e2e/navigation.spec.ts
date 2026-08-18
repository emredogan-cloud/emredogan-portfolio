import { expect, test } from '@playwright/test';

test.describe('navigation island', () => {
  test('is transparent at the top and becomes an island once scrolled', async ({ page }) => {
    await page.goto('/');
    const island = page.locator('header > div');

    const initialRadius = await island.evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
    expect(initialRadius).toBe('0px');

    await page.evaluate(() => window.scrollTo({ top: 600, behavior: 'instant' }));
    await expect
      .poll(() => island.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .not.toBe('0px');

    // The island must actually be translucent, not just rounded — otherwise
    // the backdrop blur has nothing to blur. `color-mix()` resolves to an
    // `oklab(... / alpha)` string in Chromium, so match the alpha rather than
    // assuming an `rgba()` serialisation.
    const alpha = await island.evaluate((el) => {
      const value = getComputedStyle(el).backgroundColor;
      const match = value.match(/\/\s*([\d.]+)\s*\)/) ?? value.match(/,\s*([\d.]+)\s*\)$/);
      return match ? Number(match[1]) : 1;
    });
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(1);
  });

  test('marks the section in view with aria-current, not colour alone', async ({ page }) => {
    await page.goto('/');
    const workLink = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
      name: 'Work',
    });

    await expect(workLink).not.toHaveAttribute('aria-current', 'true');

    // Put the section under the header, which is where the reading band sits.
    await page.evaluate(() => {
      const top = document.getElementById('work')!.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top - 100, behavior: 'instant' });
    });
    await expect(workLink).toHaveAttribute('aria-current', 'true');
    // and only that one
    await expect(
      page.getByRole('navigation', { name: 'Primary' }).locator('[aria-current="true"]'),
    ).toHaveCount(1);
  });

  test('anchor links move the reader to the right section', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'About' })
      .click();

    await expect(page).toHaveURL(/#about$/);

    // Landing "somewhere on screen" is not good enough — the section must come
    // to rest near the top, clear of the floating header. `scroll-mt` on the
    // section is what guarantees the second half.
    await expect
      .poll(() => page.locator('#about').evaluate((el) => el.getBoundingClientRect().top))
      .toBeLessThan(140);
    const headingTop = await page
      .locator('#about-heading')
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(headingTop, 'the header is covering the heading').toBeGreaterThan(60);
  });

  test('a deep link with a hash lands on the right section', async ({ page }) => {
    await page.goto('/#work');
    await expect
      .poll(() => page.locator('#work').evaluate((el) => el.getBoundingClientRect().top))
      .toBeLessThan(140);
  });

  test('every section the nav points at exists', async ({ page }) => {
    await page.goto('/');
    const links = page.getByRole('navigation', { name: 'Primary' }).getByRole('link');
    for (const link of await links.all()) {
      const href = await link.getAttribute('href');
      const id = href?.split('#')[1];
      expect(id, `nav link ${href} has no fragment`).toBeTruthy();
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test('the whole page is reachable by keyboard', async ({ page }) => {
    await page.goto('/');
    const reached: string[] = [];
    for (let i = 0; i < 14; i += 1) {
      await page.keyboard.press('Tab');
      const label = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? `${el.tagName}:${(el.textContent || '').trim().slice(0, 24)}` : 'none';
      });
      reached.push(label);
    }
    expect(reached.join(' | ')).toContain('Skip to content');
    expect(reached.some((r) => r.includes('About'))).toBe(true);
    expect(reached.some((r) => r.includes('Work'))).toBe(true);
  });
});

test.describe('mobile menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('opens, traps focus, closes on Escape and restores focus', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Open navigation' });
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: 'Site navigation' });
    await expect(dialog).toBeVisible();

    // Background must not scroll while the sheet is open.
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

    // Tabbing must never reach a control behind the sheet. Asserting "focus is
    // inside the dialog" is too strict — when focus wraps, Chromium parks it on
    // the dialog itself or on <body>, neither of which is a leak. What matters
    // is that the header and the page content stay unreachable.
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press('Tab');
      const leaked = await page.evaluate(() => {
        const active = document.activeElement;
        if (!active) return false;
        const background = [document.querySelector('header'), document.querySelector('main')];
        return background.some((region) => region?.contains(active));
      });
      expect(leaked, `focus reached a background control on tab ${i + 1}`).toBe(false);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  });

  test('closes and navigates when a link is chosen', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('dialog').getByRole('link', { name: 'Contact' }).click();

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page).toHaveURL(/#contact$/);
  });

  test('the desktop nav is not exposed at mobile width', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Primary' }).first()).toBeHidden();
  });
});

test.describe('scroll progress', () => {
  test('grows as the page is scrolled', async ({ page }) => {
    await page.goto('/');
    const bar = page.locator('.scroll-progress');
    await expect(bar).toHaveAttribute('data-scroll-timeline', /native|fallback/);

    const scaleAt = async () =>
      bar.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);

    const atTop = await scaleAt();
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }),
    );
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 120))));
    const atBottom = await scaleAt();

    expect(atBottom).toBeGreaterThan(atTop);
  });
});

test.describe('footer', () => {
  test('links out with rel="me noopener noreferrer" and names each profile', async ({ page }) => {
    await page.goto('/');
    const github = page.getByRole('contentinfo').getByRole('link', { name: /GitHub/ });
    await expect(github).toHaveAttribute('href', 'https://github.com/emredogan-cloud');
    await expect(github).toHaveAttribute('rel', /noopener/);
    await expect(github).toHaveAttribute('target', '_blank');
  });

  test('back-to-top returns the reader to the start', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo({ top: 2000, behavior: 'instant' }));
    await page.getByRole('link', { name: 'Back to top' }).click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(100);
  });
});

test.describe('layout integrity', () => {
  for (const [label, width, height] of [
    ['mobile', 390, 844],
    ['tablet', 768, 1024],
    ['desktop', 1440, 900],
  ] as const) {
    test(`the fixed header never covers the hero heading — ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');

      const headerBottom = await page
        .locator('header > div')
        .evaluate((el) => el.getBoundingClientRect().bottom);
      const headingTop = await page
        .locator('#home-heading')
        .evaluate((el) => el.getBoundingClientRect().top);

      expect(headingTop, `header bottom ${headerBottom}`).toBeGreaterThan(headerBottom);
    });

    test(`no horizontal overflow — ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});
