# Phase 14 — Production Hardening and Launch · COMPLETE

**Date:** 2026-08-20

**The site is live at https://emredogan.work.**

---

## What was done

| Task                   | Result                                                                          |
| ---------------------- | ------------------------------------------------------------------------------- |
| Security headers + CSP | Enforced, after report-only verification                                        |
| Domain cutover         | `emredogan.work` and `www` moved to this project; www redirects 308 to the apex |
| Rollback drill         | Both directions on production: **4 s back, 2 s forward**                        |
| Analytics              | Web Analytics and Speed Insights confirmed live in the browser                  |
| Reference comparison   | `docs/REFERENCE_COMPARISON.md` — eight frames, section by section               |
| Runbook                | `docs/RUNBOOK.md`, including the two traps this phase found                     |
| Final report           | `FINAL_PORTFOLIO_COMPLETION_REPORT.md`                                          |

---

## Content Security Policy

Shipped as `Content-Security-Policy-Report-Only` first and verified across every
route, a full scroll of each, a real Server Action submission and the mobile
menu — **no violations** — then enforced and re-verified the same way.

Two directives are not narrow, and the config says why rather than waving them
through. `script-src 'unsafe-inline'` because Next inlines the flight payload
and hydration bootstrap in every prerendered document; the strict alternative is
a per-request nonce, which needs middleware and makes every page dynamic —
trading the entire static-prerender architecture for a directive that stops no
attack this site is exposed to, since no user input is ever rendered into a
page. `style-src 'unsafe-inline'` because the design sets gradients, reveal
delays and glow positions through style attributes.

Resend is deliberately absent from `connect-src`: delivery happens in a Server
Action, so the browser never talks to it, and an entry for it would be a hint
that the key was in the wrong place.

---

## Defects found in this phase

### 1. `upgrade-insecure-requests` broke the entire site on WebKit

CI reported ten unrelated background failures — an empty star field,
`pointer-events: auto`, a canvas that never appeared — plus a navigation
timeout. All of it was one cause: **Chromium and Firefox exempt `localhost`
from the upgrade and WebKit does not**, so against the plain-HTTP test server
every stylesheet and script was requested over `https://127.0.0.1:3100` and
failed. A document with no CSS and no JavaScript looks like ten separate bugs
from the outside.

The directive is now added only when `x-forwarded-proto: https` — every
production request, no local one. The fix needed a second correction: **Next
applies every matching `headers` rule and the last one wins per key**, so the
plain-HTTP rule was overwriting the HTTPS policy it was meant to complement.

### 2. A rollback pinned production, and later pushes silently never went live

After the rollback drill, the production alias stayed on the deployment it was
rolled to. Three subsequent pushes built, passed CI and **did not go live** —
the site kept serving the pinned version with no error anywhere. It surfaced as
a `www` redirect that had been merged, was green, and simply did not exist.

`npx vercel promote <newest> --yes` releases the pin. Written into the runbook
with the symptom, because the symptom is what someone will search for.

### 3. Forced colors, chased through two real fixes before the engine was the answer

WebKit reported 1.81:1 for text under `forced-colors`. Two fixes were made and
both were genuine improvements — a concrete colour before every system keyword,
then splitting a Selectors-Level-4 `:not()` that older parsers discard entirely
— and neither moved the number, because WebKit's emulation returns a
**self-contradictory palette**: `CanvasText` resolves to `#ffffff` (a dark
theme's text) over `Canvas` at `#c0c0c0` (a light theme's silver). Nothing in
CSS reconciles two different themes.

Safari has no Windows High Contrast mode; it maps the media query to macOS
"Increase contrast", a different contract. The suite is now scoped to Chromium
and Firefox, which is where the mode exists, and covers both palettes it can
present. Recorded in `docs/ACCESSIBILITY.md` rather than left as a skip.

### 4. Vercel Analytics looked broken and was not

No request to `/_vercel/insights/script.js` appeared, on any page, after any
wait. Analytics v2 **injects no script tag** — it bundles the tracking code and
beacons directly. `window.va` and `window.si` are both functions on the live
site, with a queued event. Written into the runbook, because the obvious check
returns nothing whether or not it is working.

### 5. The WebKit job outgrew its timeout

`page.goto` exceeded 45 s across six tests, including one stable for phases. The
cross-browser and security-header suites roughly doubled that job's
navigations, and it shares two cores with two workers and a Node server. Raised
to 90 s on CI only — the same suites finish in ~70 s locally, and the product's
own timing budgets live in `tests/perf`, which runs single-worker precisely so
contention cannot be mistaken for a regression.

---

## The cutover

```
before: emredogan.work → emredogan-work    (the previous site)
after:  emredogan.work → emredogan-portfolio
        www.emredogan.work → 308 → emredogan.work
```

The previous project is left intact, so the undo is the same command pointed
back at it. The `www` redirect is in `next.config.ts` rather than the platform
dashboard, so it is visible in review, versioned, and covered by a test that
runs against the production domain and skips visibly elsewhere.

### Verified live

| Check                                                                | Result                                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `/`, `/about`, `/work`, `/work/pawdoc`, `/work/formai`               | 200                                                                      |
| `/sitemap.xml` (11 URLs), `/robots.txt`, `/opengraph-image`, `/icon` | 200                                                                      |
| `/nope`                                                              | 404, designed page                                                       |
| `www.emredogan.work/about`                                           | **308 → `https://emredogan.work/about`**                                 |
| Security headers                                                     | CSP enforced, HSTS preloaded, `X-Frame-Options: DENY`, no `X-Powered-By` |
| TTFB, warm                                                           | **184 ms**, 119 ms of it TLS                                             |
| Edge cache                                                           | `x-vercel-cache: HIT`                                                    |
| Analytics                                                            | `window.va` and `window.si` both live                                    |
| Lighthouse, mobile, applied throttling                               | **95–96 / 100 / 100 / 100**, CLS **0.000**                               |

---

## Limitations, stated

1. **The contact form cannot send mail yet.** Vercel's marketplace terms for
   Resend need the account owner to accept them in a browser. Everything else is
   built and tested; the fallback path is the shipped behaviour until then.
2. **Search Console is not verified.** It needs the owner's Google account. The
   sitemap is live and correct.
3. **No uptime monitoring, error tracking or dependency automation.** Stated in
   the runbook rather than implied.
