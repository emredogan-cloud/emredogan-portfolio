import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { projects } from '@/content/projects';
import { buildMetadata } from '@/lib/utils/seo';

export const metadata = buildMetadata({
  title: 'Work',
  description:
    'Production web, cloud and mobile projects — with the problem, the architecture and the outcome for each.',
  path: '/work',
});

/**
 * Project index. The grid and case-study links arrive in Phase 7; the route
 * exists now so navigation, metadata and the sitemap are real rather than
 * pointing at a 404.
 */
export default function WorkPage() {
  return (
    <main id="content">
      <Section id="work-index" labelledBy="work-index-heading" variant="hero">
        <div className="container-content">
          <SectionHeading
            id="work-index-heading"
            as="h1"
            eyebrow="Work"
            lead="Things I have"
            accent="shipped"
            description="Production systems, not prototypes. Each entry links to the live product or the public repository where one exists."
          />

          {projects.length === 0 ? (
            <div className="mt-12 max-w-xl">
              <p className="text-[var(--color-text-muted)]">
                Case studies are being written from the source repositories rather than from memory
                — architecture, decisions and measured outcomes. They land here shortly.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="https://github.com/emredogan-cloud" variant="secondary">
                  Browse the repositories
                </Button>
                <Button href="/#contact">Get in touch</Button>
              </div>
            </div>
          ) : null}
        </div>
      </Section>
    </main>
  );
}
