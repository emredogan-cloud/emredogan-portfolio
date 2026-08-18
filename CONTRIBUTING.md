# Working conventions

This is a single-maintainer project, but it is run like a team one — the rules
are what keep the site shippable at the end of every phase.

The binding contract is **[`WORKING_DISCIPLINE.md`](./WORKING_DISCIPLINE.md)**.
Read it before touching anything. What follows is the short operational version.

## Before you start

1. Read `WORKING_DISCIPLINE.md`.
2. Read the relevant phase in `PERSONAL_WEBSITE_EXECUTION_ROADMAP.md`.
3. Check `docs/progress/` for the last completed phase.

## While you work

- **No raw design values in components.** Colours, radii, blurs, durations and
  easings come from `src/styles/tokens.css` and `src/lib/motion/tokens.ts`.
- **No content in components.** Copy lives in `src/content/`, validated by Zod.
- **Every animation ships with its reduced-motion behaviour** in the same
  change. Not later.
- **Every visual effect needs a stated purpose.** If you cannot say what it
  does for the reader, do not add it.
- **Never invent a fact.** No fabricated testimonials, metrics, clients,
  employers or certifications. If the evidence does not exist, the section says
  less or does not render.

## Before you commit

```bash
pnpm verify     # lint → typecheck → test → build
pnpm e2e
pnpm a11y
pnpm visual
```

Then open the page in a real browser and look at it. Automated tests do not
catch bad spacing.

## Commits

Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `perf:`,
`a11y:`, `refactor:`, `build:`, `ci:`.

Small and logical. A commit does one thing.

## Never commit

`.env` files, API keys, tokens, credentials, or local editor configuration.

## Updating a visual baseline

Snapshot updates must be justified in the pull-request description: what
changed, and why the new rendering is correct. A blind `--update-snapshots` is
how a real regression gets committed as the new normal.
