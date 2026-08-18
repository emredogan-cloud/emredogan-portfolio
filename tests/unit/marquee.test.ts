import { describe, expect, it } from 'vitest';
import { approachVelocity, loopDuration, wrapOffset } from '@/lib/motion/marquee';
import { marquee } from '@/lib/motion/tokens';

/** Integrates the velocity model at a given frame rate. */
function rampTo95(target: number, fps: number, rampSeconds: number): number {
  const delta = 1 / fps;
  let velocity = 0;
  let seconds = 0;
  while (Math.abs(velocity) < Math.abs(target) * 0.95 && seconds < 10) {
    velocity = approachVelocity(velocity, target, delta, rampSeconds);
    seconds += delta;
  }
  return seconds;
}

describe('approachVelocity', () => {
  it('reaches 95% of the target in the configured ramp time', () => {
    // The definition the reference was measured against: `rampSeconds` is the
    // point at which the strip visibly reaches cruise, or visibly stops.
    expect(rampTo95(-97, 60, 0.7)).toBeCloseTo(0.7, 1);
  });

  it('takes the same wall-clock time at 60 and 120 Hz', () => {
    // The usual `v += (target - v) * 0.06` is frame-rate dependent and ramps
    // almost twice as fast on a 120 Hz display. This is the property that rules
    // that form out.
    const at60 = rampTo95(-97, 60, 0.7);
    const at120 = rampTo95(-97, 120, 0.7);
    expect(Math.abs(at120 - at60)).toBeLessThan(0.03);
  });

  it('survives a long frame without overshooting the target', () => {
    // A tab resuming can deliver a 250 ms delta. The velocity must approach the
    // target, never pass it.
    const velocity = approachVelocity(0, -97, 0.25, 0.7);
    expect(velocity).toBeGreaterThanOrEqual(-97);
    expect(velocity).toBeLessThan(0);
  });

  it('decays back to a stop as smoothly as it started', () => {
    const stopTime = (() => {
      let velocity = -97;
      let seconds = 0;
      while (Math.abs(velocity) > 97 * 0.05 && seconds < 10) {
        velocity = approachVelocity(velocity, 0, 1 / 60, 0.7);
        seconds += 1 / 60;
      }
      return seconds;
    })();
    // Symmetric with the ramp up, which is what the recording shows.
    expect(stopTime).toBeCloseTo(0.7, 1);
  });

  it('is a no-op ramp when rampSeconds is zero', () => {
    expect(approachVelocity(0, -97, 1 / 60, 0)).toBe(-97);
  });

  it('never moves away from the target', () => {
    let velocity = -97;
    for (let i = 0; i < 600; i += 1) {
      const next = approachVelocity(velocity, 0, 1 / 60, 0.7);
      expect(Math.abs(next)).toBeLessThanOrEqual(Math.abs(velocity) + 1e-9);
      velocity = next;
    }
  });
});

describe('the measured profile', () => {
  it('cruises within the band measured from the reference', () => {
    // §1.4 measured 95–101 px/s.
    expect(marquee.speed).toBeGreaterThanOrEqual(95);
    expect(marquee.speed).toBeLessThanOrEqual(101);
  });

  it('ramps within the window measured from the reference', () => {
    // §1.4 measured 0.6–0.9 s to stop and to restart.
    expect(marquee.rampSeconds).toBeGreaterThanOrEqual(0.6);
    expect(marquee.rampSeconds).toBeLessThanOrEqual(0.9);
  });

  it('completes a loop close to the reference’s ~8.7 s', () => {
    // The reference's repeat unit measured 840 px at ~97 px/s.
    expect(loopDuration(840, marquee.speed)).toBeCloseTo(8.7, 0);
  });

  it('runs slower on a narrow viewport so logos stay legible', () => {
    expect(marquee.mobileSpeedFactor).toBeGreaterThan(0.4);
    expect(marquee.mobileSpeedFactor).toBeLessThan(1);
  });
});

describe('wrapOffset', () => {
  it('keeps the offset inside one copy width', () => {
    for (let offset = 0; offset > -5_000; offset -= 37) {
      const wrapped = wrapOffset(offset, 840);
      expect(wrapped).toBeLessThanOrEqual(0);
      expect(wrapped).toBeGreaterThan(-840);
    }
  });

  it('lands on the seam exactly at one copy width', () => {
    expect(wrapOffset(-840, 840)).toBe(-0);
    expect(wrapOffset(-1680, 840)).toBe(-0);
  });

  it('handles a single huge jump, not just incremental steps', () => {
    // A resumed tab can produce an offset many loops past the end. Modulo
    // handles it; a `if (offset < -width) offset += width` reset would not.
    expect(wrapOffset(-99_999, 840)).toBeGreaterThan(-840);
    expect(wrapOffset(-99_999, 840)).toBeLessThanOrEqual(0);
  });

  it('is a no-op before the track has been measured', () => {
    expect(wrapOffset(-120, 0)).toBe(0);
  });
});
