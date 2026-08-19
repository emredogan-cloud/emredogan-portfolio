# Architecture decision record

Format: decision · context · alternatives · consequence. Newest first.

---

## ADR-0009 — Drop `motion`; reveals are IntersectionObserver + CSS

**Date:** 2026-08-18 · **Phase:** 2 · **Status:** accepted
**Major architecture change · roadmap §2.2-B and §3.1 updated**

**Context.** The roadmap selected Motion v13 as the animation runtime after a
decision matrix. Once it was actually wired up and measured, the numbers did
not survive contact:

| Configuration                       | First-party JS                                 |
| ----------------------------------- | ---------------------------------------------- |
| Budget                              | 45 KB                                          |
| `motion` imported directly          | 45.4 KB — over on its own                      |
| `LazyMotion` + `m` + `domAnimation` | 54.0 KB (11.4 KB core + 34.4 KB feature chunk) |
| IntersectionObserver + CSS          | **7.6 KB**                                     |

`LazyMotion` made it _worse_, not better: the feature chunk is fetched as soon
as a `Reveal` is on the page, so on any real section it is first-load payload
with an extra request in front of it.

The framework floor is 131 KB and the total ceiling is 175 KB, leaving 44 KB
for everything this site still has to build — the canvas starfield, the
navigation island, the mobile menu, the testimonial carousel, the contact form.
Motion would have consumed all of it to animate a fade and a 24-pixel
translate.

**Decision.** No animation library. `Reveal` is one `IntersectionObserver` that
toggles a class; the transition is declared in CSS.

**What this costs.** `layoutId` shared-element transitions are gone, so the
navigation's active-section indicator (Phase 3) is a CSS-transitioned bar
rather than a FLIP-projected pill. That is a smaller effect, and it is the only
capability actually lost — nothing else planned needs a physics engine. The
marquee's damped velocity (Phase 6) was always going to be a hand-written lerp
against the values measured from the reference; it does not need a library.

**What this gains, beyond 46 KB.**

- The resting state is _visible_, and the hidden class is applied by script only
  after confirming the element is below the fold. Content is therefore readable
  before hydration, with JavaScript disabled, and to any crawler that does not
  run scripts. A library-driven `initial="hidden"` renders a blank page in all
  three cases. `tests/e2e/reveal.spec.ts` asserts the no-JS path.
- Transitions are pure CSS, so they run on the compositor with no main-thread
  work at all — which is where the INP budget is won or lost.
- Reduced motion is a media query rather than a runtime branch.

**Alternatives.** Keep Motion and raise the budget — rejected under
`WORKING_DISCIPLINE.md` §7.2; the budget is what caught this. Keep Motion only
for the nav pill — rejected: the whole feature bundle loads either way.

**Consequence.** 7.6 KB of 45 KB used at the end of Phase 2, with the heaviest
work still ahead. Recorded as a major architecture change per the roadmap's
change-control rules: discovery recorded, smallest safe adjustment made,
roadmap updated, execution continues.

---

## ADR-0008 — `/dev/tokens` stays public with `noindex`

**Date:** 2026-08-18 · **Phase:** 2 · **Status:** accepted · **Deviates from roadmap §Faz 2**

**Context.** The roadmap specified a token gallery "compiled only in
development". The natural implementation is a `VERCEL_ENV` check that calls
`notFound()` — but Phase 1 established that Vercel's system variables cannot be
relied on to reach a build (ADR-0005). A route that 404s based on a variable
that may be absent is a worse outcome than one that is simply public.

**Decision.** The gallery ships as a normal route, marked `robots: noindex`
and disallowed under `/dev/` in `robots.ts`.

**Consequence.** No conditional build behaviour, the visual and axe baselines
run against the same artifact in CI as in production, and a live design-token
gallery is a reasonable thing for a developer's portfolio to expose. Recorded
as a deliberate deviation per `WORKING_DISCIPLINE.md` §4.5.

---

## ADR-0007 — `@theme static` for design tokens

**Date:** 2026-08-18 · **Phase:** 2 · **Status:** accepted

**Context.** The token gallery rendered "Display" at the same size as "Heading
4". Inspecting the compiled stylesheet showed `--text-display`, `--text-h4`,
`--radius-sm`, `--radius-lg` and `--radius-2xl` were **absent from the build**.

Tailwind v4 emits only the theme variables it can see referenced in class
names. Any token consumed another way — an inline `style`, a value read in
JavaScript, a colour handed to the canvas background engine in Phase 5 — is
invisible to that scan and is dropped. The property then silently falls back to
its inherited value. No error, no warning, no failing test; just wrong type
sizes in production.

**Decision.** `@theme static`, which emits every declaration in the block.
`tests/unit/token-emission.test.ts` compares the tokens declared in
`tokens.css` against the compiled CSS and fails if any went missing, so the
protection cannot be removed silently either. The unit job now runs `pnpm build`
first so the test has real output to check.

**Alternatives.** Referencing every token from a dummy utility class —
rejected: unmaintainable, and it would break again the moment a token is added.
Accepting the loss and only using tokens through class names — rejected: Phase
5's canvas engine has to read colour tokens in JavaScript.

**Consequence.** ~1.8 KB more CSS (4.2 → 6.1 KB gzip, against a 30 KB budget)
in exchange for a design system that cannot silently lose a token.

---

## ADR-0006 — Split the JS budget into framework floor and first-party delta

**Date:** 2026-08-18 · **Phase:** 1 · **Status:** accepted · **Roadmap updated:** §7

**Context.** The roadmap set first-load JS at "< 100 KB, CI limit 120 KB". That
number was written before anything was measured. Next.js 16.3 + React 19 render
an essentially empty page — `_global-error` — for **131.0 KB gzip**. The budget
was therefore unreachable by construction, and a build could never go green.

Two further measurement errors were found at the same time. `size-limit`
globbing `.next/static/chunks/**` counted every chunk the build emitted,
including ones no route loads, reporting 179 KB against a real 137 KB. And the
`noModule` legacy-polyfill bundle (38.4 KB gz) was being charged to every user
even though no browser in `docs/BROWSER_SUPPORT.md` downloads it.

**Decision.** Replace `size-limit` with `scripts/check-budgets.mjs`, which
parses the prerendered HTML, skips `noModule` scripts, and reports two numbers:

| Budget                                      | Limit     | Phase 1 actual |
| ------------------------------------------- | --------- | -------------- |
| Total first-load JS (modern)                | 175 KB    | 137.3 KB       |
| **First-party JS** (total − measured floor) | **45 KB** | **6.3 KB**     |
| CSS                                         | 30 KB     | 4.2 KB         |

The first-party figure is the real contract: it is the only part this codebase
controls, and it stays honest even when the framework baseline moves.

**Alternatives.** Keeping 120 KB and disabling the check — rejected outright.
Keeping 120 KB and counting only our own chunks — rejected: it would hide a
framework regression, which is exactly the kind of change that should be
visible.

**Consequence.** This is a roadmap adjustment, not a scope change, and is
recorded in §7 of the roadmap with the measurement that motivated it. Both
numbers are enforced in CI. Raising either still requires the same
justification `WORKING_DISCIPLINE.md` §7.2 demands.

---

## ADR-0005 — Gate analytics on an explicit flag, not a platform sniff

**Date:** 2026-08-18 · **Phase:** 1 · **Status:** accepted (revised same day)

**Context.** `@vercel/analytics` and `@vercel/speed-insights` load their scripts
from `/_vercel/*`, which only exists on Vercel's infrastructure. Under
`next start` locally or in CI they 404 and the browser logs a MIME-type error,
which broke the "no console errors" E2E test.

The first attempt gated on `process.env.VERCEL === '1'`. Browser verification of
the production deployment showed **no insights script in the DOM at all** —
the gate was closed on Vercel too. Whether Vercel injects its system variables
into a build is a per-project setting, so the sniff was reading a value that
may simply not be there. A silently-disabled analytics integration is worse
than no integration, because nobody notices.

**Decision.** An explicit `NEXT_PUBLIC_ENABLE_ANALYTICS` variable, validated by
the env schema, defaulting to `'0'`, and set to `'1'` only in the Vercel
Production environment.

**Alternatives.** Allowlisting the console error in the test — rejected: it
would blind the test to real console errors, the only thing it exists to catch.
Inferring from `NEXT_PUBLIC_SITE_URL` — rejected: that variable also defaults
to the production origin locally, so it would re-break local runs.

**And then it still did not work.** With the flag set, the production
deployment _still_ rendered nothing. Root cause: `vercel env add` had stored
`NEXT_PUBLIC_ENABLE_ANALYTICS` as a **Sensitive** variable. Vercel's sensitive
variables are runtime-only and are never exposed to the build — but a
`NEXT_PUBLIC_*` value has to exist at build time to be inlined, and this page
is statically prerendered. So the variable was present in the dashboard,
correct in value, and invisible to the code that read it.

Re-added with `--no-sensitive` (a public variable being marked sensitive was
wrong on its own terms) and redeployed. `window.va` and `window.si` are now
functions on production and both platform scripts load.

**Consequence.** The switch is greppable, unit-tested, environment-scoped, and
doubles as a kill switch. Two separate silent failures were caught only because
the deployment was opened in a real browser and inspected — neither would have
failed a test, and neither produced an error anywhere. Public variables are
non-sensitive by policy in this project; `CONTACT_TO_EMAIL` and future secrets
stay sensitive.

---

## ADR-0004 — Deepen the filled-CTA gradient rather than inherit the reference's

**Date:** 2026-08-18 · **Phase:** 1 · **Status:** accepted

**Context.** The reference's primary button runs `#1d6ff2 → #22d3ee` with white
text. Measured, white on the cyan end is **1.81:1** — far below the 4.5:1 AA
floor. The blue end is 4.56:1, only just passing.

**Decision.** The bright blue→cyan pair stays as the _decorative_ token, used
for gradient headings on the dark background where it measures 5.9–13.1:1. A
separate `--color-cta-from` / `--color-cta-to` pair (`#1d5fe0 → #0e7490`) backs
filled buttons; white text clears 5.36:1 at every point along that ramp,
verified by sampling the gradient at 21 stops in `tests/unit/contrast.test.ts`.

**Alternatives.** (a) Dark text on the bright gradient — fails at the blue end
(4.43:1). (b) Ship the reference's values — rejected under
`WORKING_DISCIPLINE.md` §6.1.

**Consequence.** The blue→cyan signature is preserved; the button is legible.
This is one of the documented ways the site exceeds its reference.

---

## ADR-0003 — Raise `--color-text-faint` above the sampled reference value

**Date:** 2026-08-18 · **Phase:** 1 · **Status:** accepted

**Context.** Pixel-sampled from the reference recording, the faintest text tone
was `#5d6a7d` — **3.68:1** on the page background. axe flagged 93 nodes.

**Decision.** Raised to `#7a899d` (5.67:1 on the page background, 4.99:1 on the
lightest surface token), keeping the same hue family.

**Consequence.** Eyebrow and metadata text now pass AA on every surface. The
values are locked by `tests/unit/contrast.test.ts`, which reads the tokens out
of the stylesheet rather than duplicating them.

---

## ADR-0002 — Canvas 2D for the animated background, not WebGL

**Date:** 2026-08-18 · **Phase:** 0 · **Status:** accepted

**Context.** The reference's signature is a static starfield plus animated
meteors. Frame analysis confirmed the stars never twinkle and never parallax;
only the meteors move. There is no 3D content anywhere in the recording.

**Decision.** One fixed Canvas 2D layer. Stars are drawn once into an offscreen
buffer and blitted; meteors come from an object pool; the loop stops when the
tab or the canvas is not visible; DPR is clamped to 2.

**Alternatives.** Three.js / React Three Fiber — rejected: ~160 KB of bundle
and a GPU context for an effect that has no 3D in it. DOM elements with CSS
keyframes (the reference's own approach) — rejected: hundreds of composited
layers, measurably worse on low-end mobile.

**Consequence.** The background costs roughly 3 KB and no dependency.
Revisiting requires profiling evidence and a roadmap update
(`WORKING_DISCIPLINE.md` §4.4).

---

## ADR-0001 — Native scroll, no smooth-scroll library

**Date:** 2026-08-18 · **Phase:** 0 · **Status:** accepted

**Context.** Frame-by-frame scrollbar tracking of the reference showed discrete
wheel bursts with abrupt stops — no inertia signature. The reference uses
native scrolling.

**Decision.** Native scrolling plus CSS `scroll-behavior: smooth` for anchors.
No Lenis in v1.

**Alternatives.** Lenis (~3 KB) — rejected for v1: it runs JavaScript on every
scroll frame, which is the single largest risk to the 200 ms INP budget, and it
overrides OS-level scrolling preferences.

**Consequence.** Revisit only if a pinned or horizontally-scrolled section is
introduced, and then behind a feature flag with INP measured before and after.

## ADR-0010 — Subset the Geist faces, and keep `geist` as a build-time source

**Date:** 2026-08-19 · **Status:** accepted

The `geist` package ships the published faces: 728 and 889 mapped glyphs,
including Cyrillic, Greek and box-drawing. This site is written in English with
Turkish proper nouns. Both faces were preloaded, so **141 KB of font sat on the
critical path against a 120 KB hard budget** — and more than half of it was for
scripts that never appear on any page.

**Decision.** `scripts/subset-fonts.py` cuts both faces to the standard `latin`
and `latin-ext` ranges plus every character the built pages actually render,
keeping the weight axis. The results are committed to `src/assets/fonts/` and
loaded with `next/font/local`. **137.7 KB → 78.1 KB**, and every one of the 43
visual baselines passes untouched.

**Why the subsets are committed rather than generated.** The script needs
`fonttools`, a Python dependency this project does not otherwise have, and
regenerating a binary during `next build` would give every machine a different
bundle hash for no benefit. `geist` therefore stays installed — as a
**devDependency** and in `knip.json`'s `ignoreDependencies`, because nothing
imports it any more but the script reads the source faces out of it.

**What keeps this from rotting.** `tests/unit/fonts.test.ts` re-derives the
rendered character set from the current build and fails if a character is
rendered that the subset does not cover. Verified by removing `ğ` from the
manifest and watching the test fail.

**Rejected:** the tighter subset. Dropping layout features and hinting —
`--layout-features=kern,liga,calt,tnum --no-hinting --desubroutinize`, which is
the usual advice — reached 55.4 KB and moved forty-one visual baselines. A
subset should remove glyphs nobody needs, not change how the remaining ones
rasterise; the 22.7 KB is the price of that guarantee, and the budget has room
for it.

**Rejected:** `next/font/google`, which subsets automatically but makes every
build depend on `fonts.googleapis.com` being reachable.

## ADR-0011 — Measure mobile Lighthouse with applied throttling

**Date:** 2026-08-19 · **Status:** accepted

Lighthouse's default `simulate` throttling models a page from its dependency
graph rather than measuring it. For this page the model produced **2.55 s** of
LCP, while a real Chromium under the same Slow-4G profile and 4× CPU throttling
measured **776 ms** for the same element — a threefold difference on the metric
the budget is written against.

**Decision.** `lighthouserc.mobile.json` sets `throttlingMethod: "devtools"`,
which applies the throttling for real and reports what happened. Measured LCP
is **1.60 s**, inside both the 2.0 s target and the 2.5 s hard threshold.

This is not a loosened budget: the threshold is unchanged at 2500 ms, and the
run is slower and closer to a real device. Both numbers are recorded in
`docs/PERFORMANCE.md` so the gap between model and measurement stays visible
rather than being quietly resolved in one direction.
