import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * `next/font` cannot be imported outside the Next build, so these check the
 * things that actually break in practice: the CSS variable names drifting from
 * the ones `tokens.css` consumes, and — since Phase 11 — a character being
 * rendered that the font subset does not cover.
 *
 * Turkish glyph coverage is asserted in `tests/e2e/typography.spec.ts`, where a
 * real browser is available to measure it.
 */
const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), 'utf8');

describe('typography wiring', () => {
  const fonts = read('src/lib/fonts.ts');
  const tokens = read('src/styles/tokens.css');

  it('declares both faces', () => {
    expect(fonts).toContain('geistSans');
    expect(fonts).toContain('geistMono');
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

describe('font subset', () => {
  const FACES = ['Geist-Variable.subset.woff2', 'GeistMono-Variable.subset.woff2'];

  it('ships both subset faces', () => {
    for (const face of FACES) {
      expect(existsSync(join(root, 'src/assets/fonts', face)), `${face} is missing`).toBe(true);
    }
  });

  it('stays inside the font budget', () => {
    // Roadmap §7: under 90 KB together, hard limit 120 KB. The unsubset faces
    // were 141 KB, which is why this budget has a test rather than a note.
    const total = FACES.reduce(
      (sum, face) => sum + statSync(join(root, 'src/assets/fonts', face)).size,
      0,
    );
    expect(total / 1024).toBeLessThan(90);
  });

  /**
   * The check that makes subsetting safe.
   *
   * Every character the built pages render must be in the set the subset was
   * generated from. Add a bullet, an arrow or a currency symbol to the content
   * and this fails before anyone sees a tofu box in production.
   */
  it('covers every character the built pages render', () => {
    const buildDir = join(root, '.next/server/app');
    if (!existsSync(buildDir)) {
      // Unit tests run before `build` in some orders; there is nothing to
      // compare against and passing silently would be a lie, so say why.
      console.warn('[fonts] no build found — coverage check skipped');
      return;
    }

    const covered = new Set<string>(
      (JSON.parse(read('src/assets/fonts/coverage.json')) as { characters: string[] }).characters,
    );

    const missing = new Set<string>();
    let scanned = 0;
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(path);
          continue;
        }
        if (!entry.name.endsWith('.html')) continue;
        scanned += 1;

        const text = readFileSync(path, 'utf8')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
          .replace(/&#x([0-9a-fA-F]+);/g, (_, h: string) => String.fromCodePoint(parseInt(h, 16)));

        for (const character of text) {
          if (/\s/.test(character)) continue;
          if (covered.has(character)) continue;
          missing.add(character);
        }
      }
    };
    walk(buildDir);

    // A walker that found nothing would pass this test forever.
    expect(scanned, 'no prerendered HTML was scanned').toBeGreaterThan(5);

    expect(
      [...missing],
      'characters rendered but not in the font subset — re-run scripts/subset-fonts.py',
    ).toEqual([]);
  });
});
