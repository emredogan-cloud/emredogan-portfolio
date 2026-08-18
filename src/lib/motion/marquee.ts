/**
 * The marquee's velocity model.
 *
 * Frame-by-frame analysis of the reference (roadmap §1.4) found something a
 * plain CSS animation cannot produce: the strip cruises at 95–101 px/s, then
 * eases to a complete stop over 0.6–0.9 s and eases back up again — while the
 * page is not scrolling and no frames are dropped. It is a damped velocity,
 * not a constant one.
 *
 * Kept as pure functions so the profile can be asserted against the measured
 * numbers without a browser.
 */

/**
 * Exponential approach to a target velocity, integrated over `delta` seconds.
 *
 * Deliberately **not** `v += (target - v) * 0.06`, the usual lerp. That form is
 * frame-rate dependent: identical code ramps almost twice as fast on a 120 Hz
 * display as on a 60 Hz one. Solving the exponential over the real elapsed time
 * makes the ramp take the same wall-clock duration on any display.
 *
 * `rampSeconds` is defined as the time to cover 95% of the gap, which is what
 * the recording measures — the point where the strip visibly stops.
 */
export function approachVelocity(
  current: number,
  target: number,
  delta: number,
  rampSeconds: number,
): number {
  if (rampSeconds <= 0) return target;
  // 95% of the gap in `rampSeconds` ⇒ e^(-rampSeconds/τ) = 0.05 ⇒ τ = ramp/3.
  const tau = rampSeconds / 3;
  const factor = 1 - Math.exp(-delta / tau);
  return current + (target - current) * factor;
}

/**
 * Wraps the strip's offset into `[-loopWidth, 0]`.
 *
 * The track renders its contents twice, so scrolling exactly one copy's width
 * lands on a pixel-identical position and the seam is invisible. Modulo rather
 * than a conditional reset, so a large delta — a tab resuming, a long frame —
 * cannot leave the offset out of range.
 */
export function wrapOffset(offset: number, loopWidth: number): number {
  if (loopWidth <= 0) return 0;
  return -(((-offset % loopWidth) + loopWidth) % loopWidth);
}

/** Seconds for one full loop at a given speed — the reference measured ~8.7 s. */
export function loopDuration(loopWidth: number, speed: number): number {
  if (speed <= 0) return Infinity;
  return loopWidth / speed;
}
