import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { CountUp } from '@/components/ui/count-up';
import { GradientText } from '@/components/ui/gradient-text';
import { Magnetic } from '@/components/ui/magnetic';
import { Pill } from '@/components/ui/pill';
import { PortraitFrame } from '@/components/sections/portrait-frame';
import { hero } from '@/content/hero';

/**
 * The opening.
 *
 * A server component: only the count-up and the magnetic pull are client
 * islands, so the headline, the intro and every number are in the initial HTML
 * and are the LCP candidate rather than something that appears after
 * hydration.
 *
 * The reference's stats were "20+ Projects · 3+ Years Experience · 100%
 * Passion". Two of those cannot be checked and the third is not a statistic.
 * These three are counted, and each states its method in a `<dfn>`-style note
 * that screen readers get and sighted readers see as a tooltip-free caption.
 */
export function Hero() {
  return (
    <Section id="home" labelledBy="home-heading" variant="hero">
      <div className="container-content">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[color-mix(in_oklab,var(--color-brand-blue)_38%,transparent)] bg-[color-mix(in_oklab,var(--color-brand-blue)_12%,transparent)] px-3.5 py-1.5 text-sm text-[var(--color-brand-blue-bright)]">
              <span
                aria-hidden
                className="size-1.5 rounded-full bg-[var(--color-positive)] shadow-[0_0_10px_var(--color-positive)]"
              />
              {hero.badge}
            </p>

            <h1 id="home-heading" className="mt-7 text-[length:var(--text-h1)]">
              {hero.headline.lead} <GradientText>{hero.headline.accent}</GradientText>
            </h1>

            <p className="mt-3 text-[length:var(--text-h3)] font-semibold text-[var(--color-text-strong)]">
              {hero.subhead}
            </p>

            <p className="mt-6 max-w-xl text-[length:var(--text-lead)] text-[var(--color-text-body)]">
              {hero.intro}
            </p>

            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Core technologies">
              {hero.stack.map((technology) => (
                <li key={technology}>
                  <Pill mono>{technology}</Pill>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Button href={hero.primaryCta.href} size="lg">
                  {hero.primaryCta.label}
                </Button>
              </Magnetic>
              <Button href={hero.secondaryCta.href} variant="secondary" size="lg">
                {hero.secondaryCta.label}
              </Button>
            </div>

            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6">
              {hero.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <CountUp
                      value={stat.value}
                      className="block text-[length:var(--text-h2)] leading-none font-bold text-[var(--color-brand-blue-bright)]"
                    />
                    <span className="mt-2 block text-sm text-[var(--color-text-muted)]">
                      {stat.label}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--color-text-faint)]">
                      {stat.evidence}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <PortraitFrame />
        </div>
      </div>
    </Section>
  );
}
