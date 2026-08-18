'use client';

import { useEffect, useRef, useState } from 'react';
import { createEngine, type Engine } from '@/lib/background/engine';
import { readDeviceSignals, selectProfile, type QualityProfile } from '@/lib/background/quality';

/** Fixed seed. The sky is the same one on every device and every test run. */
const DEFAULT_SEED = 0x5eed_5747;

/**
 * The animated background.
 *
 * A single fixed canvas behind everything, `aria-hidden` and
 * `pointer-events: none`, so it is invisible to assistive technology and can
 * never intercept a click.
 *
 * Four things stop it from being a battery tax:
 *
 *  - The quality profile is chosen from the device's own signals before
 *    anything is drawn (`selectProfile`).
 *  - The loop stops entirely when the tab is hidden. A background tab has no
 *    business animating.
 *  - Pointer parallax is only wired up on profiles that have it, so no phone
 *    pays for a listener it will never use.
 *  - Under `prefers-reduced-motion` the profile is `static`: one frame, then
 *    nothing. Not slower — still.
 *
 * Tests can pin the field with `?bg-seed=` and freeze the clock with
 * `?bg-static`, which is what makes visual baselines reproducible.
 */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [profileId, setProfileId] = useState<QualityProfile['id'] | 'pending'>('pending');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const params = new URLSearchParams(window.location.search);
    const seedParam = params.get('bg-seed');
    const seed = seedParam ? Number(seedParam) : DEFAULT_SEED;
    const forceStatic = params.has('bg-static');

    const signals = readDeviceSignals();
    const profile = selectProfile(forceStatic ? { ...signals, reducedMotion: true } : signals);
    setProfileId(profile.id);

    const engine = createEngine({
      canvas,
      profile,
      seed: Number.isFinite(seed) ? seed : DEFAULT_SEED,
    });
    engineRef.current = engine;
    engine.resize();
    engine.start();

    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize, { passive: true });

    // Stop when the tab is hidden. `visibilitychange` is the only reliable
    // signal — rAF already throttles, but throttled is not stopped.
    const onVisibility = () => {
      if (document.hidden) engine.stop();
      else engine.start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    let onPointerMove: ((event: PointerEvent) => void) | null = null;
    let onPointerLeave: (() => void) | null = null;
    if (profile.parallax > 0) {
      onPointerMove = (event) => engine.setPointer(event.clientX, event.clientY);
      onPointerLeave = () => engine.setPointer(null, null);
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('pointerleave', onPointerLeave);
    }

    return () => {
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      if (onPointerMove) window.removeEventListener('pointermove', onPointerMove);
      if (onPointerLeave) document.removeEventListener('pointerleave', onPointerLeave);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-background-profile={profileId}
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
