# Phase 7 — Work / Portfolio Experience · COMPLETE

**Date:** 2026-08-18

---

## What was implemented

Eight projects, a `/work` index, and eight prerendered `/work/[slug]` case
studies. This is the phase the roadmap called the site's highest-value section,
and it is the reference's largest gap: there, a project is a screenshot plus a
Live and a Code link.

### The content is researched, not written from memory

Every project was reconstructed from its source repository — manifests, module
graphs, `git rev-list`, architecture documents — and from live HTTP checks.
Where a README's status claim disagreed with the evidence, the evidence won.
Evolutionary Tycoon's README still says "no code written yet"; the repository
has 26,000 lines across 143 files and 110 test files.

| Project             | Status            | Evidence                                                    |
| ------------------- | ----------------- | ----------------------------------------------------------- |
| PawDoc              | Released          | Play production build 1.0.0+8; 118 commits                  |
| Ehliyet Akademi     | **Live**          | ehliyetegitim.com returns 200; 261 commits, live in 28 days |
| FormAI              | Release candidate | Build 1.0.0+40, closed testing; ~61k lines of Dart          |
| Evolutionary Tycoon | In development    | Live build; 4 of 25 phases, deliberately paused             |
| FormAI Web          | **Live**          | web-form-ai.vercel.app returns 200; 56 commits              |
| Lumina              | In development    | 11 phases, 35 routes — **repository private, not linked**   |
| NOVA                | Research          | 13 modules, 36 documents — **deliberately never shipped**   |
| Living Library      | Release candidate | 11 volumes, 11 public repositories                          |

### Four honesty rules, each enforced by a test

1. **A private repository is described, never linked.** Lumina's repository is
   private, so it has no links at all rather than a link to a 404.
2. **An unresolved store listing says so.** PawDoc and FormAI both have builds
   approved or in testing and no public listing; both status notes say that
   plainly instead of implying availability.
3. **`live` requires a linked live URL.** A test fails if any project claims the
   status without one.
4. **Covers are real captures or nothing.** Three are screenshots of the live
   sites taken in a browser, two are screenshots of the shipped apps. The other
   three have no capture — a private repo, a project never deployed, and a set
   of books — and render a generated mark captioned **"No public capture"**
   rather than a stock photograph or a mock-up of something that does not exist.

### Case study structure

Four fixed beats, required by the schema so a project cannot be written up as a
feature list: **the problem**, **the architecture**, **the interesting
decision**, **what it does now**. A test fails if any beat is under 80
characters. The status note sits directly under the cover, before the prose,
because a reader deciding whether to care should not have to infer maturity.

### Assets

`scripts/build-work-images.mjs` composes the covers: live captures cropped to
the card ratio, and portrait phone captures composed onto a brand-tinted canvas
with rounded corners rather than cropped, because cropping a phone screenshot to
16:10 throws away the screen. All five are inside the 90 KB budget after
`next/image` re-encodes them.

---

## Tests

**107 browser tests**, **182 unit tests**, **8 performance measurements**,
axe clean, budget 27.7 / 45 KB first-party, coverage 91.4 / 87.7 / 90.3 / 92.2.

New unit coverage: schema conformance for all eight; slug uniqueness and ASCII
safety (two source directories carry non-ASCII, and `MY-DİGİTAL-BOOK`'s dotted
İ breaks naive case-folding, so no route is ever derived from a directory name);
order integrity; and the four honesty rules above, plus a check that Flutter has
not drifted into the game's or the books' stack.

New browser coverage: every case study renders all four beats; ItemList,
CreativeWork and BreadcrumbList structured data; `aria-current` on Work for both
the index and a case study; external links open safely; a project with nothing
to link says so and renders no external link at all; a project with no capture
shows no `<img>`; every case study offers the next one and the last wraps to the
first; and an unknown slug is a real 404.

---

## Defects found and fixed

**1. The navigation marked "Home" as current on a case study.** The scroll-spy
observes `#home`, `#about`, `#work`, `#contact`, none of which exist outside the
home page, so it fell back to its first id. Active state is now derived from the
route on non-home pages and from the spy only on `/`.

**2. The reference's card pattern is invalid HTML, and reproducing it would have
been the easy path.** It wraps the whole card in an anchor and nests Live and
Code links inside it — a screen reader announces three overlapping links for one
card. This uses a stretched link: one anchor over the title whose `::before`
covers the card, with the external links as siblings outside that area. A test
asserts zero nested anchors and samples four points across the card to confirm
the overlay really covers it.

**3. Two tests were passing on the wrong element.** The JSON-LD assertions used
`.last()`, which selected the layout's Person block rather than the page's — so
they would have passed no matter what the page emitted. Each block now carries a
stable id.

**4. A geometric assertion silently returned nothing.**
`document.elementFromPoint` resolves only inside the viewport and returns `null`
below it; the card sat 1,630 px down. The failure output showed a diff of
identical-looking values, which is what `null` compared against `true` looks
like. The test now scrolls first and reports `'off-screen'` explicitly, so the
same mistake cannot be mistaken for a coverage failure again.

---

**5. A long-task test that was measuring the wrong thing — and a fix aimed at
the wrong cause.** CI reported a 51 ms long task "while scrolling" the work
grid. The first fix assumed image decode and added `decoding="async"`. The task
then measured **58 ms**, so the assumption was wrong.

Attributing it properly with the Long Animation Frame API named the real
culprit: a Next.js chunk evaluating for 30 ms plus React's scheduler working in
5 ms slices — **hydration**, not scrolling. The test observed with
`buffered: true` and started scrolling immediately after navigation, so it was
capturing the startup frame and labelling it a scroll cost. Startup blocking
time is real, but Lighthouse's assertion already owns it.

The test now waits for hydration to finish, then starts observing, then
scrolls — so it measures what its name claims. `decoding="async"` was kept; it
is correct regardless, just not the fix for this.

**7. A liveness signal that was frame-rate dependent.** The background engine
published its frame counter every 30 frames. At the ~9 fps a headless engine
manages on a shared runner that is 3.3 seconds, so WebKit's hidden-tab test
timed out waiting for a signal that had not been written yet. Now published
every 250 ms of wall-clock time, which appears at the same rate on every engine
and still keeps DOM writes out of the per-frame path.

**6. A test that depended on the frame rate to be correct.** "The pause control
stops it" waited a fixed 1.4 s for the ramp to settle. The loop clamps each
frame's delta to 50 ms so a resumed tab cannot jump, which means on a headless
engine delivering ~9 frames a second the decay advances slower than wall-clock —
Chromium had long since stopped while WebKit still had 2 px of drift. The test
now polls until the strip actually comes to rest, which is the contract, at any
frame rate.

---

## Known limitations

- Evolutionary Tycoon's live capture shows **placeholder art** — magenta
  markers standing in for sprites — because that is the honest current state at
  phase 4 of 25. The status note and a highlight both say so.
- Lumina has no capture because there is no public deployment, and no link
  because the repository is private. Both are stated in the UI.
- Case-study galleries are supported by the schema but unused; the single cover
  carries each project for now.

---

## Next

**Phase 8 — About.** The long-form profile, principles and experience timeline,
built from the same evidence base.
