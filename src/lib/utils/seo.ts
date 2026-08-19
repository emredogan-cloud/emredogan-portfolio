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
        /*
         * One contact point, email only.
         *
         * No telephone number is published anywhere on this site, so none is
         * claimed here either — structured data that says something the page
         * does not is the same lie in a machine-readable form.
         */
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Enquiries',
          email: site.email,
          availableLanguage: ['en', 'tr'],
          areaServed: 'Worldwide',
        },
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
        /*
         * No `SearchAction`.
         *
         * §9 of the roadmap lists `WebSite` + `SearchAction`, and the pattern
         * requires a URL template pointing at a working search endpoint. This
         * site has no search. Declaring one anyway is how a site ends up with
         * a Google sitelinks search box that leads nowhere, so the property is
         * left out and the reason recorded rather than the shape being filled
         * in for completeness.
         */
      },
    ],
  };
}
