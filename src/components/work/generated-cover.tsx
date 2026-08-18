import type { Project } from '@/content/schema';
import { cn } from '@/lib/utils/cn';

const ACCENTS = {
  blue: ['#1D6FF2', '#4FA8F5'],
  cyan: ['#0E7490', '#22D3EE'],
  amber: ['#B45309', '#FBBF24'],
  emerald: ['#047857', '#34D399'],
  rose: ['#9F1239', '#FB7185'],
  violet: ['#5B21B6', '#A78BFA'],
} as const;

/**
 * The cover for a project that has no capture.
 *
 * Three projects cannot be photographed: one repository is private, one was
 * deliberately never deployed, and one is a set of books rather than a screen.
 * Reaching for a stock photograph, or a mock-up of a product that does not
 * exist, would be the dishonest option — so those get a generated mark instead.
 * The project's initials over its accent, on the same grid the hero's monogram
 * plate uses, so it reads as part of the system rather than as a gap. The
 * caption says plainly that there is no public capture.
 *
 * Pure CSS and text: no image request, no bytes, and it cannot 404.
 */
export function GeneratedCover({ project, className }: { project: Project; className?: string }) {
  const [from, to] = ACCENTS[project.accent];
  const initials = project.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('');

  return (
    <div
      className={cn(
        'relative grid h-full w-full place-items-center overflow-hidden bg-[var(--color-surface-1)]',
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(70% 70% at 24% 18%, ${from}44, transparent 70%), radial-gradient(60% 60% at 82% 88%, ${to}33, transparent 66%)`,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-hairline-strong) 1px, transparent 1px), linear-gradient(90deg, var(--color-hairline-strong) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <span
        aria-hidden
        className="relative text-[clamp(3rem,10vw,5.5rem)] leading-none font-bold tracking-tight"
        style={{
          backgroundImage: `linear-gradient(100deg, ${from}, ${to})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {initials}
      </span>
      <p className="absolute inset-x-0 bottom-5 text-center font-mono text-[0.6875rem] tracking-[0.18em] text-[var(--color-text-faint)] uppercase">
        No public capture
      </p>
    </div>
  );
}
