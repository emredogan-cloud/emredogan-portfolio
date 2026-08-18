# Phase 6 — Motion Choreography · COMPLETE

**Date:** 2026-08-18

---

## What was implemented

**The technology marquee, with the reference's damped velocity.** Frame
analysis (roadmap §1.4) found something a CSS animation cannot produce: the
strip cruises at 95–101 px/s, eases to a complete stop over 0.6–0.9 s, holds,
then eases back — while the page is stationary and no frames are dropped. So
this runs a small rAF loop over an exponential velocity model rather than a
keyframe, and unit tests assert the profile against the numbers measured from
the recording.

The model integrates over real elapsed time rather than using the usual
`v += (target - v) * 0.06`, which is frame-rate dependent and ramps almost twice
as fast on a 120 Hz display. A test asserts the ramp takes the same wall-clock
time at 60 and 120 Hz.

**What it adds beyond the reference**

|                                    |                                                                                                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A visible pause control**        | WCAG 2.2.2 requires motion lasting over five seconds to be pausable. The reference offers no way to stop it. Hover and focus also pause, but neither is a control you can find. |
| **The logos are information**      | A `sr-only` list names every technology _and the projects it was used in_, so a screen reader gets the content rather than a decorative smear.                                  |
| **Every logo traces to a project** | `stack.ts` requires a `usedIn` array. A logo wall for technologies nobody has shipped with is decoration pretending to be evidence.                                             |
| **Reduced motion is a still row**  | Not a slower one — and the control is hidden by media query, not removed.                                                                                                       |
| **Off-screen it stops**            | No frames spent animating something nobody is looking at.                                                                                                                       |

**Brand marks without a runtime dependency.** `scripts/generate-icons.mjs`
emits only the fourteen paths this site draws from the `simple-icons`
devDependency (CC0), so none of its ~3,000 icons can reach the browser. A test
regenerates and diffs, so the checked-in file cannot drift from the generator.
Marks render in `currentColor` — a row of full-colour logos on a dark page
reads as a sponsor wall.

**Section glow washes.** Each section carries a faint radial of its own, so the
page reads as a sequence rather than a stack. The reference cuts flat between
sections.

---

## Tests

**81 browser tests**, **155 unit tests**, **8 performance measurements**, axe
clean, budget 27.9 / 45 KB first-party.

New unit coverage: the velocity model's ramp timing against the measured
0.6–0.9 s, frame-rate independence, no overshoot on a 250 ms frame, symmetric
decay, monotonic approach; offset wrapping including a single huge jump; the
loop duration against the reference's ~8.7 s; icon-generator drift; and that
every technology names a project.

New browser coverage: the strip moves and keeps moving; the control pauses,
resumes, and works by keyboard; hover pauses; reduced motion is still with a
hidden-not-removed control; the seam's two copies are exactly equal width; and
**the page does not shift when the client takes over**.

New performance suite (`pnpm perf`, single worker): frame budget, **INP on the
pause control and the mobile menu**, no long tasks while scrolling, and **CLS
across `/`, `/work`, `/about` and mobile**.

---

## Defects found and fixed

**1. A layout shift on every page load.** The pause control was rendered with
`{!reduced ? … : null}`, and `useReducedMotionSafe` reports `true` until the
first effect runs — so the control was absent from the server HTML and appeared
at hydration, pushing every section below the marquee down by **58 px**. It
surfaced indirectly: a deep-link test started landing 162 px from the top
instead of 104 px, because the anchored section moved after the browser had
already scrolled to it.

Fixed by rendering it unconditionally and hiding it with a `motion-reduce:`
media query, which applies at first paint. Then generalised: a CLS measurement
now runs against four page/viewport combinations, because the next instance of
this should not have to be found by accident.

**2. An ARIA contradiction in the pause control.** It changed its label
_and_ carried `aria-pressed`, so a screen reader would announce "Play,
pressed". A media control conveys state through its label; a toggle button
through `aria-pressed`; carrying both contradicts itself. Removed
`aria-pressed`, added `aria-controls` naming what it operates — which also gave
the tests a locator that does not stop matching the moment the label changes.

**3. Refs written during render.** `pausedRef.current = paused` at the top level
of the component is a React rule violation that can tear under concurrent
rendering. Moved into effects.

**4. The generator and the formatter disagreed.** `pnpm format` rewrote the
generated icon file, so the drift test — which regenerates and compares —
failed on whitespace neither side was wrong about. The generator now formats
its own output with Prettier's API.

---

## Known limitations

- Card hover treatments are deferred to Phase 7, where the cards exist.
- The visual baseline for the marquee is captured under reduced motion (all
  baselines are), so the pause control does not appear in it. Its behaviour is
  covered by nine browser tests instead.

---

## Next

**Phase 7 — Work.** The eight real projects, the `/work` index, and
`/work/[slug]` case studies built from first-hand inspection of the source
repositories.
