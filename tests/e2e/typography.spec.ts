import { expect, test } from '@playwright/test';

/**
 * Geist advertises Latin Extended coverage, which should include the Turkish
 * glyphs in the founder's own name. "Should" is not evidence, so this measures
 * it: a glyph that is missing from the face gets substituted by a fallback
 * font, and the substituted advance width almost never matches. Comparing a
 * Turkish-glyph string against its ASCII twin catches that substitution.
 */
test('renders Turkish glyphs from the loaded face, not a fallback', async ({ page }) => {
  await page.goto('/');

  const result = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.cssText =
      'position:absolute;visibility:hidden;white-space:pre;font-size:120px;font-family:var(--font-geist-sans)';
    document.body.appendChild(probe);

    const measure = (text: string) => {
      probe.textContent = text;
      return probe.getBoundingClientRect().width;
    };

    // If any of these glyphs were missing, the browser would fall back for the
    // whole run and the notdef/fallback metrics would diverge from the control.
    const turkish = measure('Doğanışçö');
    const control = measure('Doganisco');
    const resolved = getComputedStyle(probe).fontFamily;

    probe.remove();
    return { turkish, control, resolved };
  });

  // The family name comes from `next/font/local`, which derives it from the
  // export name rather than the file — so it is `geistSans`, not `Geist`, and
  // asserting the literal published name broke when Phase 11 swapped the
  // package import for a local subset. What matters is that the *first* family
  // is ours and not a system fallback.
  const [primary] = result.resolved.split(',');
  expect(primary?.trim(), 'text fell back to a system font').toMatch(/geist/i);
  expect(result.turkish).toBeGreaterThan(0);
  // Diacritics change the advance slightly; a font substitution changes it a lot.
  const ratio = result.turkish / result.control;
  expect(ratio).toBeGreaterThan(0.9);
  expect(ratio).toBeLessThan(1.15);
});
