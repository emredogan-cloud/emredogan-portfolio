import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrolledPast } from '@/lib/hooks/use-scroll-state';

type Callback = (entries: { isIntersecting: boolean }[]) => void;

let callbacks: Callback[] = [];
let observed: Element[] = [];
let disconnects = 0;

class MockIntersectionObserver {
  constructor(private readonly callback: Callback) {
    callbacks.push(callback);
  }
  observe(element: Element) {
    observed.push(element);
  }
  disconnect() {
    disconnects += 1;
  }
  unobserve() {}
  takeRecords() {
    return [];
  }
}

beforeEach(() => {
  callbacks = [];
  observed = [];
  disconnects = 0;
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('useScrolledPast', () => {
  it('starts false so the first paint matches the server', () => {
    const { result } = renderHook(() => useScrolledPast(48));
    expect(result.current).toBe(false);
  });

  it('inserts an aria-hidden sentinel of the requested height', () => {
    renderHook(() => useScrolledPast(64));
    const sentinel = observed[0] as HTMLElement;
    expect(sentinel).toBeTruthy();
    expect(sentinel.getAttribute('aria-hidden')).toBe('true');
    expect(sentinel.style.height).toBe('64px');
    expect(sentinel.style.pointerEvents).toBe('none');
    expect(document.body.firstElementChild).toBe(sentinel);
  });

  it('reports true once the sentinel leaves the viewport', () => {
    const { result } = renderHook(() => useScrolledPast());
    act(() => callbacks[0]!([{ isIntersecting: false }]));
    expect(result.current).toBe(true);

    act(() => callbacks[0]!([{ isIntersecting: true }]));
    expect(result.current).toBe(false);
  });

  it('removes the sentinel and disconnects on unmount', () => {
    const { unmount } = renderHook(() => useScrolledPast());
    const sentinel = observed[0] as HTMLElement;
    expect(document.body.contains(sentinel)).toBe(true);

    unmount();
    expect(disconnects).toBe(1);
    expect(document.body.contains(sentinel)).toBe(false);
  });
});
