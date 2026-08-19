# Phase 8 — About Experience · COMPLETE

**Date:** 2026-08-19

---

## What was implemented

The About section on the home page and a rebuilt `/about` long-form page,
written from the record rather than from memory. Six components, one content
module, and a schema that makes the honesty rules structural.

| Surface                     | Contains                                                       |
| --------------------------- | -------------------------------------------------------------- |
| `#about` (home)             | Intro, descriptors, 4 principles, 4 capabilities, link onward  |
| `/about` → `#about-intro`   | The same intro at full length, plus focus areas                |
| `/about` → `#principles`    | The four working positions                                     |
| `/about` → `#capabilities`  | Four areas, each naming the technologies actually used         |
| `/about` → `#timeline`      | Six projects in date order, every entry evidenced              |
| `/about` → `#credentials`   | Two shipped proofs, two AWS exams marked **Target — not held** |
| `/about` → `#about-contact` | Close, with the two calls to action                            |

### The content rules, and what they cost

The instruction was: never invent employers, customers, metrics or
certifications, and where something is missing, say so rather than fill it in.
Applied literally, that removed things a portfolio normally has:

- **No third-party certification is held.** No certificate file, credential id
  or verification URL exists anywhere on disk. The section is not omitted —
  omission would have been the quiet lie. It states the position, lists two AWS
  exams explicitly labelled `Target — not held` in plain text (not by colour
  alone), and puts two `shipped` proofs beside them: a live domain and an
  approved production release, both of which a stranger can open and check in a
  way a PDF certificate cannot be.
- **No employment history, no degree, no awards, no revenue, no downloads.**
  None of it is supported by anything on disk, so none of it appears.
- **Every timeline period is `git log --reverse` output**, and every entry
  carries at least one checkable claim — a commit count on the default branch,
  a route count, a release build number, a live domain.
- **The bakery shifts appear once, in past tense, and not as the framing
  device.** They belong in the record; making hardship the headline would be
  asking to be judged on the story instead of the code. A test pins this: one
  mention, and not in the opening clause.

`src/content/schema.ts` gained `aboutSchema` with a required `evidence` array
on every timeline entry and a three-way `kind` on credentials (`held` |
`target` | `shipped`). A timeline entry with nothing checkable, or a credential
with no kind, now fails the build rather than a review.

### The published commit total was wrong, and was corrected

The hero shipped `1,113 commits`, produced by `git rev-list --count HEAD`
across the six repositories under version control. Three of them had a feature
branch checked out, so the figure counted unmerged work and moved whenever a
branch advanced. Recounted on the default branch — the number anyone cloning
the repositories reproduces — it is **1,068**:

| Repository          | Default-branch commits |
| ------------------- | ---------------------- |
| FormAI              | 604                    |
| Ehliyet Akademi     | 238                    |
| PawDoc              | 109                    |
| FormAI Web          | 56                     |
| Evolutionary Tycoon | 43                     |
| Lumina              | 18                     |
| **Total**           | **1,068**              |

The stated method now names the default branch, the third statistic was
relabelled `live or released` to match what it counts, and two of the three
hero numbers are asserted against `projects.ts` so they cannot drift again.
Three E2E assertions had hardcoded `1,113` and all three failed at once; they
now read the value from the content module, because a number the site derives
should be derived by the test too.

---

## Defects found and fixed

### 1. A reveal that was jumped over stayed invisible for the rest of the session

Found by scrolling `/about` in a real browser, then reproduced deterministically
in Playwright (`tests/e2e/reveal-jump.spec.ts` — two tests failed before the fix
and pass after).

`IntersectionObserver` reports a _change_ of intersection. An element that goes
from "below the fold, not intersecting" to "above the viewport, not
intersecting" in a single frame never changes state, so the callback never runs
and the element stays at `opacity: 0` permanently.

That is reachable by an ordinary click. `scroll-behavior` is `auto` under
`prefers-reduced-motion: reduce`, so for those readers every in-page anchor is
an instant jump: click Contact, scroll back up, and the About and Work sections
are blank. The reveal is decoration; losing the content to it is the one
outcome `globals.css` explicitly rules out — _"The failure mode of the opposite
arrangement — hidden by default, shown by JS — is a blank page."_

Fixed by extending the observer's root far above the viewport
(`rootMargin: '100000px 0px -12% 0px'`), so "already passed" counts as
intersecting and reveals. The negative bottom margin is unchanged, so content
below the fold still waits its turn — a third test asserts that, because a fix
that revealed everything at mount would pass the first two and delete the
feature.

**This is a site-wide bug that Phase 8 happened to surface.** Every section
built in Phases 4–7 had it.

### 2. Four serious contrast violations on the principle numerals

The numerals were drafted as `color-mix(in oklab, var(--color-brand-cyan) 38%,
transparent)`, which composites to `#145b6b` on `#0b111a` — **2.46:1**. axe
reported four serious violations. `aria-hidden` removes the numeral from the
accessibility tree but not from the screen, so the contrast floor still applies.

The first correction to 60% passed at 1440 px and **still failed at 390 px**:
`--text-h3` is `clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem)`, whose minimum is
22.32 px — under the 24 px that makes text "large", so the 4.5:1 floor applies
rather than 3:1. _A fluid type ramp can move a colour from one WCAG threshold
to the other without anyone touching the colour._ Settled at 68%, which clears
4.5:1 on `surface-1` and `surface-2` alike, and a unit test now reads the
percentage out of the component and re-derives the composited ratio, so it
cannot be dialled back down for looks.

### 3. A visual baseline that failed only under load

`home — desktop › work` failed in a full-suite run and passed on its own —
the signature of a race, and the kind of flake that gets a real regression
waved through as "just the visual test again". `networkidle` says the image
bytes arrived; it says nothing about whether the decoder has produced a bitmap.
`prepareForSnapshot` now awaits `img.decode()` on every image before capturing.

### 4. `--update-snapshots` accepted four baselines it should have been asked about

Regenerating everything at once quietly rewrote the contact and footer
baselines. Restoring them from git and re-running showed a genuine difference:
the footer is **524 px tall, was 525 px** — sub-pixel layout rounding shifted by
the taller About section, not a regression. Documented rather than assumed:
region baselines are sensitive to 1 px rounding elsewhere on the page.

---

## Verification

| Gate                  | Result                                                          |
| --------------------- | --------------------------------------------------------------- |
| `pnpm lint`           | clean, `--max-warnings=0`                                       |
| `pnpm typecheck`      | clean                                                           |
| `pnpm knip`           | clean — the four About types are used, not exported for show    |
| Unit                  | **204 passing**, 24 files (+15 this phase)                      |
| E2E + a11y (Chromium) | **127 passing**                                                 |
| E2E + a11y (Firefox)  | **100 passing**                                                 |
| axe                   | **0 violations** — `/about` at 1440 and 390, plus `/` at both   |
| Visual                | 27 baselines, 4 new (`timeline`, `credentials` × 2 viewports)   |
| Perf                  | 8 passing, including CLS on `/about` with real content          |
| Production build      | 18 static pages                                                 |
| Console               | clean on a fresh `/about` load                                  |
| Real browser          | Chrome — intro, principles, capabilities, timeline, credentials |

### Budgets

| Budget              | Measured                    | Limit  |
| ------------------- | --------------------------- | ------ |
| Total first-load JS | 158.9 KB (`index.html`)     | 175 KB |
| First-party JS      | **27.7 KB** — unchanged     | 45 KB  |
| CSS                 | 8.7 KB (from 8.4)           | 30 KB  |
| `/about` first-load | 144.0 KB total, 12.8 KB own | —      |

The About experience cost **0 KB of first-party JavaScript**: everything except
`Reveal` is a server component, and `Reveal` was already on the page.

---

## Limitations, stated

1. **WebKit is not run locally.** `libevent-2.1-7t64` is missing and installing
   it needs root. CI runs all three engines in the Playwright container.
2. **Visual baselines are Chromium-only**, by design — font rasterisation
   differs enough between engines that per-engine baselines would be three sets
   of near-duplicates to maintain.
3. **The timeline covers six of the eight projects.** NOVA and Living Library
   are not under version control, so no observed period exists for them and
   none is invented. The section says so.
4. **Two AWS exams are stated as intentions.** If either is passed, the entry
   moves from `target` to `held` and the unit test asserting zero `held`
   credentials has to be updated deliberately — which is the point of it.
