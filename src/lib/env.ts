import { z } from 'zod';

/**
 * Environment contract.
 *
 * Parsed once, at module load, so a missing or malformed variable fails the
 * build rather than surfacing as a runtime 500 in production. Only variables
 * that are genuinely required are marked required; optional integrations
 * degrade rather than crash (WORKING_DISCIPLINE §3.5).
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  /** Canonical origin, no trailing slash. Drives metadata, sitemap and JSON-LD. */
  NEXT_PUBLIC_SITE_URL: z.string().url().default('https://emredogan.work'),
  /** Transactional email for the contact form. Absent → mailto fallback. */
  RESEND_API_KEY: z.string().min(1).optional(),
  CONTACT_TO_EMAIL: z.string().email().default('emre30283@gmail.com'),
});

const parsed = schema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
});

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  · ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
