import { describe, expect, it } from 'vitest';
import { PROFILES } from '@/lib/background/quality';
import { generateStars, starCountFor, twinkleFactor } from '@/lib/background/stars';

const standard = PROFILES.standard;

describe('star field generation', () => {
  it('is reproducible for a seed', () => {
    expect(generateStars(200, standard, 1234)).toEqual(generateStars(200, standard, 1234));
  });

  it('differs between seeds', () => {
    expect(generateStars(50, standard, 1)).not.toEqual(generateStars(50, standard, 2));
  });

  it('positions are normalised so a resize re-maps rather than re-rolls', () => {
    for (const star of generateStars(500, standard, 5)) {
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.x).toBeLessThan(1);
      expect(star.y).toBeGreaterThanOrEqual(0);
      expect(star.y).toBeLessThan(1);
    }
  });

  it('assigns three depth layers with the furthest most populous', () => {
    const stars = generateStars(3_000, standard, 11);
    const counts = [0, 0, 0];
    for (const star of stars) counts[star.depth] = (counts[star.depth] ?? 0) + 1;
    expect(counts[0]!).toBeGreaterThan(counts[1]!);
    expect(counts[1]!).toBeGreaterThan(counts[2]!);
    // Nearer stars are larger and brighter, which is what makes it read as depth.
    const byDepth = (depth: number) => stars.filter((s) => s.depth === depth);
    const meanRadius = (depth: number) =>
      byDepth(depth).reduce((sum, s) => sum + s.radius, 0) / byDepth(depth).length;
    expect(meanRadius(2)).toBeGreaterThan(meanRadius(0));
  });

  it('twinkles only the configured share of stars', () => {
    const stars = generateStars(4_000, standard, 21);
    const share = stars.filter((s) => s.phase !== null).length / stars.length;
    expect(share).toBeGreaterThan(standard.twinkleShare * 0.6);
    expect(share).toBeLessThan(standard.twinkleShare * 1.4);
  });

  it('never twinkles under the still profile', () => {
    const stars = generateStars(1_000, PROFILES.static, 3);
    expect(stars.every((star) => star.phase === null)).toBe(true);
  });

  it('scales the count with viewport area, not with width', () => {
    // A wide short window and a tall narrow one of equal area get equal stars,
    // so density is consistent rather than dependent on aspect ratio.
    expect(starCountFor(1920, 1080, standard)).toBe(starCountFor(1080, 1920, standard));
    expect(starCountFor(2560, 1440, standard)).toBeGreaterThan(starCountFor(390, 844, standard));
  });

  it('keeps a 4K desktop field within a drawable budget', () => {
    expect(starCountFor(3840, 2160, PROFILES.high)).toBeLessThan(1_200);
  });
});

describe('twinkle', () => {
  const [plain] = generateStars(1, PROFILES.static, 1);

  it('is exactly 1 for a star that does not twinkle', () => {
    expect(twinkleFactor(plain!, 12.34)).toBe(1);
  });

  it('stays within ±12%, so nothing next to body copy flashes', () => {
    const star = { ...plain!, phase: 0.4, period: 3 };
    for (let t = 0; t < 12; t += 0.05) {
      const factor = twinkleFactor(star, t);
      expect(factor).toBeGreaterThanOrEqual(0.88);
      expect(factor).toBeLessThanOrEqual(1.12);
    }
  });

  it('is periodic', () => {
    const star = { ...plain!, phase: 1, period: 4 };
    expect(twinkleFactor(star, 2)).toBeCloseTo(twinkleFactor(star, 6), 10);
  });
});
