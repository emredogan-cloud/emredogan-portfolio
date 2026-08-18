'use client';

import { useEffect, useState } from 'react';
import { readingLineRootMargin, resolveActiveSection } from './scroll-spy-logic';

/**
 * Distance below the viewport top treated as "the line you are reading".
 * Sits clear of the floating header.
 */
const READING_LINE = 120;

/**
 * Reports which section is currently the reader's context.
 *
 * **A one-pixel reading line, not a band and not "whatever is visible."**
 * Sections are contiguous, so on a tall viewport several are on screen at once
 * and any ratio- or visibility-based rule has to arbitrate between them. Even a
 * 140 px band is ambiguous: a section ending four pixels into it still counts,
 * and the outgoing section wins. A single line can only ever fall inside one
 * section, so the answer is unambiguous by construction rather than by
 * tie-breaking.
 *
 * **IntersectionObserver, not a scroll handler**, so nothing reads layout
 * per frame.
 *
 * **The end of the document activates the last section.** Scrolled to the
 * bottom, the final section's top may already be above the band; without this,
 * the navigation would highlight the second-to-last item while the reader
 * looks at the last one.
 */
export function useScrollSpy(sectionIds: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const visible = new Set<string>();

    const resolve = () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      setActiveId((previous) =>
        resolveActiveSection({ order: sectionIds, crossing: visible, atBottom, previous }),
      );
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        resolve();
      },
      { rootMargin: readingLineRootMargin(window.innerHeight, READING_LINE), threshold: 0 },
    );

    for (const element of elements) observer.observe(element);

    // The observer says nothing about reaching the end of the document, so the
    // bottom case needs a scroll listener. It is passive, does one comparison,
    // and reads only scroll offsets — never geometry that would force layout.
    window.addEventListener('scroll', resolve, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', resolve);
    };
  }, [sectionIds]);

  return activeId;
}
