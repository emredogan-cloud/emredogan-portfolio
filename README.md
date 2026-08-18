# emredogan.work

Personal portfolio of **Emre Doğan** — full-stack & AI developer, Adana, Türkiye.

Dark, space-themed, motion-led, and engineered like a product: statically
prerendered, budget-enforced, and gated by a CI pipeline that will not go green
until the accessibility, performance and visual-regression suites all pass.

**Production:** <https://emredogan.work>

---

## Stack

| Layer      | Choice                                         | Why                                                                       |
| ---------- | ---------------------------------------------- | ------------------------------------------------------------------------- |
| Framework  | Next.js 16.3 (App Router, Turbopack)           | Static prerender, `next/image`, `next/font`, Metadata API                 |
| UI         | React 19 · TypeScript 5.9 (strict)             | Server-first; client islands only where motion needs them                 |
| Styling    | Tailwind CSS v4 (`@theme`)                     | Tokens live in CSS, consumed as utilities                                 |
| Motion     | `motion` v13 (`motion/react`)                  | Spring model matches the reference's damped marquee; reduced-motion aware |
| Background | Canvas 2D (no dependency)                      | Deliberately not WebGL — see `docs/DECISIONS.md`                          |
| Content    | TypeScript modules + Zod                       | Malformed content fails the build, not production                         |
| Testing    | Vitest · Playwright · axe-core · Lighthouse CI | Eight layers, all wired into CI                                           |
| Hosting    | Vercel                                         | Preview per PR, production on `main`                                      |

Full rationale, decision matrices and the phase plan: **[`PERSONAL_WEBSITE_EXECUTION_ROADMAP.md`](./PERSONAL_WEBSITE_EXECUTION_ROADMAP.md)**.
Permanent operating rules: **[`WORKING_DISCIPLINE.md`](./WORKING_DISCIPLINE.md)**.

---

## Getting started

```bash
pnpm install
cp .env.example .env.local     # optional; the site builds without it
pnpm dev                       # http://localhost:3000
```

Node 22+ and pnpm 10+ (`packageManager` is pinned in `package.json`).

---

## Scripts

| Command                              | Does                                                   |
| ------------------------------------ | ------------------------------------------------------ |
| `pnpm dev`                           | Dev server                                             |
| `pnpm build` / `pnpm start`          | Production build / serve                               |
| `pnpm lint` · `pnpm typecheck`       | ESLint (0 warnings allowed) · `tsc --noEmit`           |
| `pnpm format` · `pnpm format:check`  | Prettier                                               |
| `pnpm test` · `pnpm test:coverage`   | Vitest unit + integration                              |
| `pnpm e2e` · `pnpm e2e:all`          | Playwright (Chromium · all three engines)              |
| `pnpm a11y`                          | axe-core against every route, zero violations required |
| `pnpm visual` · `pnpm visual:update` | Visual regression                                      |
| `pnpm size` · `pnpm analyze`         | Bundle budget · bundle analyzer                        |
| `pnpm lhci`                          | Lighthouse CI against the performance budget           |
| `pnpm knip`                          | Dead code and unused dependencies                      |
| `pnpm verify`                        | lint → typecheck → test → build                        |

---

## Project structure

```
src/
  app/          Routes, metadata, sitemap, robots, OG images
  components/   layout · sections · ui · background
  content/      Zod-validated site and project content — the only place copy lives
  lib/          motion tokens · hooks · utils (cn, seo, contrast, env)
  styles/       Design tokens + global stylesheet
tests/
  unit/  e2e/  a11y/  visual/
docs/
  progress/     One short record per completed phase
```

Adding a project means editing `src/content/projects.ts`. No JSX changes.

---

## Quality gates

Every pull request must pass, in CI:

1. Lint · typecheck · format · dead-code scan
2. Unit tests with coverage thresholds
3. Production build + bundle budget (`size-limit`)
4. Playwright E2E on Chromium, Firefox and WebKit
5. axe-core accessibility — **zero** WCAG 2.2 AA violations
6. Visual regression against committed baselines
7. Lighthouse CI against the performance budget
8. `pnpm audit`, gitleaks secret scan, CodeQL

Budgets are a contract, not a suggestion: exceeding one fails the build. The
fix is to make the site faster, never to raise the number
(`WORKING_DISCIPLINE.md` §7.2).

### Performance budget

| Metric               | Target   | CI limit |
| -------------------- | -------- | -------- |
| LCP                  | < 2.0 s  | 2.5 s    |
| INP                  | < 150 ms | 200 ms   |
| CLS                  | < 0.02   | 0.1      |
| First-load JS (gzip) | < 100 KB | 120 KB   |
| CSS (gzip)           | < 20 KB  | 30 KB    |

---

## Browser support

See [`docs/BROWSER_SUPPORT.md`](./docs/BROWSER_SUPPORT.md).

---

## Content honesty

This site makes no claim it cannot evidence. No invented testimonials, metrics,
employers, clients or certifications appear anywhere — where evidence is
absent, the section says less or does not render. The rule is written down in
`WORKING_DISCIPLINE.md` §1.6 and enforced by the content schema.

---

## Licence

MIT — see [`LICENSE`](./LICENSE). The written content and personal imagery are
not covered by it.
