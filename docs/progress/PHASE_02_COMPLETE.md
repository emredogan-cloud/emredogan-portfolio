# Phase 2 — Design System & Global Visual Language · COMPLETE

**Date:** 2026-08-18
**Gallery:** `/dev/tokens` (noindex, disallowed in robots)

---

## What was implemented

**Tokens.** `src/styles/tokens.css` now emits under `@theme static`: surfaces,
brand, text, status, radius, blur, elevation, a fluid `clamp()` type scale, the
layout container widths, and motion easing/duration mirrors. Nothing in any
component holds a raw hex, radius, blur or duration.

**Primitives.** `Button` (primary / secondary / ghost × three sizes, `href`
switches it between `<a>` and `<button>` so a navigation never ships as a click
handler), `Pill` (five tones, optional mono face), `Card` (raised / glass /
outline, `glass` degrading to an opaque surface where `backdrop-filter` is
unsupported), `Field` (visible label, error and hint wired through
`aria-describedby`), `GradientText`, `SectionHeading` (the reference's two-tone
signature, split into `lead` + `accent` so the pattern cannot drift), `Reveal`.

**Motion.** Duration, easing, spring, stagger and distance tokens, plus
`staggerDelay()`. The reveal vocabulary is three CSS classes.

**Gallery.** `/dev/tokens` renders every token and primitive on one page. It is
the surface both the design-system visual baseline and the primitive axe scan
run against, so a token change that alters any primitive produces a diff.

---

## Tests

| Suite                            | Result                                                               |
| -------------------------------- | -------------------------------------------------------------------- |
| lint · typecheck · format · knip | pass                                                                 |
| Vitest                           | **68 tests, 9 files**                                                |
| Playwright (Chromium)            | **21 tests** — E2E, reveal, reduced-motion, a11y, visual             |
| axe-core WCAG 2.2 AA             | **0 violations** — home, 404, mobile, and every primitive            |
| First-load budget                | 138.6 / 175 KB total · **7.6 / 45 KB first-party** · 6.2 / 30 KB CSS |

New coverage: contrast across every surface pairing and all 21 stops of the CTA
gradient; token emission (declared vs. compiled); motion token bounds;
`staggerDelay`; reveal behaviour including **with JavaScript disabled**;
reduced-motion for both reveals and scroll behaviour.

---

## Defects found and fixed

**1. Tailwind silently dropped design tokens.** The gallery rendered "Display"
at the same size as "Heading 4". Tailwind v4 emits only theme variables it can
see referenced in class names; `--text-display`, `--text-h4`, `--radius-sm`,
`--radius-lg` and `--radius-2xl` were absent from the compiled CSS entirely.
Properties silently fell back to inherited values — no error, no failing test.
Fixed with `@theme static` and locked by `tests/unit/token-emission.test.ts`,
which compares declared tokens against compiled output (ADR-0007).

**2. `staggerDelay` was exported from a `'use client'` module**, so calling it
during a server render threw at build time. Moved to the motion tokens, where a
pure function belongs.

**3. The a11y scan was measuring a state no user sees.** axe flagged 90+
contrast violations on `opacity: 0` reveal content. Rather than disabling the
rule — which would have masked real contrast failures in revealed cards — the
scan now settles the page first. That surfaced a fourth bug: the settle loop
never worked, because `scroll-behavior: smooth` makes `scrollTo` an
_animation_, so each step was cancelled by the next. Fixed with
`behavior: 'instant'`.

---

## Major architecture change: no animation library

The roadmap chose Motion v13 from a decision matrix. Measured after
implementation:

| Configuration                       | First-party JS |
| ----------------------------------- | -------------- |
| Budget                              | 45 KB          |
| `motion` imported directly          | 45.4 KB        |
| `LazyMotion` + `m` + `domAnimation` | 54.0 KB        |
| **IntersectionObserver + CSS**      | **7.6 KB**     |

`LazyMotion` made it worse: its feature chunk loads as soon as a `Reveal` is on
the page, so it is first-load payload with an extra request in front of it.

With a 131 KB framework floor and a 175 KB ceiling, Motion would have consumed
the entire remaining budget to animate a fade and a 24-pixel translate, leaving
nothing for the canvas background, navigation, carousel or contact form.

Dropped. Beyond the 46 KB, the CSS approach is better in three ways: the
resting state is _visible_ so content survives no-JS and pre-hydration;
transitions run purely on the compositor; and reduced motion is a media query
rather than a runtime branch.

Cost: `layoutId` shared-element transitions. Phase 3's active-section indicator
becomes a CSS-transitioned bar. Recorded in ADR-0009, roadmap §2.2-B and §3.1
updated per the change-control rules.

---

## Known limitations

- Visual baselines remain Chromium-only, by design.
- `/dev/tokens` is public rather than development-only (ADR-0008) — a
  `VERCEL_ENV` gate would depend on a variable Phase 1 proved unreliable.

---

## Next

**Phase 3 — App Shell.** Navigation island with scroll state, scroll-spy active
indicator, mobile sheet menu, footer, route architecture, scroll progress.
