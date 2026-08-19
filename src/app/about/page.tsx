import { Credentials } from '@/components/about/credentials';
import { Capabilities } from '@/components/about/capabilities';
import { Principles } from '@/components/about/principles';
import { Timeline } from '@/components/about/timeline';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/ui/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { about } from '@/content/about';
import { site } from '@/content/site';
import { buildMetadata } from '@/lib/utils/seo';

export const metadata = buildMetadata({
  title: 'About',
  description: `${site.name} — ${site.role} based in ${site.location}. How I work, what I have built, and what I am learning.`,
  path: '/about',
});

/**
 * The long-form profile.
 *
 * Written from the record: every period is `git log` output, every timeline
 * entry carries evidence a reader can check, and the credentials block states
 * that no third-party certification is held rather than quietly omitting the
 * section. Nothing here is repeated from the home page's About section — that
 * one is the summary, this one is the detail.
 */
export default function AboutPage() {
  return (
    <main id="content">
      <Section id="about-intro" labelledBy="about-page-heading" variant="hero" glow="left-blue">
        <div className="container-content">
          <SectionHeading
            id="about-page-heading"
            as="h1"
            eyebrow={`${site.location} · ${site.timezone}`}
            lead="About"
            accent={site.shortName}
          />

          <div className="mt-8 flex max-w-3xl flex-col gap-5">
            {about.intro.map((paragraph, index) => (
              <p
                key={paragraph}
                className={
                  index === 0
                    ? 'text-[length:var(--text-lead)] text-[var(--color-text-strong)]'
                    : 'text-[var(--color-text-body)]'
                }
              >
                {paragraph}
              </p>
            ))}
          </div>

          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Focus areas">
            {site.descriptors.map((descriptor) => (
              <li key={descriptor}>
                <Pill>{descriptor}</Pill>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="principles" labelledBy="principles-heading">
        <div className="container-content">
          <Reveal>
            <SectionHeading
              id="principles-heading"
              eyebrow="Principles"
              lead="What I refuse to"
              accent="compromise"
              description="Four positions that decide the architecture before the first file is written."
            />
          </Reveal>
          <div className="mt-10">
            <Principles />
          </div>
        </div>
      </Section>

      <Section id="capabilities" labelledBy="capabilities-heading" glow="right-cyan">
        <div className="container-content">
          <Reveal>
            <SectionHeading
              id="capabilities-heading"
              eyebrow="Capabilities"
              lead="What I"
              accent="build"
              description="No percentage bars. Each area names the technologies actually used in the projects listed below it."
            />
          </Reveal>
          <div className="mt-10">
            <Capabilities />
          </div>
        </div>
      </Section>

      <Section id="timeline" labelledBy="timeline-heading">
        <div className="container-content">
          <Reveal>
            <SectionHeading
              id="timeline-heading"
              eyebrow="Experience"
              lead="What happened,"
              accent="in order"
              description="Dates are taken from git history rather than from memory, and every entry carries something checkable. Six of the eight projects are under version control; those are the six here."
            />
          </Reveal>
          <div className="mt-12">
            <Timeline />
          </div>
        </div>
      </Section>

      <Section id="credentials" labelledBy="credentials-heading" glow="center-blue">
        <div className="container-content">
          <Reveal>
            <SectionHeading
              id="credentials-heading"
              eyebrow="Credentials"
              lead="Verifiable, and"
              accent="not yet held"
              description="No third-party certification is held today. Two AWS exams are planned and are labelled as targets. The rest is work a stranger can open and check, which is the stronger claim anyway."
            />
          </Reveal>
          <div className="mt-10">
            <Credentials />
          </div>
        </div>
      </Section>

      <Section id="about-contact" labelledBy="about-contact-heading">
        <div className="container-content">
          <Reveal>
            <SectionHeading
              id="about-contact-heading"
              eyebrow="Next"
              lead="Have something"
              accent="to build?"
              description="Open to freelance work, collaboration and full-time roles."
            />
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/#contact">Get in touch</Button>
              <Button href="/work" variant="secondary">
                See the work
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>
    </main>
  );
}
