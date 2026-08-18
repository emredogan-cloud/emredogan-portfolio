import type { Hero } from './schema';

/**
 * Hero content.
 *
 * The three statistics replace the reference's "20+ Projects · 3+ Years
 * Experience · 100% Passion". Two of those are unverifiable and the third is
 * not a statistic. Every number here was counted on 18 August 2026 and carries
 * the method that produced it:
 *
 *  - **1,113 commits** — `git rev-list --count HEAD` summed across the six of
 *    these projects that are under version control (Evolutionary Tycoon 56,
 *    FormAI 604, PawDoc 118, Ehliyet Akademi 261, Lumina 18, FormAI Web 56).
 *  - **8 projects** — the eight presented on this site.
 *  - **3 live** — returned HTTP 200 when checked: ehliyetegitim.com,
 *    evolutionary-tycoon.vercel.app, web-form-ai.vercel.app.
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
      value: '1,113',
      label: 'commits',
      evidence: 'Counted with git rev-list across the six of these projects under version control.',
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
      label: 'live in production',
      evidence: 'Reachable over the public internet and verified returning HTTP 200.',
      verifyUrl: 'https://www.ehliyetegitim.com',
    },
  ],
  portrait: null,
  spotlight: { label: 'Working in', value: 'TypeScript + Flutter' },
};
