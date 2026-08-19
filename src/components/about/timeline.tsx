import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Pill } from '@/components/ui/pill';
import { Reveal } from '@/components/ui/reveal';
import { about } from '@/content/about';
import { staggerDelay } from '@/lib/motion/tokens';

/**
 * The experience timeline.
 *
 * An ordered list, not a stack of divs. A timeline is inherently sequential and
 * `<ol>` is what communicates that to a screen reader — otherwise the reader
 * gets six unrelated headings and has to infer the order from the dates.
 *
 * Every entry carries evidence, because the schema requires it. A timeline of
 * unfalsifiable claims is a CV; a timeline where each line names a commit count
 * or a live domain is a record.
 *
 * Layout: below `lg` the period stacks above the title. At `lg` it moves into
 * its own right-aligned rail on the far left, which is what makes the column
 * read as a timeline instead of six stacked cards. Both arrangements share one
 * spine, positioned from `--rail` so the line, the dots and the content column
 * cannot drift apart when one of them is edited.
 */
export function Timeline() {
  return (
    <ol
      aria-label="Experience timeline"
      className="relative flex flex-col gap-12 [--rail:0px] lg:[--rail:11.5rem]"
    >
      {/* The spine. Decorative, and hidden below `sm` where there is no room. */}
      <span
        aria-hidden
        className="absolute top-2 bottom-2 left-[calc(var(--rail)+7px)] hidden w-px bg-[linear-gradient(180deg,var(--color-hairline-strong),transparent)] sm:block"
      />

      {about.timeline.map((entry, index) => (
        <Reveal
          key={entry.id}
          as="li"
          delay={staggerDelay(index)}
          className="relative sm:pl-10 lg:grid lg:grid-cols-[9rem_minmax(0,1fr)] lg:gap-x-10 lg:pl-0"
        >
          <span
            aria-hidden
            className="absolute top-2 left-[var(--rail)] hidden size-[15px] rounded-full border-2 border-[var(--color-void)] bg-[var(--color-brand-blue-bright)] sm:block"
          />

          <p className="font-mono text-[length:var(--text-eyebrow)] tracking-[0.16em] text-[var(--color-text-faint)] uppercase lg:pt-1.5 lg:text-right">
            {entry.period}
          </p>

          <div className="lg:pl-10">
            <h3 className="mt-2 text-[length:var(--text-h4)] lg:mt-0">
              {entry.projectSlug ? (
                <Link
                  href={`/work/${entry.projectSlug}`}
                  className="group inline-flex items-center gap-2 underline-offset-4 hover:underline"
                >
                  {entry.title}
                  <ArrowRight
                    aria-hidden
                    className="size-4 text-[var(--color-brand-cyan-bright)] transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0"
                  />
                  <span className="sr-only"> — read the case study</span>
                </Link>
              ) : (
                entry.title
              )}
            </h3>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{entry.context}</p>
            <p className="mt-4 max-w-2xl text-[var(--color-text-body)]">{entry.body}</p>

            <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${entry.title} evidence`}>
              {entry.evidence.map((item) => (
                <li key={item}>
                  <Pill mono>{item}</Pill>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
