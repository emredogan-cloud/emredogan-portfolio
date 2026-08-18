'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { primaryNav, scrollSpySections } from '@/content/navigation';
import { site } from '@/content/site';
import { useScrolledPast } from '@/lib/hooks/use-scroll-state';
import { useScrollSpy } from '@/lib/hooks/use-scroll-spy';
import { cn } from '@/lib/utils/cn';

/**
 * The floating navigation island.
 *
 * Two states, matching the reference: transparent and full-bleed at the top of
 * the page, then a rounded translucent island once scrolled. Both the state
 * change and the active-section indicator are CSS transitions — the shared
 * `layoutId` projection an animation library would have provided is not worth
 * 46 KB (ADR-0009), and a sliding underline reads just as clearly.
 *
 * The active indicator is not decoration: it also sets `aria-current`, so the
 * information is available to a screen reader and not only to the eye.
 */
export function Header() {
  const scrolled = useScrolledPast(48);
  const activeId = useScrollSpy(scrollSpySections);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-[padding] duration-[var(--duration-base)]',
          'ease-[var(--ease-in-out-quart)]',
          scrolled ? 'pt-3' : 'pt-0',
        )}
      >
        <div
          className={cn(
            'mx-auto flex items-center justify-between transition-all',
            'duration-[var(--duration-base)] ease-[var(--ease-in-out-quart)]',
            'px-[clamp(1.25rem,4vw,2.5rem)]',
            scrolled
              ? // The island has to read as a panel floating *above* the page.
                // Tinting it with the page background made it invisible — same
                // colour, same value — so it is built from `surface-1` at 82%,
                // which is a step lighter, plus a brighter hairline and a
                // shadow to separate it from whatever scrolls underneath.
                'max-w-[calc(var(--container-content)+3rem)] rounded-[var(--radius-2xl)] border ' +
                  'border-[var(--color-hairline-strong)] ' +
                  'bg-[color-mix(in_oklab,var(--color-surface-1)_82%,transparent)] ' +
                  'py-3 shadow-[var(--shadow-island)] backdrop-blur-[var(--blur-glass)] ' +
                  'supports-[not(backdrop-filter:blur(1px))]:bg-[var(--color-surface-1)]'
              : 'max-w-[calc(var(--container-content)+5rem)] rounded-none border border-transparent py-5',
          )}
        >
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-[var(--color-text-strong)]"
          >
            {site.shortName}
            <span className="text-gradient-brand">.dev</span>
            <span className="sr-only"> — home</span>
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {primaryNav.map((item) => {
                const active = activeId === item.id;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        'relative rounded-[var(--radius-sm)] px-3.5 py-2 text-sm font-medium',
                        'transition-colors duration-[var(--duration-fast)]',
                        active
                          ? 'text-[var(--color-text-strong)]'
                          : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)]',
                      )}
                    >
                      {item.label}
                      <span
                        aria-hidden
                        className={cn(
                          'absolute inset-x-3.5 -bottom-0.5 h-px origin-center rounded-full',
                          'bg-[linear-gradient(90deg,var(--color-brand-blue-bright),var(--color-brand-cyan-bright))]',
                          'transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)]',
                          active ? 'scale-x-100' : 'scale-x-0',
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Button href="/#contact" size="sm" className="hidden sm:inline-flex">
              Let&rsquo;s talk
            </Button>
            <button
              ref={menuTriggerRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
              aria-expanded={menuOpen}
              className={cn(
                'grid size-11 place-items-center rounded-[var(--radius-md)] md:hidden',
                'border border-[var(--color-hairline)] text-[var(--color-text-body)]',
                'hover:bg-[var(--color-surface-2)]',
              )}
            >
              <Menu aria-hidden className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeId={activeId}
        triggerRef={menuTriggerRef}
      />
    </>
  );
}
