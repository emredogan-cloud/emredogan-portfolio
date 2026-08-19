# Runbook

Operational procedures for `emredogan.work`. Every command here has been run,
not drafted — where something has not been exercised, it says so.

---

## Deploying

Pushing to `main` deploys. Vercel builds from the repository; GitHub Actions
runs the gates in parallel and does not gate the deployment, so **a red CI does
not stop a deploy** — check both.

```bash
git push                       # deploys
gh run watch                   # the gates
```

## Rolling back

**Drilled on 2026-08-19**, both directions, on the production alias.

```bash
# What is live now — keep this before you change anything
npx vercel inspect https://emredogan-portfolio.vercel.app | grep -E '^\s+url'

# Recent deployments, newest first
npx vercel ls emredogan-portfolio

# Roll back
npx vercel rollback <deployment-url> --yes

# Roll forward again — same command, the newer URL
npx vercel rollback <newer-deployment-url> --yes
```

Observed: **4 s back, 2 s forward**, with the alias switching immediately.
Verified by checking a header that only exists in one of the two builds:

```bash
curl -sI https://emredogan.work/ | grep -i content-security-policy
```

Rolling back does **not** revert the repository. Push a revert commit as well,
or the next deploy re-introduces whatever was rolled back.

## Moving the domain

`emredogan.work` and `www.emredogan.work` are registered at Namecheap and
served through Vercel DNS.

```bash
# Where the domain points today
npx vercel domains inspect emredogan.work

# Move it to another project (this is the cutover, and its own undo)
npx vercel domains add emredogan.work <project> --force
npx vercel domains add www.emredogan.work <project> --force
```

**To undo a cutover**, run the same command with the previous project name.
The old project is left intact precisely so this works.

## Environment variables

```bash
npx vercel env ls production
npx vercel env add KEY production            # prompts for the value
npx vercel env rm KEY production --yes
```

**`NEXT_PUBLIC_*` variables must not be marked Sensitive.** Sensitive variables
are runtime-only and never reach the build, so a `NEXT_PUBLIC_` value stored
that way is silently absent from a statically prerendered page — which is how
analytics shipped dark twice. Add them with `--no-sensitive`.

| Variable                       | Purpose                                                                                  | Sensitive |
| ------------------------------ | ---------------------------------------------------------------------------------------- | --------- |
| `NEXT_PUBLIC_SITE_URL`         | Canonical origin for metadata, sitemap, JSON-LD                                          | No        |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Explicit on-switch, `1` in production only                                               | No        |
| `CONTACT_TO_EMAIL`             | Where the contact form delivers                                                          | Yes       |
| `RESEND_API_KEY`               | Transactional email. **Absent → the form falls back to `mailto:` and says so on screen** | Yes       |

## Regenerating the font subsets

Only when the content gains a character the subset does not cover —
`tests/unit/fonts.test.ts` fails and names it.

```bash
python3 -m venv .venv && .venv/bin/pip install 'fonttools[woff]'
pnpm build                                   # the script reads the built HTML
.venv/bin/python scripts/subset-fonts.py
pnpm test && pnpm exec playwright test --project=chromium tests/visual
```

Commit the regenerated `.woff2` files and `coverage.json` together.

## Updating visual baselines

```bash
pnpm exec playwright test --project=chromium tests/visual --update-snapshots=all
```

`--update-snapshots` without `=all` only writes **missing** baselines in
Playwright 1.62 — a changed one is left alone and the next run fails.

**Look at the regenerated images before committing them.** The tolerance is
`maxDiffPixelRatio: 0.003`; it was 0.01, which on a dark 768×1400 screenshot is
eleven thousand pixels — enough to hide an entire navigation bar appearing or
disappearing, which it did.

## Checking production

```bash
for p in / /about /work /work/pawdoc; do
  curl -s -o /dev/null -w "$p %{http_code} ttfb=%{time_starttransfer}\n" https://emredogan.work$p
done
curl -sI https://emredogan.work/ | grep -iE 'content-security|strict-transport|x-frame|x-vercel-cache'
```

TTFB on a **cold** connection reads 600–800 ms and means nothing: it is mostly
DNS, TCP and TLS. On a warm one it is 180–210 ms, of which about 65 ms is
server time.

## When the contact form stops delivering

The form never loses a message: if delivery fails or is unconfigured it returns
the visitor's text to the fields and offers a prefilled `mailto:`. Check, in
order:

1. `npx vercel env ls production` — is `RESEND_API_KEY` present?
2. Runtime logs for `[contact] delivery unconfigured` or
   `[contact] delivery failed: …`.
3. Resend's dashboard for the sending domain's status.

The rate limiter is **in-memory and per-instance**, so it is a speed bump, not
a control. If abuse becomes real, replace `RateLimiter.check` with a durable
store; nothing else changes.

## What is not covered here

- **Uptime monitoring and error tracking are not configured.** No Sentry, no
  status page. The site is static and has no runtime dependencies besides the
  contact form, but an outage would be discovered by a person, not an alert.
- **Dependency automation is not configured.** No Renovate or Dependabot;
  updates are manual.

Both are listed as open items in `FINAL_PORTFOLIO_COMPLETION_REPORT.md` rather
than being implied.
