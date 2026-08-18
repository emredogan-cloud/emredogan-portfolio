import { Hero } from '@/components/sections/hero';
import { TechMarquee } from '@/components/sections/tech-marquee';
import { Work } from '@/components/sections/work';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { site } from '@/content/site';

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
      <Hero />

      <TechMarquee />

      <Section id="about" labelledBy="about-heading" glow="left-blue">
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

      <Work />

      <Section id="contact" labelledBy="contact-heading" glow="center-blue">
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
