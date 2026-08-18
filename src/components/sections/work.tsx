import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { SectionHeading } from '@/components/ui/section-heading';
import { ProjectCard } from '@/components/work/project-card';
import { featuredProjects, projects } from '@/content/projects';
import { staggerDelay } from '@/lib/motion/tokens';

export function Work() {
  const remaining = projects.length - featuredProjects.length;

  return (
    <Section id="work" labelledBy="work-heading" glow="right-cyan">
      <div className="container-content">
        <Reveal>
          <SectionHeading
            id="work-heading"
            eyebrow="Selected work"
            lead="Things I have"
            accent="shipped"
            description="Production systems, not prototypes. Each one links to the live product or the public repository where one exists — and says plainly where one does not."
          />
        </Reveal>

        <ul className="mt-14 grid gap-6 lg:grid-cols-2">
          {featuredProjects.map((project, index) => (
            <Reveal key={project.slug} as="li" delay={staggerDelay(index)}>
              {/* The first card is above the fold on a tall desktop viewport,
                  so its cover is a plausible LCP candidate. */}
              <ProjectCard project={project} priority={index === 0} />
            </Reveal>
          ))}
        </ul>

        <Reveal delay={staggerDelay(featuredProjects.length)}>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Button href="/work" variant="secondary">
              All {projects.length} projects
            </Button>
            <p className="text-sm text-[var(--color-text-muted)]">
              {remaining} more, including the two that were deliberately never shipped.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
