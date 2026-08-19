import 'server-only';

import { aboutSchema, heroSchema, parseContent, projectSchema, siteSchema } from './schema';
import { about } from './about';
import { hero } from './hero';
import { projects } from './projects';
import { site } from './site';

/**
 * Build-time content validation.
 *
 * `server-only` is the load-bearing import: if a client component ever reaches
 * this module, the build fails with an explicit error instead of silently
 * shipping the Zod validator to the browser. That is exactly what happened
 * before this split existed — 68 KB gzipped of schema code in the client
 * bundle, for checks that can only ever be useful at build time.
 *
 * Running at module scope means importing this from any server component is
 * enough to gate the build. `app/layout.tsx` does.
 */
parseContent(siteSchema, site, 'site');
parseContent(heroSchema, hero, 'hero');
parseContent(aboutSchema, about, 'about');

projects.forEach((project, index) => {
  parseContent(projectSchema, project, `projects[${index}]`);
});

const slugs = projects.map((project) => project.slug);
const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
if (duplicates.length > 0) {
  throw new Error(`Duplicate project slugs: ${[...new Set(duplicates)].join(', ')}`);
}
