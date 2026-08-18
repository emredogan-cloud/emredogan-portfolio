/**
 * The scroll-spy's decision, separated from the DOM.
 *
 * This is where the bug lived: with a reading *band* rather than a line,
 * several contiguous sections qualified at once and the rule picked the
 * outgoing one. Pulling the choice out of the effect makes it directly
 * testable, and keeps the hook to wiring.
 */
export interface SpyState {
  /** Section ids in document order. */
  readonly order: readonly string[];
  /** Ids the observer currently reports as crossing the reading line. */
  readonly crossing: ReadonlySet<string>;
  /** The document is scrolled to its end. */
  readonly atBottom: boolean;
  /** What was active before this update. */
  readonly previous: string | null;
}

/**
 * Rules, in priority order:
 *
 *  1. **At the end of the document, the last section wins.** Its top may
 *     already be above the reading line, so the observer alone would leave the
 *     navigation pointing at the second-to-last item while the reader is
 *     looking at the last one.
 *  2. **Otherwise the first section in document order that crosses the line.**
 *     With a one-pixel line at most one can, so the ordering is a tie-break
 *     that should never actually be needed — it exists so a taller line, or a
 *     sub-pixel rounding overlap, still gives a deterministic answer.
 *  3. **If nothing crosses, hold the previous value.** Gaps between sections
 *     should not blank the indicator.
 */
export function resolveActiveSection({
  order,
  crossing,
  atBottom,
  previous,
}: SpyState): string | null {
  if (atBottom) return order.at(-1) ?? previous;
  const first = order.find((id) => crossing.has(id));
  return first ?? previous;
}

/**
 * `rootMargin` that collapses the observer root to a single line, `line` px
 * below the viewport top.
 */
export function readingLineRootMargin(viewportHeight: number, line: number): string {
  const below = Math.max(0, viewportHeight - line - 1);
  return `-${line}px 0px -${below}px 0px`;
}
