import type { MetadataRoute } from 'next';
import { orderedProjects } from '@/content/projects';
import { env } from '@/lib/env';

const base = env.NEXT_PUBLIC_SITE_URL;

/** Derived from content, so a new project cannot be missing from the sitemap. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/work`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = orderedProjects.map((p) => ({
    url: `${base}/work/${p.slug}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: p.featured ? 0.8 : 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}
