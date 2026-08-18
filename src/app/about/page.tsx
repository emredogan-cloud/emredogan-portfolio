import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Pill } from '@/components/ui/pill';
import { SectionHeading } from '@/components/ui/section-heading';
import { site } from '@/content/site';
import { buildMetadata } from '@/lib/utils/seo';

export const metadata = buildMetadata({
  title: 'About',
  description: `${site.name} — ${site.role} based in ${site.location}. How I work, what I have built, and what I am learning.`,
  path: '/about',
});

/**
 * Long-form profile. Populated in Phase 8 from the evidence base; the route
 * exists now so the footer, metadata and sitemap point somewhere real.
 */
export default function AboutPage() {
  return (
    <main id="content">
      <Section id="about-page" labelledBy="about-page-heading" variant="hero">
        <div className="container-content">
          <SectionHeading
            id="about-page-heading"
            as="h1"
            eyebrow={`${site.location} · ${site.timezone}`}
            lead="About"
            accent={site.shortName}
            description={site.description}
          />

          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Focus areas">
            {site.descriptors.map((descriptor) => (
              <li key={descriptor}>
                <Pill>{descriptor}</Pill>
              </li>
            ))}
          </ul>

          <p className="mt-10 max-w-2xl text-[var(--color-text-muted)]">
            The full story — how the work started, what each project taught, and the experience
            timeline — is being written from the record rather than from memory.
          </p>

          <div className="mt-8">
            <Button href={`mailto:${site.email}`}>{site.email}</Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
