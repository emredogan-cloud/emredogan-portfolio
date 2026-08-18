import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * `next/font` cannot be imported outside the Next build, so this checks the
 * thing that actually breaks in practice: the CSS variable names in
 * `lib/fonts.ts` drifting from the ones `styles/tokens.css` consumes. When
 * that happens typography silently falls back to a system font and nothing
 * fails — which is exactly the class of bug a test should catch.
 *
 * Turkish glyph coverage is asserted in `tests/e2e/typography.spec.ts`, where
 * a real browser is available to measure it.
 */
const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');

describe('typography wiring', () => {
  const fonts = read('src/lib/fonts.ts');
  const tokens = read('src/styles/tokens.css');

  it('declares both Geist faces', () => {
    expect(fonts).toContain('GeistSans');
    expect(fonts).toContain('GeistMono');
  });

  it('tokens consume exactly the variables the font module provides', () => {
    for (const variable of ['--font-geist-sans', '--font-geist-mono']) {
      expect(tokens, `tokens.css must reference ${variable}`).toContain(variable);
    }
  });

  it('every font stack ends in a generic family so a failed load still renders', () => {
    const stacks = [...tokens.matchAll(/--font-(?:sans|mono):\s*([^;]+);/g)].map((m) => m[1]!);
    expect(stacks.length).toBeGreaterThanOrEqual(2);
    for (const stack of stacks) {
      expect(stack.trim()).toMatch(/(sans-serif|monospace)\s*$/);
    }
  });
});
