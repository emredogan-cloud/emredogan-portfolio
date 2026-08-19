import Link from 'next/link';
import { ArrowUp, Mail } from 'lucide-react';
import { GitHubIcon, XIcon } from '@/components/ui/brand-icons';
import { footerNav } from '@/content/navigation';
import { site } from '@/content/site';

const ICONS = {
  github: GitHubIcon,
  x: XIcon,
  mail: Mail,
  linkedin: GitHubIcon,
} as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32 border-t border-[var(--color-hairline)]">
      <div className="container-content py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center text-xl font-bold text-[var(--color-text-strong)]"
            >
              {site.shortName}
              <span className="text-gradient-brand">.dev</span>
            </Link>
            <p className="mt-4 max-w-sm text-[var(--color-text-muted)]">{site.description}</p>
            <p className="mt-4 font-mono text-sm text-[var(--color-text-faint)]">
              {site.location} · {site.timezone}
            </p>
          </div>

          <nav aria-labelledby="footer-navigate">
            <h2
              id="footer-navigate"
              className="font-mono text-[length:var(--text-eyebrow)] tracking-[0.18em] text-[var(--color-text-faint)] uppercase"
            >
              Navigate
            </h2>
            {/* `gap-1` with the height coming from each link's own padding.
                A 44 px target plus a 12 px gap would make the column
                needlessly tall; this way the rows touch and every one of them
                is still a full target. */}
            <ul className="mt-3 flex flex-col gap-1">
              {[...footerNav.navigate, ...footerNav.more].map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 min-w-11 items-center text-[var(--color-text-muted)] underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text-strong)] hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2
              id="footer-connect"
              className="font-mono text-[length:var(--text-eyebrow)] tracking-[0.18em] text-[var(--color-text-faint)] uppercase"
            >
              Connect
            </h2>
            <ul aria-labelledby="footer-connect" className="mt-5 flex flex-wrap gap-3">
              {site.socials.map((social) => {
                const Icon = ICONS[social.icon];
                const isExternal = social.href.startsWith('http');
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      {...(isExternal ? { target: '_blank', rel: 'me noopener noreferrer' } : {})}
                      className="grid size-11 place-items-center rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-surface-2)] text-[var(--color-text-body)] transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-text-strong)]"
                    >
                      <Icon className="size-[18px]" aria-hidden />
                      <span className="sr-only">
                        {social.label} — {social.handle}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-6 border-t border-[var(--color-hairline)] pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-[var(--color-text-faint)]">
            © {year} {site.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <p className="text-sm text-[var(--color-text-faint)]">
              Built with Next.js &amp; Tailwind CSS
            </p>
            <a
              href="#top"
              aria-label="Back to top"
              className="grid size-11 place-items-center rounded-[var(--radius-pill)] border border-[var(--color-hairline)] bg-[var(--color-surface-2)] text-[var(--color-brand-cyan-bright)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-surface-3)]"
            >
              <ArrowUp aria-hidden className="size-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
