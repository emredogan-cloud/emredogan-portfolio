import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Section } from '@/components/layout/section';
import { Card } from '@/components/ui/card';
import { GradientText } from '@/components/ui/gradient-text';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/ui/reveal';
import { GeneratedCover } from '@/components/work/generated-cover';
import { StatusPill } from '@/components/work/status-pill';
import { getProject, orderedProjects, projectSlugs } from '@/content/projects';
import { site } from '@/content/site';
import { staggerDelay } from '@/lib/motion/tokens';
import { absoluteUrl, buildMetadata } from '@/lib/utils/seo';

/** Every case study is prerendered; there are eight and they never change at runtime. */
export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  return buildMetadata({
    title: project.name,
    description: project.tagline,
    path: `/work/${project.slug}`,
    ...(project.cover ? { image: absoluteUrl(project.cover.src) } : {}),
  });
}

/**
 * The four narrative beats every case study runs through.
 *
 * Fixed and required by the schema, so a project cannot be written up as a
 * feature list. "What was the problem" and "what is verifiable now" are the two
 * questions a reader actually has, and they are the two most portfolios skip.
 */
const BEATS = [
  { key: 'problem', label: 'The problem' },
  { key: 'architecture', label: 'The architecture' },
  { key: 'innovation', label: 'The interesting decision' },
  { key: 'outcome', label: 'What it does now' },
] as const;

function jsonLd(project: NonNullable<ReturnType<typeof getProject>>) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': absoluteUrl(`/work/${project.slug}#work`),
        name: project.name,
        headline: project.tagline,
        abstract: project.summary,
        url: absoluteUrl(`/work/${project.slug}`),
        dateCreated: project.year,
        creator: { '@type': 'Person', name: site.name, url: site.url },
        keywords: project.stack.join(', '),
        ...(project.cover ? { image: absoluteUrl(project.cover.src) } : {}),
        ...(project.links.length > 0 ? { sameAs: project.links.map((l) => l.href) } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Work', item: absoluteUrl('/work') },
          {
            '@type': 'ListItem',
            position: 3,
            name: project.name,
            item: absoluteUrl(`/work/${project.slug}`),
          },
        ],
      },
    ],
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = orderedProjects.findIndex((entry) => entry.slug === project.slug);
  const next = orderedProjects[(index + 1) % orderedProjects.length]!;

  return (
    <main id="content">
      <Section id="case-study" labelledBy="case-study-heading" variant="hero" glow="left-blue">
        <div className="container-content">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text-strong)]"
          >
            <ArrowLeft aria-hidden className="size-4" />
            All work
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <StatusPill status={project.status} />
            <Pill mono>{project.year}</Pill>
            <Pill mono>{project.role}</Pill>
          </div>

          <h1 id="case-study-heading" className="mt-6 text-[length:var(--text-h1)]">
            {project.name}
          </h1>

          <p className="mt-4 max-w-3xl text-[length:var(--text-lead)] text-[var(--color-text-body)]">
            {project.tagline}
          </p>

          {/* The hook, given the weight it deserves: it is the one thing worth
              remembering about the project. */}
          <Card surface="glass" className="mt-10 max-w-3xl p-6">
            <p className="font-mono text-[length:var(--text-eyebrow)] tracking-[0.18em] text-[var(--color-text-faint)] uppercase">
              The short version
            </p>
            <p className="mt-3 text-[length:var(--text-h4)] text-[var(--color-text-strong)]">
              {project.hook}
            </p>
          </Card>

          <div className="mt-12 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-hairline)]">
            <div className="relative aspect-16/10">
              {project.cover ? (
                <Image
                  src={project.cover.src}
                  alt={project.cover.alt}
                  width={project.cover.width}
                  height={project.cover.height}
                  sizes="(min-width: 1024px) 72rem, 96vw"
                  priority
                  decoding="async"
                  className="size-full object-cover object-top"
                />
              ) : (
                <GeneratedCover project={project} />
              )}
            </div>
          </div>

          {/* Status before anything else. A reader deciding whether to care
              should not have to infer maturity from the prose. */}
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">{project.statusNote}</p>
        </div>
      </Section>

      <Section id="detail" labelledBy="detail-heading" glow="right-cyan">
        <div className="container-content">
          <h2 id="detail-heading" className="sr-only">
            How {project.name} works
          </h2>

          <div className="grid gap-14 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              <p className="text-[length:var(--text-lead)] text-[var(--color-text-body)]">
                {project.summary}
              </p>

              <div className="mt-12 flex flex-col gap-10">
                {BEATS.map((beat, beatIndex) => (
                  <Reveal key={beat.key} delay={staggerDelay(beatIndex)}>
                    <h3 className="font-mono text-[length:var(--text-eyebrow)] tracking-[0.18em] text-[var(--color-text-faint)] uppercase">
                      {beat.label}
                    </h3>
                    <p className="mt-3 text-[var(--color-text-body)]">{project.beats[beat.key]}</p>
                  </Reveal>
                ))}
              </div>

              <Reveal className="mt-14">
                <h3 className="text-[length:var(--text-h3)]">
                  Worth <GradientText>knowing</GradientText>
                </h3>
                <ul className="mt-6 flex flex-col gap-4">
                  {project.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex gap-4 border-l border-[var(--color-hairline-strong)] pl-4 text-[var(--color-text-body)]"
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <aside className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
              {project.metrics.length > 0 ? (
                <Card className="p-6">
                  <h3 className="font-mono text-[length:var(--text-eyebrow)] tracking-[0.18em] text-[var(--color-text-faint)] uppercase">
                    Counted
                  </h3>
                  <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
                    {project.metrics.map((metric) => (
                      <div key={metric.label}>
                        <dd className="tabular text-[length:var(--text-h3)] leading-none font-bold text-[var(--color-brand-blue-bright)]">
                          {metric.value}
                        </dd>
                        <dt className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                          {metric.label}
                        </dt>
                      </div>
                    ))}
                  </dl>
                </Card>
              ) : null}

              <Card className="p-6">
                <h3 className="font-mono text-[length:var(--text-eyebrow)] tracking-[0.18em] text-[var(--color-text-faint)] uppercase">
                  Built with
                </h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {project.stack.map((technology) => (
                    <li key={technology}>
                      <Pill mono>{technology}</Pill>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="font-mono text-[length:var(--text-eyebrow)] tracking-[0.18em] text-[var(--color-text-faint)] uppercase">
                  See it
                </h3>
                {project.links.length > 0 ? (
                  <ul className="mt-5 flex flex-col gap-3">
                    {project.links.map((link) => (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[var(--color-text-body)] underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-brand-cyan-bright)] hover:underline"
                        >
                          {link.label}
                          <ArrowUpRight aria-hidden className="size-4" />
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-5 text-sm text-[var(--color-text-muted)]">
                    Nothing to link. {project.statusNote}
                  </p>
                )}
              </Card>
            </aside>
          </div>

          <nav
            aria-label="More work"
            className="mt-20 border-t border-[var(--color-hairline)] pt-8"
          >
            <Link
              href={`/work/${next.slug}`}
              className="group inline-flex flex-col gap-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand-cyan)]"
            >
              <span className="font-mono text-[length:var(--text-eyebrow)] tracking-[0.18em] text-[var(--color-text-faint)] uppercase">
                Next project
              </span>
              <span className="text-[length:var(--text-h3)] text-[var(--color-text-strong)] group-hover:underline">
                {next.name}
              </span>
              <span className="text-sm text-[var(--color-text-muted)]">{next.tagline}</span>
            </Link>
          </nav>
        </div>
      </Section>

      <script
        id="ld-project"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(project)) }}
      />
    </main>
  );
}
