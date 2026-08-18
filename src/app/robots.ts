import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

/**
 * Preview and branch deployments must never be indexed — only the canonical
 * production origin is allowed through.
 */
export default function robots(): MetadataRoute.Robots {
  const isProduction =
    process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  const isCanonicalHost = env.NEXT_PUBLIC_SITE_URL.includes('emredogan.work');

  if (!isProduction || !isCanonicalHost) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
    host: env.NEXT_PUBLIC_SITE_URL,
  };
}
