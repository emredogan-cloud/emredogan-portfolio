# Final Completion Report — emredogan.work

**Verdict: READY WITH DOCUMENTED LIMITATIONS**

**Live:** https://emredogan.work
**Source:** https://github.com/emredogan-cloud/emredogan-portfolio
**Completed:** 2026-08-20 · 14 phases · 37 commits

---

## 1. Verdict, and why it is not unqualified

The site is built, tested, deployed and live on its production domain. Every
gate is green on three browser engines. Two things are genuinely incomplete,
and neither is hidden:

1. **The contact form cannot send mail yet.** Vercel's marketplace terms for
   Resend have to be accepted in a browser by the account owner —
   `vercel integration add resend/resend-email` returns `action_required`. Every
   line of the delivery path is written and tested; the moment `RESEND_API_KEY`
   exists the same code delivers, with no edit. Until then the form says so on
   screen, keeps every word the visitor typed, and hands them a prefilled
   `mailto:`. **One click by the owner finishes it:**
   https://vercel.com/emre30283-4955s-projects/~/integrations/accept-terms/resend
2. **The hero has no photograph.** None exists, and fabricating one was ruled
   out. The frame holds a monogram plate designed to look deliberate; swapping
   in a real portrait is a change to one line of `content/hero.ts`.

A third item is a _measurement_ limitation rather than a defect: no live screen
reader and no physical handset were available. Both are stated in
`docs/ACCESSIBILITY.md` and neither is marked complete.

---

## 2. What was asked, and what was refused

The instruction that shaped this build more than any other was: **never invent
facts, employers, customers, metrics or certifications; where something is
missing, say so.** Applied literally, it removed things a portfolio normally
has.

| The reference does                                                                                 | This build does                                                                                                                                    |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| "20+ Projects · 3+ Years Experience · **100% Passion**"                                            | "1,068 commits · 8 projects built · 3 live or released" — each with the method printed underneath, two asserted against the content in a unit test |
| Four testimonials with **"Verified Client"** badges                                                | **No testimonials, and the section says why.** Six claims a stranger can check, each with a link                                                   |
| A project card reading "Coming soon · TOP SECRET" with **Live and Code buttons that lead nowhere** | A project with nothing to link **says so**: _"Repository is private — described, not linked."_                                                     |
| A **phone number** in the contact block                                                            | Working hours. No phone number is published, and a test asserts the page contains no `tel:` link                                                   |
| Placeholder-only form labels                                                                       | A visible `<label>` on every field                                                                                                                 |

**No third-party certification is held**, so the credentials block says that,
labels two AWS exams **"Target — not held"** in plain text rather than by
colour, and places two `shipped` proofs beside them. A unit test fails if a
`held` credential ever appears.

**The published commit total was wrong and was corrected.** It shipped as 1,113
from `git rev-list --count HEAD` with three feature branches checked out —
counting unmerged work. Recounted on default branches: **1,068**.

---

## 3. Measured results

### Performance — against the live domain

Lighthouse, mobile form factor with **applied** Slow-4G throttling (not
Lighthouse's simulation — ADR-0011), three runs per URL, median:

| Page           | Perf | A11y    | Best practices | SEO     | LCP     | CLS       | TBT    |
| -------------- | ---- | ------- | -------------- | ------- | ------- | --------- | ------ |
| `/`            | 95   | **100** | **100**        | **100** | 2237 ms | **0.000** | 102 ms |
| `/about`       | 96   | **100** | **100**        | **100** | 2154 ms | **0.000** | 76 ms  |
| `/work`        | 96   | **100** | **100**        | **100** | 2273 ms | **0.000** | 67 ms  |
| `/work/pawdoc` | 96   | **100** | **100**        | **100** | 2225 ms | **0.000** | 71 ms  |

Desktop is 100/100/100/100 on all four with LCP ≈ 0.6 s.

### Budget table (roadmap §7)

| Metric                     | Target         | Hard          | Measured                             |     |
| -------------------------- | -------------- | ------------- | ------------------------------------ | --- |
| LCP, mobile Slow 4G        | < 2.0 s        | 2.5 s         | 2.15–2.27 s live · 1.60 s local      | ⚠️  |
| CLS                        | < 0.02         | 0.1           | **0.000**                            | ✅  |
| INP proxy (TBT)            | < 150 ms       | 200 ms        | 67–102 ms                            | ✅  |
| TTFB                       | < 200 ms       | 500 ms        | **184 ms** warm (119 ms of it TLS)   | ✅  |
| First-load JS, total       | < 160 KB       | 175 KB        | 161.2 KB                             | ⚠️  |
| First-load JS, first-party | < 35 KB        | 45 KB         | **30.0 KB**                          | ✅  |
| CSS                        | < 20 KB        | 30 KB         | **9.5 KB**                           | ✅  |
| Fonts                      | < 90 KB        | 120 KB        | **78.1 KB** (was 141)                | ✅  |
| Project image, served      | < 90 KB        | 140 KB        | **4.4–24.8 KB** AVIF                 | ✅  |
| Background CPU             | < 3 %          | 6 %           | **< 1 %** of frame budget            | ✅  |
| JS heap                    | < 40 MB        | 70 MB         | **6.0 MB**, flat over 12 round trips | ✅  |
| Lighthouse                 | 95/100/100/100 | 90/100/95/100 | **95–96 / 100 / 100 / 100**          | ✅  |

**The two amber rows, honestly.**

_LCP._ 1.60 s on localhost, 2.15–2.27 s against the live edge — the difference
is real network latency, and it is inside the hard threshold with 0.23 s to
spare but over the 2.0 s target. What remains is the framework's hydration
cost, not an unoptimised asset: fonts are subset and preloaded, images are AVIF
at 4–25 KB, and nothing above the fold waits on anything else.

_Total first-load JS._ 1.2 KB over, 13.8 KB under the enforced threshold. The
measured framework floor is 131.2 KB, leaving 28.8 KB for everything else; this
site uses 30.0 KB. Two reductions were **measured**, not assumed: inlining every
client-side icon saved 0.5 KB, and deferring the contact form's hydration moves
the metric without moving the experience. Neither was worth keeping.

### Tests

| Layer              | Count                                                 |
| ------------------ | ----------------------------------------------------- |
| Unit               | **237** in 26 files                                   |
| Browser, Chromium  | **227**                                               |
| Browser, Firefox   | 173 (+1 skipped: clipboard permissions)               |
| Browser, WebKit    | full E2E and axe (forced colors excluded — see below) |
| Visual baselines   | 43                                                    |
| Performance        | 13, single-worker                                     |
| **axe violations** | **0** across 12 route/state combinations              |

CI runs nine jobs on every push and is green on all three engines.

---

## 4. What went wrong, and what it taught

The defects worth naming are the ones that were invisible until something
measured them.

| Defect                                                     | How it was found                         | Why it mattered                                                                                                                                 |
| ---------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reveals that were jumped over stayed invisible forever** | Scrolling `/about` by hand               | Under reduced motion every anchor is an instant jump, so clicking Contact and scrolling back left About and Work blank. Site-wide since Phase 4 |
| **A silent false success on the contact form**             | Writing a test for field errors          | Clicking Send early to see what was required answered _"your message is on its way"_, cleared the form and discarded the message                |
| **Zod in the client bundle, twice**                        | The bundle budget check                  | 93.8 KB against a 45 KB budget, the second time through three imported integers. Nobody reads 66 KB in a diff                                   |
| **Windows High Contrast was unreadable**                   | axe under `forced-colors`                | Body text at **1.58:1**. Then again at 1.58:1 under _Firefox's_ dark palette, which Chromium's light one could not show                         |
| **The proof cards had no headings**                        | An accessibility-tree audit              | A reader browsing by heading skipped the site's entire body of evidence. No automated rule reports this                                         |
| **`upgrade-insecure-requests` broke WebKit entirely**      | CI, as ten unrelated background failures | Chromium and Firefox exempt localhost from the upgrade; WebKit does not. A document with no CSS and no JavaScript looks like ten separate bugs  |
| **A rollback pinned production**                           | The redirect not appearing               | Later pushes built, passed CI and never went live. No error anywhere                                                                            |
| **A 1 % visual tolerance hid a stale baseline**            | Chasing a flaky test                     | On a dark 768×1400 screenshot, 1 % is eleven thousand pixels — enough to absorb an entire navigation bar                                        |

Two general lessons run through all of it:

**Measure the thing, not a proxy for it.** `performance.memory` returns a flat
10,000,000 in Chrome even after allocating a two-million-element array. A
marquee's rest cannot be inferred from pixel positions on a starved runner —
the engine now publishes `data-marquee="stopped"`. Lighthouse's simulated
throttling reported 2.55 s where a real browser measured 776 ms.

**A budget you do not measure everywhere is a budget you do not have.** axe
scanned four surfaces for ten phases; the first time `/work` was scanned, it
had a heading-order violation. CLS was measured on a fast link until the day it
was measured on a slow one.

---

## 5. Deliberate deviations from the roadmap

Each was a judgement call, and each is recorded where it was made.

| Roadmap said                                                | What was done                                                           | Why                                                                                                                                          |
| ----------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Motion library for reveals                                  | CSS transitions + `IntersectionObserver`                                | 46 KB against a 45 KB budget for an entrance animation (ADR-0009)                                                                            |
| First-load JS < 120 KB                                      | Split into framework floor (131.2 KB, measured) + first-party (< 45 KB) | 120 KB was unreachable before the first line of site code                                                                                    |
| Visual regression on 3 engines × 3 breakpoints × 8 sections | Layout and capability matrix on 3 engines; pixel baselines on Chromium  | WebKit baselines cannot be produced on this machine and would have to be committed unseen; most of a cross-engine pixel diff is antialiasing |
| `WebSite` + `SearchAction`                                  | `WebSite` without it                                                    | The pattern needs a working search endpoint. This site has no search                                                                         |
| Testimonial carousel                                        | A proof section                                                         | There are no clients to quote                                                                                                                |

---

## 6. Open items

**Needs the owner:**

1. **Accept Vercel's Resend terms** — the one step between the contact form and
   real delivery.
2. **Google Search Console** — verification and the first sitemap submission
   need the owner's Google account. The sitemap is live and correct at
   `https://emredogan.work/sitemap.xml`, 11 URLs.
3. **A portrait**, whenever one exists.

**Not configured, and stated rather than implied:**

4. **No uptime monitoring or error tracking.** The site is static with one
   Server Action; an outage would be noticed by a person, not an alert.
5. **No dependency automation.** No Renovate or Dependabot.
6. **The rate limiter is in-memory**, so it is per-instance — a speed bump, not
   a control. Only `RateLimiter.check` would change.

**Verification gaps:**

7. **No live screen reader.** The accessibility tree was audited line by line
   for every route — and that audit found a real defect — but speech order and
   verbosity on NVDA, JAWS and VoiceOver are unverified.
8. **No physical handset.** Device emulation on three engines is what ran.
9. **Forced colors is not asserted on WebKit.** Safari has no Windows High
   Contrast mode, and the emulation returns a self-contradictory palette
   (`CanvasText` white over `Canvas` silver). Verified on the two engines that
   implement it, across both a light and a dark palette.

---

## 7. Documentation

| File                                    | Contents                                                               |
| --------------------------------------- | ---------------------------------------------------------------------- |
| `PERSONAL_WEBSITE_EXECUTION_ROADMAP.md` | The plan, with reference measurements                                  |
| `WORKING_DISCIPLINE.md`                 | The rules this build was held to                                       |
| `docs/PERFORMANCE.md`                   | Every budget row, how it was measured, what was tried                  |
| `docs/ACCESSIBILITY.md`                 | axe coverage, keyboard map, display modes, open items                  |
| `docs/SEO.md`                           | What is emitted, and what is deliberately not                          |
| `docs/BROWSER_SUPPORT.md`               | Support matrix and the engine differences actually found               |
| `docs/REFERENCE_COMPARISON.md`          | Eight frames, section by section — including where this build is worse |
| `docs/RUNBOOK.md`                       | Deploy, rollback, domain moves, env vars, and the traps                |
| `docs/DECISIONS.md`                     | Eleven ADRs                                                            |
| `docs/progress/PHASE_01–14_COMPLETE.md` | One record per phase, defects included                                 |

---

## 8. Sign-off

The site is live at **https://emredogan.work**, serving from Vercel's edge with
a 184 ms warm TTFB, an enforced Content Security Policy, HSTS preloaded, and
`www` redirecting permanently to the apex. All ten smoke-tested routes answer
correctly and an unknown path returns the designed 404. Rollback was drilled in
both directions: four seconds back, two forward.

Nothing on it claims anything that cannot be checked.
