/**
 * First focusable element on the page. Visually hidden until focused, then it
 * becomes a real, high-contrast control (WCAG 2.4.1).
 */
export function SkipLink() {
  return (
    <a
      href="#content"
      className="sr-only rounded-md bg-[var(--color-brand-blue)] px-4 py-2 font-medium text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]"
    >
      Skip to content
    </a>
  );
}
