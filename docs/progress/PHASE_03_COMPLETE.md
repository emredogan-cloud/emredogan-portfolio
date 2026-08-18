# Phase 3 — App Shell: Navigation & Page Architecture · COMPLETE

**Date:** 2026-08-18

---

## What was implemented

**Navigation island.** Two states matching the reference: transparent and
full-bleed at the top, then a rounded translucent island once scrolled. The
scrolled state uses `useScrolledPast`, which observes a one-pixel sentinel
rather than listening to `scroll` — it fires twice in the page's lifetime and
never reads layout.

**Scroll-spy with `aria-current`.** The active section is communicated to
assistive technology, not only by an underline. Implemented as a **one-pixel
reading line** 120 px from the viewport top (see defect 2 below). Reaching the
end of the document activates the last section, which an observer alone cannot
express.

**Mobile sheet.** A native `<dialog>` in modal mode, so focus trapping, an
inert background and top-layer stacking come from the platform. The parts the
platform does not provide are added explicitly: focus returns to the trigger,
body scroll is locked and released (including on unmount), and backdrop clicks
close.

**Scroll progress.** CSS `animation-timeline: scroll()` where supported —
compositor-driven, zero main-thread work — with a rAF fallback that only writes
a custom property. Support is read through `useCssSupports`, a
`useSyncExternalStore` wrapper, so nothing sets state in an effect.

**Footer.** Three columns, real social links with `rel="me noopener
noreferrer"`, and inline GitHub and X marks (lucide v1 dropped brand icons).

**Routes.** `/work` and `/about` now exist with real metadata and sitemap
entries, plus `Section`, a landmark wrapper that _requires_ a `labelledBy` id —
an unnamed `<section>` is not exposed as a landmark at all.

---

## Tests

39 Playwright tests on Chromium (18 navigation, plus E2E, reveal,
reduced-motion, a11y and visual), 71 unit tests. axe: 0 violations. Budget:
10.7 / 45 KB first-party.

New: island state change, `aria-current` exclusivity, anchor landing position,
deep-link landing, keyboard traversal, focus containment, body-scroll lock and
release, backdrop and Escape close, progress growth, footer link attributes,
back-to-top, and header-never-covers-heading plus horizontal-overflow checks at
three breakpoints.

---

## Defects found and fixed

**1. Zod was shipping to the browser — 64 KB.** `site.ts` called
`parseContent` at module scope, and client components legitimately import
`site`, so the validator followed them into the client bundle: first-party JS
measured **75.1 KB** against a 45 KB budget. Content is now plain data typed
with `satisfies`, and `content/validate.ts` is `import 'server-only'` and runs
at build time from the root layout. **75.1 KB → 10.6 KB.** Both guarantees were
verified rather than assumed: a deliberately invalid email still fails
`next build`, and a deliberate client import of the validator fails with an
explicit `server-only` error.

**2. The scroll-spy highlighted the wrong section.** A 140 px reading band was
still ambiguous — a section ending four pixels into it counted, and the
outgoing section won. Replaced with a one-pixel line, which exactly one
contiguous section can contain.

**3. Anchor navigation landed 216 px short.** `scroll-margin-top: 112px` on the
section and `scroll-padding-top: 104px` on the document **stack**, so the
heading came to rest 344 px down — a third of a laptop screen of empty space
above the content the reader asked for. Removed the section's `scroll-mt`; the
scroll container's padding is now the single mechanism. Found by tightening a
test that had been asserting only `toBeInViewport()`.

**4. A silent Tailwind class conflict.** The hero passed `pt-40` through
`className` while `Section` applied `pt-[clamp(...)]`. `cn()` joins class names
without resolving conflicts — deliberately, to avoid a `tailwind-merge`
dependency — so both landed in the DOM and whichever the compiler emitted later
won. Replaced with an explicit `variant` prop.

**5. `setState` inside an effect** in `ScrollProgress`, flagged by
`react-hooks/set-state-in-effect`. Rewritten as `useSyncExternalStore`, which
is what "a value read from outside React that never changes" actually is.

**6. Two lost hours to a stale server.** Playwright's `reuseExistingServer`
adopted a hand-started `pnpm start` from an earlier build. Next reads its build
once at boot, so it served chunk hashes that no longer existed: a 500 on a
script, no hydration, and failures that looked exactly like hydration bugs.
Playwright now builds and serves on **port 3100**, which makes the collision
impossible. Documented in `CONTRIBUTING.md`.

---

## Known limitations

- Section contents are shells. Hero (Phase 4), work (7), about (8) and contact
  (9) fill them; the copy currently says so rather than pretending otherwise.
- `IntersectionObserver` is throttled in a backgrounded Chrome tab, so
  interactive debugging through CDP under-reports scroll-driven state.
  Playwright is authoritative for these behaviours.

---

## Next

**Phase 4 — Hero & opening experience**, then **Phase 5 — the Canvas starfield
and meteor background**.
