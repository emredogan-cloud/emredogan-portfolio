'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

type RevealVariant = 'up' | 'up-large' | 'fade';

interface RevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  /** Delay in seconds — pass `staggerDelay(index)` from the motion tokens. */
  delay?: number;
  as?: 'div' | 'li' | 'section' | 'article' | 'p' | 'span';
  className?: string;
}

const variantClass: Record<RevealVariant, string> = {
  up: 'reveal-up',
  'up-large': 'reveal-up-large',
  fade: 'reveal-fade',
};

/**
 * The single entry point for scroll-triggered reveals.
 *
 * Implemented as an `IntersectionObserver` that toggles one class, with the
 * transition itself declared in CSS. That is a deliberate choice over an
 * animation library — see ADR-0009. It costs about 1 KB instead of 46 KB, runs
 * entirely on the compositor, and needs no runtime to be correct.
 *
 * Three guarantees:
 *
 *  1. **Content is never hidden from anyone who cannot see the animation.**
 *     The hidden state is applied by script after mount, so with JavaScript
 *     disabled — or before hydration — the content renders visible. Under
 *     `prefers-reduced-motion` the CSS resolves the transition instantly.
 *  2. **It fires once.** The observer disconnects on the first intersection,
 *     so scrolling back up does not replay it.
 *  3. **Only `opacity` and `transform` animate**, so nothing triggers layout.
 */
export function Reveal({
  children,
  variant = 'up',
  delay = 0,
  as: Tag = 'div',
  className,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'ssr' | 'hidden' | 'shown'>('ssr');

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Anything already on screen at mount is shown without a transition —
    // animating the hero out of nowhere on load reads as a glitch, not a
    // reveal.
    const alreadyVisible = node.getBoundingClientRect().top < window.innerHeight;
    if (alreadyVisible) {
      setState('shown');
      return;
    }

    setState('hidden');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setState('shown');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn(
        'reveal',
        variantClass[variant],
        state === 'hidden' && 'reveal-hidden',
        className,
      )}
      style={delay > 0 ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
