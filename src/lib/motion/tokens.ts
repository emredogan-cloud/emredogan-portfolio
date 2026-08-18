/**
 * Motion tokens — the single source for every duration, easing curve and
 * stagger on the site. Components never write a raw number
 * (WORKING_DISCIPLINE §5.1).
 *
 * `marquee` and `marqueeRamp` are calibrated against the reference recording:
 * a full 840 px loop takes ~8.7 s (≈97 px/s) and the speed ramps in and out
 * over 0.6–0.9 s rather than switching instantly
 * (PERSONAL_WEBSITE_EXECUTION_ROADMAP.md §1.4).
 */

export const duration = {
  instant: 0.12,
  fast: 0.2,
  base: 0.35,
  slow: 0.6,
  slower: 0.9,
} as const;

export const ease = {
  /** Premium expo-out. Default for reveals. */
  out: [0.16, 1, 0.3, 1],
  /** Symmetric. State changes that go both ways (nav island, toggles). */
  inOut: [0.65, 0, 0.35, 1],
} as const;

export const spring = {
  default: { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 },
  soft: { type: 'spring', stiffness: 160, damping: 26, mass: 1 },
  magnetic: { type: 'spring', stiffness: 220, damping: 18, mass: 0.6 },
} as const;

export const stagger = {
  tight: 0.04,
  base: 0.07,
  loose: 0.12,
} as const;

export const distance = {
  reveal: 24,
  revealLarge: 40,
  /** Pointer parallax ceiling, in px. Desktop only. */
  parallaxMax: 8,
  /** Magnetic button displacement ceiling, in px. */
  magneticMax: 6,
} as const;

export const marquee = {
  /** Cruise speed in px/s, measured from the reference. */
  speed: 97,
  /** Seconds to ramp between 0 and cruise. */
  rampSeconds: 0.7,
  /** Mobile runs slower so the logos stay legible on a narrow viewport. */
  mobileSpeedFactor: 0.6,
} as const;
