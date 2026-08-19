# Phase 12 — Accessibility and SEO Hardening · COMPLETE

**Date:** 2026-08-19

---

## What was done

Two documents of record — **`docs/ACCESSIBILITY.md`** and **`docs/SEO.md`** —
and the tests that keep them true. Three real defects were found and fixed, two
of which nobody developing on a normal display would ever have seen.

---

## Defects found and fixed

### 1. Windows High Contrast was unreadable, and one engine could not show it

Under `forced-colors: active` the browser forces the page background to the
system canvas while the author's text colours survive. Body text measured
**1.58:1** — present, and unreadable.

The design is token-driven, so the fix starts as one `@media (forced-colors:
active)` block remapping the tokens to `Canvas`, `CanvasText`, `LinkText`,
`ButtonFace` and `Highlight`, with the decorative canvas removed and filled
buttons given a `ButtonText` border.

**That was not sufficient, and the second half is the interesting part.**
Several accents are written as `color-mix(in oklab, var(--color-brand-cyan)
68%, transparent)` in arbitrary values, and mixing a _system colour keyword_
does not reliably produce one. Under Firefox's **dark** forced palette the
principle numerals resolved to `#164350` on `#1c1b22` — 1.58:1 again, 163 axe
nodes. Chromium's emulation uses a **light** canvas and never showed it.

Two engines, two palettes, one bug only one of them can see. Text is now
`CanvasText` and links `LinkText` outright, because in this mode the reader's
palette is meant to win.

### 2. The proof cards had no headings

The accessibility-tree audit — not axe, which has no rule for this — found that
a reader browsing by heading jumped from _"Don't take my word for it"_ straight
to the next section. **The site's entire body of evidence was invisible in that
navigation mode.** Each card is now an `h3` whose accessible name reads
_"40 public repositories"_. Visually identical: the regenerated baseline is
indistinguishable from the previous one.

### 3. A focus-trap test asserted something untrue about browsers

The first version of the modal test asserted focus is inside the dialog on
every Tab. Chrome's `<dialog>` cycle passes through `document.body` once as it
wraps from the last control to the first — not an escape, since `body` is not
focusable content and the next Tab returns inside. The test now asserts the
property that matters: focus never lands on an **interactive element** outside
the modal.

---

## Structured data and crawling

- `Person` gained a **`ContactPoint`** — email only. No telephone number is
  published anywhere on this site, so none is claimed in machine-readable form.
- **`SearchAction` was deliberately not added.** §9 lists it, and the pattern
  requires a URL template pointing at a working search endpoint. This site has
  no search; declaring one is how a site ends up with a sitelinks search box
  that leads nowhere. The reason is recorded in `docs/SEO.md` rather than the
  shape being filled in for completeness.
- `robots.txt`, `sitemap.xml` (11 URLs, derived from content) and canonicals on
  all four route types audited against the production origin.

---

## The screen-reader question, answered honestly

The instruction was _"actually do the manual screen reader tour and list the
findings; do not say 'it probably works'"_.

**What was done:** the accessibility tree — landmarks, heading outline,
accessible names, image alternatives, language — was dumped from a real Chromium
for every route and reviewed line by line. That is the same tree a screen reader
consumes, and it found defect #2 above, which no automated rule reports.

**What was not done:** no live screen reader was run. NVDA, JAWS and VoiceOver
are not available in this environment, so speech order, verbosity and gesture
behaviour are unverified. It is listed as an open item in
`docs/ACCESSIBILITY.md` and is **not** marked complete.

---

## Verification

| Gate                     | Result                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------ |
| axe — routes and states  | **0 violations** across 12 surfaces, both engines                                    |
| Keyboard tour            | 6 tests: skip link, tab reachability, visible focus, modal trap, form, media control |
| `forced-colors: active`  | 4 tests × 2 engines — light and dark system palettes                                 |
| `prefers-contrast: more` | 0 violations                                                                         |
| 400 % zoom (320×256)     | 5 tests — all four routes reflow, nothing lost                                       |
| Lighthouse A11y / SEO    | **100 / 100** on every page, desktop and mobile                                      |
| Unit                     | 237 passing                                                                          |
| E2E + a11y (Chromium)    | **204 passing** (+16 this phase)                                                     |
| E2E + a11y (Firefox)     | **160 passing**, 1 skipped                                                           |
| Visual                   | 43 baselines green                                                                   |
| `pnpm verify`            | clean                                                                                |

---

## Limitations, stated

1. **No live screen reader.** See above.
2. **Rich Results Test needs a public URL**, so JSON-LD is validated here by
   parsing and asserting its shape; Google's own validator runs against
   production in Phase 14.
3. **Search Console verification** needs the production domain — Phase 14.
