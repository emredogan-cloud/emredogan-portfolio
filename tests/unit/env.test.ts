import { describe, expect, it } from 'vitest';
import { env } from '@/lib/env';

describe('environment contract', () => {
  it('defaults the site URL to the production origin', () => {
    expect(env.NEXT_PUBLIC_SITE_URL).toMatch(/^https?:\/\//);
    expect(env.NEXT_PUBLIC_SITE_URL.endsWith('/')).toBe(false);
  });

  it('always resolves a contact destination', () => {
    expect(env.CONTACT_TO_EMAIL).toContain('@');
  });
});

describe('analytics switch', () => {
  it('is off unless explicitly enabled', async () => {
    const { analyticsEnabled } = await import('@/lib/env');
    // The test environment sets no flag, so this must be false — proving the
    // default is "off" rather than "on unless proven otherwise".
    expect(analyticsEnabled).toBe(false);
  });
});
