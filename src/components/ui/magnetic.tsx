'use client';

import { useCallback, useEffect, useRef } from 'react';
import { distance } from '@/lib/motion/tokens';
import { useReducedMotionSafe } from '@/lib/motion/use-reduced-motion-safe';

/**
 * Gives its child a slight pull toward the pointer.
 *
 * **Purpose, not decoration.** The effect is confined to the primary call to
 * action, where it does one job: make the single most important control on the
 * page feel like it is reaching back. Capped at 6 px — enough to register as
 * responsiveness, too small to make the target harder to hit, which is the way
 * this pattern usually goes wrong.
 *
 * Disabled entirely under reduced motion and on devices without a fine
 * pointer, where it would be dead weight.
 */
export function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);
  const reduced = useReducedMotionSafe();

  const reset = useCallback(() => {
    const node = ref.current;
    if (node) node.style.transform = '';
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const onMove = (event: PointerEvent) => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        const box = node.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        const max = distance.magneticMax;
        const clamp = (n: number, extent: number) =>
          Math.max(-max, Math.min(max, (n / extent) * max * 2));
        node.style.transform = `translate3d(${clamp(dx, box.width)}px, ${clamp(dy, box.height)}px, 0)`;
      });
    };

    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerleave', reset);
    return () => {
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', reset);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [reduced, reset]);

  return (
    <span
      ref={ref}
      className="inline-block transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] will-change-transform"
    >
      {children}
    </span>
  );
}
