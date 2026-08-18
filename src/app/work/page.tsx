import { Section } from '@/components/layout/section';
import { Reveal } from '@/components/ui/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { ProjectCard } from '@/components/work/project-card';
import { orderedProjects, projects } from '@/content/projects';
import { staggerDelay } from '@/lib/motion/tokens';
import { absoluteUrl, buildMetadata } from '@/lib/utils/seo';

export const metadata = buildMetadata({
  title: 'Work',
  description: `${projects.length} production web, cloud, mobile and game projects — each with the problem, the architecture and what is verifiable today.`,
  path: '/work',
});

/**
 * `ItemList` structured data. Listed in the same order as the page, so a search
 * engine's understanding of the ranking matches the reader's.
 */
function itemListJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Projects',
    numberOfItems: orderedProjects.length,
    itemListElement: orderedProjects.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/work/${project.slug}`),
      name: project.name,
    })),
  };
}

export default function WorkPage() {
  const live = projects.filter((project) => project.status === 'live').length;
  const released = projects.filter((project) => project.status === 'released').length;

  return (
    <main id="content">
      <Section id="work-index" labelledBy="work-index-heading" variant="hero" glow="left-blue">
        <div className="container-content">
          <SectionHeading
            id="work-index-heading"
            as="h1"
            eyebrow="Work"
            lead="Everything I have"
            accent="built"
            description="Reconstructed from the repositories themselves — manifests, module graphs, commit history and live checks — not from README copy. Where a status claim disagreed with the evidence, the evidence won."
          />

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 font-mono text-sm">
            <div>
              <dt className="text-[var(--color-text-faint)]">Projects</dt>
              <dd className="text-[var(--color-text-strong)]">{projects.length}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-faint)]">Live or released</dt>
              <dd className="text-[var(--color-text-strong)]">{live + released}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-faint)]">Deliberately unshipped</dt>
              <dd className="text-[var(--color-text-strong)]">
                {projects.filter((project) => project.status === 'research').length}
              </dd>
            </div>
          </dl>

          <ul className="mt-14 grid gap-6 lg:grid-cols-2">
            {orderedProjects.map((project, index) => (
              <Reveal key={project.slug} as="li" delay={staggerDelay(index % 2)}>
                <ProjectCard project={project} priority={index < 2} />
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <script
        id="ld-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd()) }}
      />
    </main>
  );
}
