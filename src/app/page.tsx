import { About } from '@/components/sections/about';
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
 * Four anchored sections, in the order a stranger needs them: who, what with,
 * what shipped, how to reach him. The contact section is still the shell built
 * in Phase 3 — the validated form lands in Phase 9 — and until then it offers a
 * working mailto rather than placeholder copy that would have to be retracted.
 */
export default function HomePage() {
  return (
    <main id="content">
      <Hero />

      <TechMarquee />

      <About />

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
