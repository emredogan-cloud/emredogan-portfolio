import { cn } from '@/lib/utils/cn';

type Surface = 'raised' | 'glass' | 'outline';

const surfaces: Record<Surface, string> = {
  raised:
    'border border-[var(--color-hairline)] bg-[var(--color-surface-1)] shadow-[var(--shadow-card)]',
  glass:
    'border border-[var(--color-hairline)] bg-[var(--color-glass)] shadow-[var(--shadow-card)] ' +
    'backdrop-blur-[var(--blur-glass)] supports-[not(backdrop-filter:blur(1px))]:bg-[var(--color-surface-1)]',
  outline: 'border border-[var(--color-hairline)] bg-transparent',
};

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  surface?: Surface;
  /** Lifts and brightens the border on hover. Only for cards that are links. */
  interactive?: boolean;
  as?: 'div' | 'article' | 'li';
}

/**
 * The single container surface. `glass` degrades to an opaque surface where
 * `backdrop-filter` is unsupported, rather than becoming an unreadable
 * transparent panel over the animated background.
 */
export function Card({
  surface = 'raised',
  interactive = false,
  as: Tag = 'div',
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={cn(
        'relative rounded-[var(--radius-xl)]',
        surfaces[surface],
        interactive &&
          'transition-[border-color,transform,box-shadow] duration-[var(--duration-base)] ' +
            'ease-[var(--ease-out-expo)] hover:-translate-y-0.5 ' +
            'hover:border-[color-mix(in_oklab,var(--color-brand-cyan)_34%,transparent)] ' +
            'motion-reduce:hover:translate-y-0',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
