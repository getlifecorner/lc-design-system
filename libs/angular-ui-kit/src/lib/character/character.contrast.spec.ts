import { compile } from 'sass';
import { resolve } from 'path';
import { ColorPrimary500, ColorPrimary800 } from '@lifecorner/angular-ui-kit/tokens';
import { CHARACTER_SVG_CALM, CHARACTER_SVG_HELLO } from '@lifecorner/angular-ui-kit/character-svg';

/**
 * Edu's body against the surfaces he stands on (3.8, G-4, AC-11 of request
 * 005), computed with the WCAG 2.2 formula from the real theme files and the
 * real drawings. Edu is a non-text graphic: 3:1 is the floor; the app asks
 * 4.5:1 on its own surfaces.
 */
function themeTokens(file: string): Record<string, string> {
  const css = compile(resolve(__dirname, '../../styles', file)).css;
  const tokens: Record<string, string> = {};
  for (const match of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) tokens[match[1]] = match[2].trim();
  return tokens;
}

function token(tokens: Record<string, string>, name: string): string {
  const value = tokens[name];
  const ref = value?.match(/^var\((--[\w-]+)\)$/);
  if (ref) return token(tokens, ref[1]);
  if (!/^#[0-9a-f]{6}$/i.test(value ?? '')) throw new Error(`${name} is not an opaque hex colour: ${value}`);
  return value.toLowerCase();
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function luminance(c: number[]): number {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: number[], b: number[]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** The body colour: the head's fill (the ellipse rx 22) of a drawing. */
const body = (svg: string) => svg.match(/<ellipse cx="50" cy="38" rx="22" ry="20" fill="(#[0-9a-f]{6})"/)?.[1] ?? '';

/** The hero band (`lc-hero` primary): primary-800 → primary-500, sRGB, at t = (x + y) / (w + h). */
const band = (t: number) => rgb(ColorPrimary800).map((from, i) => from + (rgb(ColorPrimary500)[i] - from) * t);

describe('Edu: contrast on his surfaces (AC-11)', () => {
  const light = themeTokens('_theme-light.scss');
  const dark = themeTokens('_theme-dark.scss');

  it('draws the body in primary-600 (light) and primary-400 (dark)', () => {
    expect(body(CHARACTER_SVG_CALM.light)).toBe('#1a6a79');
    expect(body(CHARACTER_SVG_CALM.dark)).toBe('#84c7d4');
    expect(body(CHARACTER_SVG_HELLO.dark)).toBe('#84c7d4');
  });

  it.each([
    ['--color-background', 6.21],
    ['--color-background-low', 5.91],
  ])('light body on light %s: %s:1', (surface, expected) => {
    const value = ratio(rgb(body(CHARACTER_SVG_CALM.light)), rgb(token(light, surface)));
    expect(value).toBeCloseTo(expected, 2);
    expect(value).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ['--color-background-low', 9.14],
    ['--color-background', 9.95],
    ['--color-surface', 9.13],
  ])('dark body on dark %s: %s:1', (surface, expected) => {
    const value = ratio(rgb(body(CHARACTER_SVG_CALM.dark)), rgb(token(dark, surface)));
    expect(value).toBeCloseTo(expected, 2);
    expect(value).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    [0, 6.97],
    [0.6, 3.55],
    [0.75, 3.01],
    [1, 2.31],
  ])('on-dark Hallo on the hero band at t %s: %s:1', (t, expected) => {
    expect(ratio(rgb(body(CHARACTER_SVG_HELLO.dark)), band(t))).toBeCloseTo(expected, 2);
  });

  it('reaches 3:1 on the band wherever t ≤ 0.75 (the docs rule)', () => {
    for (let t = 0; t <= 0.75; t += 0.01) {
      expect(ratio(rgb(body(CHARACTER_SVG_HELLO.dark)), band(t))).toBeGreaterThanOrEqual(3);
    }
  });
});
