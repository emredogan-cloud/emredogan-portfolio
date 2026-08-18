import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollSpy } from '@/lib/hooks/use-scroll-spy';

type Entry = { isIntersecting: boolean; target: { id: string } };
type Callback = (entries: Entry[]) => void;

let callbacks: Callback[] = [];
let options: IntersectionObserverInit[] = [];
let disconnects = 0;

class MockIntersectionObserver {
  constructor(
    private readonly callback: Callback,
    init?: IntersectionObserverInit,
  ) {
    callbacks.push(callback);
    options.push(init ?? {});
  }
  observe() {}
  disconnect() {
    disconnects += 1;
  }
  unobserve() {}
  takeRecords() {
    return [];
  }
}

const SECTIONS = ['home', 'about', 'work', 'contact'];

function mountSections() {
  document.body.innerHTML = SECTIONS.map((id) => `<section id="${id}"></section>`).join('');
}

const cross = (id: string) => ({ isIntersecting: true, target: { id } });
const leave = (id: string) => ({ isIntersecting: false, target: { id } });

beforeEach(() => {
  callbacks = [];
  options = [];
  disconnects = 0;
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  mountSections();
  Object.defineProperty(window, 'innerHeight', { writable: true, value: 800 });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    writable: true,
    configurable: true,
    value: 4000,
  });
  window.scrollY = 0;
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('useScrollSpy', () => {
  it('starts on the first section so the server render is not blank', () => {
    const { result } = renderHook(() => useScrollSpy(SECTIONS));
    expect(result.current).toBe('home');
  });

  it('observes a one-pixel reading line rather than the whole viewport', () => {
    renderHook(() => useScrollSpy(SECTIONS));
    expect(options[0]?.rootMargin).toBe('-120px 0px -679px 0px');
  });

  it('follows the section crossing the line', () => {
    const { result } = renderHook(() => useScrollSpy(SECTIONS));
    act(() => callbacks[0]!([leave('home'), cross('about')]));
    expect(result.current).toBe('about');

    act(() => callbacks[0]!([leave('about'), cross('work')]));
    expect(result.current).toBe('work');
  });

  it('holds the last section rather than blanking in a gap', () => {
    const { result } = renderHook(() => useScrollSpy(SECTIONS));
    act(() => callbacks[0]!([leave('home'), cross('work')]));
    act(() => callbacks[0]!([leave('work')]));
    expect(result.current).toBe('work');
  });

  it('activates the final section at the end of the document', () => {
    const { result } = renderHook(() => useScrollSpy(SECTIONS));
    act(() => callbacks[0]!([cross('work')]));
    expect(result.current).toBe('work');

    act(() => {
      window.scrollY = 3200; // 3200 + 800 === scrollHeight
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe('contact');
  });

  it('does nothing when none of the ids are in the document', () => {
    document.body.innerHTML = '';
    const { result } = renderHook(() => useScrollSpy(SECTIONS));
    expect(result.current).toBe('home');
    expect(callbacks).toHaveLength(0);
  });

  it('disconnects and unbinds the scroll listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useScrollSpy(SECTIONS));
    unmount();
    expect(disconnects).toBe(1);
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
