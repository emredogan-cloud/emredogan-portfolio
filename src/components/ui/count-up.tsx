'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotionSafe } from '@/lib/motion/use-reduced-motion-safe';

interface CountUpProps {
  /** The final string, e.g. "1,113" or "3". Formatting is preserved. */
  value: string;
  /** Seconds. */
  duration?: number;
  className?: string;
}

/** Pulls the digits out of a formatted number, keeping the formatting shape. */
function parse(value: string): { target: number; format: (n: number) => string } | null {
  const digits = value.replace(/[^\d]/g, '');
  if (digits.length === 0) return null;
  const target = Number(digits);
  if (!Number.isFinite(target)) return null;

  const grouped = value.includes(',');
  const prefix = value.slice(0, value.search(/\d/));
  const suffix = value.slice(value.search(/\d(?!.*\d)/) + 1);

  return {
    target,
    format: (n) =>
      `${prefix}${grouped ? Math.round(n).toLocaleString('en-US') : String(Math.round(n))}${suffix}`,
  };
}

/**
 * Counts a statistic up when it first comes into view.
 *
 * Three things it will not do:
 *
 *  - **Animate under reduced motion.** It renders the final value immediately.
 *  - **Hide the number if JavaScript never runs.** The final value is the
 *    server-rendered content; the animation replaces it after mount.
 *  - **Reflow the layout mid-count.** The container reserves the final value's
 *    width with an invisible copy, and the digits are tabular, so nothing
 *    beside it shifts while the number changes.
 */
export function CountUp({ value, duration = 1.2, className }: CountUpProps) {
  const reduced = useReducedMotionSafe();
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const node = ref.current;
    const parsed = parse(value);
    if (!node || !parsed || reduced) return;

    let frame = 0;
    let start: number | null = null;

    const run = () => {
      setDisplay(parsed.format(0));
      const tick = (now: number) => {
        start ??= now;
        const elapsed = (now - start) / 1000;
        const progress = Math.min(1, elapsed / duration);
        // Ease-out cubic: fast at first, settles onto the final value.
        const eased = 1 - (1 - progress) ** 3;
        setDisplay(parsed.format(parsed.target * eased));
        if (progress < 1) frame = requestAnimationFrame(tick);
        else setDisplay(value);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          run();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {/* Reserves the final width so the surrounding layout cannot shift. */}
      <span className="tabular invisible block h-0 overflow-hidden" aria-hidden>
        {value}
      </span>
      <span className="tabular" data-count-up aria-hidden>
        {display}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
