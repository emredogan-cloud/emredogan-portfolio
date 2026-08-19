'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { BrandMark } from '@/components/ui/brand-mark';
import { stack } from '@/content/stack';
import { marquee as marqueeTokens } from '@/lib/motion/tokens';
import { approachVelocity, wrapOffset } from '@/lib/motion/marquee';
import { useReducedMotionSafe } from '@/lib/motion/use-reduced-motion-safe';
import { cn } from '@/lib/utils/cn';

/**
 * The technology strip.
 *
 * Reproduces the one behaviour of the reference that a CSS animation cannot:
 * a **damped** velocity. Frame analysis (roadmap §1.4) showed it cruising at
 * 95–101 px/s, easing to a full stop over 0.6–0.9 s, holding, then easing back
 * — with the page stationary and no dropped frames. So this runs a small rAF
 * loop over `approachVelocity` instead of a keyframe.
 *
 * What it adds beyond the reference:
 *
 *  - **A visible pause control.** WCAG 2.2.2 requires any automatic motion
 *    lasting over five seconds to be pausable, and the reference offers no way
 *    to stop it. Hover and keyboard focus also pause it, but neither is a
 *    substitute for a control you can find.
 *  - **The logos are real content.** A `sr-only` list names every technology
 *    and the projects it was used in, so the information is available to a
 *    screen reader rather than being a decorative smear.
 *  - **Reduced motion renders a static row**, not a slower one.
 *  - **Off-screen it stops**: no frames are spent animating something nobody
 *    is looking at.
 */
export function TechMarquee() {
  const reduced = useReducedMotionSafe();
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLUListElement>(null);

  // Read inside the rAF loop, so the loop never has to restart when they
  // change. Synchronised in an effect rather than assigned during render —
  // writing a ref while rendering is a React rule violation and can tear under
  // concurrent rendering.
  const pausedRef = useRef(paused);
  const interactingRef = useRef(interacting);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    interactingRef.current = interacting;
  }, [interacting]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const copy = copyRef.current;
    if (!viewport || !track || !copy || reduced) return;

    const narrow = window.matchMedia('(max-width: 767px)').matches;
    const cruise = marqueeTokens.speed * (narrow ? marqueeTokens.mobileSpeedFactor : 1);

    let offset = 0;
    let velocity = 0;
    let frame = 0;
    let last = 0;
    let onScreen = true;

    const step = (now: number) => {
      frame = requestAnimationFrame(step);
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;

      const target = pausedRef.current || interactingRef.current || !onScreen ? 0 : -cruise;
      velocity = approachVelocity(velocity, target, delta, marqueeTokens.rampSeconds);

      // Below a twentieth of a pixel per second the strip has stopped; skip the
      // style write rather than dirtying a layer forever.
      //
      // The state is published because a test cannot tell "stopped" from "no
      // frame was delivered" by watching the offset — and on a loaded CI
      // runner those look identical for a quarter of a second at a time, which
      // is exactly how a WebKit job failed by 2.5 px of residual drift after
      // the helper had already declared the strip at rest. Written only when
      // it changes, so this is not a per-frame DOM write.
      if (Math.abs(velocity) < 0.05 && Math.abs(target) < 0.05) {
        if (track.dataset['marquee'] !== 'stopped') track.dataset['marquee'] = 'stopped';
        return;
      }
      if (track.dataset['marquee'] !== 'running') track.dataset['marquee'] = 'running';

      offset = wrapOffset(offset + velocity * delta, copy.offsetWidth);
      track.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
      },
      { rootMargin: '120px 0px' },
    );
    observer.observe(viewport);

    last = performance.now();
    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [reduced]);

  const items = stack.map((entry) => (
    <li key={entry.id} className="shrink-0 px-[clamp(1.25rem,3vw,2.25rem)]">
      <span
        className={cn(
          'block size-8 text-[var(--color-text-muted)] transition-colors duration-[var(--duration-base)]',
          'hover:text-[var(--color-text-strong)] sm:size-9',
        )}
      >
        <BrandMark id={entry.id} />
      </span>
    </li>
  ));

  return (
    <section
      aria-labelledby="stack-heading"
      className="border-y border-[var(--color-hairline)] py-10"
    >
      <h2 id="stack-heading" className="sr-only">
        Technologies used across these projects
      </h2>

      {/*
        The accessible copy. The strip itself is decorative duplication; this is
        where the information actually lives, and it is what a screen reader
        reads.
      */}
      <ul className="sr-only">
        {stack.map((entry) => (
          <li key={entry.id}>
            {entry.label} — used in {entry.usedIn.join(', ')}
          </li>
        ))}
      </ul>

      <div className="relative">
        <div
          ref={viewportRef}
          id="tech-strip"
          aria-hidden="true"
          className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
          onPointerEnter={() => setInteracting(true)}
          onPointerLeave={() => setInteracting(false)}
          onFocusCapture={() => setInteracting(true)}
          onBlurCapture={() => setInteracting(false)}
        >
          <div ref={trackRef} className="flex w-max will-change-transform">
            <ul ref={copyRef} className="flex items-center">
              {items}
            </ul>
            {/* Second copy: scrolling exactly one copy's width lands on a
                pixel-identical position, so the seam is invisible. */}
            <ul className="flex items-center">{items}</ul>
          </div>
        </div>

        {/*
          Rendered unconditionally and hidden with a CSS media query, never with
          `{reduced ? … : null}`.

          `useReducedMotionSafe` reports `true` until the first effect runs, so
          a JavaScript condition means this row is absent from the server HTML
          and appears at hydration — pushing every section below it down by
          58 px. That is a layout shift on every load, and it moved an anchored
          section out from under the reader's cursor. A media query is applied
          at first paint, so there is nothing to shift.
        */}
        <div className="container-content mt-6 flex justify-end motion-reduce:hidden">
          {/*
              A media control, not a toggle button. The label changes
              (Pause ↔ Play) and there is deliberately no `aria-pressed`:
              carrying both would announce "Play, pressed", which contradicts
              itself. `aria-controls` names what the control operates.
            */}
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-controls="tech-strip"
            className={cn(
              'inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border px-4 py-2',
              'border-[var(--color-hairline)] text-sm text-[var(--color-text-muted)]',
              'transition-colors duration-[var(--duration-fast)]',
              'hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-text-strong)]',
            )}
          >
            {paused ? (
              <Play aria-hidden className="size-3.5" />
            ) : (
              <Pause aria-hidden className="size-3.5" />
            )}
            {paused ? 'Play' : 'Pause'}
            <span className="sr-only"> technology strip animation</span>
          </button>
        </div>
      </div>
    </section>
  );
}
