import Link from 'next/link';
import { site } from '@/content/site';

/**
 * Phase 1 surface.
 *
 * Deliberately minimal: the objective of Phase 1 is a complete engineering
 * foundation, not a visual build. What ships here is real — real identity,
 * real links, real typography and colour tokens — so nothing on the page is a
 * claim that has to be retracted later. The full experience lands in Phases
 * 3–9 (ROADMAP §16).
 */
export default function HomePage() {
  return (
    <main id="content" className="relative flex min-h-dvh flex-col justify-center py-24">
      <div className="container-content">
        <p className="font-mono text-[length:var(--text-eyebrow)] tracking-[0.18em] text-[var(--color-text-faint)] uppercase">
          {site.location} · {site.timezone}
        </p>

        <h1 className="mt-6 text-[length:var(--text-h1)]">
          {site.name.split(' ')[0]}{' '}
          <span className="text-gradient-brand">{site.name.split(' ').slice(1).join(' ')}</span>
        </h1>

        <p className="mt-3 text-[length:var(--text-h3)] font-semibold text-[var(--color-text-strong)]">
          {site.role}
        </p>

        <p className="mt-6 max-w-2xl text-[length:var(--text-lead)] text-[var(--color-text-body)]">
          {site.tagline}
        </p>

        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Focus areas">
          {site.descriptors.map((d) => (
            <li
              key={d}
              className="rounded-[var(--radius-pill)] border border-[var(--color-hairline)] bg-[var(--color-surface-3)] px-4 py-1.5 text-sm text-[var(--color-text-body)]"
            >
              {d}
            </li>
          ))}
        </ul>

        <nav className="mt-10 flex flex-wrap items-center gap-3" aria-label="Contact and profiles">
          {site.socials.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-surface-2)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-strong)] transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-hairline-strong)] hover:bg-[var(--color-surface-3)]"
              {...(s.href.startsWith('http')
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              {s.label}
              <span className="sr-only"> — {s.handle}</span>
            </Link>
          ))}
        </nav>

        <p className="mt-16 font-mono text-xs text-[var(--color-text-faint)]">
          Portfolio in active development · Phase 1 of 14
        </p>
      </div>
    </main>
  );
}
