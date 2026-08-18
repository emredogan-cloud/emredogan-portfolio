import { createRng, range } from './rng';
import type { QualityProfile } from './quality';

export interface Star {
  /** Normalised position, 0–1, so a resize does not need a regenerated field. */
  readonly x: number;
  readonly y: number;
  readonly radius: number;
  readonly alpha: number;
  /** 0 = furthest layer. Drives parallax strength and size. */
  readonly depth: 0 | 1 | 2;
  /** Twinkle phase offset in radians; `null` for stars that do not twinkle. */
  readonly phase: number | null;
  /** Twinkle period in seconds. */
  readonly period: number;
}

/** Three depth layers, furthest first. Matches the reference's flat field
 *  plus the depth it was missing. */
const LAYERS = [
  { share: 0.55, radius: [0.4, 0.75], alpha: [0.28, 0.5] },
  { share: 0.31, radius: [0.65, 1.05], alpha: [0.45, 0.72] },
  { share: 0.14, radius: [0.95, 1.6], alpha: [0.68, 0.98] },
] as const;

export function starCountFor(width: number, height: number, profile: QualityProfile): number {
  // Density is per unit *area*, so a 2,560 px display is not sparser than a
  // phone and a phone is not swamped.
  const area = (width * height) / 100_000;
  return Math.round(area * profile.starDensity);
}

/**
 * Generates the field.
 *
 * Positions are normalised rather than absolute so a viewport resize re-maps
 * the same stars instead of scattering a new sky — resizing a window should
 * not visibly re-roll the background.
 */
export function generateStars(count: number, profile: QualityProfile, seed: number): Star[] {
  const rng = createRng(seed);
  const stars: Star[] = [];

  for (let index = 0; index < count; index += 1) {
    const roll = rng();
    let depth: 0 | 1 | 2 = 0;
    let cumulative = 0;
    for (let layer = 0; layer < LAYERS.length; layer += 1) {
      cumulative += LAYERS[layer]!.share;
      if (roll <= cumulative) {
        depth = layer as 0 | 1 | 2;
        break;
      }
    }

    const layer = LAYERS[depth]!;
    const twinkles = rng() < profile.twinkleShare;

    stars.push({
      x: rng(),
      y: rng(),
      radius: range(rng, layer.radius[0], layer.radius[1]),
      alpha: range(rng, layer.alpha[0], layer.alpha[1]),
      depth,
      phase: twinkles ? range(rng, 0, Math.PI * 2) : null,
      period: range(rng, 2.6, 5.4),
    });
  }

  return stars;
}

/**
 * Twinkle brightness multiplier at time `t`.
 *
 * Amplitude is deliberately small (±12%). The reference's stars do not twinkle
 * at all; the goal is to make the sky feel alive on close inspection, not to
 * put flashing content next to body copy.
 */
export function twinkleFactor(star: Star, seconds: number): number {
  if (star.phase === null) return 1;
  return 1 + 0.12 * Math.sin((seconds / star.period) * Math.PI * 2 + star.phase);
}
