/**
 * Deterministic pseudo-random source.
 *
 * `Math.random()` would make the starfield unrepeatable, which means visual
 * baselines could never be trusted and a "the layout broke at this star
 * position" bug could never be reproduced. mulberry32 is four lines, has good
 * enough distribution for scattering points, and gives an identical field for
 * an identical seed on every machine.
 */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Uniform float in `[min, max)`. */
export function range(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

/** Uniform integer in `[min, max]`. */
export function rangeInt(rng: () => number, min: number, max: number): number {
  return Math.floor(range(rng, min, max + 1));
}
