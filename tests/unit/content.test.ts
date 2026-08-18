import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { site } from '@/content/site';
import { featuredProjects, projects } from '@/content/projects';
import { parseContent, projectSchema, siteSchema } from '@/content/schema';

/**
 * Content is exported as plain data and validated by the `server-only`
 * `content/validate.ts` at build time — see the note in `site.ts` for why the
 * Zod validator must not reach the browser bundle.
 *
 * These tests run the same schemas against the same data, so a malformed field
 * fails here in milliseconds instead of only surfacing during `next build`.
 */
describe('site content', () => {
  it('satisfies the schema', () => {
    expect(() => parseContent(siteSchema, site, 'site')).not.toThrow();
  });

  it('uses the canonical production origin with no trailing slash', () => {
    expect(site.url).toBe('https://emredogan.work');
    expect(site.url.endsWith('/')).toBe(false);
  });

  it('exposes the real contact channels and nothing invented', () => {
    expect(site.email).toBe('emre30283@gmail.com');
    const hrefs = site.socials.map((social) => social.href);
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
    for (const [index, project] of projects.entries()) {
      expect(() => parseContent(projectSchema, project, `projects[${index}]`)).not.toThrow();
    }
  });

  it('slugs are unique', () => {
    const slugs = projects.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('featured projects are a subset of all projects, in order', () => {
    for (const project of featuredProjects) expect(projects).toContain(project);
    const orders = featuredProjects.map((project) => project.order);
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

describe('client bundle safety', () => {
  /**
   * Client components import `site` for the header, footer and mobile menu.
   * If these modules ever go back to calling `parseContent` at module scope,
   * Zod re-enters the browser bundle — 68 KB gzipped, measured. Only a
   * type-only import of the schema is allowed.
   */
  const read = (file: string) => readFileSync(join(process.cwd(), 'src/content', file), 'utf8');

  it.each(['site.ts', 'projects.ts'])('%s imports the schema for types only', (file) => {
    const source = read(file);
    expect(source, 'must not call the validator at module scope').not.toContain('parseContent(');
    expect(source, 'schema import must be type-only').toMatch(
      /import type \{[^}]+\} from '\.\/schema'/,
    );
    expect(source, 'no value import from the schema module').not.toMatch(
      /^import \{[^}]+\} from '\.\/schema'/m,
    );
  });

  it('the validator is marked server-only', () => {
    expect(read('validate.ts')).toMatch(/^import 'server-only';/m);
  });
});
