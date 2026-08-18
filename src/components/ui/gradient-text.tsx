import { cn } from '@/lib/utils/cn';

/**
 * The reference's signature: a heading where one word carries the blue→cyan
 * gradient. Applied to a span inside the heading, never to the whole heading,
 * so the text stays selectable and the non-accent words keep full contrast.
 *
 * Under `forced-colors: active` the gradient is dropped for a system colour —
 * `background-clip: text` is unsupported there and the word would otherwise
 * render invisible (handled in `globals.css`).
 */
export function GradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn('text-gradient-brand', className)}>{children}</span>;
}
