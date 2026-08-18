'use client';

import { useEffect, useState } from 'react';

/**
 * True once the page has scrolled past `threshold`.
 *
 * Uses a sentinel element observed by `IntersectionObserver` rather than a
 * scroll listener. A scroll handler that reads `window.scrollY` runs on every
 * scroll event and forces the browser to resolve layout mid-scroll; this fires
 * twice in the page's lifetime and never reads layout at all, which is the
 * difference between a navigation that costs nothing and one that shows up in
 * INP.
 */
export function useScrolledPast(threshold = 48): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    Object.assign(sentinel.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '1px',
      height: `${threshold}px`,
      pointerEvents: 'none',
    });
    document.body.prepend(sentinel);

    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry?.isIntersecting), {
      threshold: 0,
    });
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, [threshold]);

  return scrolled;
}
