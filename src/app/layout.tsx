import type { Metadata, Viewport } from 'next';
import { Background } from '@/components/background/background';
import { Analytics } from '@/components/layout/analytics';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { ScrollProgress } from '@/components/layout/scroll-progress';
import { SkipLink } from '@/components/layout/skip-link';
import { site } from '@/content/site';
// Side-effect import: validates every content module at build time (server-only).
import '@/content/validate';
import { fontVariables } from '@/lib/fonts';
import { env } from '@/lib/env';
import { personJsonLd } from '@/lib/utils/seo';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    'Emre Doğan',
    'full-stack developer',
    'AI developer',
    'indie hacker',
    'Next.js',
    'Flutter',
    'AWS',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@emredogancloud',
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  themeColor: '#03070c',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body id="top" className="min-h-dvh antialiased">
        <SkipLink />
        <Background />
        <ScrollProgress />
        <Header />
        {children}
        <Footer />
        <script
          id="ld-person"
          type="application/ld+json"
          // Serialised server-side from a typed literal; no user input reaches this.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
