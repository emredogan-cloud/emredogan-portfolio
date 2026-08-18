import { describe, expect, it } from 'vitest';
import { createRng, range, rangeInt } from '@/lib/background/rng';

describe('deterministic rng', () => {
  it('produces the same sequence for the same seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    const first = Array.from({ length: 20 }, a);
    const second = Array.from({ length: 20 }, b);
    expect(first).toEqual(second);
  });

  it('produces a different sequence for a different seed', () => {
    const a = Array.from({ length: 10 }, createRng(1));
    const b = Array.from({ length: 10 }, createRng(2));
    expect(a).not.toEqual(b);
  });

  it('stays within [0, 1)', () => {
    const rng = createRng(7);
    for (let i = 0; i < 5_000; i += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('is roughly uniform, so stars do not cluster in one corner', () => {
    const rng = createRng(99);
    const buckets = new Array(10).fill(0);
    const samples = 20_000;
    for (let i = 0; i < samples; i += 1) buckets[Math.floor(rng() * 10)] += 1;
    for (const count of buckets) {
      // Each decile should hold ~10%; allow a generous ±25% before calling it
      // biased, which still catches a genuinely broken generator.
      expect(count).toBeGreaterThan((samples / 10) * 0.75);
      expect(count).toBeLessThan((samples / 10) * 1.25);
    }
  });

  it('range and rangeInt respect their bounds', () => {
    const rng = createRng(3);
    for (let i = 0; i < 1_000; i += 1) {
      const value = range(rng, -5, 5);
      expect(value).toBeGreaterThanOrEqual(-5);
      expect(value).toBeLessThan(5);

      const integer = rangeInt(rng, 2, 4);
      expect(Number.isInteger(integer)).toBe(true);
      expect(integer).toBeGreaterThanOrEqual(2);
      expect(integer).toBeLessThanOrEqual(4);
    }
  });
});
