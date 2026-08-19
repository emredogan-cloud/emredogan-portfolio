import { describe, expect, it } from 'vitest';
import { proof } from '@/content/proof';
import { projects } from '@/content/projects';
import { parseContent, proofSectionSchema } from '@/content/schema';

describe('proof content', () => {
  it('satisfies the schema', () => {
    expect(() => parseContent(proofSectionSchema, proof, 'proof')).not.toThrow();
  });

  it('every claim links somewhere a stranger can check it', () => {
    // The whole point of the section. A claim with nowhere to go is a
    // testimonial with extra steps.
    for (const entry of proof.entries) {
      expect(entry.verifyUrl, `${entry.label} is unverifiable`).toMatch(/^https:\/\//);
      expect(entry.method.length, `${entry.label} states no method`).toBeGreaterThan(20);
    }
  });

  it('links only to public repositories', () => {
    const urls = JSON.stringify(proof).match(/https:\/\/github\.com\/[^"' ]+/g) ?? [];
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(url, 'private repository linked').not.toMatch(/aws-waste-hunter|VibingCodeAI|lumina/i);
    }
  });

  it('says plainly that there are no testimonials', () => {
    // The absence is information, and hiding it would be the quiet lie this
    // section exists to avoid.
    expect(proof.disclosure).toMatch(/no testimonials/i);
    expect(proof.disclosure).toMatch(/no clients|inventing/i);
  });

  it('publishes when the links were last checked', () => {
    const checked = new Date(`${proof.verifiedOn}T00:00:00Z`);
    expect(Number.isNaN(checked.getTime())).toBe(false);
    expect(checked.getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('claims no stars, followers, users, revenue or downloads', () => {
    // Every repository has zero stars; a vanity metric at zero is still a
    // vanity metric, and the rest are unverifiable by construction.
    const text = JSON.stringify(proof).toLowerCase();
    for (const forbidden of ['stars', 'followers', 'active users', 'revenue', 'downloads', 'mrr']) {
      expect(text, `"${forbidden}" is not evidence`).not.toMatch(
        new RegExp(`\\b${forbidden}\\b`, 'i'),
      );
    }
  });

  it('the live-domain claim matches the projects that are actually live', () => {
    const live = projects.filter((project) => project.status === 'live').length;
    const entry = proof.entries.find((item) => item.id === 'live-domains');
    expect(entry).toBeDefined();
    expect(Number(entry!.value)).toBe(live);
  });

  it('entry ids are unique', () => {
    const ids = proof.entries.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
