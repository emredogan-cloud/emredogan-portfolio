/**
 * Class-name joiner.
 *
 * Deliberately dependency-free: `clsx` + `tailwind-merge` cost ~4 KB gzip and
 * this project never generates conflicting Tailwind utilities at runtime —
 * variants are resolved in the component, not merged from props.
 */
export function cn(...parts: readonly (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
