import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

/**
 * Analytics is only mounted when the app is actually running on Vercel.
 *
 * Both scripts are served by the platform at `/_vercel/*`, so anywhere else —
 * `next start` locally, CI, a self-hosted preview — they resolve to a 404 and
 * the browser logs a MIME-type error. Gating on `process.env.VERCEL` keeps the
 * console clean off-platform without weakening the "no console errors" test.
 *
 * Both are privacy-conscious by default: no cookies, no cross-site identifiers.
 */
export function Analytics() {
  if (process.env.VERCEL !== '1') return null;

  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
    </>
  );
}
