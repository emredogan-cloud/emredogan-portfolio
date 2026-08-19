import { expect, test } from '@playwright/test';

const FEATURED = ['pawdoc', 'ehliyet-akademi', 'formai', 'evolutionary-tycoon'];
const ALL = [...FEATURED, 'formai-web', 'lumina', 'nova', 'living-library'];

test.describe('work section on the home page', () => {
  test('shows the four featured projects and links onward', async ({ page }) => {
    await page.goto('/#work');
    const cards = page.locator('#work li article');
    await expect(cards).toHaveCount(4);
    await expect(page.getByRole('link', { name: /all 8 projects/i })).toBeVisible();
  });

  test('each card is one link, not three overlapping ones', async ({ page }) => {
    await page.goto('/#work');
    const card = page.locator('#work li article').first();

    // The reference wraps the whole card in an anchor and nests Live and Code
    // links inside it, which is invalid HTML and announces three overlapping
    // links for one card. The stretched-link pattern gives one case-study link
    // plus any external links as siblings, never nested.
    const caseStudyLinks = card.locator(':is(h2, h3) a');
    await expect(caseStudyLinks).toHaveCount(1);
    const nested = await card.locator('a a').count();
    expect(nested, 'links must not be nested').toBe(0);
  });

  test('the whole card surface reaches the case study', async ({ page }) => {
    await page.goto('/#work');
    const card = page.locator('#work li article').first();

    // Must be on screen: `elementFromPoint` only resolves coordinates inside
    // the viewport and returns null for anything below it.
    await card.scrollIntoViewIfNeeded();

    // Asserted geometrically rather than by clicking the cover.
    //
    // The stretched link's `::before` deliberately covers the card and swallows
    // the pointer, so Playwright's actionability check on the image underneath
    // waits forever — the overlay working correctly is what makes that click
    // untestable. So: sample points across the card and confirm the element at
    // each one is the case-study anchor.
    const covered = await card.evaluate((element) => {
      const anchor = element.querySelector(':is(h2, h3) a');
      const box = element.getBoundingClientRect();
      const samples: [number, number][] = [
        [0.5, 0.2], // over the cover
        [0.15, 0.55], // over the title row
        [0.85, 0.55],
        [0.5, 0.72], // over the tagline
      ];
      return samples.map(([fx, fy]) => {
        const hit = document.elementFromPoint(box.x + box.width * fx, box.y + box.height * fy);
        if (hit === null) return 'off-screen';
        return hit === anchor || anchor?.contains(hit) === true;
      });
    });

    expect(covered, 'the stretched link does not cover the card').toEqual([true, true, true, true]);

    // And the link itself navigates.
    await card.locator(':is(h2, h3) a').click();
    await expect(page).toHaveURL(/\/work\/[a-z-]+$/);
  });
});

test.describe('work index', () => {
  test('lists every project', async ({ page }) => {
    await page.goto('/work');
    await expect(page.locator('article')).toHaveCount(ALL.length);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('built');
  });

  test('publishes ItemList structured data in document order', async ({ page }) => {
    await page.goto('/work');
    // Targeted by id: the layout also emits a Person/WebSite block, and
    // `.last()` picked that one because the layout's script follows children.
    const raw = await page.locator('script#ld-itemlist').textContent();
    const parsed = JSON.parse(raw ?? '{}');
    expect(parsed['@type']).toBe('ItemList');
    expect(parsed.itemListElement).toHaveLength(ALL.length);
    expect(parsed.itemListElement[0].name).toBe('PawDoc');
  });

  test('marks Work as the current nav item, not Home', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/work');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'true');
    await expect(nav.locator('[aria-current="true"]')).toHaveCount(1);
  });
});

test.describe('case studies', () => {
  for (const slug of ALL) {
    test(`${slug} renders with all four beats and a status`, async ({ page }) => {
      const response = await page.goto(`/work/${slug}`);
      expect(response?.status()).toBe(200);

      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      for (const beat of [
        'The problem',
        'The architecture',
        'The interesting decision',
        'What it does now',
      ]) {
        await expect(page.getByRole('heading', { name: beat })).toBeVisible();
      }
      await expect(page.getByText(/^The short version$/)).toBeVisible();
    });
  }

  test('publishes CreativeWork and BreadcrumbList structured data', async ({ page }) => {
    await page.goto('/work/pawdoc');
    const raw = await page.locator('script#ld-project').textContent();
    const parsed = JSON.parse(raw ?? '{}');
    const types = parsed['@graph'].map((node: { '@type': string }) => node['@type']);
    expect(types).toContain('CreativeWork');
    expect(types).toContain('BreadcrumbList');
  });

  test('marks Work as the current nav item on a case study', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/work/pawdoc');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'true');
  });

  test('external links open safely in a new tab', async ({ page }) => {
    await page.goto('/work/ehliyet-akademi');
    const link = page.getByRole('link', { name: /ehliyetegitim\.com/ }).first();
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  });

  test('a project with nothing to link says so instead of linking a 404', async ({ page }) => {
    // Lumina's repository is private; NOVA was never shipped.
    for (const slug of ['lumina', 'nova']) {
      await page.goto(`/work/${slug}`);
      await expect(page.getByText(/nothing to link/i)).toBeVisible();
      await expect(page.locator('main a[target="_blank"]')).toHaveCount(0);
    }
  });

  test('a project with no capture says so rather than showing a stand-in', async ({ page }) => {
    await page.goto('/work/nova');
    await expect(page.getByText(/no public capture/i).first()).toBeVisible();
    await expect(page.locator('main img')).toHaveCount(0);
  });

  test('every case study offers the next one', async ({ page }) => {
    await page.goto('/work/living-library');
    const next = page.getByRole('navigation', { name: 'More work' }).getByRole('link');
    await expect(next).toHaveCount(1);
    // The last project wraps back to the first.
    await expect(next).toHaveAttribute('href', '/work/pawdoc');
  });

  test('an unknown slug is a real 404, not an empty page', async ({ page }) => {
    const response = await page.goto('/work/not-a-real-project');
    expect(response?.status()).toBe(404);
  });
});
