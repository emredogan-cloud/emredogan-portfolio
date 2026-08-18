import { parseContent, projectSchema, type Project } from './schema';

/**
 * Projects.
 *
 * Populated in Phase 7 from first-hand inspection of the source repositories —
 * manifests, module graphs, git history and live HTTP checks — not from README
 * marketing copy. Empty here so Phase 1 ships an honest, buildable skeleton
 * rather than placeholder projects that would read as real.
 */
const raw: readonly unknown[] = [];

export const projects: readonly Project[] = raw.map((p, i) =>
  parseContent(projectSchema, p, `projects[${i}]`),
);

export const featuredProjects = projects
  .filter((p) => p.featured)
  .sort((a, b) => a.order - b.order);
