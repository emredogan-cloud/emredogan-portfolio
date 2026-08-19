import { expect, test } from '@playwright/test';

test.describe('about section on the home page', () => {
  test('carries the intro, four principles and four capabilities', async ({ page }) => {
    await page.goto('/#about');
    const section = page.locator('#about');

    await expect(section.getByRole('heading', { name: /how i work/i })).toBeVisible();
    await expect(section.getByRole('list', { name: 'Working principles' })).toBeVisible();
    await expect(section.locator('[aria-label="Working principles"] > li')).toHaveCount(4);
    await expect(section.getByRole('heading', { name: 'What I build' })).toBeVisible();
    await expect(section.locator('[aria-label="Capabilities"] > li')).toHaveCount(4);
  });

  test('hands off to the long-form page', async ({ page }) => {
    await page.goto('/#about');
    const link = page.locator('#about').getByRole('link', { name: /timeline, principles/i });

    // Assert where it points before following it. A click that silently does
    // nothing and a link that points somewhere else fail identically
    // otherwise, and on a loaded WebKit runner this click landed before the
    // router had attached — leaving the page on `/#about` and the failure
    // reading as if the link were wrong.
    await expect(link).toHaveAttribute('href', '/about');
    // Centre it first. `goto('/#about')` leaves this link near the bottom of
    // the viewport, and the fixed header sits over the top of the page — a
    // click that lands under the header is retried until it times out, which
    // reads as "the link does nothing" rather than "the click missed".
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await page.waitForURL('**/about', { timeout: 15_000 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('About');
  });

  test('states no skill percentages', async ({ page }) => {
    // The reference fills this area with self-assessed proficiency bars —
    // "React 95%" — which are unverifiable by construction. Nothing here may
    // reintroduce them.
    await page.goto('/#about');
    const text = (await page.locator('#about').innerText()).toLowerCase();
    expect(text).not.toMatch(/\b\d{1,3}\s?%/);
    await expect(page.locator('#about [role="progressbar"]')).toHaveCount(0);
  });
});

test.describe('about page', () => {
  test('exposes one h1 and a heading outline that does not skip a level', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

    const levels = await page
      .locator('main h1, main h2, main h3, main h4')
      .evaluateAll((nodes) => nodes.map((node) => Number(node.tagName[1])));

    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i]! - levels[i - 1]!, `jump at heading ${i}: ${levels.join(',')}`).toBeLessThan(
        2,
      );
    }
  });

  test('every section is a named landmark', async ({ page }) => {
    await page.goto('/about');
    const regions = page.locator('main section[aria-labelledby]');
    await expect(regions).toHaveCount(6);
    for (const id of await regions.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('aria-labelledby')),
    )) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });
});

test.describe('experience timeline', () => {
  test('is an ordered list, so the sequence survives a screen reader', async ({ page }) => {
    await page.goto('/about');
    const list = page.locator('[aria-label="Experience timeline"]');
    await expect(list).toHaveCount(1);
    await expect(list.locator('> li')).toHaveCount(6);
  });

  test('every entry states something checkable', async ({ page }) => {
    await page.goto('/about');
    const entries = page.locator('#timeline ol > li');
    for (let i = 0; i < (await entries.count()); i += 1) {
      const evidence = entries.nth(i).locator('ul[aria-label$="evidence"] li');
      expect(await evidence.count(), `entry ${i} has no evidence`).toBeGreaterThan(0);
    }
  });

  test('links reach a real case study rather than a 404', async ({ page }) => {
    await page.goto('/about');
    const links = page.locator('#timeline ol > li h3 a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i += 1) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toMatch(/^\/work\/[a-z-]+$/);
      const response = await page.request.get(href!);
      expect(response.status(), `${href} is not published`).toBe(200);
    }
  });
});

test.describe('credentials', () => {
  test('does not present a planned exam as a held certificate', async ({ page }) => {
    // The whole reason this block exists. A target has to be unmistakable in
    // plain text, not by colour alone — someone skimming must not come away
    // believing a certification is in hand.
    await page.goto('/about');
    const cards = page.locator('#credentials li');
    await expect(cards).toHaveCount(4);

    const aws = cards.filter({ hasText: 'AWS Certified Solutions Architect' });
    await expect(aws).toHaveCount(1);
    await expect(aws).toContainText(/target — not held/i);
    await expect(aws).toContainText(/not held/i);
  });

  test('claims no certification is currently held', async ({ page }) => {
    await page.goto('/about');
    const text = await page.locator('#credentials').innerText();
    expect(text.toLowerCase()).not.toMatch(/\bcertified since\b|\bcredential id\b/);
    // Stated positively rather than left to inference.
    expect(text).toMatch(/No third-party certification is held today/i);
  });

  test('external verification links are safe and announced', async ({ page }) => {
    await page.goto('/about');
    const links = page.locator('#credentials a[target="_blank"]');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      await expect(links.nth(i)).toHaveAttribute('rel', /noopener/);
      await expect(links.nth(i)).toContainText(/opens in a new tab/i);
    }
  });
});
