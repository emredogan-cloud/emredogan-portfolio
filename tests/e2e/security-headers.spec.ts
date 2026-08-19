import { expect, test } from '@playwright/test';

/**
 * Security headers, asserted on the response rather than read from the config.
 *
 * A header defined in `next.config.ts` and a header a browser receives are two
 * different claims — a platform rewrite, a middleware, or a `headers()` match
 * that does not cover a route can separate them.
 */
const EXPECTED: Record<string, RegExp> = {
  'content-security-policy': /default-src 'self'/,
  'x-content-type-options': /^nosniff$/,
  'x-frame-options': /^DENY$/,
  'referrer-policy': /^strict-origin-when-cross-origin$/,
  'permissions-policy': /camera=\(\)/,
  'strict-transport-security': /max-age=\d+/,
};

test.describe('security headers', () => {
  for (const path of ['/', '/about', '/work', '/work/pawdoc'] as const) {
    test(`${path} carries every header`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      const headers = response!.headers();

      for (const [name, pattern] of Object.entries(EXPECTED)) {
        expect(headers[name], `${path} is missing ${name}`).toBeDefined();
        expect(headers[name], `${path} has a wrong ${name}`).toMatch(pattern);
      }
    });
  }

  test('the policy is enforced, not merely reported', async ({ page }) => {
    // Report-only is how the policy was verified before launch; shipping it
    // that way permanently would be a policy that stops nothing.
    const response = await page.goto('/');
    const headers = response!.headers();
    expect(headers['content-security-policy']).toBeDefined();
    expect(headers['content-security-policy-report-only']).toBeUndefined();
  });

  test('the policy forbids remote script, framing and object embedding', async ({ page }) => {
    const response = await page.goto('/');
    const policy = response!.headers()['content-security-policy'] ?? '';

    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("form-action 'self'");

    // No remote origin may serve script. `'unsafe-inline'` is present and
    // documented in next.config.ts; a *host* would not be.
    const scriptSrc = /script-src ([^;]+)/.exec(policy)?.[1] ?? '';
    expect(scriptSrc).not.toMatch(/https?:\/\//);
  });

  test('adds upgrade-insecure-requests only on an HTTPS request', async ({ page }) => {
    /*
     * Unconditionally, this directive broke the site on WebKit. Chromium and
     * Firefox exempt `localhost` from the upgrade; WebKit does not, so against
     * the plain-HTTP test server every stylesheet and script was requested over
     * `https://127.0.0.1:3100` and failed — no CSS, no hydration, no canvas, no
     * client-side navigation. CI reported it as ten unrelated background
     * failures and a navigation timeout, which is what a broken document looks
     * like from the outside.
     */
    const plain = await page.goto('/');
    expect(plain!.headers()['content-security-policy']).not.toContain('upgrade-insecure-requests');

    const secure = await page.request.get('/', {
      headers: { 'x-forwarded-proto': 'https' },
    });
    expect(secure.headers()['content-security-policy']).toContain('upgrade-insecure-requests');

    // And the rest of the headers survive on the HTTPS path — Next applies
    // every matching rule and the last one wins per key, so a second rule
    // silently overwriting the first is the failure mode here.
    expect(secure.headers()['x-frame-options']).toBe('DENY');
    expect(secure.headers()['strict-transport-security']).toMatch(/max-age=\d+/);
  });

  test('does not advertise the framework', async ({ page }) => {
    const response = await page.goto('/');
    expect(response!.headers()['x-powered-by']).toBeUndefined();
  });

  test('no page trips its own policy', async ({ page }) => {
    // The check that matters: an enforced policy that blocks the site's own
    // assets is worse than none, because it fails silently in the console.
    const refusals: string[] = [];
    page.on('console', (message) => {
      if (/Refused to/i.test(message.text())) refusals.push(message.text().slice(0, 160));
    });

    for (const path of ['/', '/about', '/work', '/work/pawdoc']) {
      await page.goto(path);
      await page.evaluate(async () => {
        const step = window.innerHeight * 0.8;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 40));
        }
      });
    }

    expect(refusals, refusals.join(' | ')).toEqual([]);
  });
});

test.describe('canonical host', () => {
  test('www redirects to the apex, permanently', async ({ request }) => {
    // Only meaningful against the real domain; the test server has no host to
    // match. Skipped rather than silently passing, so the skip is visible.
    test.skip(
      !process.env['PLAYWRIGHT_BASE_URL']?.includes('emredogan.work'),
      'runs against the production domain only',
    );

    const response = await request.get('https://www.emredogan.work/about', {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(308);
    expect(response.headers()['location']).toBe('https://emredogan.work/about');
  });
});
