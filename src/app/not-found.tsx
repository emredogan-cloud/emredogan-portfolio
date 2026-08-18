import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="content" className="flex min-h-dvh flex-col justify-center py-24">
      <div className="container-content">
        <p className="font-mono text-[length:var(--text-eyebrow)] tracking-[0.18em] text-[var(--color-text-faint)] uppercase">
          Error 404
        </p>
        <h1 className="mt-6 text-[length:var(--text-h2)]">
          This page <span className="text-gradient-brand">does not exist</span>
        </h1>
        <p className="mt-4 max-w-xl text-[var(--color-text-muted)]">
          The link may be out of date, or the page may have moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-surface-2)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-strong)] transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-surface-3)]"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
