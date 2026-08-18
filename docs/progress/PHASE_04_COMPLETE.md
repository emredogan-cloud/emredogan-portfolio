# Phase 4 — Hero & Opening Experience · COMPLETE

**Date:** 2026-08-18

---

## What was implemented

**Hero.** A server component with two small client islands. The headline, the
subhead, the intro and every number are in the initial HTML, so the LCP
candidate does not wait on hydration.

**Statistics that can be checked.** The reference showed "20+ Projects · 3+
Years Experience · 100% Passion". Two of those cannot be verified and the third
is not a statistic. Replaced with three that were counted on the day, each
rendering the method that produced it directly beneath the number:

| Number                   | Method                                                                                                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1,113** commits        | `git rev-list --count HEAD` summed across the six of these projects under version control — Evolutionary Tycoon 56, FormAI 604, PawDoc 118, Ehliyet Akademi 261, Lumina 18, FormAI Web 56 |
| **8** projects built     | The eight presented on this site                                                                                                                                                          |
| **3** live in production | Verified returning HTTP 200: ehliyetegitim.com, evolutionary-tycoon.vercel.app, web-form-ai.vercel.app                                                                                    |

Years of experience, employers, clients, revenue and downloads are **not**
claimed, because nothing on disk supports them.

**Portrait frame.** No photograph exists, and none is invented. The frame falls
back to a monogram plate — brand-gradient initials on a faint grid, inside the
same glowing rounded frame the reference uses — with the floating glass card
over its top-left corner. Swapping in a real photo is a change to
`hero.portrait` in the content module and nothing else: no layout, no
component, no CSS.

**Count-up.** Animates on first view, reserves the final value's width so
nothing beside it shifts mid-count, uses tabular numerals, renders the final
value immediately under reduced motion, and exposes the true value to screen
readers while the animated digits stay `aria-hidden`.

**Magnetic CTA.** Confined to the single most important control, capped at
6 px, and disabled entirely under reduced motion or without a fine pointer.

---

## Tests

**57 Playwright tests** on Chromium, **95 unit tests**, axe clean, budget
16.4 / 45 KB first-party.

New: the headline is in the server HTML; every statistic states its provenance;
the count-up ends on the true value, is screen-reader readable, does not shift
layout, and skips the animation under reduced motion; the portrait renders no
`<img>` and no broken image; the technology list is a real list.

---

## Defects found and fixed

**1. The glass card rendered at the bottom of the frame.** `Card` sets
`relative` in its base classes and the caller passed `absolute`; `cn()` joins
class names without resolving Tailwind conflicts, so both landed in the DOM and
the compiler's ordering decided. Positioned by a wrapper instead. This is the
second instance of the same class of bug — the first was `pt-40` in Phase 3 —
so the rule is now explicit: **never pass a positioning or spacing utility to a
component that already sets one.**

**2. Horizontal overflow at 390 px.** The hero's ambient glow used `-inset-8`,
extending its box 32 px on every side and pushing 12 px past the viewport.
The first fix attempt used `clip-path`, which was wrong for an instructive
reason: `clip-path` clips _painting_, not the layout box that `scrollWidth` is
computed from, and the test still failed. Correct fix is to keep the glow's box
inside the column (`inset-x-0 -inset-y-8`) and let only its blur bleed outward.

**3. Visual baselines were pictures of an empty page.**
`toHaveScreenshot({ fullPage: true })` rendered the entire middle of the
document blank, while `page.screenshot({ fullPage: true })` of the very same
page rendered correctly and `getComputedStyle` reported every element fully
opaque. Ruled out in turn: `will-change` (removed anyway — it buys nothing over
a transition the browser already promotes), in-flight transitions (waited on
via `getAnimations()`), and `animations: 'disabled'` (reproduced clean with a
raw screenshot). The cause is full-page stitching dropping composited subtrees.

Switched to **per-region baselines** — hero, about, work, contact, footer, and
the navigation island in both states. This is better regardless: a hero change
now produces a hero diff rather than a 2,900-pixel-tall diff of everything.
A baseline that silently captures nothing passes forever and catches nothing,
which is the worst failure mode a visual test has.

**4. `getAnimations()` never settled.** Waiting for every animation to stop
timed out, because the scroll-progress bar is a scroll-driven animation whose
`playState` is `running` for the life of the document. The wait is now scoped
to `CSSTransition` instances.

---

## Known limitations

- The About, Work and Contact sections are still shells; their copy says so.
- No photograph. The monogram plate is a deliberate placeholder, and the
  content field it reads from is the only thing that has to change.

---

## Next

**Phase 5 — the Canvas starfield and meteor background**, the site's signature
visual layer.
