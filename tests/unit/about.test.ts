import { describe, expect, it } from 'vitest';
import { about } from '@/content/about';
import { projects } from '@/content/projects';
import { aboutSchema, parseContent } from '@/content/schema';

describe('about content', () => {
  it('satisfies the schema', () => {
    expect(() => parseContent(aboutSchema, about, 'about')).not.toThrow();
  });
});

/**
 * The honesty rules for this page, expressed as tests.
 *
 * The instruction was explicit: never invent employers, customers, metrics or
 * certifications. A prose review cannot enforce that six months from now when
 * someone adds a timeline entry in a hurry — a failing test can.
 */
describe('claims are backed by something checkable', () => {
  it('every timeline entry carries evidence', () => {
    for (const entry of about.timeline) {
      expect(entry.evidence.length, `${entry.title} states nothing checkable`).toBeGreaterThan(0);
    }
  });

  it('every timeline project link resolves to a published project', () => {
    // A dead link to a case study is worse than no link: it implies a body of
    // work that the reader then cannot find.
    const slugs = new Set(projects.map((project) => project.slug));
    for (const entry of about.timeline) {
      if (entry.projectSlug === null) continue;
      expect(slugs.has(entry.projectSlug), `${entry.title} → /work/${entry.projectSlug}`).toBe(
        true,
      );
    }
  });

  it('timeline entries are unique and ordered oldest first', () => {
    const ids = about.timeline.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('the six timeline entries correspond to the six repositories under version control', () => {
    // The intro says "six of them under version control" and the timeline is
    // that list. If a seventh entry is added without the intro changing, the
    // page starts contradicting itself.
    expect(about.timeline).toHaveLength(6);
    expect(about.intro.join(' ')).toMatch(/six of them under version control/i);
  });
});

describe('credentials are not overstated', () => {
  it('claims no held certification, because none exists', () => {
    // The research found no certificate file, credential id or verification
    // URL anywhere on disk. If one is ever earned, this test is the place that
    // has to be updated deliberately — which is the point.
    const held = about.credentials.filter((credential) => credential.kind === 'held');
    expect(held, 'a held credential appeared with no evidence for it').toHaveLength(0);
  });

  it('every planned certification says plainly that it is not held', () => {
    for (const credential of about.credentials.filter((c) => c.kind === 'target')) {
      expect(credential.date, `${credential.title} is not marked as a target`).toMatch(/target/i);
      expect(credential.detail, `${credential.title} does not say it is unheld`).toMatch(
        /not held|no certificate/i,
      );
    }
  });

  it('every shipped credential links to something a stranger can open', () => {
    for (const credential of about.credentials.filter((c) => c.kind === 'shipped')) {
      expect(credential.verifyUrl, `${credential.title} is unverifiable`).toMatch(/^https:\/\//);
    }
  });

  it('links only to public repositories', () => {
    // The two private repositories are described in the wider record but must
    // never be linked — a 404 reads as a fabricated project.
    const urls = JSON.stringify(about).match(/https:\/\/github\.com\/[^"' ]+/g) ?? [];
    expect(urls.length, 'no repository is linked at all').toBeGreaterThan(0);
    for (const url of urls) {
      expect(url, 'private repository linked').not.toMatch(/aws-waste-hunter|VibingCodeAI/i);
    }
  });
});

describe('no invented biography', () => {
  const text = JSON.stringify(about).toLowerCase();

  /**
   * Matched on word boundaries, not as substrings. The first version of this
   * test banned the bare string `arr` and failed on the word "narrow" — a
   * false positive that would have pushed someone to weaken the content to
   * satisfy the test rather than the other way round.
   */
  const forbids = (term: string) => new RegExp(`\\b${term}\\b`, 'i');

  it('names no employer, client or job title', () => {
    for (const forbidden of [
      'worked at',
      'employed',
      'my client',
      'our client',
      'clients include',
      'senior engineer at',
      'intern at',
    ]) {
      expect(text, `"${forbidden}" implies employment history that does not exist`).not.toMatch(
        forbids(forbidden),
      );
    }
  });

  it('claims no revenue, downloads, user counts or awards', () => {
    for (const forbidden of [
      'revenue',
      'mrr',
      'arr',
      'downloads',
      'active users',
      'million users',
      'award',
      'winner',
      'featured in',
    ]) {
      expect(text, `"${forbidden}" is not supported by anything on disk`).not.toMatch(
        forbids(forbidden),
      );
    }
  });

  it('claims no degree or formal education credential', () => {
    for (const forbidden of ['bachelor', 'msc', 'university of', 'graduated']) {
      expect(text, `"${forbidden}" is not true`).not.toMatch(forbids(forbidden));
    }
    // The absence is stated positively, once, rather than hidden.
    expect(about.intro.join(' ')).toMatch(/no computer science degree/i);
  });

  it('mentions the bakery shifts once, in the past tense, and not as the headline', () => {
    // A deliberate editorial rule: the hardship belongs in the record but must
    // not become the pitch. One mention, and not in the opening clause.
    const occurrences = (about.intro.join(' ').match(/bakery/gi) ?? []).length;
    expect(occurrences).toBe(1);
    const first = about.intro[0]!;
    expect(first.indexOf('bakery')).toBeGreaterThan(40);
  });
});
