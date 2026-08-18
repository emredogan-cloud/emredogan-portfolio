# Architecture decision record

Format: decision · context · alternatives · consequence. Newest first.

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
