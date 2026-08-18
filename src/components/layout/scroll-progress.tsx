'use client';

import { useEffect } from 'react';
import { useCssSupports } from '@/lib/hooks/use-supports';

/**
 * Reading-progress bar.
 *
 * Prefers the CSS scroll-driven timeline where it exists — Chrome/Edge 115+,
 * Safari 26+ — which the compositor runs with no main-thread work at all. The
 * JavaScript path exists for Firefox, and even that only writes a CSS custom
 * property, so it never triggers layout.
 *
 * Support is detected, not assumed, so the fallback listener is not attached
 * in browsers that do not need it.
 */
export function ScrollProgress() {
  const native = useCssSupports('animation-timeline: scroll()');

  useEffect(() => {
    if (native) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      document.documentElement.style.setProperty('--scroll-progress', String(progress));
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [native]);

  return (
    <div
      aria-hidden
      data-scroll-timeline={native ? 'native' : 'fallback'}
      className="scroll-progress"
    />
  );
}
