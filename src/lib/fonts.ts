import localFont from 'next/font/local';

/**
 * Self-hosted variable faces, subset to what this site can render.
 *
 * **Not `geist/font`.** That package ships the full published faces — 728 and
 * 889 mapped glyphs, including Cyrillic, Greek and box-drawing — for a site
 * written in English with Turkish proper nouns. Both are preloaded, so the
 * critical path carried **141 KB of font against a 120 KB budget**, and more
 * than half of it was for scripts that never appear.
 *
 * `scripts/subset-fonts.py` cuts them to the standard `latin` + `latin-ext`
 * ranges plus every character the built pages actually render, keeping the
 * weight axis intact: **137.7 KB → 55.4 KB, a 60 % reduction** with no visible
 * change. The subsets are committed rather than generated during the build,
 * because regenerating a binary at build time gives every machine a different
 * bundle hash for no benefit.
 *
 * Two things keep this honest: `tests/unit/fonts.test.ts` re-derives the
 * rendered character set from the current build and fails if anything falls
 * outside the subset, and `tests/e2e/typography.spec.ts` measures the Turkish
 * glyphs (ı İ ş ğ ç ö ü) in a real browser.
 *
 * `display: 'swap'` with `adjustFontFallback` left on: the fallback metrics
 * Next generates are what keep the swap from shifting layout.
 *
 * `geist` stays in **devDependencies**: nothing imports it at runtime any
 * more, but `scripts/subset-fonts.py` reads the published faces out of
 * `node_modules/geist` to regenerate the subsets.
 */
const geistSans = localFont({
  src: '../assets/fonts/Geist-Variable.subset.woff2',
  variable: '--font-geist-sans',
  display: 'swap',
  weight: '100 900',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
  preload: true,
});

/**
 * The mono face is **not** preloaded.
 *
 * It renders eyebrows, pills and metric labels — never the largest element on
 * any page. Preloading both faces put 55 KB in front of the paint on a Slow 4G
 * connection, and the two competed: the sans face is what the LCP paragraph
 * waits for. Discovered through CSS instead, the mono arrives a moment later
 * and swaps in on small text, which is the right place to spend that delay.
 */
const geistMono = localFont({
  src: '../assets/fonts/GeistMono-Variable.subset.woff2',
  variable: '--font-geist-mono',
  display: 'swap',
  weight: '100 900',
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
  preload: false,
});

export const fontVariables = `${geistSans.variable} ${geistMono.variable}`;
