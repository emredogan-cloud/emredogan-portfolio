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
  capture: z.enum(['real', 'diagram', 'placeholder']),
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
  cover: projectVisualSchema,
  gallery: z.array(projectVisualSchema).default([]),
  featured: z.boolean(),
  /** Lower renders earlier. */
  order: z.number().int().nonnegative(),
});
export type Project = z.infer<typeof projectSchema>;

/**
 * Schemas for capabilities, principles, timeline entries, proof points and
 * skill groups are added by the phases that render them (7–9) rather than
 * declared up front — an unused schema is a promise the compiler cannot keep.
 */

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
