import { Reveal } from '@/components/ui/reveal';
import { about } from '@/content/about';
import { staggerDelay } from '@/lib/motion/tokens';

/**
 * The four working principles.
 *
 * Rendered as a list with a large numeral rather than as cards: these are
 * positions, and stacking them in boxes made them read like feature bullets.
 * The numeral is `aria-hidden` — an ordered list already conveys the sequence,
 * and having a screen reader announce "zero one" before every heading is noise.
 * The list carries its own accessible name instead of a visually hidden
 * heading: a hidden heading would sit at the same level as the four it is
 * meant to group, which reads to a screen reader as a fifth principle.
 */
export function Principles() {
  return (
    <ol
      aria-label="Working principles"
      className="grid gap-px overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-hairline)] bg-[var(--color-hairline)] sm:grid-cols-2"
    >
      {about.principles.map((principle, index) => (
        <Reveal
          key={principle.index}
          as="li"
          delay={staggerDelay(index)}
          className="group bg-[var(--color-surface-1)] p-6 transition-colors duration-[var(--duration-base)] hover:bg-[var(--color-surface-2)] sm:p-8"
        >
          {/*
            68%, not the 38% this was drafted at. `aria-hidden` removes the
            numeral from the accessibility tree but not from the screen, so the
            contrast floor still applies: at 38% it composited to #145b6b on
            #0b111a, 2.46:1.

            The first correction went to 60% and passed on desktop but still
            failed at 390 px, because `--text-h3` is a `clamp()` whose minimum
            is 22 px — under the 24 px that makes text "large", so the 4.5:1
            floor applies rather than 3:1. Fluid type changes which threshold
            you are being measured against. 68% clears 4.5:1 on all three card
            surfaces, and a unit test holds it there.
          */}
          <span
            aria-hidden
            className="font-mono text-[length:var(--text-h3)] leading-none font-semibold text-[color-mix(in_oklab,var(--color-brand-cyan)_68%,transparent)] transition-colors duration-[var(--duration-base)] group-hover:text-[var(--color-brand-cyan-bright)]"
          >
            {principle.index}
          </span>
          <h3 className="mt-5 text-[length:var(--text-h4)]">{principle.title}</h3>
          <p className="mt-3 text-[var(--color-text-body)]">{principle.body}</p>
        </Reveal>
      ))}
    </ol>
  );
}
