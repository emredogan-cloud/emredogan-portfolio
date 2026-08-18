#!/usr/bin/env node
/**
 * Emits `src/content/icons.generated.ts` from `simple-icons`.
 *
 * Generated rather than imported so `simple-icons` stays a devDependency and
 * none of its ~3,000 icons can reach the browser bundle — only the dozen paths
 * this site actually draws.
 *
 * `pnpm icons` regenerates. `tests/unit/icons.test.ts` fails if the checked-in
 * file has drifted from what this script would produce, so the two cannot
 * silently disagree.
 */
import { writeFileSync } from 'node:fs';
import { format, resolveConfig } from 'prettier';
import * as icons from 'simple-icons';

/** id → simple-icons export. Every entry must trace to a real project. */
const WANTED = {
  typescript: 'siTypescript',
  nextjs: 'siNextdotjs',
  react: 'siReact',
  svelte: 'siSvelte',
  vite: 'siVite',
  tailwind: 'siTailwindcss',
  flutter: 'siFlutter',
  dart: 'siDart',
  kotlin: 'siKotlin',
  python: 'siPython',
  postgres: 'siPostgresql',
  supabase: 'siSupabase',
  terraform: 'siTerraform',
  vercel: 'siVercel',
};

const entries = Object.entries(WANTED).map(([id, exportName]) => {
  const icon = icons[exportName];
  if (!icon) throw new Error(`simple-icons has no export "${exportName}" (for "${id}")`);
  return { id, title: icon.title, path: icon.path, license: icon.license?.type ?? 'CC0-1.0' };
});

const header = `// GENERATED FILE — do not edit by hand.
//
// Written by \`scripts/generate-icons.mjs\` (\`pnpm icons\`) from the
// \`simple-icons\` devDependency, so none of its ~3,000 icons reach the browser
// bundle — only the ${entries.length} paths this site draws.
//
// Brand marks are used to label the technologies behind real projects, which is
// their intended use. Paths are ${[...new Set(entries.map((e) => e.license))].join(' / ')}.
// \`tests/unit/icons.test.ts\` fails if this file drifts from the generator.

export interface BrandIcon {
  readonly id: string;
  readonly title: string;
  readonly path: string;
}

export const brandIcons = {
`;

const body = entries
  .map(
    (entry) =>
      `  ${entry.id}: {\n    id: '${entry.id}',\n    title: ${JSON.stringify(entry.title)},\n    path: ${JSON.stringify(entry.path)},\n  },`,
  )
  .join('\n');

const footer = `
} as const satisfies Record<string, BrandIcon>;

export type BrandIconId = keyof typeof brandIcons;
`;

const target = new URL('../src/content/icons.generated.ts', import.meta.url);

// Formatted here, not left to `pnpm format`. Otherwise the formatter rewrites
// the file after generation and the drift test — which regenerates and compares
// — fails on whitespace that neither side is wrong about.
const options = await resolveConfig(target.pathname);
const output = await format(`${header}${body}${footer}`, {
  ...options,
  filepath: target.pathname,
});

writeFileSync(target, output);
console.log(`Wrote ${entries.length} brand icons.`);
