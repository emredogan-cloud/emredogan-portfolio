/**
 * Device-appropriate quality profile.
 *
 * The background is the one part of this site that can make a phone warm, so
 * the budget is decided before a single star is drawn rather than discovered
 * afterwards by a user. Every knob here maps to a line in the performance
 * budget (roadmap §7).
 */
export interface QualityProfile {
  readonly id: 'static' | 'low' | 'standard' | 'high';
  /** Stars per 100,000 CSS px² of viewport area. */
  readonly starDensity: number;
  /** Fraction of stars that twinkle. */
  readonly twinkleShare: number;
  readonly maxMeteors: number;
  /** Seconds between meteor spawns, as a range. */
  readonly meteorInterval: readonly [number, number];
  /** Pointer parallax ceiling in px. 0 disables it. */
  readonly parallax: number;
  /** Device pixel ratio cap. Retina above 2 costs 4× fill for no visible gain. */
  readonly maxDpr: number;
  /** `static` renders one frame and stops. */
  readonly animate: boolean;
}

const PROFILES = {
  static: {
    id: 'static',
    starDensity: 9,
    twinkleShare: 0,
    maxMeteors: 0,
    meteorInterval: [0, 0],
    parallax: 0,
    maxDpr: 2,
    animate: false,
  },
  low: {
    id: 'low',
    starDensity: 7,
    twinkleShare: 0,
    maxMeteors: 3,
    meteorInterval: [1.1, 2.6],
    parallax: 0,
    maxDpr: 1.5,
    animate: true,
  },
  standard: {
    id: 'standard',
    starDensity: 11,
    twinkleShare: 0.14,
    maxMeteors: 5,
    meteorInterval: [0.7, 1.9],
    parallax: 0,
    maxDpr: 2,
    animate: true,
  },
  high: {
    id: 'high',
    starDensity: 13,
    twinkleShare: 0.16,
    maxMeteors: 7,
    meteorInterval: [0.45, 1.5],
    parallax: 8,
    maxDpr: 2,
    animate: true,
  },
} as const satisfies Record<string, QualityProfile>;

export interface DeviceSignals {
  readonly reducedMotion: boolean;
  readonly cores: number;
  /** `navigator.deviceMemory` in GB, or `null` where unsupported (Safari). */
  readonly memoryGb: number | null;
  readonly saveData: boolean;
  readonly finePointer: boolean;
  readonly coarseViewport: boolean;
}

/**
 * Picks a profile from what the device says about itself.
 *
 * Reduced motion is checked first and is absolute: it produces a still field,
 * not a slower one. Everything below it is a graduated response — an
 * eight-core desktop with a mouse gets parallax and twinkle; a four-core phone
 * gets a calmer sky at a lower pixel ratio; Data Saver gets the still image,
 * because someone who asked to save data did not ask for an animation.
 *
 * Missing signals are treated as capable rather than incapable. Safari does not
 * implement `deviceMemory`, and degrading every Safari user on that basis would
 * be worse than the occasional over-estimate.
 */
export function selectProfile(signals: DeviceSignals): QualityProfile {
  if (signals.reducedMotion || signals.saveData) return PROFILES.static;

  const lowMemory = signals.memoryGb !== null && signals.memoryGb <= 4;
  if (signals.cores <= 4 || lowMemory || signals.coarseViewport) return PROFILES.low;

  if (signals.cores >= 8 && signals.finePointer) return PROFILES.high;
  return PROFILES.standard;
}

/** Reads the signals from the browser. Server-safe: returns the still profile. */
export function readDeviceSignals(): DeviceSignals {
  if (typeof window === 'undefined') {
    return {
      reducedMotion: true,
      cores: 1,
      memoryGb: null,
      saveData: false,
      finePointer: false,
      coarseViewport: true,
    };
  }

  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;

  return {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    cores: navigator.hardwareConcurrency || 4,
    memoryGb: typeof memory === 'number' ? memory : null,
    saveData: connection?.saveData === true,
    finePointer: window.matchMedia('(hover: hover) and (pointer: fine)').matches,
    coarseViewport: window.innerWidth < 768,
  };
}

export { PROFILES };
