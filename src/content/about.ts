import type { About } from './schema';

/**
 * About content.
 *
 * Sourced from a read-only investigation of the local filesystem: git history
 * across the repositories, project manifests, architecture documents, and the
 * subject's own prior written work. Every timeline period is `git log` output
 * rather than recollection.
 *
 * **Specifically not claimed anywhere here, because no evidence exists for it:**
 * employment history, job titles, employers, degrees, awards, competition
 * results, publications, client names, revenue, download counts, or any
 * third-party certification. `credentials` below handles the last one honestly
 * rather than by omission.
 *
 * One editorial decision carried forward from the prior site, and worth
 * stating: the early work happened around 01:30 bakery shifts and high-school
 * exams. That belongs in the record, and it appears once, in past tense, as one
 * line — not as the framing device. Making hardship the headline would be
 * asking to be judged on the story instead of the code.
 */
export const about: About = {
  intro: [
    'Nineteen. Self-taught, two years in, no computer science degree. The early work happened around 01:30 bakery shifts and high-school exams — that is part of the record, but it is not the interesting part.',
    'The interesting part is what the code does. Eight projects, six of them under version control, a little over a thousand commits between April and August 2026. Two are live on the public internet, one is an approved production release, and one was deliberately never shipped.',
    'The through-line is narrow and on purpose: probabilistic systems constrained by deterministic ones. A hardcoded emergency check that runs before the model. A scheduling engine the framework is not allowed to touch. A simulation core that knows nothing about its renderer.',
  ],

  /**
   * The subject's own words, carried forward from his prior written work rather
   * than composed for this site — which is why they read as positions rather
   * than adjectives.
   */
  principles: [
    {
      index: '01',
      title: 'Production-first',
      body: 'Every system is designed for real users from day one. No prototypes wearing the costume of products.',
    },
    {
      index: '02',
      title: 'Reproducible or it does not exist',
      body: 'If it cannot be re-created from a repository, I do not consider it built. Infrastructure in code, decisions written down, gates that must be green before work continues.',
    },
    {
      index: '03',
      title: 'Cost-aware engineering',
      body: 'Every architectural decision considers what it costs per request. At scale those choices compound faster than feature velocity does.',
    },
    {
      index: '04',
      title: 'AI as leverage, never as authority',
      body: 'Augment with AI; never replace engineering rigour. Models hallucinate. Types and tests do not.',
    },
  ],

  capabilities: [
    {
      title: 'Product engineering',
      body: 'End-to-end products rather than front ends: authentication, metered billing, scanning engines, observability, and authorization derived from the token rather than trusted from the client. Four of the eight projects here went from an empty repository to something a stranger could use.',
      tech: ['Next.js', 'React', 'TypeScript', 'PostgreSQL', 'Supabase'],
      icon: 'layers',
    },
    {
      title: 'AI systems',
      body: 'Orchestration where the model is bounded by design: structured output validated against a schema, confidence floors that resolve to "not enough information", deterministic overrides that execute before inference, and remediation produced by playbooks rather than generation.',
      tech: ['Claude', 'Gemini', 'ML Kit', 'Zod'],
      icon: 'brain',
    },
    {
      title: 'Mobile engineering',
      body: 'Flutter applications shipped to production release tracks: on-device machine vision, row-level-secured backends, subscription entitlement mirrored server-side, and paths that still work when the network does not.',
      tech: ['Flutter', 'Dart', 'Riverpod', 'ML Kit'],
      icon: 'smartphone',
    },
    {
      title: 'Cloud and delivery',
      body: 'Production resources provisioned in Terraform, edge functions, object storage, and CI that gates on lint, types, tests, accessibility and performance budgets before anything reaches a branch.',
      tech: ['Terraform', 'AWS', 'Cloudflare R2', 'Vercel', 'Playwright'],
      icon: 'cloud',
    },
  ],

  /**
   * Periods come from `git log --reverse` on each repository, so they are
   * observed rather than remembered. Commit counts are on the default branch.
   */
  timeline: [
    {
      id: 'formai',
      period: 'Apr — Aug 2026',
      title: 'FormAI',
      context: 'On-device vision · 604 commits',
      body: 'The largest codebase here: roughly 61,000 lines of Dart across 177 files, eight pose analyzers, all inference on the device. Reached a closed testing track. Its most telling commit corrects the privacy policy the moment a feature started uploading photographs.',
      evidence: ['604 commits', 'Build 1.0.0+40'],
      projectSlug: 'formai',
    },
    {
      id: 'lumina',
      period: 'May 2026',
      title: 'Lumina',
      context: 'Eleven phases · performance as a build gate',
      body: 'A Next.js monorepo where every route carries its own first-load JavaScript budget and a script fails the build when one is exceeded. Thirty-five routes, three locales, and an editorial workflow that refuses to publish an uncited chapter.',
      evidence: ['35 routes', '3 locales'],
      projectSlug: 'lumina',
    },
    {
      id: 'formai-web',
      period: 'May 2026',
      title: 'FormAI Web',
      context: 'Five days, first commit to live',
      body: 'The product site for FormAI. Notable less for the stack than for the process: a written audit scored version one at 6.2 out of 10 against explicit criteria, and the phased rewrite that followed came from those findings rather than from taste.',
      evidence: ['56 commits', 'Live in 5 days'],
      projectSlug: 'formai-web',
    },
    {
      id: 'pawdoc',
      period: 'May 2026 — present',
      title: 'PawDoc',
      context: 'Safety-critical AI · production release',
      body: 'A pet-health triage product where a false negative is the primary business risk, so the emergency path is hardcoded, mirrored on-device for offline use, and kept in parity across three languages by a test. Reached an approved production release build in August.',
      evidence: ['109 commits', 'Release 1.0.0+8'],
      projectSlug: 'pawdoc',
    },
    {
      id: 'ehliyet-akademi',
      period: 'Jul — Aug 2026',
      title: 'Ehliyet Akademi',
      context: 'Monorepo platform · live in 28 days',
      body: 'A Turborepo platform with a framework-free spaced-repetition engine as its own tested package, taken from first commit to a live production domain in under a month, with architecture decision records kept in-repo throughout.',
      evidence: ['238 commits', 'Live at ehliyetegitim.com'],
      projectSlug: 'ehliyet-akademi',
    },
    {
      id: 'evolutionary-tycoon',
      period: 'Aug 2026',
      title: 'Evolutionary Tycoon',
      context: 'Deterministic simulation · paused at a gate',
      body: 'A browser game whose simulation core imports nothing from its renderer, which is what makes the economy verifiable without a browser and a bug reproducible from a seed. Stopped at phase 4 of 25 deliberately, at a gate, rather than drifting.',
      evidence: ['26k lines', '110 test files'],
      projectSlug: 'evolutionary-tycoon',
    },
  ],

  /**
   * Credentials — handled by stating the truth rather than by leaving the
   * section out.
   *
   * The research finding was unambiguous: **no third-party certification is
   * held.** No certificate file, credential identifier or verification URL
   * exists anywhere. Two AWS exams are planned, and they are marked as targets,
   * explicitly not claiming the certificate is in hand.
   *
   * The `shipped` entries are not a consolation prize. A live domain and an
   * approved production release are things a stranger can verify in a way that
   * a PDF certificate is not.
   */
  credentials: [
    {
      id: 'shipped-ehliyet',
      kind: 'shipped',
      title: 'Ehliyet Akademi — live platform',
      issuer: 'Self-issued · independently verifiable',
      date: 'Aug 2026',
      detail:
        'A learning platform taken from first commit to a live production domain in twenty-eight days. Open it and check.',
      verifyUrl: 'https://www.ehliyetegitim.com',
    },
    {
      id: 'shipped-pawdoc',
      kind: 'shipped',
      title: 'PawDoc — production release build',
      issuer: 'Self-issued · source publicly auditable',
      date: 'Aug 2026',
      detail:
        'A safety-critical mobile product at approved production release 1.0.0+8, with the full source open for inspection.',
      verifyUrl: 'https://github.com/emredogan-cloud/PawDoc',
    },
    {
      id: 'aws-saa',
      kind: 'target',
      title: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: 'Target · Q3 2026',
      detail:
        'Associate. Planned, not held — to formalise architecture already running in production. No certificate exists yet and none is implied.',
      verifyUrl: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
    },
    {
      id: 'aws-devops-pro',
      kind: 'target',
      title: 'AWS Certified DevOps Engineer',
      issuer: 'Amazon Web Services',
      date: 'Target · Q1 2027',
      detail:
        'Professional. Follows the Associate exam; covers the Terraform, CI and release practice already in use. Also not held.',
      verifyUrl: 'https://aws.amazon.com/certification/certified-devops-engineer-professional/',
    },
  ],
};
