import { ArrowUpRight } from 'lucide-react';
import { Section } from '@/components/layout/section';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/ui/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { proof } from '@/content/proof';
import { staggerDelay } from '@/lib/motion/tokens';

/**
 * Where the reference puts a testimonial carousel.
 *
 * There is no carousel because there are no testimonials, and the section says
 * so in its own words rather than quietly disappearing. Each card is a claim
 * plus the link that settles it, so the reader never has to take any of it on
 * trust — which is a stronger position than three anonymous five-star quotes,
 * and the only honest one available.
 */
export function Proof() {
  return (
    <Section id="proof" labelledBy="proof-heading" glow="right-cyan">
      <div className="container-content">
        <Reveal>
          <SectionHeading
            id="proof-heading"
            eyebrow="Proof"
            lead="Don't take my"
            accent="word for it"
            description={proof.disclosure}
          />
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proof.entries.map((entry, index) => (
            <Reveal key={entry.id} as="li" delay={staggerDelay(index)}>
              <Card interactive className="group flex h-full flex-col p-6">
                {/*
                  A heading, not two paragraphs.
                  An accessibility-tree audit found a reader browsing by
                  heading jumped from "Don't take my word for it" straight past
                  all six cards to the next section — the site's entire body of
                  evidence was invisible to that navigation mode. The value and
                  the label are one heading, so its accessible name reads
                  "40 public repositories".
                */}
                <h3>
                  <span className="text-gradient-brand block text-[length:var(--text-h2)] leading-none font-bold tracking-tight">
                    {entry.value}
                  </span>
                  <span className="mt-3 block font-mono text-[length:var(--text-eyebrow)] tracking-[0.14em] text-[var(--color-text-faint)] uppercase">
                    {entry.label}
                  </span>
                </h3>

                <p className="mt-4 flex-1 text-sm text-[var(--color-text-body)]">{entry.detail}</p>

                <p className="mt-5 border-t border-[var(--color-hairline)] pt-4 text-xs text-[var(--color-text-muted)]">
                  <span className="sr-only">Method: </span>
                  {entry.method}
                </p>

                <a
                  href={entry.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brand-cyan-bright)] underline-offset-4 before:absolute before:inset-0 before:z-10 before:content-[''] hover:underline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-brand-cyan)]"
                >
                  {entry.verifyLabel}
                  <ArrowUpRight
                    aria-hidden
                    className="size-3.5 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0"
                  />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </Card>
            </Reveal>
          ))}
        </ul>

        <Reveal delay={staggerDelay(proof.entries.length)}>
          <p className="mt-8 font-mono text-xs text-[var(--color-text-faint)]">
            Links last checked by hand on{' '}
            <time dateTime={proof.verifiedOn}>{formatVerified(proof.verifiedOn)}</time>. Published
            so you know how old the check is instead of having to guess.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

/** `2026-08-19` → `19 August 2026`. Fixed locale: the site is English-only. */
function formatVerified(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
