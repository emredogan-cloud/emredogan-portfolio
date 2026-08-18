import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

/**
 * Security headers. `Content-Security-Policy` is intentionally absent here in
 * Phase 1 — it is introduced in report-only mode in Phase 14 once the full
 * asset and script surface is known (ROADMAP Phase 14, task 1).
 */
const securityHeaders = [
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
