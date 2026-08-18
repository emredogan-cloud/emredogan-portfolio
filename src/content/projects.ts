import type { Project } from './schema';

/**
 * Projects.
 *
 * Plain data, validated at build time by `content/validate.ts` rather than at
 * module scope — see the note in `site.ts` for why the validator must not
 * reach the browser.
 *
 * Populated in Phase 7 from first-hand inspection of the source repositories —
 * manifests, module graphs, git history and live HTTP checks — not from README
 * marketing copy. Empty here so the build ships an honest skeleton rather than
 * placeholder projects that would read as real.
 */
export const projects: readonly Project[] = [];

export const featuredProjects: readonly Project[] = projects
  .filter((project) => project.featured)
  .sort((a, b) => a.order - b.order);
