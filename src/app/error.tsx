'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced to the platform's runtime logs; never rendered to the user.
    console.error(error);
  }, [error]);

  return (
    <main id="content" className="flex min-h-dvh flex-col justify-center py-24">
      <div className="container-content">
        <p className="font-mono text-[length:var(--text-eyebrow)] tracking-[0.18em] text-[var(--color-text-faint)] uppercase">
          Unexpected error
        </p>
        <h1 className="mt-6 text-[length:var(--text-h2)]">
          Something <span className="text-gradient-brand">broke</span>
        </h1>
        <p className="mt-4 max-w-xl text-[var(--color-text-muted)]">
          This has been logged. Reloading usually fixes it.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-surface-2)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-strong)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-surface-3)]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
