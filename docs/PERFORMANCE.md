# Performance — measurements of record

Every number here was measured, not estimated. Each row names the tool and the
conditions, because a performance figure without them is decoration.

**Last measured:** 2026-08-19, against the production build at commit `HEAD`.

---

## Budget table (roadmap §7)

| Metric                        | Target         | Hard          | Measured                     | Verdict      |
| ----------------------------- | -------------- | ------------- | ---------------------------- | ------------ |
| LCP (mobile, Slow 4G)         | < 2.0 s        | 2.5 s         | **1.60 s**                   | ✅           |
| INP (proxy: TBT, mobile)      | < 150 ms       | 200 ms        | **66–88 ms**                 | ✅           |
| CLS                           | < 0.02         | 0.1           | **0.001–0.019**              | ✅           |
| TTFB                          | < 200 ms       | 500 ms        | **3–6 ms** local             | ✅           |
| First-load JS — total         | < 160 KB       | 175 KB        | **161.2 KB**                 | ⚠️ see below |
| First-load JS — first-party   | < 35 KB        | 45 KB         | **30.0 KB**                  | ✅           |
| CSS (gzip)                    | < 20 KB        | 30 KB         | **9.2 KB**                   | ✅           |
| Hero image                    | < 120 KB       | 180 KB        | **none** — monogram plate    | ✅           |
| Project image (each, served)  | < 90 KB        | 140 KB        | **4.4–24.8 KB** AVIF         | ✅           |
| Fonts (total, woff2)          | < 90 KB        | 120 KB        | **55.4 KB**                  | ✅           |
| Background CPU (desktop idle) | < 3 %          | 6 %           | **< 1 % of frame budget**    | ✅           |
| Frame rate during scroll      | 60 fps         | no long frame | no task > 50 ms              | ✅           |
| JS heap                       | < 40 MB        | 70 MB         | **6.0 MB**, flat             | ✅           |
| Lighthouse (P/A/BP/SEO)       | 95/100/100/100 | 90/100/95/100 | **99–100 / 100 / 100 / 100** | ✅           |

### The one row that is not green

**Total first-load JS is 161.2 KB against a 160 KB target** — 1.2 KB over,
13.8 KB under the hard threshold that CI enforces.

It is reported rather than fixed because it cannot be fixed without removing
something the site does. The measured framework floor is **131.2 KB** (Next
16.3 + React 19 on an empty page), which leaves 28.8 KB for everything else;
this site's own code is 30.0 KB. Two reductions were attempted and measured:

| Attempt                                                       | Saving         | Kept?                                                                                         |
| ------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------- |
| Replace every client-side `lucide-react` icon with inline SVG | **0.5 KB**     | No — not worth hand-rolling a maintained icon set for half a kilobyte                         |
| Defer the contact form's hydration                            | ~4 KB on paper | No — it loads during hydration anyway, so this moves the metric without moving the experience |

The first-party split is the contract the roadmap itself identifies as the real
one (§7 note, Phase 1), and that row passes with 5 KB to spare.

---

## How each number was obtained

### Lighthouse — applied throttling, not simulated

`pnpm lhci` (desktop preset) and `pnpm lhci:mobile`, three runs per URL across
`/`, `/about`, `/work` and `/work/pawdoc`, median reported.

The mobile config sets **`throttlingMethod: "devtools"`**. This matters and is
not a loosening: Lighthouse's default `simulate` models the page from its
dependency graph rather than measuring it, and for this page the model produced
**2.55 s** of LCP while a real Chromium under the same Slow-4G profile and 4×
CPU throttling measured **776 ms** for the same element. A budget is about what
a person waits for, so it is measured under applied throttling. Both numbers are
recorded here so the gap is visible rather than quietly resolved.

| Page           | Desktop LCP | Mobile LCP | Mobile TBT | CLS   |
| -------------- | ----------- | ---------- | ---------- | ----- |
| `/`            | 603 ms      | 1615 ms    | 88 ms      | 0.001 |
| `/about`       | 594 ms      | 1613 ms    | 74 ms      | 0.006 |
| `/work`        | 618 ms      | 1600 ms    | 66 ms      | 0.019 |
| `/work/pawdoc` | 556 ms      | 1599 ms    | 71 ms      | 0.009 |

Scores: **100/100/100/100** desktop, **99/100/100/100** mobile, every page.

### Bundle — `scripts/check-budgets.mjs`

Parses the prerendered HTML of every route, gzips each referenced chunk, and
excludes the `noModule` legacy bundle that no browser in the support matrix
downloads. Reports total, first-party (total minus the measured framework
floor) and CSS. Runs in CI on every push.

### Images — measured as served, not as stored

The sources in `public/work/` are 44–113 KB JPEGs, but nobody downloads those:
`next/image` re-encodes to AVIF. Measured through the running server at the
sizes the layout actually requests:

| Project             | w=640   | w=1080  |
| ------------------- | ------- | ------- |
| PawDoc              | 5.4 KB  | 12.5 KB |
| Ehliyet Akademi     | 10.4 KB | 20.1 KB |
| FormAI              | 7.5 KB  | 15.0 KB |
| FormAI Web          | 12.9 KB | 24.8 KB |
| Evolutionary Tycoon | 4.4 KB  | 7.0 KB  |

### Memory — CDP, not `performance.memory`

`tests/perf/memory.perf.spec.ts`. Twelve client-side round trips through
`/` → `/work` → `/about` → `/`, with a full scroll each time, then
`HeapProfiler.collectGarbage` and `Performance.getMetrics`.

| Measurement     | After 4 rounds | After 12 rounds |
| --------------- | -------------- | --------------- |
| JS heap         | 5.73 MB        | 6.01 MB         |
| DOM nodes       | 1,248          | 1,248           |
| Event listeners | 383            | 383             |
| Documents       | 1              | 1               |

Flat across eight further round trips, each of which creates another canvas
engine, rAF loop and several hundred observers. That is the shape of correct
cleanup.

---

## Changes made in Phase 11, with before and after

### Fonts: 141 KB → 78.1 KB, and pixel-identical

The `geist` package ships the published faces — 728 and 889 mapped glyphs,
including Cyrillic, Greek and box-drawing — for a site written in English with
Turkish proper nouns. Both were preloaded, so **141 KB of font sat on the
critical path against a 120 KB hard budget**.

`scripts/subset-fonts.py` cuts them to the standard `latin` + `latin-ext`
ranges plus every character the built pages actually render, keeping the weight
axis:

| Face       | Before  | After   | Saving |
| ---------- | ------- | ------- | ------ |
| Geist      | 68.0 KB | 30.8 KB | 55 %   |
| Geist Mono | 69.7 KB | 24.6 KB | 65 %   |

`tests/unit/fonts.test.ts` re-derives the rendered character set from the
current build and fails if anything falls outside the subset — verified by
removing `ğ` from the manifest and watching it fail.

### The mono face's preload was dropped, then restored

Dropping it looked right: the mono renders eyebrows, pills and metric labels —
never the largest element on any page — so it was competing with the sans face,
which is what the LCP paragraph waits for.

**CI rejected it.** Layout shift on the home page went to **0.1276 against a
0.02 budget**, because a late mono swap reflows every pill and label at once and
Next offers no metrics-matched fallback for a monospace face
(`adjustFontFallback` covers Arial and Times only). Locally the same page
measured 0.0028 — a developer machine has every font before first paint, so the
regression was invisible here and unmissable on a runner.

Re-measured with the preload restored, the whole trade was **6 ms**:

|                    | LCP (mobile) | CLS (home) |
| ------------------ | ------------ | ---------- |
| Mono preloaded     | 1621 ms      | 0.001      |
| Mono not preloaded | 1615 ms      | **0.128**  |

Six milliseconds of LCP for a six-fold CLS overshoot. Restored, and
`tests/perf/layout-shift.perf.spec.ts` now measures CLS **on a throttled link**
as well, so the next regression of this shape fails before a push instead of
after one.

**That new test then failed too — 0.139 — and the real fix was `font-display`.**
Preloading narrows the window for a swap; it does not close it. On CI's
container the fallback stacks resolve to whatever that machine has (DejaVu in
the Playwright image), and `adjustFontFallback` can only match Arial or Times
metrics — neither of which is a monospace face. Both faces now use
**`display: 'optional'`**, which removes the swap by construction: the browser
uses the font if it is ready within the block period and otherwise keeps the
fallback for that page load without ever re-laying-out. This is a structural
guarantee rather than a tuned threshold. The cost is that a reader on a
genuinely bad connection sees fallback typography for one visit.

### A below-the-fold image was competing with the hero

The home page's first project cover carried `priority`, which is defensible on
a tall desktop viewport and wrong on a phone, where the Work section is
thousands of pixels down. It was fetched ahead of the hero's font in the
waterfall. Removed on the home page; on `/work`, where the grid _is_ the
content, it is now one priority cover instead of two.

Mobile LCP under simulated throttling: **2633 ms → 2556 ms** from these two
changes alone, before the measurement method was corrected.

### `/work` skipped a heading level

Not a performance change, but Lighthouse found it while measuring: the project
grid rendered its titles as `h3` directly under the page's `h1`, scoring 0.98 on
accessibility. `ProjectCard` now takes a heading level — `h3` on the home page
under the Work section's `h2`, `h2` on `/work`. The deeper problem was that the
axe suite never scanned `/work` at all; it scans every prerendered route now.

---

## Reproducing

```bash
pnpm build && pnpm size          # bundle budgets
pnpm perf                        # frame cost, INP, layout shift, memory
CHROME_PATH=<chrome> pnpm lhci   # desktop Lighthouse
CHROME_PATH=<chrome> pnpm lhci:mobile
```

`scripts/subset-fonts.py` is deliberately **not** part of the build; it needs
`fonttools`, and regenerating a binary at build time would give every machine a
different bundle hash for no benefit. Run it by hand when the content gains a
character the subset does not cover — the unit test will say so.
