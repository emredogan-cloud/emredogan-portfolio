import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { GradientText } from '@/components/ui/gradient-text';
import { site } from '@/content/site';

/**
 * The band between the work and the contact form.
 *
 * The reference's version is a full-bleed gradient panel with a pill above it.
 * This keeps the shape and drops the gradient behind text: white on that ramp
 * measured 1.81:1 (ADR-0004), so the panel is a dark surface and the gradient
 * appears only as a glow and in the accent word.
 */
export function CtaBand() {
  return (
    <section aria-labelledby="cta-heading" className="pb-[clamp(2rem,6vw,4rem)]">
      <div className="container-content">
        <Reveal variant="up-large">
          <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-hairline-strong)] bg-[var(--color-surface-1)] px-6 py-14 text-center shadow-[var(--shadow-island)] sm:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(42rem 22rem at 50% 0%, color-mix(in oklab, var(--color-brand-blue) 26%, transparent), transparent 70%), radial-gradient(34rem 18rem at 88% 110%, color-mix(in oklab, var(--color-brand-cyan) 18%, transparent), transparent 70%)',
              }}
            />

            <div className="relative">
              <p className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[color-mix(in_oklab,var(--color-brand-cyan)_34%,transparent)] bg-[color-mix(in_oklab,var(--color-brand-cyan)_10%,transparent)] px-4 py-1.5 font-mono text-[length:var(--text-eyebrow)] tracking-[0.14em] text-[var(--color-brand-cyan-bright)] uppercase">
                {site.availability}
              </p>

              <h2 id="cta-heading" className="mt-6 text-[length:var(--text-h2)]">
                Let&rsquo;s build something <GradientText>that ships</GradientText>
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-[length:var(--text-lead)] text-[var(--color-text-muted)]">
                Tell me what you are working on. If I am not the right person for it, I will say so
                — and usually say who is.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button href="#contact" size="lg">
                  Start a conversation
                </Button>
                <Button href={`mailto:${site.email}`} variant="secondary" size="lg">
                  {site.email}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
