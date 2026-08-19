'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  value: string;
  /** What is being copied, for the accessible name. */
  label: string;
}

/**
 * Copies a value and says so.
 *
 * The confirmation is a `role="status"` region, not a colour change: a
 * sighted-only "it went green" tells a screen-reader user nothing, and this is
 * a control whose entire output is invisible otherwise.
 *
 * `navigator.clipboard` needs a secure context and can be refused by policy, so
 * failure is handled rather than assumed away — the address is written out in
 * full next to this button, so there is always another way to take it.
 */
export function CopyButton({ value, label }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2400);
  };

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-hairline)] text-[var(--color-text-muted)] transition-colors duration-[var(--duration-fast)] hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-text-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-cyan)]"
      >
        {state === 'copied' ? (
          <Check aria-hidden className="size-4 text-[var(--color-positive)]" />
        ) : (
          <Copy aria-hidden className="size-4" />
        )}
        <span className="sr-only">Copy {label}</span>
      </button>

      <span role="status" aria-live="polite" className="sr-only">
        {state === 'copied' ? `${label} copied to the clipboard` : null}
        {state === 'failed'
          ? `Could not copy the ${label}. It is written out beside this button.`
          : null}
      </span>
    </>
  );
}
