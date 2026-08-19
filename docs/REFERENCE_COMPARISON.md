# Reference comparison

The brief was to study a reference recording (`Web-ste.webm`, 26.8 s, 1849×1007,
29.67 fps) and rebuild what it does well — **not** to clone it. This is the
side-by-side, section by section, with the eight frames sampled across the
recording and the decisions each one drove.

The reference is another developer's portfolio (`Yusuf.Dev`). **No text, image,
project or claim from it appears anywhere in this build.** Its structure and
motion are what was studied.

---

## Frame 1 — hero (0.5 s)

|                   | Reference                                                            | This build                                                                                              |
| ----------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Headline          | "Hi, I'm **Yusuf**" — two-tone                                       | "**Emre Doğan**" — same two-tone treatment                                                              |
| Sub-line          | Full-Stack Developer                                                 | Full-Stack & AI Developer                                                                               |
| Availability pill | 🚀 "Building products & startups"                                    | "Available for product, cloud and mobile work" with a live dot                                          |
| Stack pills       | React · Django · Python · PostgreSQL · Tailwind                      | TypeScript · Next.js · React · Flutter · Python · AWS · Postgres                                        |
| Calls to action   | View Projects / Contact Me                                           | View work / Get in touch                                                                                |
| Portrait          | Photograph in a glowing frame, floating "Stack: React + Django" card | **Monogram plate** in the same frame, same floating card — no photograph exists and none was fabricated |
| Statistics        | **20+ Projects · 3+ Years Experience · 100% Passion**                | **1,068 commits · 8 projects built · 3 live or released**                                               |

**The statistics are the sharpest difference in the whole comparison.** "3+
Years Experience" and "100% Passion" cannot be checked by anyone. Every number
here states the method that produced it directly underneath — _"git rev-list on
the default branch of the six of these projects under version control"_ — and
two of the three are asserted against the content in a unit test so they cannot
drift.

## Frame 2 — technology marquee (12 s)

Identical in intent: a continuous strip of technology logos. Measured from the
recording at **95–101 px/s** with a **0.6–0.9 s ease in and out** — a damped
velocity a CSS animation cannot produce, so this build runs a small
`requestAnimationFrame` loop over an exponential velocity model instead.

Three things the reference does not do:

- **A visible pause control.** WCAG 2.2.2 requires any automatic motion over
  five seconds to be pausable; the reference offers no way to stop it.
- **The logos are real content.** A visually-hidden list names every technology
  and the projects it was used in, so a screen reader gets information rather
  than a decorative smear.
- **It stops when off-screen and under reduced motion** — no frames spent
  animating something nobody is looking at.

## Frame 3 — About (12 s)

The reference pairs three service cards (Website Development, UI/UX Design,
Deployment) with a paragraph about being "passionate about building scalable
digital products".

This build keeps the two-column shape and replaces the copy with four
**capabilities**, each naming the technologies actually used in the projects
listed below it, plus four principles in the subject's own words. There is no
"passionate about" sentence, and no self-assessed proficiency bars — a test
fails if a percentage ever appears in that section.

## Frame 4 — projects (19 s)

|                | Reference                                                                              | This build                                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Card           | Screenshot, title, one line, stack pills, **Live** and **Code** buttons                | Same anatomy                                                                                                                            |
| Depth          | The card is the whole story                                                            | Every card links to a **case study**: problem, architecture, innovation, outcome                                                        |
| Unshipped work | "Startup — Coming soon — TOP SECRET", with **Live and Code buttons that lead nowhere** | A project with nothing to link **says so**: _"Repository is private — described, not linked."_ Four honesty rules are enforced by tests |

The reference's dead buttons are the single clearest thing this build refuses to
copy. `live` requires a resolving live URL; a private repository is described
and never linked; an unresolved store listing says so instead of implying
availability.

## Frame 5 — "Client Stories" (19 s)

The reference shows a horizontal carousel of testimonials, each with a
**"Verified Client"** badge, above a "Become My Next Client →" button.

**This build has no testimonials, because there are no clients to quote.** The
section is not silently dropped either — that is the quiet version of the same
lie. It says so in its own words and replaces the quotes with six claims a
stranger can check, each with its method and a link: 40 public repositories, 2
live domains, an approved production release, 1,068 default-branch commits, this
site's own source and CI, and 28 days from first commit to a live domain.

Also not used, deliberately: GitHub stars (every repository has zero) and
follower count (24). A vanity metric at zero is still a vanity metric.

## Frame 6 — contact (24 s)

The reference has three info cards — Email, Location, **Phone** — beside a
"Send Me a Message" form whose inputs are labelled by placeholder only.

|            | Reference      | This build                                                                                                                  |
| ---------- | -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Third card | Phone number   | **Working hours** — no phone number is published for this subject, and a test asserts the page contains no `tel:` link      |
| Labels     | Placeholders   | A visible `<label>` on every field                                                                                          |
| Validation | Not observable | Zod on the server, per-field `aria-invalid` and `aria-describedby`, a live region that exists before it has anything to say |
| Spam       | Not observable | Honeypot, minimum fill time, rate limit — all server-side                                                                   |
| Failure    | Not observable | The visitor's words come back **and** a prefilled `mailto:` opens their mail client                                         |

## Frames 7–8 — background and motion

The star field, the meteors and the section-to-section scroll were measured from
the recording rather than guessed: star density, meteor cadence, the marquee's
speed and ramp, and the reveal distance and easing all come from frame analysis
(roadmap §1).

What differs is what happens underneath. The reference runs a client-rendered
single-page app. This one is statically prerendered, with the background as a
**two-layer Canvas 2D** engine — the sky painted once, only the live layer
redrawn — a seeded RNG so the field is reproducible, a device-pixel-ratio cap, a
delta-time clamp, and a full stop when the tab is hidden or the canvas leaves
the viewport. Measured cost: **under 1 % of the frame budget**.

---

## Where this build is deliberately worse

Honesty runs both ways.

- **No portrait.** The reference's photograph anchors its hero; a monogram plate
  does not, however well made. This is a placeholder awaiting a real photograph,
  and it is one content change away from being fixed.
- **No testimonials.** Four five-star quotes are more persuasive at a glance
  than six verifiable numbers, and some readers will not click through to check
  any of them.
- **Fewer projects with live demos.** The reference links live sites for most of
  its work. Two of these eight are live on the public internet; the rest are
  described accurately, which is less impressive and more true.

## What was measured, not guessed

| Property                              | Measured from the recording                                                             |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| Marquee speed                         | 95–101 px/s, ~8.7 s per 840 px loop                                                     |
| Marquee ramp                          | 0.6–0.9 s ease in and out                                                               |
| Reveal distance                       | ~24 px, expo-out easing                                                                 |
| Contrast of the body text colour      | **3.68:1** — below AA, so it was changed to 5.67:1                                      |
| Contrast of white on the CTA gradient | **1.81:1** at the cyan end — so a deeper ramp holds ≥5.36:1 across all 21 sampled stops |

The last two are the clearest case of studying a reference rather than copying
one: the design signature was kept and the two colours that failed WCAG were
corrected.
