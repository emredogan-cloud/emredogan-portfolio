import { parseContent, siteSchema, type Site } from './schema';

/**
 * Site identity.
 *
 * Every field traces to evidence on disk: git authorship across the source
 * repositories, the founder knowledge base assembled from those repositories,
 * and the subject's own prior written work.
 *
 * Deliberately NOT claimed anywhere on this site, because no evidence exists:
 * employment history, job titles, employers, degrees, awards, publications,
 * client names, revenue, download counts, or any third-party certification.
 */
export const site: Site = parseContent(
  siteSchema,
  {
    name: 'Emre Doğan',
    shortName: 'Emre',
    role: 'Full-Stack & AI Developer',
    descriptors: ['Full-Stack Developer', 'AI Developer', 'Indie Hacker'],
    location: 'Adana, Türkiye',
    timezone: 'GMT+3',
    availability: 'Available for product, cloud and mobile work',
    email: 'emre30283@gmail.com',
    url: 'https://emredogan.work',
    tagline: 'I build production systems where the model is the least trustworthy component.',
    description:
      'Independent full-stack and AI developer from Adana, Türkiye. I ship production web, cloud and mobile products — and constrain probabilistic systems with deterministic ones.',
    socials: [
      {
        label: 'GitHub',
        href: 'https://github.com/emredogan-cloud',
        handle: 'emredogan-cloud',
        icon: 'github',
      },
      { label: 'X', href: 'https://x.com/emredogancloud', handle: '@emredogancloud', icon: 'x' },
      {
        label: 'Email',
        href: 'mailto:emre30283@gmail.com',
        handle: 'emre30283@gmail.com',
        icon: 'mail',
      },
    ],
  },
  'site',
);
