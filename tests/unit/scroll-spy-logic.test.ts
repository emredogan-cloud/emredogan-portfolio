import { describe, expect, it } from 'vitest';
import { readingLineRootMargin, resolveActiveSection } from '@/lib/hooks/scroll-spy-logic';

const ORDER = ['home', 'about', 'work', 'contact'] as const;

const state = (
  crossing: readonly string[],
  overrides: { atBottom?: boolean; previous?: string | null } = {},
) => ({
  order: ORDER,
  crossing: new Set(crossing),
  atBottom: overrides.atBottom ?? false,
  previous: overrides.previous ?? null,
});

describe('resolveActiveSection', () => {
  it('picks the section crossing the reading line', () => {
    expect(resolveActiveSection(state(['work']))).toBe('work');
  });

  it('holds the previous value when nothing crosses the line', () => {
    // Gaps between sections must not blank the indicator.
    expect(resolveActiveSection(state([], { previous: 'about' }))).toBe('about');
  });

  it('returns null when nothing crosses and nothing was active', () => {
    expect(resolveActiveSection(state([]))).toBeNull();
  });

  it('activates the last section at the end of the document', () => {
    // The final section's top is above the line by then, so the observer alone
    // would leave the navigation on the second-to-last item.
    expect(resolveActiveSection(state(['work'], { atBottom: true }))).toBe('contact');
  });

  it('the end-of-document rule outranks whatever is crossing', () => {
    expect(resolveActiveSection(state(['home'], { atBottom: true }))).toBe('contact');
  });

  it('falls back to the previous value at the bottom of an empty order', () => {
    expect(
      resolveActiveSection({
        order: [],
        crossing: new Set(),
        atBottom: true,
        previous: 'about',
      }),
    ).toBe('about');
  });

  it('resolves an overlap to the first section in document order', () => {
    // This is the regression: with a reading *band*, a section ending a few
    // pixels inside it still counted, and the outgoing section won. The line
    // makes overlap almost impossible, but the tie-break must stay determinate.
    expect(resolveActiveSection(state(['about', 'work']))).toBe('about');
    expect(resolveActiveSection(state(['work', 'about']))).toBe('about');
  });

  it('ignores ids that are not part of the section order', () => {
    expect(resolveActiveSection(state(['footer'], { previous: 'work' }))).toBe('work');
  });
});

describe('readingLineRootMargin', () => {
  it('collapses the root to a one-pixel line at the requested offset', () => {
    expect(readingLineRootMargin(1000, 120)).toBe('-120px 0px -879px 0px');
  });

  it('never produces a negative bottom margin on a short viewport', () => {
    // A viewport shorter than the offset would otherwise invert the root.
    expect(readingLineRootMargin(80, 120)).toBe('-120px 0px -0px 0px');
  });

  it('leaves exactly one pixel of root height', () => {
    const height = 720;
    const line = 120;
    const margin = readingLineRootMargin(height, line);
    const bottom = Number(margin.split(' ')[2]!.replace(/-|px/g, ''));
    expect(height - line - bottom).toBe(1);
  });
});
