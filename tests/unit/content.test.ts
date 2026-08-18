import { describe, expect, it } from 'vitest';
import { site } from '@/content/site';
import { projects, featuredProjects } from '@/content/projects';
import { parseContent, projectSchema, siteSchema } from '@/content/schema';

describe('site content', () => {
  it('parses against the schema at module load', () => {
    expect(() => parseContent(siteSchema, site, 'site')).not.toThrow();
  });

  it('uses the canonical production origin with no trailing slash', () => {
    expect(site.url).toBe('https://emredogan.work');
    expect(site.url.endsWith('/')).toBe(false);
  });

  it('exposes the real contact channels and nothing invented', () => {
    expect(site.email).toBe('emre30283@gmail.com');
    const hrefs = site.socials.map((s) => s.href);
    expect(hrefs).toContain('https://github.com/emredogan-cloud');
    expect(hrefs).toContain('https://x.com/emredogancloud');
    expect(hrefs).toContain('mailto:emre30283@gmail.com');
  });

  it('keeps the primary positioning to a single line, not a stack of titles', () => {
    expect(site.role.split('·').length).toBe(1);
    expect(site.descriptors.length).toBeLessThanOrEqual(4);
  });
});

describe('project content', () => {
  it('every project satisfies the schema', () => {
    for (const [i, p] of projects.entries()) {
      expect(() => parseContent(projectSchema, p, `projects[${i}]`)).not.toThrow();
    }
  });

  it('slugs are unique', () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('featured projects are a subset of all projects, ordered', () => {
    for (const p of featuredProjects) expect(projects).toContain(p);
    const orders = featuredProjects.map((p) => p.order);
    expect([...orders].sort((a, b) => a - b)).toEqual(orders);
  });

  it('rejects a project with a non-kebab slug', () => {
    expect(() => parseContent(projectSchema, { slug: 'Not Valid' }, 'test')).toThrow();
  });

  it('rejects a cover image whose alt text is a bare label', () => {
    const result = projectSchema.shape.cover.safeParse({
      src: '/x.avif',
      alt: 'shot',
      width: 100,
      height: 100,
      capture: 'real',
    });
    expect(result.success).toBe(false);
  });
});
