import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCssSupports } from '@/lib/hooks/use-supports';

afterEach(() => vi.unstubAllGlobals());

describe('useCssSupports', () => {
  it('reports what CSS.supports says', () => {
    vi.stubGlobal('CSS', { supports: (q: string) => q === 'animation-timeline: scroll()' });

    const { result: yes } = renderHook(() => useCssSupports('animation-timeline: scroll()'));
    expect(yes.current).toBe(true);

    const { result: no } = renderHook(() => useCssSupports('display: nonsense'));
    expect(no.current).toBe(false);
  });

  it('reports false where CSS.supports does not exist', () => {
    // Old engines and non-DOM environments must take the fallback path rather
    // than throwing.
    vi.stubGlobal('CSS', undefined);
    const { result } = renderHook(() => useCssSupports('animation-timeline: scroll()'));
    expect(result.current).toBe(false);
  });
});
