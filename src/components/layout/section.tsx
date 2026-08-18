import { cn } from '@/lib/utils/cn';

interface SectionProps {
  /** Doubles as the anchor target and the scroll-spy id. */
  id: string;
  /** The id of the heading that names this section. */
  labelledBy: string;
  /**
   * `hero` clears the fixed header on first paint. Expressed as a variant
   * rather than a `pt-*` class passed through `className`: `cn()` joins class
   * names without resolving Tailwind conflicts, so `pt-40` and
   * `pt-[clamp(...)]` would both land in the DOM and whichever the compiler
   * emitted later would silently win.
   */
  variant?: 'default' | 'hero';
  children: React.ReactNode;
  className?: string;
}

const padding = {
  default: 'pt-[clamp(3.5rem,7vw,6rem)] pb-[clamp(4rem,10vw,8rem)]',
  hero: 'pt-[clamp(8rem,16vw,12rem)] pb-[clamp(4rem,10vw,8rem)]',
} as const;

/**
 * A landmark section.
 *
 * Requiring `labelledBy` is deliberate: an unnamed `<section>` is not exposed
 * as a landmark at all, so a screen-reader user gets no region list. Making it
 * a required prop means a section cannot be added without naming it.
 *
 * **No `scroll-margin-top` here.** The document already sets
 * `scroll-padding-top`, and the two stack: with `scroll-mt-28` (112 px) on top
 * of `scroll-padding-top: 6.5rem` (104 px), following an anchor left the
 * section 216 px down the viewport and its heading 344 px down — a third of a
 * laptop screen of empty space before the content the reader asked for. The
 * scroll container's padding is the single mechanism; the section's own top
 * padding provides the breathing room.
 */
export function Section({
  id,
  labelledBy,
  variant = 'default',
  children,
  className,
}: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn(padding[variant], className)}>
      {children}
    </section>
  );
}
