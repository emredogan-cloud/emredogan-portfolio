import { describe, expect, it } from 'vitest';
import { hero } from '@/content/hero';
import { projects } from '@/content/projects';
import { heroSchema, parseContent } from '@/content/schema';

describe('hero content', () => {
  it('satisfies the schema', () => {
    expect(() => parseContent(heroSchema, hero, 'hero')).not.toThrow();
  });

  it('renders exactly three statistics', () => {
    expect(hero.stats).toHaveLength(3);
  });

  it('every statistic states the method that produced it', () => {
    // A number with no stated provenance is the thing this site does not do.
    for (const stat of hero.stats) {
      expect(stat.evidence.length, `${stat.label} has no method`).toBeGreaterThan(30);
    }
  });
});

describe('statistics that can be checked against the content', () => {
  /**
   * Two of the three hero numbers are derivable from the project data, so they
   * are asserted rather than trusted.
   *
   * This exists because the third one — the commit count — drifted. It was
   * published as 1,113 from `git rev-list --count HEAD`, but three of the six
   * source repositories had a feature branch checked out, so the figure
   * included unmerged work and moved when a branch advanced. It is now counted
   * on the default branch, which anyone cloning the repositories reproduces.
   * Numbers that *can* be tied to something in this repository should be.
   */
  it('the project count matches the projects actually published', () => {
    const stat = hero.stats.find((entry) => entry.label === 'projects built');
    expect(stat).toBeDefined();
    expect(Number(stat!.value)).toBe(projects.length);
  });

  it('the live-or-released count matches the project statuses', () => {
    const stat = hero.stats.find((entry) => entry.label === 'live or released');
    expect(stat).toBeDefined();
    const actual = projects.filter(
      (project) => project.status === 'live' || project.status === 'released',
    ).length;
    expect(Number(stat!.value)).toBe(actual);
  });

  it('the commit count is stated as a default-branch count, not HEAD', () => {
    const stat = hero.stats.find((entry) => entry.label === 'commits')!;
    expect(stat.evidence).toMatch(/default branch/i);
    expect(stat.evidence).not.toMatch(/\bHEAD\b/);
  });

  it('claims no years of experience, revenue, downloads or user numbers', () => {
    // None of these are supported by anything on disk.
    const text = JSON.stringify(hero).toLowerCase();
    for (const forbidden of [
      'years experience',
      'years of experience',
      'downloads',
      'revenue',
      'active users',
      'mrr',
    ]) {
      expect(text, `hero must not claim "${forbidden}"`).not.toContain(forbidden);
    }
  });
});
