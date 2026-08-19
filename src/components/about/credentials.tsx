import { ArrowUpRight, BadgeCheck, Target, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Reveal } from '@/components/ui/reveal';
import { about } from '@/content/about';
import type { Credential } from '@/content/schema';
import { staggerDelay } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils/cn';

/**
 * Typed as a total map over the schema's `kind` union rather than inferred, so
 * adding a fourth kind to the schema fails the build here instead of rendering
 * an unlabelled card.
 */
const KIND: Record<Credential['kind'], { label: string; tone: string; Icon: LucideIcon }> = {
  held: { label: 'Held', tone: 'text-[var(--color-positive)]', Icon: BadgeCheck },
  shipped: { label: 'Shipped', tone: 'text-[var(--color-brand-cyan-bright)]', Icon: BadgeCheck },
  target: { label: 'Target — not held', tone: 'text-[var(--color-warning)]', Icon: Target },
};

/**
 * Credentials.
 *
 * No third-party certification is held, and this section says so rather than
 * being quietly omitted. Three kinds are modelled and never blurred together:
 * `held` for a credential in hand, `target` for a stated intention, and
 * `shipped` for something a stranger can verify — a live domain and an approved
 * release being verifiable in a way a PDF certificate is not.
 *
 * The `target` entries are labelled **"Target — not held"** in plain text, not
 * with a colour or a subtle pill that could be skimmed past as an achievement.
 */
export function Credentials() {
  return (
    <ul aria-label="Credentials" className="grid gap-4 sm:grid-cols-2">
      {about.credentials.map((credential, index) => {
        const { label, tone, Icon } = KIND[credential.kind];
        return (
          <Reveal key={credential.id} as="li" delay={staggerDelay(index)}>
            <Card className="flex h-full flex-col p-6">
              <p
                className={cn(
                  'inline-flex items-center gap-2 font-mono text-[length:var(--text-eyebrow)] tracking-[0.14em] uppercase',
                  tone,
                )}
              >
                <Icon aria-hidden className="size-3.5" />
                {label}
              </p>

              <h3 className="mt-3 text-[length:var(--text-h4)]">{credential.title}</h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {credential.issuer} · {credential.date}
              </p>
              <p className="mt-4 flex-1 text-sm text-[var(--color-text-body)]">
                {credential.detail}
              </p>

              {credential.verifyUrl ? (
                <a
                  href={credential.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm text-[var(--color-text-body)] underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-brand-cyan-bright)] hover:underline"
                >
                  {credential.kind === 'shipped' ? 'See it' : 'Exam details'}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : null}
            </Card>
          </Reveal>
        );
      })}
    </ul>
  );
}
