import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/ui/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { site } from '@/content/site';
import { staggerDelay } from '@/lib/motion/tokens';

/**
 * The single-page experience.
 *
 * Section shells land in Phase 3 so the navigation, scroll-spy and anchor
 * behaviour can be built and tested against real targets. The contents of each
 * arrive in Phases 4 and 7–9; what is here is real, not placeholder copy that
 * would have to be retracted.
 */
export default function HomePage() {
  return (
    <main id="content">
      <Section id="home" labelledBy="home-heading" variant="hero">
        <div className="container-content">
          <p className="font-mono text-[length:var(--text-eyebrow)] tracking-[0.18em] text-[var(--color-text-faint)] uppercase">
            {site.location} · {site.timezone}
          </p>

          <h1 id="home-heading" className="mt-6 text-[length:var(--text-h1)]">
            {site.name.split(' ')[0]}{' '}
            <span className="text-gradient-brand">{site.name.split(' ').slice(1).join(' ')}</span>
          </h1>

          <p className="mt-3 text-[length:var(--text-h3)] font-semibold text-[var(--color-text-strong)]">
            {site.role}
          </p>

          <p className="mt-6 max-w-2xl text-[length:var(--text-lead)] text-[var(--color-text-body)]">
            {site.tagline}
          </p>

          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Focus areas">
            {site.descriptors.map((descriptor) => (
              <li key={descriptor}>
                <Pill>{descriptor}</Pill>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button href="/#work">View work</Button>
            <Button href="/#contact" variant="secondary">
              Get in touch
            </Button>
          </div>
        </div>
      </Section>

      <Section id="about" labelledBy="about-heading">
        <div className="container-content">
          <Reveal>
            <SectionHeading
              id="about-heading"
              eyebrow="About"
              lead="How I"
              accent="work"
              description="Long-form profile, principles and experience timeline land in Phase 8."
            />
          </Reveal>
        </div>
      </Section>

      <Section id="work" labelledBy="work-heading">
        <div className="container-content">
          <Reveal>
            <SectionHeading
              id="work-heading"
              eyebrow="Selected work"
              lead="Featured"
              accent="projects"
              description="Case studies with problem, architecture and outcome land in Phase 7."
            />
          </Reveal>
          <div className="mt-10 flex flex-wrap gap-3">
            {['Evolutionary Tycoon', 'FormAI', 'PawDoc', 'Ehliyet Akademi'].map((name, index) => (
              <Reveal key={name} delay={staggerDelay(index)}>
                <Pill mono>{name}</Pill>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section id="contact" labelledBy="contact-heading">
        <div className="container-content">
          <Reveal>
            <SectionHeading
              id="contact-heading"
              eyebrow="Contact"
              lead="Let's build"
              accent="something"
              description="A validated contact form with server-side delivery lands in Phase 9. Until then, email works."
            />
          </Reveal>
          <div className="mt-8">
            <Button href={`mailto:${site.email}`}>{site.email}</Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
