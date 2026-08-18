'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function getSnapshot(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

/**
 * Single entry point for reduced-motion. Server snapshot is `true` so the
 * first paint is the calm variant and motion is opted *into* after hydration —
 * never the other way round, which would flash animation at a user who asked
 * for none.
 */
export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
