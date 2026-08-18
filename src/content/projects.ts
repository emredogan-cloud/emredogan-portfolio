import type { Project } from './schema';

/**
 * The eight projects.
 *
 * Reconstructed from the source repositories themselves — manifests, module
 * graphs, `git rev-list`, architecture documents and live HTTP checks — not
 * from README marketing copy. Where a README's status claim disagreed with the
 * evidence, the evidence won.
 *
 * Rules applied throughout:
 *
 *  - **`status` and `statusNote` describe what is verifiable today.** Where a
 *    product is not publicly listed, it says so rather than implying it is.
 *  - **Metrics are counted, not estimated.** Commit counts from
 *    `git rev-list --count HEAD` on 18 August 2026; file and line counts from
 *    the working trees; live URLs returned 200 when checked.
 *  - **Private repositories are not linked.** Lumina's repository is private,
 *    so it is described and not linked — never linked to a 404.
 *  - **No technology appears in a `stack` unless it is in that project's
 *    manifest or infrastructure code.** Nothing is borrowed between projects.
 *  - **Covers are real captures or nothing.** Three are screenshots of the live
 *    sites, two are screenshots of the shipped apps, and three are `null`
 *    because no capture is possible — those render a generated mark, not a
 *    stand-in photograph.
 */
const raw = [
  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'pawdoc',
    name: 'PawDoc',
    tagline: 'AI pet-health triage where the safety rail runs before the model does.',
    hook: 'The emergency keyword list is written three times — in Dart, Python and TypeScript — and a test fails the build if the three ever disagree.',
    summary:
      'An owner describes a symptom, or photographs it, and PawDoc returns a triage decision: get help now, call today, or watch and re-check. A false negative is the worst thing this product can do, so the architecture treats the language model as the least trustworthy component in the system and constrains it accordingly.',
    role: 'Founder · sole engineer',
    year: '2026',
    status: 'released',
    statusNote:
      'Google Play production release build 1.0.0+8, approved 15 August 2026. The public store listing had not resolved when this page was written, so it is not linked.',
    stack: [
      'Flutter',
      'Dart',
      'Riverpod',
      'Python',
      'FastAPI',
      'Supabase',
      'PostgreSQL',
      'Deno',
      'Claude',
      'Gemini',
      'Cloudflare R2',
      'Sentry',
      'PostHog',
    ],
    beats: {
      problem:
        'Owners cannot tell an emergency from a nuisance, and the internet answers both the same way. Telling someone their animal is fine when it is not is unrecoverable — so the design question is not "how good is the model" but "what happens when the model is wrong".',
      architecture:
        'A Flutter client, a Python FastAPI analysis service, Supabase Postgres with row-level security on every user table, roughly thirteen Deno edge functions, and Cloudflare R2 for image and video objects. Analysis tiers from Gemini up to Claude depending on what the request needs.',
      innovation:
        'A hardcoded emergency-keyword override executes before any model call, and is mirrored client-side so it still works on an offline cold start. The keyword lists live in three languages — safety.py, emergency_keywords.mjs, emergency_keywords.dart — and a parity test fails the build if they drift apart.',
      outcome:
        'Structured JSON output only, temperature 0.1, a confidence floor below which the answer becomes "not enough information", and an action ladder with no "do nothing" rung. The model never names a condition and never says "normal".',
    },
    highlights: [
      'The emergency override runs before the model, not after it — and is mirrored on-device so it survives an offline cold start.',
      'The AnalysisResult contract is frozen across Dart, Python and TypeScript; all three change together or not at all.',
      'Row-level security on every user table with both USING and WITH CHECK, verified by a scripted test against a real database.',
      'Disclaimers are injected server-side. The client only gates on the flag, so it cannot render a result without one.',
      'A safety-critical defect found during device QA — Emergency unreachable on an offline cold start — was fixed and regression-tested rather than noted.',
    ],
    metrics: [
      { value: '118', label: 'commits' },
      { value: '3', label: 'languages kept in parity' },
      { value: '0.1', label: 'model temperature' },
      { value: '13', label: 'edge functions' },
    ],
    links: [
      { label: 'Repository', href: 'https://github.com/emredogan-cloud/PawDoc', kind: 'repo' },
    ],
    cover: {
      src: '/work/pawdoc.jpg',
      alt: 'PawDoc showing a high-risk triage result: an emergency banner, a risk level, a ranked list of actions, and a veterinary disclaimer.',
      width: 1600,
      height: 1000,
      capture: 'real',
    },
    accent: 'rose',
    featured: true,
    order: 1,
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'ehliyet-akademi',
    name: 'Ehliyet Akademi',
    tagline: 'A driving-licence learning platform built around a spaced-repetition engine.',
    hook: 'The scheduling engine is its own package with its own tests, because the thing that decides when you see a question again is the actual product.',
    summary:
      'An end-to-end preparation platform for Turkish class-B licence candidates, covering both the theoretical e-exam and the practical test. Built as a Turborepo monorepo with a web app, a Flutter app and four shared packages, and taken from first commit to a live production domain in twenty-eight days.',
    role: 'Founder · sole engineer',
    year: '2026',
    status: 'live',
    statusNote:
      'Web platform live at ehliyetegitim.com, verified returning HTTP 200. Mobile build 1.0.0+6 produced; store listing pending, so it is not claimed.',
    stack: [
      'TypeScript',
      'Next.js',
      'React',
      'Drizzle ORM',
      'PostgreSQL',
      'PGlite',
      'Flutter',
      'Turborepo',
      'Playwright',
      'Vitest',
    ],
    beats: {
      problem:
        'Licence preparation is sold as question dumps. Volume is not the constraint — retention is. Answering two thousand questions once teaches less than answering the right two hundred on the right days.',
      architecture:
        'A Turborepo monorepo: a Next.js App Router web app, a Flutter mobile app, and shared packages for the content schema, the question bank, the database layer and the scheduling engine. Drizzle ORM over Postgres, with PGlite for embedded local execution.',
      innovation:
        'The spaced-repetition engine is an independent package that depends only on the content schema — no database, no framework, no network. That makes the part of the product which actually determines learning outcomes unit-testable in isolation rather than only observable in production.',
      outcome:
        'Quality gates that mirror CI exactly, architecture decision records kept in-repo throughout, and a binding content rule: an original question bank, with "official rule" reserved for verified legislation.',
    },
    highlights: [
      'The scheduling engine is framework-free and database-free, so its behaviour is provable rather than merely observable.',
      'PGlite alongside Postgres means the same schema runs embedded and hosted, so local development and tests are real rather than mocked.',
      'Documentation discipline enforced by structure: decision records in-repo, a roadmap treated as the single source of truth, phase gates that must be green before work continues.',
      'Content legality is a first-class constraint — original questions only, and regulatory claims restricted to verified legislation.',
      'Commit history is written in Turkish for a Turkish-market product, and in English everywhere else.',
    ],
    metrics: [
      { value: '261', label: 'commits' },
      { value: '28d', label: 'first commit to live' },
      { value: '4', label: 'shared packages' },
      { value: '2', label: 'client surfaces' },
    ],
    links: [
      { label: 'ehliyetegitim.com', href: 'https://www.ehliyetegitim.com', kind: 'live' },
      {
        label: 'Repository',
        href: 'https://github.com/emredogan-cloud/ehliyet-akademi',
        kind: 'repo',
      },
    ],
    cover: {
      src: '/work/ehliyet-akademi.jpg',
      alt: 'The Ehliyet Akademi home page: a diagnostic-test call to action beside counts of questions, lessons, traffic signs and vehicle images.',
      width: 1600,
      height: 1000,
      capture: 'real',
    },
    accent: 'emerald',
    featured: true,
    order: 2,
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'formai',
    name: 'FormAI',
    tagline: 'A camera-driven fitness coach that counts and corrects repetitions on-device.',
    hook: 'Packaged food never reaches the vision model — a barcode is an exact identification against the manufacturer’s own nutrition panel, and it costs nothing.',
    summary:
      'A single Flutter codebase pairing a thirty-day training programme with on-device pose analysis for live repetition counting and form correction, plus nutrition tracking, subscriptions and native session widgets. The largest codebase in this portfolio.',
    role: 'Founder · sole engineer',
    year: '2026',
    status: 'release-candidate',
    statusNote:
      'Build 1.0.0+40 on the Google Play closed testing track. Not yet publicly listed. The iOS target is written but has never been built, so no iOS claim is made.',
    stack: [
      'Flutter',
      'Dart',
      'Riverpod',
      'Supabase',
      'PostgreSQL',
      'ML Kit',
      'Terraform',
      'RevenueCat',
      'Sentry',
      'PostHog',
    ],
    beats: {
      problem:
        'Form is what makes training safe, and it is exactly what you cannot check alone. Sending video to a server to find out is slow, expensive and a privacy problem all at once.',
      architecture:
        'Everything vision-related runs on the device through Google ML Kit pose detection. Supabase Postgres holds the exercise catalogue behind row-level security; a Deno edge function and a Terraform-managed AWS edge serve the legal surface.',
      innovation:
        'Two detectors share one camera stack rather than two. Barcode scanning was chosen from the same vendor as the pose detector specifically so it adds a detector to the existing pipeline, instead of bringing a second camera implementation that would fight the first.',
      outcome:
        'Roughly 61,000 lines of Dart across 177 source files, eight pose analyzers and a 138-exercise catalogue, with a four-layer release-build error guard and observability behind a KVKK/GDPR consent gate.',
    },
    highlights: [
      'Pose analysis is entirely on-device — no video leaves the phone for the coaching path.',
      'The barcode route exists so packaged food is identified exactly rather than estimated by a vision model.',
      'Every user table is row-level-security gated end to end; analytics sit behind an explicit consent gate.',
      'A dependency was removed only after measuring that it had already been tree-shaken to 848 bytes — the reasoning is written down in the manifest.',
      'The privacy policy was corrected the moment the calorie scanner started uploading photos, in a commit that says exactly that.',
    ],
    metrics: [
      { value: '604', label: 'commits' },
      { value: '~61k', label: 'lines of Dart' },
      { value: '8', label: 'pose analyzers' },
      { value: '138', label: 'exercise catalogue' },
    ],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/emredogan-cloud/FormAI-Fitness-Kocu',
        kind: 'repo',
      },
    ],
    cover: {
      src: '/work/formai.jpg',
      alt: 'FormAI running on a phone, showing a live workout session with pose feedback overlaid on the camera view.',
      width: 1600,
      height: 1000,
      capture: 'real',
    },
    accent: 'violet',
    featured: true,
    order: 3,
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'evolutionary-tycoon',
    name: 'Evolutionary Tycoon',
    tagline:
      'An isometric browser management game whose demand is real traffic, not a spawn timer.',
    hook: 'The simulation core knows nothing about the renderer. Phaser only draws — which is what makes the economy testable headlessly and a bug reproducible from a seed.',
    summary:
      'A 2D isometric tycoon game: turn a roadside lemonade stand into a restaurant chain by converting the vehicles physically passing your plot into customers. The differentiator is that demand is an observable, influenceable traffic flow rather than a timer that emits customers.',
    role: 'Designer · engineer',
    year: '2026',
    status: 'in-development',
    statusNote:
      'Phases 0–4 of a 25-phase plan are complete and the build is deliberately paused there. The isometric renderer and the deterministic simulation core work; the art is placeholder, which the live build shows honestly.',
    stack: ['TypeScript', 'Vite', 'Phaser 4', 'Svelte 5', 'Vitest', 'Playwright', 'Vercel'],
    beats: {
      problem:
        'In this genre demand arrives from a spawn timer, which the player cannot see, predict or influence. That makes the core loop opaque: you upgrade and hope. Making demand a physical flow of vehicles across the screen turns the same loop into something you can watch and reason about.',
      architecture:
        'One decision carries the project: the simulation is a dependency-free, deterministic TypeScript core with no knowledge of the renderer, and Phaser is a drawing layer fed by a bridge. Six separate RNG streams, an eighteen-slot system pipeline, a command log and an event bus sit behind it. No backend at all — it deploys as a static site.',
      innovation:
        'Separating simulation from rendering buys five things at once that would each be hard to retrofit: headless tests, economy balance verification in CI, pixel-exact visual regression, bug reports reproducible from a seed, and a "replay the day" feature that is free rather than engineered.',
      outcome:
        'Roughly 26,000 lines across 143 source files with 110 test files, a determinism suite, and a simulation benchmark. Phaser 4 was chosen over PixiJS and a custom WebGL2 renderer on a weighted comparison recorded in the repository.',
    },
    highlights: [
      'The simulation core imports nothing from the renderer, so the economy can be verified without a browser.',
      'Six independent RNG streams, so adding a system cannot perturb another system’s sequence.',
      'A determinism suite: the same seed must produce the same world hash, which is what makes a bug report reproducible.',
      'The engine decision is written down as a weighted comparison of four candidates, not asserted.',
      'Paused at phase 4 of 25 on purpose, at a gate, rather than drifting — and the live build shows placeholder art rather than pretending otherwise.',
    ],
    metrics: [
      { value: '26k', label: 'lines of TypeScript' },
      { value: '110', label: 'test files' },
      { value: '6', label: 'RNG streams' },
      { value: '4/25', label: 'phases complete' },
    ],
    links: [
      {
        label: 'Live build',
        href: 'https://evolutionary-tycoon.vercel.app',
        kind: 'live',
      },
      {
        label: 'Repository',
        href: 'https://github.com/emredogan-cloud/evolutionary-tycoon',
        kind: 'repo',
      },
    ],
    cover: {
      src: '/work/evolutionary-tycoon.jpg',
      alt: 'The Evolutionary Tycoon build: a 2:1 dimetric road and plot rendered with placeholder art markers standing in for the final sprites.',
      width: 1600,
      height: 1000,
      capture: 'real',
    },
    accent: 'amber',
    featured: true,
    order: 4,
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'formai-web',
    name: 'FormAI Web',
    tagline: 'The marketing site for FormAI — dark, cinematic, and shipped in five days.',
    hook: 'Its own audit scored the first version 6.2 out of 10 and the findings became the roadmap. The score is in the repository.',
    summary:
      'A six-page Turkish-language product site for FormAI, built to mirror the coaching identity of the app rather than to look like a generic SaaS template. Statically rendered, animated, and deployed on Vercel.',
    role: 'Designer · engineer',
    year: '2026',
    status: 'live',
    statusNote: 'Live on Vercel, verified returning HTTP 200.',
    stack: [
      'Next.js',
      'TypeScript',
      'Tailwind CSS',
      'Framer Motion',
      'MediaPipe',
      'Sentry',
      'Vercel',
    ],
    beats: {
      problem:
        'An app whose entire premise is a camera watching you move cannot be sold with stock photography and three feature bullets. The site has to demonstrate the thing.',
      architecture:
        'Next.js App Router with a page per product pillar — training, nutrition, progress, support, conversion — each with its own generated Open Graph image. MediaPipe ships on the page so the pose overlay is the real detector rather than a video of one.',
      innovation:
        'The interesting part is not the stack, it is the process: a written audit scored version one at 6.2/10 against explicit criteria, and the seven-phase evolution plan that followed is derived from those findings rather than from taste.',
      outcome:
        'Eighty-eight source files across ten routes, with security and long-cache headers declared in configuration rather than assumed, and the audit and phase reports kept in the repository.',
    },
    highlights: [
      'Six pages in Turkish, each with its own generated Open Graph image.',
      'A written audit with a numeric score, kept in the repository, driving a phased rewrite.',
      'MediaPipe on the page so the pose demonstration is the real detector, not a recording of one.',
      'Security headers and cache policy declared in `vercel.json` rather than left to defaults.',
    ],
    metrics: [
      { value: '56', label: 'commits' },
      { value: '10', label: 'routes' },
      { value: '5d', label: 'first commit to live' },
      { value: '6.2', label: 'self-audit score, v1' },
    ],
    links: [
      { label: 'web-form-ai.vercel.app', href: 'https://web-form-ai.vercel.app', kind: 'live' },
      {
        label: 'Repository',
        href: 'https://github.com/emredogan-cloud/Web-FormAI',
        kind: 'repo',
      },
    ],
    cover: {
      src: '/work/formai-web.jpg',
      alt: 'The FormAI Web home page: a large Turkish headline beside phone mock-ups showing live pose tracking and nutrition screens.',
      width: 1600,
      height: 1000,
      capture: 'real',
    },
    accent: 'violet',
    featured: false,
    order: 5,
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'lumina',
    name: 'Lumina',
    tagline: 'A cinematic encyclopedia of notable lives, static-first by discipline.',
    hook: 'Every route carries its own first-load JavaScript budget, and a script fails the build when one is exceeded — the cinematic surface is not allowed to cost the reader latency.',
    summary:
      'An animated encyclopedia of remarkable lives across technology, science, sport, the arts, business and the humanities. A Next.js monorepo with a Sanity editorial workflow, Algolia search, authentication and billed premium tiers — built to the brief "open a page, fall into a life".',
    role: 'Architect · engineer',
    year: '2026',
    status: 'in-development',
    statusNote:
      'Eleven phases complete across a monorepo of two applications. The repository is private and is therefore described here but not linked, and there is no public deployment to screenshot.',
    stack: [
      'Next.js',
      'React',
      'TypeScript',
      'Sanity',
      'Algolia',
      'Clerk',
      'Stripe',
      'Upstash Redis',
      'next-intl',
      'Tailwind CSS',
    ],
    beats: {
      problem:
        'Reference sites are either fast and dull or beautiful and slow. A page that takes four seconds to become readable has not earned its typography, however good the typography is.',
      architecture:
        'A pnpm monorepo: a Next.js reader and a Sanity studio. Profile, category, list and article routes all flow through `generateStaticParams` with incremental regeneration. Edge middleware owns exactly three concerns in a fixed order — authentication gating with a real 307, forced 404s for unknown slugs, and locale resolution.',
      innovation:
        'Performance is a build gate rather than an aspiration. Every route is classified into a tier — homepage, profile, discovery, marketing — with its own first-load JavaScript budget, and a script parses the build output and exits non-zero when a tier is exceeded. GSAP is lazily imported inside the one component that needs it; the connection graph is dynamically imported and mounted on intersection.',
      outcome:
        'Thirty-five routes, three locales with per-page hreflang, a sitemap sharded into five files for scale, an editorial audit trail with a publish gate that refuses to publish an uncited chapter, and thirty-eight passing tests.',
    },
    highlights: [
      'Per-route first-load JavaScript budgets, enforced by a script that fails the build.',
      'Static-first rendering with incremental regeneration on every content route.',
      'Edge middleware with three responsibilities in a defined order, so behaviour is predictable.',
      'A publish gate that refuses to publish a chapter without a citation, a fact-check date and a reviewer.',
      'A Wikidata importer that drafts profiles and never auto-publishes them.',
    ],
    metrics: [
      { value: '11', label: 'phases complete' },
      { value: '35', label: 'routes' },
      { value: '3', label: 'locales' },
      { value: '38', label: 'tests passing' },
    ],
    links: [],
    cover: null,
    accent: 'cyan',
    featured: false,
    order: 6,
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'nova',
    name: 'NOVA',
    tagline: 'An on-device agent architecture, and an honest account of why it was not shipped.',
    hook: 'Its own architecture review concluded that the model is not the product — the harness is — and that the agent’s core guarantee was hoped for in a prompt rather than enforced in code.',
    summary:
      'A Kotlin multi-module Android agent that plans, acts on the device and verifies the result, together with a research corpus arguing at length — and against its own author — about what such a system would have to become before it could be trusted.',
    role: 'Architect · engineer',
    year: '2026',
    status: 'research',
    statusNote:
      'A working multi-module codebase plus thirty-six documents, including a ten-part architecture review. Deliberately not shipped: the review concluded the enforcement model was not sound enough to put in front of anyone.',
    stack: ['Kotlin', 'Android', 'Gradle', 'Coroutines'],
    beats: {
      problem:
        'A phone assistant that can actually operate the phone has to be trusted with outward actions — sending, deleting, paying. Trust has to be structural, because one confident hallucination on an outward action is unrecoverable.',
      architecture:
        'Gradle multi-module with deliberately platform-free boundaries: core, planner, memory and the tool API contain no Android dependencies at all and are unit-tested in isolation. Voice, model providers and Android integration are separate modules behind interfaces.',
      innovation:
        'Verify-don’t-assume actuation — real machine verifiers read device state back after an action rather than trusting the model’s report — plus a deny-first confirmation parser and a no-retry rule on anything outward-facing.',
      outcome:
        'The architecture review is the deliverable. It identifies that success was being accepted on the model’s word, that memory was a five-hundred-row log with no consolidation, and that building on the accessibility layer was a strategic dead end — then argues for a channel hierarchy instead.',
    },
    highlights: [
      'Platform-free module boundaries — the portable half of the system genuinely does not import Android.',
      'Verifiers read device state back after acting, instead of accepting the model’s claim of success.',
      'Deny-first confirmation parsing and a no-retry rule on outward actions.',
      'The review is written against its author’s own work: "assume the current architecture is wrong until proven correct".',
      'Not shipping was the finding, and it is recorded as one rather than as a pause.',
    ],
    metrics: [
      { value: '13', label: 'Gradle modules' },
      { value: '36', label: 'documents' },
      { value: '0', label: 'outward actions taken on trust' },
    ],
    links: [],
    cover: null,
    accent: 'blue',
    featured: false,
    order: 7,
  },

  // ───────────────────────────────────────────────────────────────────────────
  {
    slug: 'living-library',
    name: 'Living Library',
    tagline: 'Eleven original books and the zero-dependency reading engine they run on.',
    hook: 'The reading engine is inherited between volumes: the typography and page mechanics stay fixed, and only the identity changes.',
    summary:
      'A collection of original Turkish literary works — codices, a fable collection and several narrative volumes — delivered through a hand-built, dependency-free reading engine that treats the page turn, the typesetting and the reading performance as the product rather than the wrapper.',
    role: 'Author · engineer',
    year: '2026',
    status: 'release-candidate',
    statusNote:
      'Eleven volumes with content and engine complete, each in its own public repository. Not published to a store, so no store claim is made.',
    stack: ['TypeScript', 'Python', 'HTML', 'CSS'],
    beats: {
      problem:
        'Reading applications optimise for library management. The actual experience — how a page turns, how a paragraph is set, whether the text is worth setting — is where the attention should go.',
      architecture:
        'Each volume is a self-contained build with its own Python pipeline producing the packaged reading experience. The engine is carried forward between books rather than rewritten, and has no runtime dependencies at all.',
      innovation:
        'Form discipline as an inheritance rule: when a new volume adopts the engine, the page mechanics, typesetting and performance characteristics are preserved deliberately, and only colour, atmosphere, cover and metadata change. The reading experience cannot regress from book to book because it is not re-implemented.',
      outcome:
        'Eleven volumes of original writing with a consistent reading experience, and a stated editorial position — a fable "leaves an observation rather than imposing a lesson".',
    },
    highlights: [
      'The books are original work, not a reader for someone else’s catalogue.',
      'A zero-dependency reading engine — the page turn and the typesetting are the engineering, not a wrapper around a library.',
      'The engine is explicitly inherited between volumes, so the reading experience cannot regress.',
      'Editorial structure is deliberate: thematic clusters that order the work without imposing continuity.',
    ],
    metrics: [
      { value: '11', label: 'volumes' },
      { value: '0', label: 'runtime dependencies' },
      { value: '11', label: 'public repositories' },
    ],
    links: [
      {
        label: 'Repositories',
        href: 'https://github.com/emredogan-cloud?tab=repositories&q=codex',
        kind: 'repo',
      },
    ],
    cover: null,
    accent: 'amber',
    featured: false,
    order: 8,
  },
] as const satisfies readonly Project[];

/**
 * `satisfies` on the literal, then a widening assignment.
 *
 * Authoring against `satisfies` keeps every field checked while the literal
 * types survive, so a typo in a `status` or an `accent` is a compile error here
 * rather than a runtime surprise. The exported value is widened to `Project[]`
 * so consumers are not coupled to the literal shape.
 */
export const projects: readonly Project[] = raw;

export const featuredProjects: readonly Project[] = projects
  .filter((project) => project.featured)
  .sort((a, b) => a.order - b.order);

export const orderedProjects: readonly Project[] = [...projects].sort((a, b) => a.order - b.order);

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export const projectSlugs: readonly string[] = projects.map((project) => project.slug);
