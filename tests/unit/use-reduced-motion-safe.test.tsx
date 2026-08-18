import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useReducedMotionSafe } from '@/lib/motion/use-reduced-motion-safe';

type Listener = () => void;

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<Listener>();
  const mql = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: (_: string, fn: Listener) => listeners.add(fn),
    removeEventListener: (_: string, fn: Listener) => listeners.delete(fn),
  };
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn(() => mql),
  });
  return {
    set(next: boolean) {
      mql.matches = next;
      listeners.forEach((fn) => fn());
    },
    listenerCount: () => listeners.size,
  };
}

afterEach(() => vi.restoreAllMocks());

describe('useReducedMotionSafe', () => {
  it('reports false when the user has expressed no preference', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotionSafe());
    expect(result.current).toBe(false);
  });

  it('reports true when the user asked for reduced motion', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotionSafe());
    expect(result.current).toBe(true);
  });

  it('subscribes while mounted and unsubscribes on unmount', () => {
    const media = mockMatchMedia(false);
    const { unmount } = renderHook(() => useReducedMotionSafe());
    expect(media.listenerCount()).toBeGreaterThan(0);
    unmount();
    expect(media.listenerCount()).toBe(0);
  });
});

describe('useReducedMotionSafe in environments without matchMedia', () => {
  it('falls back to "no preference" rather than throwing', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: undefined,
    });
    const { result, unmount } = renderHook(() => useReducedMotionSafe());
    expect(result.current).toBe(false);
    expect(() => unmount()).not.toThrow();
  });
});
