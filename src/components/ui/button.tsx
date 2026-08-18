import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium ' +
  'whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] ' +
  'duration-[var(--duration-fast)] ease-[var(--ease-out-expo)] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-brand-cyan)] ' +
  'disabled:pointer-events-none disabled:opacity-50 active:translate-y-px';

const variants: Record<Variant, string> = {
  /* White on this ramp holds ≥5.36:1 at every stop — verified in
     tests/unit/contrast.test.ts. The brighter decorative blue→cyan pair is
     never used behind text. */
  primary:
    'bg-[linear-gradient(100deg,var(--color-cta-from),var(--color-cta-to))] text-white ' +
    'shadow-[var(--shadow-glow-brand)] hover:brightness-110',
  secondary:
    'border border-[var(--color-hairline)] bg-[var(--color-surface-2)] text-[var(--color-text-strong)] ' +
    'hover:border-[var(--color-hairline-strong)] hover:bg-[var(--color-surface-3)]',
  ghost:
    'text-[var(--color-text-body)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-strong)]',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-[0.9375rem]',
  lg: 'h-12 px-6 text-base',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  /** Renders a trailing ↗ and marks the link as leaving the site. */
  external?: boolean;
}

type ButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type LinkProps = CommonProps & { href: string };

function content(children: React.ReactNode, external?: boolean) {
  return (
    <>
      {children}
      {external ? <ArrowUpRight aria-hidden className="size-4 shrink-0" /> : null}
    </>
  );
}

/**
 * The one button in the system. `href` switches it between `<a>` and
 * `<button>` so a navigation never ships as a click handler.
 */
export function Button(props: ButtonProps | LinkProps) {
  const { variant = 'primary', size = 'md', className, children, external, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ('href' in rest && typeof rest.href === 'string') {
    const { href, ...linkRest } = rest as LinkProps;
    const isExternal = external ?? /^https?:/.test(href);
    return (
      <Link
        href={href}
        className={classes}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...linkRest}
      >
        {content(children, isExternal)}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...(rest as ButtonProps)}>
      {content(children, external)}
    </button>
  );
}
