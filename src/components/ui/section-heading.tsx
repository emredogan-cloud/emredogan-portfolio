import { cn } from '@/lib/utils/cn';
import { GradientText } from './gradient-text';

interface SectionHeadingProps {
  /** Small mono label above the heading. */
  eyebrow?: string;
  /** Words rendered in the plain text colour. */
  lead: string;
  /** Words rendered in the brand gradient. */
  accent: string;
  description?: string;
  /** The id an enclosing `<section aria-labelledby>` points at. */
  id?: string;
  as?: 'h1' | 'h2' | 'h3';
  align?: 'start' | 'center';
  className?: string;
}

/**
 * The two-tone section heading used throughout the reference — "Featured
 * **Projects**", "About **Me**", "Client **Stories**".
 *
 * Split into `lead` and `accent` rather than accepting markup so the pattern
 * cannot drift between sections, and so the heading's accessible name is
 * always the complete sentence.
 */
export function SectionHeading({
  eyebrow,
  lead,
  accent,
  description,
  id,
  as: Tag = 'h2',
  align = 'start',
  className,
}: SectionHeadingProps) {
  const centered = align === 'center';
  return (
    <div className={cn(centered && 'flex flex-col items-center text-center', className)}>
      {eyebrow ? (
        <p className="font-mono text-[length:var(--text-eyebrow)] tracking-[0.18em] text-[var(--color-text-faint)] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <Tag
        id={id}
        className={cn(
          'mt-3',
          Tag === 'h1' ? 'text-[length:var(--text-h1)]' : 'text-[length:var(--text-h2)]',
        )}
      >
        {lead} <GradientText>{accent}</GradientText>
      </Tag>
      {description ? (
        <p
          className={cn(
            'mt-4 max-w-2xl text-[length:var(--text-lead)] text-[var(--color-text-muted)]',
            centered && 'mx-auto',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
