import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { analyticsEnabled } from '@/lib/env';

/**
 * Analytics is mounted only where `NEXT_PUBLIC_ENABLE_ANALYTICS=1`.
 *
 * Both scripts are served by the platform from `/_vercel/*`, so anywhere else —
 * `next start` locally, CI, a self-hosted preview — they 404 and the browser
 * logs a MIME-type error, which the "no console errors" E2E test correctly
 * rejects.
 *
 * The switch is an explicit environment variable rather than a
 * `process.env.VERCEL` sniff: whether Vercel injects its system variables into
 * a build is a per-project setting, and this component silently rendering
 * nothing on production was exactly that failure. An explicit flag is
 * greppable, testable, and doubles as a kill switch.
 *
 * Both products are privacy-conscious by default: no cookies, no cross-site
 * identifiers.
 */
export function Analytics() {
  if (!analyticsEnabled) return null;

  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
    </>
  );
}
