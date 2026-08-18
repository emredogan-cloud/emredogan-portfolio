import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { WCAG_AA_LARGE, WCAG_AA_NORMAL, contrastRatio, mixHex } from '@/lib/utils/contrast';

/**
 * Colour tokens are read out of `tokens.css` rather than duplicated here, so
 * the test fails if someone edits a token without re-checking its contrast —
 * which is the actual failure mode this guards against.
 */
const css = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8');

function token(name: string): string {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{3,8});`));
  if (!match?.[1]) throw new Error(`Token --color-${name} not found in tokens.css`);
  return match[1];
}

const SURFACES = ['void', 'surface-1', 'surface-2', 'surface-3'] as const;

describe('colour contrast (WCAG 2.2 AA)', () => {
  describe.each(['text-body', 'text-muted', 'text-faint'])('%s', (fg) => {
    it.each(SURFACES)(`clears ${WCAG_AA_NORMAL}:1 on %s`, (bg) => {
      expect(contrastRatio(token(fg), token(bg))).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    });
  });

  it('text-strong is comfortably above the floor on the page background', () => {
    expect(contrastRatio(token('text-strong'), token('void'))).toBeGreaterThanOrEqual(12);
  });

  describe.each(['brand-blue-bright', 'brand-cyan-bright'])('%s as accent text', (fg) => {
    it.each(SURFACES)(`clears ${WCAG_AA_NORMAL}:1 on %s`, (bg) => {
      expect(contrastRatio(token(fg), token(bg))).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    });
  });

  it('white text clears AA across the entire filled-CTA gradient', () => {
    const from = token('cta-from');
    const to = token('cta-to');
    // Sample the ramp rather than only the stops: the midpoint is where a
    // naive blue→cyan gradient fails.
    for (let i = 0; i <= 20; i += 1) {
      const stop = mixHex(from, to, i / 20);
      expect(
        contrastRatio('#ffffff', stop),
        `white on ${stop} (t=${i / 20})`,
      ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    }
  });

  it('status colours stay legible on the page background', () => {
    for (const name of ['positive', 'warning', 'danger']) {
      expect(contrastRatio(token(name), token('void'))).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    }
  });

  it('documents that brand-blue is a fill, not a text colour', () => {
    // Guard rail: if someone "fixes" this by brightening --color-brand-blue,
    // the decorative gradient identity changes and this test says so.
    expect(contrastRatio(token('brand-blue'), token('void'))).toBeLessThan(WCAG_AA_NORMAL);
    expect(contrastRatio(token('brand-blue'), token('void'))).toBeGreaterThanOrEqual(WCAG_AA_LARGE);
  });
});

describe('contrast primitives', () => {
  it('matches the canonical extremes', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });

  it('is symmetric in its arguments', () => {
    expect(contrastRatio('#1d5fe0', '#ffffff')).toBeCloseTo(
      contrastRatio('#ffffff', '#1d5fe0'),
      10,
    );
  });

  it('expands three-digit hex the same way CSS does', () => {
    expect(contrastRatio('#fff', '#000')).toBeCloseTo(contrastRatio('#ffffff', '#000000'), 10);
  });

  it('rejects anything that is not a hex colour', () => {
    expect(() => contrastRatio('rgb(0,0,0)', '#fff')).toThrow(/hex/i);
    expect(() => contrastRatio('#12345', '#fff')).toThrow(/hex/i);
  });

  it('mixHex returns the endpoints at t=0 and t=1 and interpolates between', () => {
    expect(mixHex('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mixHex('#000000', '#ffffff', 1)).toBe('#ffffff');
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080');
  });
});
