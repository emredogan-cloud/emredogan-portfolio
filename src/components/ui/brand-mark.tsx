import { brandIcons, type BrandIconId } from '@/content/icons.generated';
import { cn } from '@/lib/utils/cn';

/**
 * A technology's brand mark.
 *
 * Renders in `currentColor` rather than brand colour: a row of full-colour
 * logos on a dark page reads as a sponsor wall, and the reference's own strip
 * is monochrome-adjacent for the same reason. Colour returns on hover, where it
 * aids recognition without shouting.
 */
export function BrandMark({
  id,
  className,
  title,
}: {
  id: BrandIconId;
  className?: string;
  /** Provide only when the mark is not accompanied by a text label. */
  title?: string;
}) {
  const icon = brandIcons[id];
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('size-full', className)}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d={icon.path} fill="currentColor" />
    </svg>
  );
}
