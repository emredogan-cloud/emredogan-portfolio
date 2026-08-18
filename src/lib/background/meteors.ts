import { range } from './rng';
import type { QualityProfile } from './quality';

export interface Meteor {
  active: boolean;
  /** Head position in CSS px. */
  x: number;
  y: number;
  /** Velocity in px/s. */
  vx: number;
  vy: number;
  /** Trail length in px. */
  length: number;
  thickness: number;
  /** Seconds lived, and total lifetime. */
  age: number;
  life: number;
}

/**
 * Geometry measured from the reference recording (roadmap §1.4): a white
 * streak angled 35–40° below horizontal, travelling down and to the right,
 * with the bright head at the leading end and the tail fading behind it.
 * Length varied between roughly 55 and 130 px.
 */
const ANGLE = [Math.PI / 5.4, Math.PI / 4.3] as const; // ≈33°–42°
const SPEED = [320, 560] as const; // px/s
const LENGTH = [55, 135] as const;
const LIFE = [1.4, 2.8] as const;

/**
 * Fixed-size pool.
 *
 * Meteors are recycled rather than allocated. At one spawn every half second
 * over a long session, allocating would hand the garbage collector a steady
 * drip of short-lived objects — which is exactly the pattern that produces
 * periodic frame drops in an otherwise smooth animation.
 */
export function createMeteorPool(size: number): Meteor[] {
  return Array.from({ length: size }, () => ({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    length: 0,
    thickness: 0,
    age: 0,
    life: 0,
  }));
}

/** Activates one dormant meteor. Returns false when the pool is exhausted. */
export function spawnMeteor(
  pool: Meteor[],
  width: number,
  height: number,
  rng: () => number,
): boolean {
  const meteor = pool.find((candidate) => !candidate.active);
  if (!meteor) return false;

  const angle = range(rng, ANGLE[0], ANGLE[1]);
  const speed = range(rng, SPEED[0], SPEED[1]);

  // Entry points are spread across the top edge and down the left edge, so
  // streaks arrive from off-screen rather than appearing in mid-air.
  const fromTop = rng() < 0.72;
  meteor.x = fromTop ? range(rng, -0.15 * width, width * 0.95) : -60;
  meteor.y = fromTop ? range(rng, -80, -10) : range(rng, -40, height * 0.55);

  meteor.vx = Math.cos(angle) * speed;
  meteor.vy = Math.sin(angle) * speed;
  meteor.length = range(rng, LENGTH[0], LENGTH[1]);
  meteor.thickness = range(rng, 1.4, 2.4);
  meteor.age = 0;
  meteor.life = range(rng, LIFE[0], LIFE[1]);
  meteor.active = true;
  return true;
}

/** Advances the pool and retires anything expired or off-screen. */
export function stepMeteors(pool: Meteor[], delta: number, width: number, height: number): void {
  for (const meteor of pool) {
    if (!meteor.active) continue;

    meteor.x += meteor.vx * delta;
    meteor.y += meteor.vy * delta;
    meteor.age += delta;

    const past = meteor.x - meteor.length > width || meteor.y - meteor.length > height;
    if (meteor.age >= meteor.life || past) meteor.active = false;
  }
}

/**
 * Opacity over a meteor's life: a quick fade in, a long bright middle, a fade
 * out. A streak that simply vanished would read as a rendering glitch.
 */
export function meteorOpacity(meteor: Meteor): number {
  const progress = meteor.life === 0 ? 1 : meteor.age / meteor.life;
  if (progress < 0.12) return progress / 0.12;
  if (progress > 0.7) return Math.max(0, (1 - progress) / 0.3);
  return 1;
}

/** Seconds until the next spawn, drawn from the profile's interval. */
export function nextSpawnDelay(profile: QualityProfile, rng: () => number): number {
  const [min, max] = profile.meteorInterval;
  return range(rng, min, max);
}
