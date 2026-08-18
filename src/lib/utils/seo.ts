import type { Metadata } from 'next';
import { site } from '@/content/site';
import { env } from '@/lib/env';

const baseUrl = env.NEXT_PUBLIC_SITE_URL;

export function absoluteUrl(path = '/'): string {
  return new URL(path, baseUrl).toString();
}

interface PageMetaOptions {
  title: string;
  description: string;
  path: string;
  /** Absolute or root-relative OG image. Defaults to the generated site image. */
  image?: string;
}

export function buildMetadata({ title, description, path, image }: PageMetaOptions): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: site.name,
      locale: 'en_US',
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@emredogancloud',
      ...(image ? { images: [image] } : {}),
    },
  };
}

/** Person + WebSite structured data for the site root. */
export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${baseUrl}/#person`,
        name: site.name,
        url: baseUrl,
        email: `mailto:${site.email}`,
        jobTitle: site.role,
        description: site.description,
        address: { '@type': 'PostalAddress', addressLocality: 'Adana', addressCountry: 'TR' },
        sameAs: site.socials.filter((s) => !s.href.startsWith('mailto:')).map((s) => s.href),
        knowsAbout: [
          'Full-stack web development',
          'AI systems engineering',
          'Cloud architecture',
          'Mobile application development',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: `${site.name} — ${site.role}`,
        description: site.description,
        inLanguage: 'en',
        publisher: { '@id': `${baseUrl}/#person` },
      },
    ],
  };
}
