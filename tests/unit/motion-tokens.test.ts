import { describe, expect, it } from 'vitest';
import { distance, duration, ease, marquee, spring, stagger } from '@/lib/motion/tokens';

describe('motion tokens', () => {
  it('durations are ordered and stay inside a perceptible range', () => {
    const values = [duration.instant, duration.fast, duration.base, duration.slow, duration.slower];
    expect([...values].sort((a, b) => a - b)).toEqual(values);
    expect(duration.slower).toBeLessThanOrEqual(1);
  });

  it('easing curves are valid cubic-bezier control points', () => {
    for (const curve of [ease.out, ease.inOut]) {
      expect(curve).toHaveLength(4);
      // x control points must stay in [0,1]; y may overshoot.
      expect(curve[0]).toBeGreaterThanOrEqual(0);
      expect(curve[0]).toBeLessThanOrEqual(1);
      expect(curve[2]).toBeGreaterThanOrEqual(0);
      expect(curve[2]).toBeLessThanOrEqual(1);
    }
  });

  it('springs are underdamped but not bouncy enough to overshoot twice', () => {
    for (const s of [spring.default, spring.soft, spring.magnetic]) {
      expect(s.stiffness).toBeGreaterThan(0);
      expect(s.damping).toBeGreaterThan(0);
      expect(s.mass).toBeGreaterThan(0);
    }
  });

  it('marquee speed matches the value measured from the reference recording', () => {
    // §1.4: cruise measured at 95–101 px/s, ramp 0.6–0.9 s.
    expect(marquee.speed).toBeGreaterThanOrEqual(95);
    expect(marquee.speed).toBeLessThanOrEqual(101);
    expect(marquee.rampSeconds).toBeGreaterThanOrEqual(0.6);
    expect(marquee.rampSeconds).toBeLessThanOrEqual(0.9);
  });

  it('stagger stays tight enough that a group still reads as one gesture', () => {
    expect(stagger.tight).toBeLessThan(stagger.base);
    expect(stagger.base).toBeLessThan(stagger.loose);
    expect(stagger.loose).toBeLessThanOrEqual(0.15);
  });

  it('parallax and magnetic displacement stay subtle', () => {
    expect(distance.parallaxMax).toBeLessThanOrEqual(12);
    expect(distance.magneticMax).toBeLessThanOrEqual(10);
  });
});
