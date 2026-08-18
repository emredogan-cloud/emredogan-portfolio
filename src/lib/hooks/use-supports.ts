'use client';

import { useSyncExternalStore } from 'react';

/** Feature support never changes for the life of a document. */
const noop = () => () => {};

/**
 * Reads `CSS.supports` without setting state in an effect.
 *
 * The naive version — `useState(false)` plus a `useEffect` that detects and
 * sets — triggers a cascading render on every mount and is flagged by
 * `react-hooks/set-state-in-effect`. `useSyncExternalStore` expresses the same
 * thing correctly: a value read from outside React that happens never to
 * change.
 *
 * The server snapshot is `true` — assume the platform handles it — so the
 * markup rendered on the server is the one that needs no JavaScript, and the
 * fallback is opted into only where it is genuinely required.
 */
export function useCssSupports(declaration: string): boolean {
  return useSyncExternalStore(
    noop,
    () =>
      typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
        ? CSS.supports(declaration)
        : false,
    () => true,
  );
}
