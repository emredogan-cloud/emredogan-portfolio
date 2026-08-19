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
              {/* No `priority` here, deliberately.
                  It was set on the first card because that cover is a
                  plausible LCP candidate on a tall desktop viewport. On a
                  phone the Work section is thousands of pixels below the fold,
                  and the high-priority fetch competed with the hero's font on
                  a Slow 4G connection — Lighthouse put mobile LCP at 2.63 s
                  against a 2.5 s limit, with the *hero paragraph* as the LCP
                  element and this image ahead of it in the waterfall. */}
              <ProjectCard project={project} />
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
