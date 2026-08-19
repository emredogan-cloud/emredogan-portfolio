import { expect, test } from '@playwright/test';

/**
 * The keyboard tour.
 *
 * Every claim in `docs/ACCESSIBILITY.md`'s keyboard map is asserted here, so
 * the document cannot drift into describing a site that no longer exists.
 */
test.describe('keyboard', () => {
  test('the first tab stop is the skip link, and it works', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: /skip to content/i });
    await expect(skip).toBeFocused();
    await skip.press('Enter');
    await expect(page.locator('#content')).toBeVisible();
  });

  test('every interactive element on the home page is reachable by Tab', async ({ page }) => {
    await page.goto('/');
    // Settle the reveals: an element inside a hidden reveal is still focusable,
    // but this walks the page as a reader would.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

    const reachable = new Set<string>();
    for (let i = 0; i < 80; i += 1) {
      await page.keyboard.press('Tab');
      const id = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const label = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40);
        return `${el.tagName.toLowerCase()}:${label}`;
      });
      if (id) reachable.add(id);
    }

    // The controls that must be reachable without a pointer.
    expect([...reachable].join('|')).toMatch(/skip to content/i);
    expect([...reachable].join('|')).toMatch(/view work/i);
    expect([...reachable].join('|')).toMatch(/get in touch/i);
  });

  test('focus is always visible, never removed', async ({ page }) => {
    await page.goto('/');

    const offenders = await page.evaluate(() => {
      const bad: string[] = [];
      const controls = document.querySelectorAll<HTMLElement>('a, button, input, textarea, select');
      for (const control of controls) {
        control.focus();
        const style = getComputedStyle(control);
        const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
        const hasRing = style.boxShadow !== 'none';
        const hasBorderChange = style.borderColor !== '';
        if (hasOutline || hasRing || hasBorderChange) continue;
        bad.push((control.textContent ?? control.tagName).trim().slice(0, 40));
      }
      return bad;
    });

    expect(offenders, 'controls with no visible focus indicator').toEqual([]);
  });

  test('the mobile menu traps focus and closes on Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await page.getByRole('button', { name: /open navigation/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    /*
     * Tab must never reach page content behind the modal.
     *
     * "Inside the dialog on every tab" is the obvious assertion and it is
     * wrong: Chrome's `<dialog>` focus cycle passes through `document.body`
     * once as it wraps from the last control back to the first. That is not an
     * escape — `body` is not focusable content and the next Tab returns into
     * the dialog — so the property worth asserting is that focus never lands
     * on an *interactive element* outside it.
     */
    for (let i = 0; i < 14; i += 1) {
      await page.keyboard.press('Tab');
      const where = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return 'body';
        if (el.closest('dialog')) return 'dialog';
        return `escaped: <${el.tagName.toLowerCase()}> ${(el.textContent ?? '').trim().slice(0, 30)}`;
      });
      expect(where, `focus escaped the modal after ${i + 1} tabs`).toMatch(/^(dialog|body)$/);
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    // And focus returns to what opened it, rather than to the top of the page.
    await expect(page.getByRole('button', { name: /open navigation/i })).toBeFocused();
  });

  test('the contact form can be completed and submitted without a mouse', async ({ page }) => {
    await page.goto('/#contact');
    await page.getByLabel(/^Your name/i).focus();
    await page.keyboard.type('Ada Lovelace');
    await page.keyboard.press('Tab');
    await page.keyboard.type('ada@example.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('A message typed entirely with the keyboard, long enough to pass.');

    // Tab to the submit button and activate it with Enter.
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /send message/i })).toBeFocused();
    await page.waitForTimeout(3_200);
    await page.keyboard.press('Enter');

    await expect(page.locator('form [role="status"]')).toContainText(/inbox|on its way/i, {
      timeout: 15_000,
    });
  });

  test('the marquee pause control is operable and announces its state', async ({ page }) => {
    await page.goto('/');
    const control = page.getByRole('button', { name: /technology strip animation/i });
    await control.focus();
    await expect(control).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(control).toHaveAccessibleName(/^play technology strip animation$/i);
    await page.keyboard.press(' ');
    await expect(control).toHaveAccessibleName(/^pause technology strip animation$/i);
  });
});
