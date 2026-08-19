import { expect, test } from '@playwright/test';

const form = 'form:has(textarea[name="message"])';

test.describe('contact form', () => {
  test('every field has a visible label, not a placeholder pretending to be one', async ({
    page,
  }) => {
    // The reference labels its contact inputs with placeholders only, which
    // vanish the moment someone types and are not names to a screen reader.
    await page.goto('/#contact');
    for (const name of ['Your name', 'Email', 'Message']) {
      const control = page.getByLabel(new RegExp(`^${name}`, 'i'));
      await expect(control).toBeVisible();
      const id = await control.getAttribute('id');
      await expect(page.locator(`label[for="${id}"]`)).toBeVisible();
    }
  });

  test('reports what is wrong, per field, and keeps what was typed', async ({ page }) => {
    // Also pins the order of the server's checks. This submission arrives well
    // inside the three-second "nobody types that fast" window, and an earlier
    // version ran that heuristic before validation — so clicking Send early to
    // find out what was required answered "your message is on its way", threw
    // the message away and cleared the form. A silent false success is the
    // worst thing this form can do.
    await page.goto('/#contact');
    await page.getByLabel(/^Your name/i).fill('A');
    await page.getByLabel(/^Email/i).fill('not-an-email');
    await page.getByLabel(/^Message/i).fill('too short');
    await page.getByRole('button', { name: /send message/i }).click();

    const summary = page.locator(`${form} [role="status"]`);
    await expect(summary).toContainText(/check the highlighted fields/i);

    // Each control is marked invalid and describes its own problem.
    for (const label of [/^Your name/i, /^Email/i, /^Message/i]) {
      const control = page.getByLabel(label);
      await expect(control).toHaveAttribute('aria-invalid', 'true');
      const describedBy = (await control.getAttribute('aria-describedby')) ?? '';
      const ids = describedBy.split(' ').filter(Boolean);
      expect(ids.length).toBeGreaterThan(0);
      const text = (await Promise.all(ids.map((id) => page.locator(`#${id}`).textContent()))).join(
        ' ',
      );
      expect(text.trim().length).toBeGreaterThan(0);
    }

    // Nothing the visitor typed was thrown away.
    await expect(page.getByLabel(/^Email/i)).toHaveValue('not-an-email');
    await expect(page.getByLabel(/^Message/i)).toHaveValue('too short');
  });

  test('the honeypot is unreachable by sight, by tab and by screen reader', async ({ page }) => {
    await page.goto('/#contact');
    const honeypot = page.locator('input[name="company"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toHaveAttribute('tabindex', '-1');
    // Read-only, so the browser's own autofill cannot trip it. An autofilled
    // honeypot would silently discard a real enquiry.
    await expect(honeypot).toHaveAttribute('readonly', '');

    const facts = await honeypot.evaluate((el) => {
      const box = el.getBoundingClientRect();
      return {
        ariaHidden: el.closest('[aria-hidden="true"]') !== null,
        opacity: Number(getComputedStyle(el.parentElement!).opacity),
        clipped: getComputedStyle(el.parentElement!).overflow === 'hidden',
        area: box.width * box.height,
      };
    });
    expect(facts.ariaHidden, 'the honeypot is exposed to assistive technology').toBe(true);
    expect(facts.opacity, 'the honeypot is visible').toBe(0);
    expect(facts.area, 'the honeypot occupies real space').toBeLessThan(16);
    expect(facts.clipped).toBe(true);

    // And it is not reachable by keyboard: tabbing from the last real field
    // never lands on it.
    await page.getByLabel(/^Message/i).focus();
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('name'));
      expect(focused).not.toBe('company');
    }
  });

  test('a bot filling the honeypot is thanked, not told it was caught', async ({ page }) => {
    await page.goto('/#contact');
    await page.getByLabel(/^Your name/i).fill('Ada Lovelace');
    await page.getByLabel(/^Email/i).fill('ada@example.com');
    await page
      .getByLabel(/^Message/i)
      .fill('A perfectly ordinary enquiry that should never be delivered.');
    await page.locator('input[name="company"]').evaluate((el: HTMLInputElement) => {
      el.value = 'Acme Corp';
    });

    await page.getByRole('button', { name: /send message/i }).click();
    // Telling a bot it was detected is free information for whoever wrote it.
    await expect(page.locator(`${form} [role="status"]`)).toContainText(/on its way/i);
  });

  test('an instant submission is discarded, because nobody types that fast', async ({ page }) => {
    await page.goto('/#contact');
    // Fill through the DOM so no human-speed delay is introduced.
    await page.locator(form).evaluate((el: HTMLFormElement) => {
      (el.elements.namedItem('name') as HTMLInputElement).value = 'Ada Lovelace';
      (el.elements.namedItem('email') as HTMLInputElement).value = 'ada@example.com';
      (el.elements.namedItem('message') as HTMLTextAreaElement).value =
        'An enquiry submitted implausibly quickly after the form appeared.';
      (el.elements.namedItem('renderedAt') as HTMLInputElement).value = String(Date.now());
    });
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.locator(`${form} [role="status"]`)).toContainText(/on its way/i);
  });

  test('when delivery is unavailable it says so and hands over a working mailto', async ({
    page,
  }) => {
    // No provider key is configured in this environment, which is exactly the
    // path that must not lose the visitor's message.
    await page.goto('/#contact');
    await page.getByLabel(/^Your name/i).fill('Ada Lovelace');
    await page.getByLabel(/^Email/i).fill('ada@example.com');
    const message = 'I would like to talk about constraining a model with a deterministic core.';
    await page.getByLabel(/^Message/i).fill(message);

    // Outlast the minimum fill time rather than defeating it.
    await page.waitForTimeout(3_200);
    await page.getByRole('button', { name: /send message/i }).click();

    const status = page.locator(`${form} [role="status"]`);
    await expect(status).toContainText(/inbox/i, { timeout: 15_000 });

    const fallback = status.getByRole('link', { name: /mail app/i });
    await expect(fallback).toBeVisible();
    const href = (await fallback.getAttribute('href')) ?? '';
    expect(href.startsWith('mailto:')).toBe(true);
    expect(decodeURIComponent(href)).toContain(message);
  });

  test('announces its result through a live region that already exists', async ({ page }) => {
    // A live region inserted at the same moment as its text is often not
    // announced at all.
    await page.goto('/#contact');
    await expect(page.locator(`${form} [role="status"][aria-live="polite"]`)).toHaveCount(1);
  });

  test('submits without client JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/#contact');

    await expect(page.locator(`${form} button[type="submit"]`)).toBeVisible();
    await expect(page.getByLabel(/^Message/i)).toBeVisible();
    // A real form that posts, not a click handler. React enhances a Server
    // Action by posting to the current URL with the action's id in a hidden
    // field, so `action` is empty by design and `method` plus that field are
    // what prove the no-JS path exists.
    await expect(page.locator(form)).toHaveAttribute('method', /post/i);
    await expect(page.locator(`${form} input[name^="$ACTION"]`).first()).toBeAttached();
    await context.close();
  });
});

test.describe('contact details', () => {
  test('offers the address as a link and as a labelled copy control', async ({ page }) => {
    await page.goto('/#contact');

    await expect(page.getByRole('link', { name: 'emre30283@gmail.com' }).first()).toHaveAttribute(
      'href',
      'mailto:emre30283@gmail.com',
    );

    // The button's only output is invisible, so its accessible name is the
    // whole of its interface.
    await expect(page.getByRole('button', { name: /copy email address/i })).toBeVisible();
  });

  test('copying puts the address on the clipboard and says so', async ({
    page,
    context,
    browserName,
  }) => {
    // Chromium only: Playwright cannot grant `clipboard-read` in Firefox or
    // WebKit, and asserting the *label* instead of the clipboard would pass
    // even if nothing were copied. Better one browser proving the real thing
    // than three proving a proxy for it.
    test.skip(browserName !== 'chromium', 'clipboard permissions are Chromium-only');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/#contact');

    await page.getByRole('button', { name: /copy email address/i }).click();
    await expect(page.getByText(/copied to the clipboard/i)).toBeAttached();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('emre30283@gmail.com');
  });

  test('states no telephone number, because none is published', async ({ page }) => {
    // The reference puts a phone number in this position. Inventing one is the
    // exact failure this build refuses.
    await page.goto('/#contact');
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  });
});

test.describe('proof, in place of testimonials', () => {
  test('says there are none rather than quietly omitting the section', async ({ page }) => {
    await page.goto('/#proof');
    await expect(page.locator('#proof')).toContainText(/no testimonials/i);
  });

  test('every card links to somewhere the claim can be checked', async ({ page }) => {
    await page.goto('/#proof');
    const cards = page.locator('#proof li');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < count; i += 1) {
      const link = cards.nth(i).getByRole('link');
      await expect(link).toHaveAttribute('href', /^https:\/\//);
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
  });

  test('publishes when the links were last checked', async ({ page }) => {
    await page.goto('/#proof');
    await expect(page.locator('#proof time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/);
  });
});
