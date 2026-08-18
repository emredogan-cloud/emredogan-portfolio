/**
 * WCAG 2.x relative luminance and contrast ratio.
 *
 * Lives in `src/` rather than in the test folder because the contrast rules
 * are a product constraint, not a test detail — Phase 5 uses the same maths to
 * decide when a text block needs a scrim over the animated background.
 */

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function parseHex(hex: string): readonly [number, number, number] {
  const h = hex.trim().replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error(`Not a hex colour: ${hex}`);
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ] as const;
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Linear interpolation between two hex colours, used to sample a gradient. */
export function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const to = (x: number, y: number) =>
    Math.round(x * (1 - t) + y * t)
      .toString(16)
      .padStart(2, '0');
  return `#${to(ar, br)}${to(ag, bg)}${to(ab, bb)}`;
}

export const WCAG_AA_NORMAL = 4.5;
export const WCAG_AA_LARGE = 3;
