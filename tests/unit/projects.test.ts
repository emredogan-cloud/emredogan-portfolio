import { describe, expect, it } from 'vitest';
import {
  featuredProjects,
  getProject,
  orderedProjects,
  projects,
  projectSlugs,
} from '@/content/projects';
import { parseContent, projectSchema } from '@/content/schema';

describe('project content', () => {
  it('every project satisfies the schema', () => {
    for (const [index, project] of projects.entries()) {
      expect(() => parseContent(projectSchema, project, `projects[${index}]`)).not.toThrow();
    }
  });

  it('holds the eight projects the site claims', () => {
    expect(projects).toHaveLength(8);
    expect(projectSlugs).toHaveLength(8);
  });

  it('slugs are unique and URL-safe ASCII', () => {
    // Two source directories carry non-ASCII characters — `FormAI-FitnessKoçu`
    // and `MY-DİGİTAL-BOOK`, where the dotted İ breaks naive case-folding — so
    // no route or asset path is ever derived from a directory name.
    expect(new Set(projectSlugs).size).toBe(projectSlugs.length);
    for (const slug of projectSlugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('orders without gaps or duplicates', () => {
    const orders = orderedProjects.map((project) => project.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('features exactly four projects', () => {
    expect(featuredProjects).toHaveLength(4);
    expect(featuredProjects.map((project) => project.slug)).toEqual([
      'pawdoc',
      'ehliyet-akademi',
      'formai',
      'evolutionary-tycoon',
    ]);
  });

  it('getProject resolves a known slug and rejects an unknown one', () => {
    expect(getProject('pawdoc')?.name).toBe('PawDoc');
    expect(getProject('not-a-project')).toBeUndefined();
  });
});

describe('content honesty rules', () => {
  it('never links a repository that is private', () => {
    // Lumina's repository is private. Linking it would 404, and describing it
    // as public would be a claim nothing supports.
    const lumina = getProject('lumina')!;
    expect(lumina.links).toHaveLength(0);
    expect(lumina.statusNote).toMatch(/private/i);
  });

  it('never links a project that was never shipped', () => {
    const nova = getProject('nova')!;
    expect(nova.status).toBe('research');
    expect(nova.links).toHaveLength(0);
  });

  it('states plainly when a store listing is not resolving', () => {
    for (const slug of ['pawdoc', 'formai']) {
      const project = getProject(slug)!;
      expect(
        /not (yet )?(publicly )?listed|had not resolved/i.test(project.statusNote),
        `${slug} must say its store listing is unresolved`,
      ).toBe(true);
    }
  });

  it('only claims `live` where a URL is linked', () => {
    for (const project of projects) {
      if (project.status !== 'live') continue;
      expect(
        project.links.some((link) => link.kind === 'live'),
        `${project.slug} claims live but links nothing live`,
      ).toBe(true);
    }
  });

  it('every cover is a real capture, never a mock-up', () => {
    // The schema only permits `real` or `diagram`; a project with no possible
    // capture carries `null` and renders a generated mark that says so.
    for (const project of projects) {
      if (project.cover === null) continue;
      expect(project.cover.capture).toBe('real');
      expect(project.cover.alt.length).toBeGreaterThan(20);
    }
  });

  it('every project without a cover explains why in its status note', () => {
    for (const project of projects) {
      if (project.cover !== null) continue;
      expect(
        /private|not shipped|never .*(deployed|shipped)|no public|not published/i.test(
          project.statusNote,
        ),
        `${project.slug} has no cover and does not explain why`,
      ).toBe(true);
    }
  });

  it('every project answers all four narrative beats substantively', () => {
    for (const project of projects) {
      for (const beat of ['problem', 'architecture', 'innovation', 'outcome'] as const) {
        expect(
          project.beats[beat].length,
          `${project.slug}.beats.${beat} is too thin to be a case study`,
        ).toBeGreaterThan(80);
      }
    }
  });

  it('every external link is https', () => {
    for (const project of projects) {
      for (const link of project.links) {
        expect(link.href.startsWith('https://'), `${project.slug}: ${link.href}`).toBe(true);
      }
    }
  });

  it('declares a stack for every project, with no cross-contamination', () => {
    // Flutter belongs to the mobile projects; it must not have drifted into the
    // game or the books.
    expect(getProject('evolutionary-tycoon')!.stack).not.toContain('Flutter');
    expect(getProject('living-library')!.stack).not.toContain('Flutter');
    expect(getProject('pawdoc')!.stack).toContain('Flutter');
    for (const project of projects) {
      expect(project.stack.length, `${project.slug} declares no stack`).toBeGreaterThan(0);
    }
  });
});
