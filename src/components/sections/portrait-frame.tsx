import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { hero } from '@/content/hero';
import { site } from '@/content/site';

/**
 * The hero's right-hand composition: a glowing rounded frame with a floating
 * glass card over it, mirroring the reference.
 *
 * **No photograph exists yet, and none is invented.** The frame falls back to a
 * monogram plate built from the brand gradient — a placeholder that reads as a
 * deliberate mark rather than a missing image. Swapping in a real portrait is a
 * change to `hero.portrait` in the content module and nothing else: no layout,
 * no component, no CSS.
 */
export function PortraitFrame() {
  const initials = site.name
    .split(' ')
    .map((part) => part[0])
    .join('');

  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0">
      {/* Ambient glow. Sits behind the frame and is purely decorative. */}
      <div
        aria-hidden
        // The glow's *box* stays inside the column; only its blur bleeds
        // outward. An earlier `-inset-8` extended the box 32 px on every side,
        // which on a 390 px viewport pushed 12 px past the edge and produced a
        // horizontal scrollbar. `clip-path` does not fix that — it clips
        // painting, not the layout box that `scrollWidth` is computed from.
        className="pointer-events-none absolute inset-x-0 -inset-y-8 rounded-[var(--radius-2xl)] opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(60% 60% at 30% 20%, color-mix(in oklab, var(--color-brand-blue) 34%, transparent), transparent 70%), radial-gradient(55% 55% at 75% 80%, color-mix(in oklab, var(--color-brand-cyan) 26%, transparent), transparent 70%)',
        }}
      />

      <div className="relative aspect-4/5 overflow-hidden rounded-[var(--radius-2xl)] border border-[color-mix(in_oklab,var(--color-brand-cyan)_30%,transparent)] bg-[var(--color-surface-1)] shadow-[var(--shadow-island)]">
        {hero.portrait ? (
          <Image
            src={hero.portrait.src}
            alt={hero.portrait.alt}
            fill
            priority
            sizes="(min-width: 1024px) 28rem, 90vw"
            className="object-cover"
          />
        ) : (
          <div className="relative grid h-full w-full place-items-center">
            {/* Faint grid, so the plate reads as a designed surface. */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage:
                  'linear-gradient(var(--color-hairline-strong) 1px, transparent 1px), linear-gradient(90deg, var(--color-hairline-strong) 1px, transparent 1px)',
                backgroundSize: '44px 44px',
              }}
            />
            <span
              aria-hidden
              className="text-gradient-brand relative text-[clamp(5rem,18vw,9rem)] leading-none font-bold tracking-tight"
            >
              {initials}
            </span>
            <p className="absolute inset-x-0 bottom-6 text-center font-mono text-xs tracking-[0.16em] text-[var(--color-text-faint)] uppercase">
              {site.location}
            </p>
          </div>
        )}
      </div>

      {/*
        Positioned by a wrapper rather than by adding `absolute` to the Card.
        `Card` sets `relative` in its base classes, and `cn()` joins class names
        without resolving Tailwind conflicts — so both landed in the DOM and
        whichever the compiler emitted later won. It won, and the card rendered
        at the bottom of the frame instead of over its top-left corner.
      */}
      <div className="absolute -top-5 -left-4 sm:-left-8 lg:-left-10">
        <Card surface="glass" className="px-4 py-3">
          <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-[var(--color-text-faint)] uppercase">
            {hero.spotlight.label}
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-text-strong)]">
            {hero.spotlight.value}
          </p>
        </Card>
      </div>
    </div>
  );
}
