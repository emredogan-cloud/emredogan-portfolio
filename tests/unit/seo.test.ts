import { describe, expect, it } from 'vitest';
import { absoluteUrl, buildMetadata, personJsonLd } from '@/lib/utils/seo';

describe('seo helpers', () => {
  it('builds absolute URLs from the canonical origin', () => {
    expect(absoluteUrl('/')).toBe('https://emredogan.work/');
    expect(absoluteUrl('/work/example')).toBe('https://emredogan.work/work/example');
  });

  it('produces canonical, OG and Twitter metadata together', () => {
    const meta = buildMetadata({ title: 'T', description: 'D', path: '/work' });
    expect(meta.alternates?.canonical).toBe('https://emredogan.work/work');
    expect(meta.openGraph?.url).toBe('https://emredogan.work/work');
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('emits Person and WebSite nodes with only real profile URLs', () => {
    const ld = personJsonLd();
    const types = ld['@graph'].map((n) => n['@type']);
    expect(types).toContain('Person');
    expect(types).toContain('WebSite');

    const person = ld['@graph'].find((n) => n['@type'] === 'Person') as { sameAs: string[] };
    expect(person.sameAs).toContain('https://github.com/emredogan-cloud');
    // mailto: is not a profile page and must not appear in sameAs.
    expect(person.sameAs.some((u) => u.startsWith('mailto:'))).toBe(false);
  });
});

describe('seo metadata with a social image', () => {
  it('attaches the image to both OpenGraph and Twitter when supplied', () => {
    const meta = buildMetadata({
      title: 'T',
      description: 'D',
      path: '/work/x',
      image: 'https://emredogan.work/og/x.png',
    });
    expect(meta.openGraph?.images).toEqual([{ url: 'https://emredogan.work/og/x.png' }]);
    expect(meta.twitter?.images).toEqual(['https://emredogan.work/og/x.png']);
  });

  it('omits the image keys entirely when none is supplied', () => {
    const meta = buildMetadata({ title: 'T', description: 'D', path: '/work' });
    expect(meta.openGraph && 'images' in meta.openGraph).toBe(false);
    expect(meta.twitter && 'images' in meta.twitter).toBe(false);
  });
});
