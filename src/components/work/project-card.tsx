import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { GeneratedCover } from '@/components/work/generated-cover';
import { StatusPill } from '@/components/work/status-pill';
import type { Project } from '@/content/schema';

/**
 * A project card.
 *
 * Built as a "stretched link": the `<article>` is the visual card, and a single
 * anchor over the title covers it with a pseudo-element. That gives one large
 * click target *and* exactly one link in the accessibility tree — the pattern
 * the reference gets wrong by wrapping the whole card in an anchor and then
 * nesting Live and Code links inside it, which is invalid and leaves a screen
 * reader announcing three overlapping links for one card.
 *
 * The external links therefore live *outside* the stretched area, below it,
 * where they are unambiguous.
 */
export function ProjectCard({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  return (
    <Card as="article" interactive className="group flex flex-col overflow-hidden">
      <div className="relative aspect-16/10 overflow-hidden border-b border-[var(--color-hairline)]">
        {project.cover ? (
          <Image
            src={project.cover.src}
            alt={project.cover.alt}
            width={project.cover.width}
            height={project.cover.height}
            sizes="(min-width: 1024px) 34rem, (min-width: 640px) 50vw, 92vw"
            priority={priority}
            className="size-full object-cover object-top transition-transform duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
          />
        ) : (
          <GeneratedCover project={project} />
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[length:var(--text-h4)]">
            {/* The stretched link. `before:` covers the card, so the whole
                surface is clickable while only one link exists. */}
            <Link
              href={`/work/${project.slug}`}
              className="before:absolute before:inset-0 before:z-10 before:content-[''] focus-visible:outline-none"
            >
              {project.name}
              <span className="sr-only"> — read the case study</span>
            </Link>
          </h3>
          <StatusPill status={project.status} />
        </div>

        <p className="mt-3 text-[var(--color-text-muted)]">{project.tagline}</p>

        <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${project.name} technologies`}>
          {project.stack.slice(0, 5).map((technology) => (
            <li key={technology}>
              <Pill mono>{technology}</Pill>
            </li>
          ))}
          {project.stack.length > 5 ? (
            <li>
              <Pill mono>+{project.stack.length - 5}</Pill>
            </li>
          ) : null}
        </ul>

        {project.links.length > 0 ? (
          <ul className="relative z-20 mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--color-hairline)] pt-5">
            {project.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-body)] underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-brand-cyan-bright)] hover:underline"
                >
                  {link.label}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="relative z-20 mt-6 border-t border-[var(--color-hairline)] pt-5 text-sm text-[var(--color-text-faint)]">
            {project.slug === 'lumina'
              ? 'Repository is private — described, not linked.'
              : 'Deliberately not shipped. The case study explains why.'}
          </p>
        )}
      </div>
    </Card>
  );
}
