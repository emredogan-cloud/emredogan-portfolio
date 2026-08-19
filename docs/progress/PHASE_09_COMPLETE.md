# Phase 9 — Social Proof and Contact / Conversion · COMPLETE WITH ONE BLOCKED STEP

**Date:** 2026-08-19

---

## What was implemented

Three new sections on the home page, in the order a reader needs them after the
work: **Proof**, a **CTA band**, and **Contact** with a working form.

| Surface    | Contains                                                        |
| ---------- | --------------------------------------------------------------- |
| `#proof`   | Six checkable claims, each with the method and a link to verify |
| CTA band   | Availability pill, headline, two calls to action                |
| `#contact` | Email / location / hours cards, copy control, and the form      |

### There is no testimonial carousel, and the site says why

The reference's "Client **Stories**" carousel has no honest equivalent here:
there are no clients to quote. Writing _"Emre delivered exceptional work —
Sarah, CTO"_ would have taken a minute and is exactly what the brief forbids;
an invented quote is not weak evidence, it is a lie about a person who does not
exist.

The section is not omitted either — omission would have been the quiet version
of the same thing. It states the position in its own words and replaces the
quotes with six claims a stranger can check:

| Claim                | Value   | How it can be checked                            |
| -------------------- | ------- | ------------------------------------------------ |
| Public repositories  | 40      | GitHub API: 42 public, minus 2 forks             |
| Live on the internet | 2       | HTTP GET against each origin                     |
| Production release   | 1.0.0+8 | Public source, release build number              |
| Commits              | 1,068   | `git rev-list --count` on each default branch    |
| This site            | Open    | Public repository, workflow file and run history |
| First commit → live  | 28 days | `git log --reverse` against the domain's launch  |

**Deliberately not used as proof:** GitHub stars (every repository has zero, and
a vanity metric at zero is still a vanity metric), follower count (24, and it
measures nothing about the code), and anything resembling users, revenue or
downloads. A unit test fails if any of those words appear in the section.

The date each link was last checked by hand is published on the page, so a
reader knows how stale the check is instead of assuming.

### The contact form

Four defences, cheapest first, all on the server:

1. **Honeypot** — a field no person can see, tab to, or hear. Filled ⇒ the
   message is discarded and the response is the ordinary success text; telling
   a bot it was caught is free information for whoever wrote it.
2. **Schema** (Zod) — the authoritative validation.
3. **Time to fill** — under three seconds since the form rendered is not typing.
4. **Rate limit** — five per address per hour, keyed by a hash of the
   forwarded address rather than the address itself.

Then delivery, through Resend's REST API with `fetch` — one POST does not
justify a dependency. The module carries `import 'server-only'`, so if anything
ever imports it from a client component the **build fails** rather than shipping
the API key to the browser.

Beyond the reference: visible `<label>` on every field (the reference labels its
inputs with placeholders, which vanish on typing and are not names to a screen
reader), `aria-invalid` + `aria-describedby` per field, a `role="status"` region
that exists before it has anything to say, a copy control for the address, and
a `mailto:` fallback that carries the message the visitor already typed.

**No telephone number.** The reference has three info cards, the third being a
phone number. None is published for this subject, so the third card is the
working timezone. A test asserts the page contains no `tel:` link.

---

## Defects found and fixed

### 1. Zod reached the client bundle again, through a different door

First-party JavaScript went from **27.7 KB to 93.8 KB** and the budget check
failed the build. The client form imported three integers — `NAME_MAX`,
`EMAIL_MAX`, `MESSAGE_MAX` — from the module that also defines the Zod schema,
and that import brought the whole validator with it.

This is the same failure Phase 2 fixed for content, arriving from a different
direction, which is what makes the automated budget check worth having: nobody
would have noticed 66 KB by reading the diff. The numbers now live in
`lib/contact/limits.ts`, a module that **imports nothing**. Back to 29.9 KB.

### 2. A silent false success on early submission

The anti-spam heuristics ran before validation, so a visitor who clicked _Send_
within three seconds — which is exactly what people do to find out which fields
are required — was told _"your message is on its way"_, had the form cleared,
and had the message thrown away. Nobody on either end would ever have known.

Validation now runs first; the heuristic only judges submissions that are
otherwise deliverable. The E2E test for field errors deliberately submits
inside that window, so the ordering cannot quietly revert.

### 3. The honeypot could have been filled by the browser itself

The field is named `company`, which is a token Chrome's autofill recognises, and
a one-pixel field is still a field to autofill. An autofilled honeypot looks
exactly like a bot — and this form's answer to a bot is to thank it and discard
the message. Fixed with `readOnly`, which browsers will not autofill and which
does nothing to stop a script setting `.value`, which is the traffic it is for.

### 4. A marquee test that failed on a sampling accident

`moves, and keeps moving in one direction` flaked on Firefox and Chromium. The
cause was not timing: the offset wraps into `[-loopWidth, 0]`, so a first sample
taken just before a wrap is _smaller_ than everything that follows for a further
fifteen seconds. The assertion now measures distance travelled with the wrap
folded in, and passed 30 consecutive runs across both engines.

### 5. WebKit failed CI on the marquee's settle threshold

`settleOffset` accepted a change under 0.5 px between 250 ms samples — 2 px/s —
so it returned while the strip was still visibly decelerating, and the caller's
"it has not moved since" check then failed by 2 px. The velocity ramp is
exponential and asymptotic, so any loose threshold breaks at some frame rate.
The engine already stops writing the transform below 0.05 px/s, which is an
exact condition to wait for; the helper now waits for that instead.

---

## Blocked: actual email delivery

**The form cannot send mail yet, and it says so on screen rather than pretending
otherwise.**

`vercel integration add resend/resend-email` returns `action_required`: Vercel's
marketplace terms for Resend have to be accepted in a browser, by the account
owner, before the integration can be provisioned. That is not something this
build can or should do on someone else's behalf.

Everything up to that point is done and tested. The moment `RESEND_API_KEY`
exists in the Vercel environment, the same code path delivers — no edit needed;
`lib/env.ts` already treats the key as optional and the action already branches
on it.

Until then the behaviour is the designed fallback, verified in Chrome: the form
returns _"The form cannot send mail from this deployment yet. Your message is
still here — send it straight to my inbox instead."_, keeps every word the
visitor typed in the fields, and offers a `mailto:` link carrying the whole
message. The server logs `[contact] delivery unconfigured`. Two E2E tests and
one axe scan cover exactly this state.

**To finish it:** accept the terms at
`https://vercel.com/emre30283-4955s-projects/~/integrations/accept-terms/resend`,
then re-run `vercel integration add resend/resend-email --environment production
--environment preview` and redeploy.

---

## Verification

| Gate                  | Result                                                          |
| --------------------- | --------------------------------------------------------------- |
| `pnpm lint`           | clean, `--max-warnings=0`                                       |
| `pnpm typecheck`      | clean                                                           |
| `pnpm knip`           | clean                                                           |
| Unit                  | **234 passing**, 26 files (+30 this phase)                      |
| E2E + a11y (Chromium) | **148 passing**                                                 |
| E2E + a11y (Firefox)  | **116 passing**, 1 skipped (clipboard permissions)              |
| axe                   | **0 violations**, including the form's error and failure states |
| Visual                | 31 baselines, 4 new (`proof`, `cta` × 2 viewports)              |
| Perf                  | 8 passing                                                       |
| Production build      | 18 static pages                                                 |
| Console               | clean                                                           |
| Real browser          | Chrome — filled and submitted the form; fallback confirmed      |

### Budgets

| Budget              | Measured | Limit  |
| ------------------- | -------- | ------ |
| Total first-load JS | 161.1 KB | 175 KB |
| First-party JS      | 29.9 KB  | 45 KB  |
| CSS                 | 9.1 KB   | 30 KB  |

The whole of Phase 9 — proof section, CTA band, contact section, form, copy
control — cost **2.2 KB** of first-party JavaScript. The roadmap's budget for
the form alone was 6 KB.

---

## Limitations, stated

1. **Delivery is not wired.** See above. This is the one item that keeps the
   phase from being unqualified.
2. **The rate limiter is in-memory**, so it is per-instance and therefore a
   speed bump rather than a guarantee. Written down in the module rather than
   implied. The roadmap's durable option (Upstash Redis) is another account this
   project does not have; only `check` would change.
3. **The clipboard assertion runs on Chromium only.** Playwright cannot grant
   `clipboard-read` in Firefox or WebKit. The test asserts the real clipboard
   contents on Chromium and the control's accessible name everywhere — better
   one browser proving the thing than three proving a proxy for it.
4. **`onboarding@resend.dev` is the sender** until a domain is verified, which
   restricts delivery to the account owner's own address. That is precisely this
   form's destination, so it is sufficient — and swapping it is one environment
   variable.
