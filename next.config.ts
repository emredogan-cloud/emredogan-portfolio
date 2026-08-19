import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

/**
 * Content Security Policy.
 *
 * Every directive below is the narrowest value that still works, and the two
 * that are not narrow are explained rather than waved through:
 *
 * - **`script-src` allows `'unsafe-inline'`.** Next inlines the flight payload
 *   and the hydration bootstrap in every prerendered document. The strict
 *   alternative is a per-request nonce, which requires middleware and makes
 *   every page dynamic — trading the site's entire static-prerender
 *   architecture, its sub-100 ms TTFB and its edge-cacheability for a
 *   directive that stops no attack this site is exposed to. There is no user
 *   input rendered into any page: the one form posts to a Server Action and
 *   its content is emailed as plain text, never echoed into HTML.
 * - **`style-src` allows `'unsafe-inline'`.** The design sets gradients,
 *   reveal delays and glow positions through `style` attributes, which CSP
 *   treats as inline styles. `'unsafe-hashes'` would need a hash per attribute
 *   value, regenerated whenever a delay changes.
 *
 * Everything else is locked: no remote scripts, no remote styles, no frames,
 * no objects, no base-tag rewriting, and forms may only post to this origin.
 *
 * `connect-src` names Vercel's vitals endpoint because Analytics and Speed
 * Insights beacon to it. Resend is **not** listed: delivery happens in a
 * Server Action, so the browser never talks to it — a CSP entry for it would
 * be a hint that the key was in the wrong place.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://vitals.vercel-insights.com",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

/**
 * `CSP_REPORT_ONLY=1` ships the policy as `Content-Security-Policy-Report-Only`
 * so a preview deployment reports violations without breaking, which is how
 * this policy was verified before it was enforced (ROADMAP Phase 14, task 1).
 */
const cspHeaderName =
  process.env.CSP_REPORT_ONLY === '1'
    ? 'Content-Security-Policy-Report-Only'
    : 'Content-Security-Policy';

const securityHeaders = [
  { key: cspHeaderName, value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Only local assets are used; no remote patterns are allowed.
    remotePatterns: [],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withBundleAnalyzer(nextConfig);
