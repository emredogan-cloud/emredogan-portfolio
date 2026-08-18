import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guards the failure mode that has no symptom.
 *
 * Tailwind v4 emits only the theme variables it can see referenced in class
 * names. A token consumed through an inline `style`, read in JavaScript, or
 * handed to the canvas background engine is invisible to that scan and gets
 * dropped from the compiled stylesheet — at which point the property silently
 * falls back to its inherited value. Nothing errors. The page is just wrong.
 *
 * `@theme static` prevents it; this test proves the prevention is still in
 * place, by comparing what `tokens.css` declares against what the build
 * actually shipped.
 *
 * Skipped when there is no build output, so `pnpm test` stays usable on a
 * clean checkout; CI always runs it after `pnpm build`.
 */
const root = process.cwd();
const tokensCss = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8');

function declaredTokens(): string[] {
  return [...tokensCss.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((m) => m[1]!);
}

function builtCss(): string | null {
  const dir = join(root, '.next/static/chunks');
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter((f) => f.endsWith('.css'));
  if (files.length === 0) return null;
  return files.map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
}

describe('design token emission', () => {
  it('declares a non-trivial number of tokens', () => {
    expect(declaredTokens().length).toBeGreaterThan(30);
  });

  it('uses `@theme static` so nothing is tree-shaken away', () => {
    expect(tokensCss).toMatch(/@theme\s+static\s*\{/);
  });

  it('every declared token reaches the compiled stylesheet', () => {
    const css = builtCss();
    if (css === null) {
      // No build output in this working tree; CI runs this after `pnpm build`.
      return;
    }
    const missing = declaredTokens().filter((token) => !css.includes(`${token}:`));
    expect(missing, `tokens dropped from the build: ${missing.join(', ')}`).toEqual([]);
  });
});
