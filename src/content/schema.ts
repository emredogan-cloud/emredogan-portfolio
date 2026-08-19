import { z } from 'zod';

/**
 * Content contract.
 *
 * Every piece of portfolio content is parsed through these schemas at module
 * load. A malformed or incomplete record throws during `next build`, so it is
 * impossible to ship a project card with a missing alt text or an invalid link
 * (ROADMAP §12, WORKING_DISCIPLINE §9.1).
 */

const socialLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().url().or(z.string().startsWith('mailto:')),
  handle: z.string().min(1),
  icon: z.enum(['github', 'x', 'mail', 'linkedin']),
});

export const siteSchema = z.object({
  name: z.string().min(1),
  shortName: z.string().min(1),
  /** Primary positioning line. One line, not a list of five titles. */
  role: z.string().min(1),
  /** Supporting descriptors shown as pills. Keep to three. */
  descriptors: z.array(z.string().min(1)).min(1).max(4),
  location: z.string().min(1),
  timezone: z.string().min(1),
  availability: z.string().min(1),
  email: z.string().email(),
  url: z.string().url(),
  tagline: z.string().min(10).max(200),
  description: z.string().min(50).max(300),
  socials: z.array(socialLinkSchema).min(1),
});
export type Site = z.infer<typeof siteSchema>;

const projectStatusSchema = z.enum([
  'live', // publicly reachable at a real URL right now
  'released', // shipped to a store or production release track
  'release-candidate', // feature-complete, gated on an external step
  'in-development',
  'research', // architecture and analysis, deliberately not shipped
]);

const projectLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().url(),
  kind: z.enum(['live', 'repo', 'store', 'docs']),
});

const projectVisualSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(8, 'Alt text must describe the image, not label it.'),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** How the asset was produced. A reconstruction is never presented as a
   *  live product capture. */
  /**
   * How the image was produced. A reconstruction is never presented as a
   * capture of a running product.
   *
   *  - `real`      — a screenshot of the live site or the shipped app
   *  - `diagram`   — an authored illustration of the architecture
   */
  capture: z.enum(['real', 'diagram']),
});

export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase ASCII kebab-case.'),
  name: z.string().min(2),
  tagline: z.string().min(10).max(140),
  /** The single most interesting true thing about this project. */
  hook: z.string().min(20),
  summary: z.string().min(40),
  role: z.string().min(2),
  year: z.string().regex(/^\d{4}(–\d{4}|–present)?$/),
  status: projectStatusSchema,
  /** Plain-language status. Never inflates: if it is not in a store, say so. */
  statusNote: z.string().min(10),
  stack: z.array(z.string().min(1)).min(1),
  beats: z.object({
    problem: z.string().min(30),
    architecture: z.string().min(30),
    innovation: z.string().min(30),
    outcome: z.string().min(30),
  }),
  highlights: z.array(z.string().min(20)).min(2),
  metrics: z.array(z.object({ value: z.string().min(1), label: z.string().min(1) })),
  links: z.array(projectLinkSchema),
  /**
   * `null` where no capture is possible — a private repository, or a project
   * that was deliberately never deployed. Those render a generated cover that
   * reads as a deliberate mark rather than a missing image, and the absence is
   * visible in the UI rather than papered over with a stock photo.
   */
  cover: projectVisualSchema.nullable(),
  /** Accent used by the generated cover and the case-study header. */
  accent: z.enum(['blue', 'cyan', 'amber', 'emerald', 'rose', 'violet']),
  /**
   * Optional rather than defaulted: `.default([])` makes the field *required*
   * in the inferred output type, which forces every authored record to write
   * `gallery: []` even when it has none. Read sites use `?? []`.
   */
  gallery: z.array(projectVisualSchema).optional(),
  featured: z.boolean(),
  /** Lower renders earlier. */
  order: z.number().int().nonnegative(),
});
export type Project = z.infer<typeof projectSchema>;

/**
 * A number a stranger could check for themselves.
 *
 * `evidence` is required and `verifyUrl` is explicit-nullable rather than
 * optional: writing a metric on this site forces a decision about where it
 * came from, and "there is no public URL for this" has to be stated rather
 * than left off.
 */
const proofPointSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(2),
  evidence: z.string().min(10),
  verifyUrl: z.string().url().nullable(),
});

const heroSchema = z.object({
  /** Small pill above the headline. */
  badge: z.string().min(4),
  /** Rendered plain, then in the brand gradient. */
  headline: z.object({ lead: z.string().min(1), accent: z.string().min(1) }),
  subhead: z.string().min(4),
  intro: z.string().min(40),
  /** Technologies shown as pills. Short labels only. */
  stack: z.array(z.string().min(1)).min(3).max(8),
  primaryCta: z.object({ label: z.string().min(2), href: z.string().min(1) }),
  secondaryCta: z.object({ label: z.string().min(2), href: z.string().min(1) }),
  stats: z.array(proofPointSchema).length(3),
  /**
   * Portrait. `null` renders the monogram plate — a deliberate placeholder,
   * not a broken image. Swapping in a photo is a change to this field only.
   */
  portrait: z.object({ src: z.string().min(1), alt: z.string().min(10) }).nullable(),
  /** The floating glass card over the portrait frame. */
  spotlight: z.object({ label: z.string().min(2), value: z.string().min(2) }),
});
export type Hero = z.infer<typeof heroSchema>;

export { heroSchema };

// ── About ───────────────────────────────────────────────────────────────────

const principleSchema = z.object({
  index: z.string().regex(/^\d{2}$/),
  title: z.string().min(3),
  body: z.string().min(30),
});

const capabilitySchema = z.object({
  title: z.string().min(3),
  body: z.string().min(60),
  tech: z.array(z.string().min(1)).min(1),
  icon: z.enum(['cloud', 'brain', 'layers', 'smartphone', 'code', 'book']),
});

const timelineEntrySchema = z.object({
  id: z.string().min(1),
  period: z.string().min(3),
  title: z.string().min(2),
  context: z.string().min(3),
  body: z.string().min(60),
  /**
   * What makes the entry checkable. Required: a timeline of unfalsifiable
   * claims is a CV, not a record.
   */
  evidence: z.array(z.string().min(2)).min(1),
  /** Links to the project page where one exists. */
  projectSlug: z.string().nullable(),
});

const credentialSchema = z.object({
  id: z.string().min(1),
  /**
   * `held` is reserved for a credential actually in hand. `target` is a stated
   * intention. `shipped` is a thing a stranger can verify for themselves —
   * which a live domain is and a PDF certificate is not.
   */
  kind: z.enum(['held', 'target', 'shipped']),
  title: z.string().min(3),
  issuer: z.string().min(2),
  date: z.string().min(3),
  detail: z.string().min(20),
  verifyUrl: z.string().url().nullable(),
});

export const aboutSchema = z.object({
  intro: z.array(z.string().min(60)).min(2),
  principles: z.array(principleSchema).min(3),
  capabilities: z.array(capabilitySchema).min(3),
  timeline: z.array(timelineEntrySchema).min(3),
  credentials: z.array(credentialSchema).min(2),
});
export type About = z.infer<typeof aboutSchema>;
export type Capability = z.infer<typeof capabilitySchema>;
export type Credential = z.infer<typeof credentialSchema>;

/** Parses and throws with a readable path on failure. */
export function parseContent<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown,
  label: string,
): z.infer<T> {
  const result = schema.safeParse(value);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  · ${label}${i.path.length ? `.${i.path.join('.')}` : ''}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid content in ${label}:\n${issues}`);
  }
  return result.data;
}
