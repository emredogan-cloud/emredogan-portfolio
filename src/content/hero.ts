import type { Hero } from './schema';

/**
 * Hero content.
 *
 * The three statistics replace the reference's "20+ Projects · 3+ Years
 * Experience · 100% Passion". Two of those are unverifiable and the third is
 * not a statistic. Every number here was counted on 18 August 2026 and carries
 * the method that produced it:
 *
 *  - **1,068 commits** — `git rev-list --count <default-branch>` summed across
 *    the six of these projects under version control: Evolutionary Tycoon 43,
 *    FormAI 604, PawDoc 109, Ehliyet Akademi 238, Lumina 18, FormAI Web 56.
 *
 *    The *default branch* specifically. An earlier version of this figure said
 *    1,113 because it counted `HEAD`, and three of the six repositories had a
 *    feature branch checked out — so the number included unmerged work and
 *    moved when a branch advanced. Counting the default branch is what anyone
 *    cloning the repositories would reproduce.
 *
 *  - **8 projects** — the eight presented on this site. Asserted against
 *    `projects.length` by a test, so the two cannot drift.
 *  - **3 live or released** — Ehliyet Akademi and FormAI Web return HTTP 200;
 *    PawDoc has an approved production release. Asserted against the project
 *    statuses by a test.
 *
 * Not claimed, because there is no evidence for it: years of experience,
 * employers, client count, revenue, downloads, or user numbers.
 */
export const hero: Hero = {
  badge: 'Available for product, cloud and mobile work',
  headline: { lead: 'Emre', accent: 'Doğan' },
  subhead: 'Full-Stack & AI Developer',
  intro:
    'I build production systems where the language model is the least trustworthy component — and the architecture is what makes the result safe to ship.',
  stack: ['TypeScript', 'Next.js', 'React', 'Flutter', 'Python', 'AWS', 'Postgres'],
  primaryCta: { label: 'View work', href: '/#work' },
  secondaryCta: { label: 'Get in touch', href: '/#contact' },
  stats: [
    {
      value: '1,068',
      label: 'commits',
      evidence:
        'git rev-list on the default branch of the six of these projects under version control. Five are public.',
      verifyUrl: 'https://github.com/emredogan-cloud',
    },
    {
      value: '8',
      label: 'projects built',
      evidence: 'The eight presented on this site — web, mobile, game and research.',
      verifyUrl: null,
    },
    {
      value: '3',
      label: 'live or released',
      evidence:
        'Two reachable over the public internet and verified at HTTP 200; one approved production release.',
      verifyUrl: 'https://www.ehliyetegitim.com',
    },
  ],
  portrait: null,
  spotlight: { label: 'Working in', value: 'TypeScript + Flutter' },
};
