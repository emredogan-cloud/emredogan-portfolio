import { Capabilities } from '@/components/about/capabilities';
import { Principles } from '@/components/about/principles';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/ui/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { about } from '@/content/about';
import { site } from '@/content/site';

/**
 * The home page's About section.
 *
 * Carries the opening paragraphs, the working principles and the capability
 * grid, then hands off to `/about` for the timeline and credentials. The split
 * is by depth, not by duplication: nothing here is repeated on that page.
 */
export function About() {
  const [opening, ...rest] = about.intro;

  return (
    <Section id="about" labelledBy="about-heading" glow="left-blue">
      <div className="container-content">
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <Reveal>
            <SectionHeading id="about-heading" eyebrow="About" lead="How I" accent="work" />
            {/* The descriptors live under the heading rather than leaving the
                column empty beside three paragraphs. They are the same list the
                header and the about page use — one source, three placements. */}
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Focus areas">
              {site.descriptors.map((descriptor) => (
                <li key={descriptor}>
                  <Pill>{descriptor}</Pill>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="flex flex-col gap-5">
              <p className="text-[length:var(--text-lead)] text-[var(--color-text-strong)]">
                {opening}
              </p>
              {rest.map((paragraph) => (
                <p key={paragraph} className="text-[var(--color-text-body)]">
                  {paragraph}
                </p>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-14">
          <Principles />
        </div>

        <div className="mt-14">
          <Reveal>
            <h3 className="text-[length:var(--text-h3)]">What I build</h3>
            <p className="mt-3 max-w-2xl text-[var(--color-text-muted)]">
              Four areas, each backed by something in the work below rather than by a self-assessed
              skill bar.
            </p>
          </Reveal>
          <div className="mt-8">
            <Capabilities />
          </div>
        </div>

        <Reveal>
          <div className="mt-12">
            <Button href="/about" variant="secondary">
              Timeline, principles and credentials
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
