import { describe, expect, it } from 'vitest';
import { createRng } from '@/lib/background/rng';
import { PROFILES } from '@/lib/background/quality';
import {
  createMeteorPool,
  meteorOpacity,
  nextSpawnDelay,
  spawnMeteor,
  stepMeteors,
} from '@/lib/background/meteors';

const W = 1440;
const H = 900;

describe('meteor pool', () => {
  it('allocates exactly once and recycles thereafter', () => {
    const pool = createMeteorPool(4);
    const rng = createRng(1);
    const identities = pool.map((m) => m);

    for (let i = 0; i < 200; i += 1) {
      spawnMeteor(pool, W, H, rng);
      stepMeteors(pool, 0.2, W, H);
    }

    // Same object references throughout: nothing was allocated in the loop, so
    // a long session hands the garbage collector nothing to interrupt a frame.
    expect(pool.map((m) => m)).toEqual(identities);
    expect(pool).toHaveLength(4);
  });

  it('refuses to exceed the pool size', () => {
    const pool = createMeteorPool(3);
    const rng = createRng(2);
    expect(spawnMeteor(pool, W, H, rng)).toBe(true);
    expect(spawnMeteor(pool, W, H, rng)).toBe(true);
    expect(spawnMeteor(pool, W, H, rng)).toBe(true);
    expect(spawnMeteor(pool, W, H, rng)).toBe(false);
    expect(pool.filter((m) => m.active)).toHaveLength(3);
  });

  it('travels down and to the right at the angle measured from the reference', () => {
    const pool = createMeteorPool(50);
    const rng = createRng(3);
    for (let i = 0; i < 50; i += 1) spawnMeteor(pool, W, H, rng);

    for (const meteor of pool) {
      expect(meteor.vx).toBeGreaterThan(0);
      expect(meteor.vy).toBeGreaterThan(0);
      const degrees = (Math.atan2(meteor.vy, meteor.vx) * 180) / Math.PI;
      // §1.4 measured 35–40°; the generator spreads 33–42° so repeats are
      // not obvious.
      expect(degrees).toBeGreaterThanOrEqual(32);
      expect(degrees).toBeLessThanOrEqual(43);
      expect(meteor.length).toBeGreaterThanOrEqual(55);
      expect(meteor.length).toBeLessThanOrEqual(135);
    }
  });

  it('enters from off-screen rather than appearing mid-air', () => {
    const pool = createMeteorPool(60);
    const rng = createRng(4);
    for (let i = 0; i < 60; i += 1) spawnMeteor(pool, W, H, rng);
    for (const meteor of pool) {
      expect(meteor.y < 0 || meteor.x < 0).toBe(true);
    }
  });

  it('retires meteors once they expire', () => {
    const pool = createMeteorPool(2);
    const rng = createRng(5);
    spawnMeteor(pool, W, H, rng);
    stepMeteors(pool, 10, W, H);
    expect(pool.every((m) => !m.active)).toBe(true);
  });

  it('retires meteors that leave the viewport before expiring', () => {
    // Constructed rather than spawned: whether a *random* meteor exits before
    // its lifetime ends depends on the seed, and a test that depends on the
    // seed for its premise is testing the seed. This one places a meteor just
    // inside the right edge and steps it out.
    const pool = createMeteorPool(1);
    Object.assign(pool[0]!, {
      active: true,
      x: W - 10,
      y: H / 2,
      vx: 500,
      vy: 350,
      length: 80,
      thickness: 2,
      age: 0,
      life: 10, // far longer than the crossing takes
    });

    stepMeteors(pool, 0.5, W, H);

    expect(pool[0]!.active, 'should be retired by position').toBe(false);
    expect(pool[0]!.age, 'and not by age').toBeLessThan(pool[0]!.life);
  });

  it('keeps a meteor alive while its trail is still on screen', () => {
    // Retiring on the head crossing the edge would clip the tail mid-flight.
    const pool = createMeteorPool(1);
    Object.assign(pool[0]!, {
      active: true,
      x: W + 20,
      y: H / 2,
      vx: 100,
      vy: 70,
      length: 120,
      thickness: 2,
      age: 0,
      life: 10,
    });

    stepMeteors(pool, 0.01, W, H);
    expect(pool[0]!.active).toBe(true);
  });

  it('is deterministic for a seed', () => {
    const run = () => {
      const pool = createMeteorPool(5);
      const rng = createRng(77);
      for (let i = 0; i < 20; i += 1) {
        spawnMeteor(pool, W, H, rng);
        stepMeteors(pool, 0.1, W, H);
      }
      return pool.map((m) => ({ x: m.x, y: m.y, active: m.active }));
    };
    expect(run()).toEqual(run());
  });
});

describe('meteor opacity', () => {
  const base = { active: true, x: 0, y: 0, vx: 1, vy: 1, length: 80, thickness: 2, life: 2 };

  it('fades in from nothing', () => {
    expect(meteorOpacity({ ...base, age: 0 })).toBe(0);
  });

  it('is fully opaque through the middle of its life', () => {
    expect(meteorOpacity({ ...base, age: 1 })).toBe(1);
  });

  it('fades out to nothing rather than vanishing', () => {
    expect(meteorOpacity({ ...base, age: 2 })).toBe(0);
    expect(meteorOpacity({ ...base, age: 1.9 })).toBeGreaterThan(0);
    expect(meteorOpacity({ ...base, age: 1.9 })).toBeLessThan(1);
  });

  it('never leaves the 0–1 range', () => {
    for (let age = 0; age <= 2.5; age += 0.01) {
      const value = meteorOpacity({ ...base, age });
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});

describe('spawn cadence', () => {
  it('draws from the profile interval', () => {
    const rng = createRng(8);
    for (let i = 0; i < 500; i += 1) {
      const delay = nextSpawnDelay(PROFILES.high, rng);
      expect(delay).toBeGreaterThanOrEqual(PROFILES.high.meteorInterval[0]);
      expect(delay).toBeLessThan(PROFILES.high.meteorInterval[1]);
    }
  });

  it('is slower on the low profile than the high one', () => {
    expect(PROFILES.low.meteorInterval[0]).toBeGreaterThan(PROFILES.high.meteorInterval[0]);
  });
});
