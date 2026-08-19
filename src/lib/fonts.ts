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
 * **`display: 'optional'`, not `'swap'`.**
 *
 * With `swap` the browser paints in a fallback and then swaps, and every swap
 * reflows the text it touches. On a developer machine the fonts are there
 * before first paint and the shift is invisible; on CI's container it measured
 * **CLS 0.139 against a 0.02 budget** on a throttled link. The fallback stacks
 * name `ui-sans-serif` and `ui-monospace`, which resolve to whatever that
 * machine happens to have — DejaVu in the Playwright image — and Next's
 * `adjustFontFallback` can only match Arial or Times metrics, neither of which
 * is a monospace face.
 *
 * `optional` removes the swap entirely: the browser uses the font if it is
 * ready within the block period and otherwise keeps the fallback for that page
 * load, never re-laying-out. Both faces are preloaded, so in practice they are
 * used; the cost is that a reader on a genuinely bad connection sees fallback
 * typography for one visit, which is a better trade than the page moving under
 * them.
 *
 * `geist` stays in **devDependencies**: nothing imports it at runtime any
 * more, but `scripts/subset-fonts.py` reads the published faces out of
 * `node_modules/geist` to regenerate the subsets.
 */
const geistSans = localFont({
  src: '../assets/fonts/Geist-Variable.subset.woff2',
  variable: '--font-geist-sans',
  display: 'optional',
  weight: '100 900',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
  preload: true,
});

/**
 * The mono face **is** preloaded, after an experiment that was reverted.
 *
 * Phase 11 dropped its preload on the reasoning that it renders eyebrows,
 * pills and metric labels — never the largest element — so it was competing
 * with the sans face for Slow-4G bandwidth. The LCP gain was real but small,
 * and it came out of the wrong budget: CI measured **CLS 0.1276 against a
 * 0.02 limit** on the home page, because a late mono swap reflows every pill
 * and label at once, and Next offers no metrics-matched fallback for a
 * monospace face (`adjustFontFallback` covers Arial and Times only).
 *
 * The trade was 0.4 s of LCP headroom — measured LCP is 1.60 s against a 2.0 s
 * target — for a six-fold CLS overshoot. Preloaded again.
 */
const geistMono = localFont({
  src: '../assets/fonts/GeistMono-Variable.subset.woff2',
  variable: '--font-geist-mono',
  display: 'optional',
  weight: '100 900',
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
  preload: true,
});

export const fontVariables = `${geistSans.variable} ${geistMono.variable}`;
