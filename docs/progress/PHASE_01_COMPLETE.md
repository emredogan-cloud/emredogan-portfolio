# Phase 1 — Engineering Foundation · COMPLETE

**Date:** 2026-08-18
**Commits:** `5b4979a` → `9e0e0b6` (5 commits on `main`)
**Repository:** <https://github.com/emredogan-cloud/emredogan-portfolio> (public)
**Production:** <https://emredogan-portfolio.vercel.app>
**CI:** green — run [`32133129534`](https://github.com/emredogan-cloud/emredogan-portfolio/actions/runs/32133129534), 9/9 jobs

---

## What was implemented

**Project.** Next.js 16.3.1 (App Router, Turbopack) · React 19.2.8 ·
TypeScript 5.9.3 strict with `noUncheckedIndexedAccess` · Tailwind CSS v4 with
CSS-first `@theme` tokens · pnpm 10.33.4 pinned via `packageManager`.

**Design tokens.** `src/styles/tokens.css` — colour, radius, blur, elevation,
fluid type scale and layout tokens, all derived from the pixel measurements in
the roadmap §1.3. `src/lib/motion/tokens.ts` — durations, easing curves,
springs, stagger and the marquee speed calibrated from the reference recording.
No component contains a raw design value.

**Typography.** Geist Sans + Geist Mono, self-hosted through `next/font/local`,
zero font-driven CLS. Turkish glyph coverage (ğ ş ı İ ç ö ü) is not assumed —
`tests/e2e/typography.spec.ts` measures advance widths against an ASCII control
to prove no fallback substitution is happening.

**Content layer.** `src/content/` with Zod schemas. Malformed content throws
during `next build`, so a project card with missing alt text cannot reach
production. `site.ts` carries the real identity, sourced from the founder
knowledge base; `projects.ts` is deliberately empty until Phase 7 rather than
seeded with placeholders that would read as real.

**Routes.** `/`, designed `not-found` and `error` boundaries, `robots.ts`
(previews are `disallow: /`), content-derived `sitemap.ts`, generated `icon` and
`opengraph-image`.

**SEO.** Metadata API with canonical, Open Graph and Twitter cards;
`Person` + `WebSite` JSON-LD.

**Security headers.** HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy`. CSP is deliberately deferred to Phase
14, where it starts in report-only mode.

---

## Tests executed

| Suite                           | Result                                                                  |
| ------------------------------- | ----------------------------------------------------------------------- |
| ESLint (`--max-warnings=0`)     | pass                                                                    |
| `tsc --noEmit`                  | pass                                                                    |
| Prettier `--check`              | pass                                                                    |
| knip (dead code / unused deps)  | pass                                                                    |
| Vitest                          | **62 tests, 8 files, pass**                                             |
| Coverage                        | 89.3% statements · 92.6% branches · 80% functions (thresholds 80/70/80) |
| Playwright E2E — Chromium       | 7 pass                                                                  |
| Playwright E2E — Firefox        | pass                                                                    |
| Playwright E2E — WebKit         | pass                                                                    |
| axe-core WCAG 2.2 AA            | **0 violations** (home, 404, mobile)                                    |
| Visual regression               | 2 baselines committed                                                   |
| Lighthouse CI                   | pass against budget                                                     |
| `pnpm audit --audit-level=high` | pass                                                                    |
| gitleaks                        | pass                                                                    |
| CodeQL                          | pass                                                                    |
| First-load budget               | 137.3 / 175 KB total · **6.3 / 45 KB first-party** · 4.2 / 30 KB CSS    |

---

## Browser validation

Opened on the production deployment in Chrome and inspected:
`<h1>` count 1 · Geist resolved (`GeistSans` in computed `font-family`) ·
background `rgb(3, 7, 12)` · horizontal overflow 0 px · `lang="en"` ·
canonical, OG and JSON-LD present · `robots.txt` and `sitemap.xml` correct ·
`/opengraph-image` and `/icon` return 200 PNG · unknown route returns a real 404
· security headers present · **no console messages of any kind**.

---

## Defects found and fixed

Four were real, and none would have been caught by writing code alone.

1. **Contrast failure inherited from the reference.** The faintest text tone
   sampled from the recording measures 3.68:1 on the page background — axe
   flagged 93 nodes. Raised to 5.67:1 (ADR-0003).
2. **The reference's CTA gradient is illegible.** White on its cyan end
   measures 1.81:1. Split into a decorative gradient (headings, 5.9–13.1:1) and
   a deeper filled-button gradient that holds white at ≥5.36:1 across all 21
   sampled stops (ADR-0004).
3. **Analytics silently disabled — twice.** First the `process.env.VERCEL`
   sniff was closed on Vercel too; then, with an explicit flag, Vercel had
   stored it as a _Sensitive_ variable, which never reaches the build and so is
   never inlined into a statically prerendered page. Both failures were silent:
   no error, no failing test. Caught only by opening the deployment and looking
   (ADR-0005).
4. **CI infrastructure defects.** `playwright install --with-deps` stalled 25
   minutes in apt and killed the Firefox job; and the gate job's
   `grep -q "failure" && exit 1` is ambiguous under `bash -e` and ignored
   `cancelled`/`skipped`. Both fixed structurally — browser binaries are now
   cached, apt is isolated with its own timeout and retry, and the gate asserts
   every result is exactly `success`. Browser jobs went from 25 min (timeout)
   to ~75 s.

---

## Roadmap adjustment

The roadmap's "first-load JS < 120 KB" was unreachable: Next 16.3 + React 19
cost **131.0 KB gzip** on an empty page. Two measurement errors were also
found — `size-limit` was globbing every emitted chunk (reporting 179 KB against
a real 137 KB), and the `noModule` legacy polyfill (38.4 KB) was being charged
to users who never download it.

Replaced with `scripts/check-budgets.mjs`, which parses the prerendered HTML and
reports the measured framework floor separately from the first-party delta. §7
of the roadmap is updated with the measurement (ADR-0006).

---

## Known limitations

- **WebKit cannot run locally.** Needs `libevent-2.1-7t64`, which requires
  sudo. CI covers it on every push. To enable locally:
  `sudo apt-get install libevent-2.1-7t64`.
- **One suppressed advisory.** `extract-zip` GHSA-jmr9-qjv8-65gv has no
  published fix; it is CI-only and never shipped. Documented with an exit
  condition in `docs/SECURITY_EXCEPTIONS.md`.
- **`emredogan.work` is not yet pointed here.** It still serves the previous
  project. The cutover is Phase 14, as planned.
- **Visual baselines are Chromium-only.** Deliberate — see
  `docs/BROWSER_SUPPORT.md`.

---

## Next

**Phase 2 — Design System & Global Visual Language.** UI primitives, the
two-tone section heading, the token gallery route, and the contrast tests
extended across every surface pairing.
