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
  /**
   * A soft radial wash anchored to one side of the section.
   *
   * The reference cuts flat between sections; this hands each one a faint
   * colour of its own so the page reads as a sequence rather than a stack.
   * Purely decorative, `aria-hidden`, and painted below the content — it never
   * sits between the reader and the text.
   */
  glow?: 'none' | 'left-blue' | 'right-cyan' | 'center-blue';
  children: React.ReactNode;
  className?: string;
}

const GLOWS = {
  none: null,
  'left-blue':
    'radial-gradient(48rem 34rem at 6% 24%, color-mix(in oklab, var(--color-brand-blue) 15%, transparent), transparent 68%)',
  'right-cyan':
    'radial-gradient(46rem 32rem at 94% 72%, color-mix(in oklab, var(--color-brand-cyan) 12%, transparent), transparent 66%)',
  'center-blue':
    'radial-gradient(52rem 30rem at 50% 8%, color-mix(in oklab, var(--color-brand-blue) 12%, transparent), transparent 70%)',
} as const;

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
  glow = 'none',
  children,
  className,
}: SectionProps) {
  const wash = GLOWS[glow];
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn('relative', padding[variant], className)}
    >
      {wash ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-[1]"
          style={{ background: wash }}
        />
      ) : null}
      {children}
    </section>
  );
}
