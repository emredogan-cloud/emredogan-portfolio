# Phase 10 — Responsive and Mobile Experience · COMPLETE

**Date:** 2026-08-19

---

## What was implemented

The instruction for this phase was _"rethink each section for mobile, do not just
add an `sm:` prefix"_, and _"prevent horizontal overflow with an automated
test"_. Both were taken literally.

### Measured first, redesigned second

A new `tests/e2e/responsive.spec.ts` checks four pages at **eleven widths**
(320 → 2560) for horizontal overflow, every standalone control against a 44 px
touch target at two widths, and three device emulations (iPhone 15, Pixel 7,
iPad Mini) for layout, navigation and hero composition. Twenty-five tests. They
were written before any fix, and they found the work.

### The hero statistics are three rows on a phone, not three columns

At 360 px the three-column layout gave each statistic about 110 px, which
wrapped its method note into a nine-line ribbon of four-word lines — text
technically present and practically unreadable. On a narrow screen the number
and its label now sit on the left and the method fills the rest of the width,
with a hairline between each. From `sm` up it is the original three columns.

This is the roadmap's §10 rule — _"statistics: three rows on mobile, not three
columns"_ — and it is the one place where the desktop layout genuinely could not
be shrunk.

### Already correct, and verified rather than assumed

Several §10 requirements were satisfied by earlier phases; they now have tests
rather than assurances: `dvh` throughout (no `100vh` anywhere), the mobile sheet
menu, the background quality profile stepping down on a coarse viewport, and
the `↗` affordances being permanently visible rather than hover-only.

---

## Defects found and fixed

### 1. Horizontal overflow at 320 px — a grid item, not a grid track

The document scrolled sideways by 30 px on the home page. The culprit was the
contact section's info column: a grid item's automatic minimum size is its
content's min-content width, and the email address is `truncate`d — which means
`white-space: nowrap`, which means its min-content is the _entire address_. The
column demanded 330 px inside a 280 px area.

`minmax(0, …)` on the template fixes the **track**; the **item** has to be told
separately with `min-w-0`. Now clean at every width from 320 up.

### 2. Twenty-eight controls under the touch-target floor

Header brand and CTA, the marquee's pause control, project-card repository
links, footer navigation, the contact email link, the copy control and the
social links were all between 18 px and 37 px tall. All now clear 44×44.

Two required more thought than adding padding:

- **The footer navigation** would have become a very tall column at 44 px per
  row plus a 12 px gap. The gap dropped to 4 px and the height comes from each
  link's own padding, so the rows touch and every one of them is a full target.
- **`Work` was 39 px wide** — tall enough, too narrow. `min-w-11` extends the
  box invisibly to the right without changing how the column looks.

The test exempts links inside a paragraph (WCAG 2.5.8 allows it) and measures a
stretched link by the card it covers rather than by its own small box, because
the card is what is under the thumb.

### 3. A visual baseline that could swallow the entire navigation bar

`768px › contact` failed intermittently. The cause was not timing: the header is
`position: fixed`, so in a region screenshot it lands wherever the viewport
happened to be when Playwright scrolled the element into view — a different
height inside the same region from one run to the next.

Region baselines now hide the fixed overlays. The header is not going untested;
it has its own baselines (`nav-top`, `nav-island`) and appears in the viewport
composites, which is where it belongs.

**`visibility: hidden` was not enough, and the reason is worth keeping.** The
island's inner panel carries `transition-all`, and `all` includes `visibility`,
so hiding it _starts a 350 ms transition_ and the element is still painted when
the screenshot is taken. `display: none` has no such window.

### 4. A 1 % pixel tolerance that hid a stale baseline

While fixing the above: baselines still containing the old header kept
**passing** against screenshots that no longer had one. On a 768×1400 dark
image, `maxDiffPixelRatio: 0.01` is eleven thousand pixels, and only the
header's text and its one bright button cleared the per-pixel threshold — the
translucent dark panel over a dark page did not. A tolerance that can absorb a
whole UI element is not a tolerance, it is a hole. Now **0.003**, and the suite
passed three consecutive full runs at the tighter setting.

A second lesson, recorded because it cost time: `--update-snapshots` in
Playwright 1.62 only writes **missing** baselines. Forcing a rewrite needs
`--update-snapshots=all`.

---

## Verification

| Gate                  | Result                                                  |
| --------------------- | ------------------------------------------------------- |
| `pnpm lint`           | clean                                                   |
| `pnpm typecheck`      | clean                                                   |
| `pnpm knip`           | clean                                                   |
| Unit                  | 234 passing                                             |
| E2E + a11y (Chromium) | **185 passing** (+37 this phase)                        |
| E2E + a11y (Firefox)  | 132 passing, 1 skipped                                  |
| Overflow              | 4 pages × 11 widths, 320 → 2560 — clean                 |
| Touch targets         | every standalone control ≥ 44×44 at 390 and 768         |
| Devices               | iPhone 15, Pixel 7, iPad Mini — layout, nav, hero       |
| Visual                | 43 baselines, 12 new (hero / work / contact × 4 widths) |
| Perf                  | 8 passing                                               |
| Console               | clean                                                   |

### Budgets

| Budget              | Measured | Limit  |
| ------------------- | -------- | ------ |
| Total first-load JS | 161.1 KB | 175 KB |
| First-party JS      | 29.9 KB  | 45 KB  |
| CSS                 | 9.2 KB   | 30 KB  |

Phase 10 added no JavaScript. Every change was layout.

---

## Limitations, stated

1. **No physical handset was used.** The roadmap asks for at least one Android
   and one iOS device. What ran is Playwright device emulation — real viewport,
   device-pixel-ratio, touch flags and user agent, on three engines in CI — plus
   Chrome on the desktop. Emulation does not reproduce touch feel, a real GPU,
   or iOS Safari's address-bar behaviour. **This is stated rather than implied,
   and it remains open.**
2. **Visual baselines are Chromium-only**, unchanged from Phase 8's reasoning.
3. **The 44 px floor is stricter than WCAG 2.2 AA**, which sets 24×24 in
   success criterion 2.5.8. The roadmap chose 44; the test enforces 44.
