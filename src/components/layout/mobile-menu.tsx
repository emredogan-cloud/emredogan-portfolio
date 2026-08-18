'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { primaryNav } from '@/content/navigation';
import { site } from '@/content/site';
import { cn } from '@/lib/utils/cn';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  activeId: string | null;
  /** The control that opened the menu; focus returns here on close. */
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Full-screen navigation sheet.
 *
 * Uses a native `<dialog>` in modal mode, which gives focus trapping, inert
 * background, `Escape` handling and top-layer stacking from the platform
 * rather than from three hundred lines of hand-written focus management. The
 * pieces the platform does *not* provide — restoring focus to the trigger,
 * locking body scroll, and closing on backdrop click — are added explicitly.
 */
export function MobileMenu({ open, onClose, activeId, triggerRef }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (open) return;
    document.body.style.overflow = '';
  }, [open]);

  // Cleanup if the component unmounts while open — otherwise the page would be
  // left permanently unscrollable.
  useEffect(() => () => void (document.body.style.overflow = ''), []);

  // Backdrop click closes the sheet.
  //
  // A `::backdrop` is not a separate element, so the only way to detect a click
  // on it is to notice that the click landed on the dialog box itself rather
  // than on its contents. Attached imperatively rather than as an `onClick`
  // prop: as a prop it reads to jsx-a11y as a mouse-only affordance on a
  // non-interactive element, and the rule is right to flag that shape even
  // though the keyboard path exists (`Escape`, plus the close button as the
  // first focusable control).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onPointerDown = (event: MouseEvent) => {
      if (event.target === dialog) onClose();
    };

    dialog.addEventListener('click', onPointerDown);
    return () => dialog.removeEventListener('click', onPointerDown);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Site navigation"
      className={cn(
        'm-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-inherit',
        'backdrop:bg-[color-mix(in_oklab,var(--color-void)_88%,transparent)]',
        'backdrop:backdrop-blur-sm open:flex',
      )}
      // `Escape` fires `cancel`; both paths must tell React the menu closed.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
        triggerRef.current?.focus();
      }}
      onClose={() => {
        document.body.style.overflow = '';
        triggerRef.current?.focus();
      }}
    >
      <div className="flex h-full w-full flex-col bg-[var(--color-void)]">
        <div className="flex items-center justify-between px-6 py-5">
          <span className="text-lg font-bold text-[var(--color-text-strong)]">
            {site.shortName}
            <span className="text-gradient-brand">.dev</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="grid size-11 place-items-center rounded-[var(--radius-md)] border border-[var(--color-hairline)] text-[var(--color-text-body)] hover:bg-[var(--color-surface-2)]"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <nav aria-label="Primary" className="flex-1 px-6 pt-6">
          <ul className="flex flex-col gap-1">
            {primaryNav.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={activeId === item.id ? 'true' : undefined}
                  className={cn(
                    'flex min-h-14 items-center rounded-[var(--radius-md)] px-4 text-[length:var(--text-h3)] font-semibold',
                    'transition-colors duration-[var(--duration-fast)]',
                    activeId === item.id
                      ? 'bg-[var(--color-surface-2)] text-[var(--color-text-strong)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-strong)]',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-[var(--color-hairline)] px-6 py-6">
          <Button href={`mailto:${site.email}`} className="w-full" onClick={onClose}>
            Get in touch
          </Button>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {site.socials
              .filter((s) => !s.href.startsWith('mailto:'))
              .map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--color-text-muted)] underline-offset-4 hover:text-[var(--color-text-strong)] hover:underline"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </dialog>
  );
}
