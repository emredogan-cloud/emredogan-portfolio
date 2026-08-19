# Accessibility — what was checked, and how

Target: **WCAG 2.2 AA**. Everything below was measured or walked through, not
assumed. Where something could not be checked with the tools available, it says
so instead of claiming coverage.

**Last audited:** 2026-08-19.

---

## Automated: axe-core

`tests/a11y/` runs axe with `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and
`wcag22aa` against **every prerendered route and every interesting state**:

| Surface                               | Widths    | Result       |
| ------------------------------------- | --------- | ------------ |
| `/`                                   | 1440, 390 | 0 violations |
| `/about`                              | 1440, 390 | 0 violations |
| `/work`                               | 1440      | 0 violations |
| `/work/pawdoc`                        | 1440      | 0 violations |
| 404                                   | 1440      | 0 violations |
| `/dev/tokens`                         | 1440      | 0 violations |
| Contact form — **field errors**       | 1440      | 0 violations |
| Contact form — **delivery failed**    | 1440      | 0 violations |
| Proof section                         | 390       | 0 violations |
| Home under **forced colors**          | 1440      | 0 violations |
| Contact under **forced colors**       | 1440      | 0 violations |
| Home under **prefers-contrast: more** | 1440      | 0 violations |

Each scan runs against a _settled_ page — scrolled through so every reveal has
fired — because scanning content at `opacity: 0` reports contrast failures
nobody experiences and drowns the real ones.

**`/work` and `/work/pawdoc` were not scanned until Phase 11**, and Lighthouse
found a heading-order violation on `/work` that axe would have caught the day it
was written. Coverage gaps are the failure mode, not the rules.

---

## Structural audit (the "screen reader tour")

**What was done:** the accessibility tree — landmarks, heading outline,
accessible names, image alternatives, language — was dumped from a real Chromium
for every route and reviewed line by line. This is the same tree a screen reader
consumes.

**What was not done, stated plainly:** no live screen reader was run. NVDA,
JAWS and VoiceOver are not available in this environment, so speech order,
verbosity and gesture behaviour are unverified. This is the one item in this
document that remains open, and it is not marked complete.

### What the audit found

**Fixed — the proof cards had no headings.** The six evidence cards rendered
their value and label as paragraphs, so a reader browsing by heading jumped
from _"Don't take my word for it"_ straight to the next section: the site's
entire body of evidence was invisible in that navigation mode. Each card is now
an `h3` whose accessible name reads _"40 public repositories"_.

**Fixed — `/work` skipped a heading level.** Project titles were `h3` directly
under the page `h1`. `ProjectCard` now takes a heading level, so it is `h3`
under the home page's section `h2` and `h2` on `/work`.

### Landmark and heading structure, as audited

Home page — every section is a named region and the outline never skips a level:

```
header
  nav "Primary"
main
  section "Emre Doğan"                    h1  Emre Doğan
  section "Technologies used…"            h2  (visually hidden)
  section "How I work"                    h2  → h3 ×8
  section "Things I have shipped"         h2  → h3 ×4
  section "Don't take my word for it"     h2  → h3 ×6
  section "Let's build something that ships"  h2
  section "Let's build something"         h2  → h3
footer
  nav "Navigate"
```

`/about` exposes six named regions, `/work` one per project, and every case
study a `#case-study` region. Every page has exactly one `h1`, `lang="en"`, a
unique `<title>`, no link without an accessible name and no image without an
`alt` attribute.

---

## Keyboard

Asserted in `tests/a11y/keyboard.a11y.spec.ts`, so this map cannot drift into
describing a site that no longer exists.

| Key                  | Where                 | Behaviour                                                                                                                                                                           |
| -------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tab` (first press)  | anywhere              | Focus lands on **Skip to content** — it is the first focusable element in the document                                                                                              |
| `Enter` on skip link | —                     | Moves focus to `#content`                                                                                                                                                           |
| `Tab`                | page                  | Every control is reachable; nothing is removed from the tab order except the honeypot, which no person can reach                                                                    |
| `Tab`                | mobile menu open      | Focus never leaves the modal. Chrome's `<dialog>` cycle passes through `document.body` once as it wraps, which is not an escape — focus never reaches interactive content behind it |
| `Esc`                | mobile menu open      | Closes it **and returns focus to the button that opened it**                                                                                                                        |
| `Enter` / `Space`    | marquee pause control | Toggles, and the accessible name changes between _Pause_ and _Play_                                                                                                                 |
| `Tab` → `Enter`      | contact form          | The whole form can be filled and submitted without a pointer                                                                                                                        |

**Focus is always visible.** Every focusable element was focused
programmatically and its computed style checked for an outline, ring or border
change; there are no exceptions. The ring is 2 px with a 2–3 px offset so it
reads against any surface.

---

## Display modes

| Mode                                            | Result                                                                                                                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prefers-reduced-motion: reduce`                | Still star field, marquee stopped, reveals resolve instantly, smooth scrolling off                                                                         |
| `forced-colors: active` (Windows High Contrast) | Colour tokens remap to system colours; the decorative canvas is removed; gradient text falls back to `LinkText`; filled buttons gain a `ButtonText` border |
| `prefers-contrast: more`                        | 0 violations                                                                                                                                               |
| **400 % zoom** (320×256 CSS viewport)           | All four routes reflow to one column, no horizontal scrolling, nothing lost — WCAG 1.4.10                                                                  |

**Forced colors was genuinely broken before Phase 12.** The browser forced the
page background to the system canvas while the author's text colours survived,
and body text measured **1.58:1** — present and unreadable. Because the design
is token-driven, the fix starts with a single `@media (forced-colors: active)`
block that remaps the tokens; every component follows from that rather than
being patched one at a time.

Remapping the tokens was **not sufficient on its own**, and the reason is worth
recording. Several accents are written as `color-mix(in oklab,
var(--color-brand-cyan) 68%, transparent)` in arbitrary values, and mixing a
_system colour keyword_ does not reliably produce one: under Firefox's dark
forced palette the principle numerals resolved to `#164350` on `#1c1b22` —
1.58:1 again, 163 nodes. **Chromium's emulation uses a light canvas and never
showed it.** Two engines, two palettes, one bug that only one of them can see —
which is the argument for running this suite on both. Text is now `CanvasText`
and links `LinkText` outright, because in this mode the reader's palette is
supposed to win.

---

## Contrast

`tests/unit/contrast.test.ts` reads the tokens out of `tokens.css` and computes
ratios, so editing a colour without re-checking it fails the build.

Two reference colours were **changed** because they did not pass:

- `--color-text-faint` was the reference's `#5d6a7d` — **3.68:1**, below the AA
  floor for body text, and it produced 93 axe nodes. Now `#7a899d`, 5.67:1.
- The reference's CTA gradient put white text at **1.81:1** at its cyan end. A
  separate, deeper ramp holds white at ≥5.36:1 at all 21 sampled stops.

A third was found in Phase 8: the principle numerals composited to **2.46:1**.
Correcting them to 60 % passed at 1440 px and still failed at 390 px, because
`--text-h3` is a `clamp()` whose minimum is 22 px — under the 24 px that makes
text "large", so the 4.5:1 floor applies instead of 3:1. _A fluid type ramp can
move a colour from one WCAG threshold to the other without anyone touching the
colour._ Settled at 68 %.

---

## Motion

- Automatic motion lasting over five seconds has a **visible pause control**
  (WCAG 2.2.2). The reference has none.
- The control is rendered unconditionally and hidden with a media query, not
  with a JavaScript condition — the conditional version added it at hydration
  and pushed every section below it down by 58 px, on every load.
- It carries a changing label and `aria-controls`, and deliberately **no**
  `aria-pressed`: both together announce "Play, pressed", which contradicts
  itself.
- Reveals animate `opacity` and `transform` only, and an element that is jumped
  past — which every anchor is under reduced motion — still reveals rather than
  staying invisible.

---

## Open items

1. **No live screen reader.** See above. Speech order and verbosity are
   unverified on NVDA, JAWS and VoiceOver.
2. **No physical mobile device.** Touch targets are measured at ≥ 44×44 and
   device emulation runs on three engines, but no handset was used.
