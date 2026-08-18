import { cn } from '@/lib/utils/cn';

type Tone = 'neutral' | 'brand' | 'positive' | 'warning' | 'danger';

const tones: Record<Tone, string> = {
  neutral:
    'border-[var(--color-hairline)] bg-[var(--color-surface-3)] text-[var(--color-text-body)]',
  brand:
    'border-[color-mix(in_oklab,var(--color-brand-blue)_38%,transparent)] ' +
    'bg-[color-mix(in_oklab,var(--color-brand-blue)_14%,transparent)] ' +
    'text-[var(--color-brand-blue-bright)]',
  positive:
    'border-[color-mix(in_oklab,var(--color-positive)_32%,transparent)] ' +
    'bg-[color-mix(in_oklab,var(--color-positive)_12%,transparent)] text-[var(--color-positive)]',
  warning:
    'border-[color-mix(in_oklab,var(--color-warning)_32%,transparent)] ' +
    'bg-[color-mix(in_oklab,var(--color-warning)_12%,transparent)] text-[var(--color-warning)]',
  danger:
    'border-[color-mix(in_oklab,var(--color-danger)_32%,transparent)] ' +
    'bg-[color-mix(in_oklab,var(--color-danger)_12%,transparent)] text-[var(--color-danger)]',
};

interface PillProps {
  tone?: Tone;
  /** Renders in the mono face — for stack labels, versions and metrics. */
  mono?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Small rounded label. Not interactive — use `Button` for anything clickable. */
export function Pill({ tone = 'neutral', mono = false, className, children }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-1 text-sm leading-tight',
        mono && 'font-mono text-[0.8125rem] tracking-tight',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
