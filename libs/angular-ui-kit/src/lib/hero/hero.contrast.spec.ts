import { resolve } from 'path';
import { compile } from 'sass';
import type { HeroColor } from './hero.component';

/**
 * 3.38 (request 058, follow-up 057-s2, design H1, AC-6, AC-7, AC-9): the text
 * of lc-hero on its bands, computed from the compiled stylesheet with the
 * WCAG 2.2 formula. The minimum over the band (t = 0 … 1 in 0.01 steps, both
 * ends, so every text corner is covered), 8-bit sRGB composites, floored to 2
 * decimals. On a default band label, title and body are one ink, white at full
 * strength; the light variant is unchanged (body 75 %, label 70 %, title
 * neutral-800). The look of the bands is proven by the story shots.
 */
const css = '\n' + compile(resolve(__dirname, 'hero.component.scss')).css;

/** The declarations of the first rule whose selector is exactly `selector`. */
function rule(selector: string): string {
  const at = css.indexOf(`\n${selector} {`);
  expect([selector, at > -1]).toEqual([selector, true]);
  const open = css.indexOf('{', at);
  return css.slice(open + 1, css.indexOf('}', open));
}

type Rgb = [number, number, number];
const hex = (h: string): Rgb => {
  const full = h.length === 4 ? `#${[...h.slice(1)].map((c) => c + c).join('')}` : h;
  return [1, 3, 5].map((i) => parseInt(full.slice(i, i + 2), 16)) as Rgb;
};
const lum = (c: Rgb) =>
  c
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
/** 8-bit composite of `top` at `alpha` over `base`. */
const over = (top: Rgb, base: Rgb, alpha: number): Rgb => [0, 1, 2].map((i) => Math.round(top[i] * alpha + base[i] * (1 - alpha))) as Rgb;
const lerp = (a: Rgb, b: Rgb, t: number): Rgb => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as Rgb;
const floor2 = (n: number) => Math.floor(n * 100) / 100;

const COLORS: HeroColor[] = ['primary', 'secondary', 'neutral', 'success', 'info', 'warning', 'accent-orange', 'accent-purple', 'accent-violet'];

/** Both stops of a band, as written in the compiled CSS. */
function stops(color: HeroColor, light: boolean): [string, string] {
  const body = rule(light ? `.hero--light.hero--${color}` : `.hero--${color}`);
  const m = body.match(/background: linear-gradient\(135deg, (#[0-9a-f]{6}) 0%, (#[0-9a-f]{6}) 100%\);/i);
  expect([color, m !== null]).toEqual([color, true]);
  return [(m as RegExpMatchArray)[1].toLowerCase(), (m as RegExpMatchArray)[2].toLowerCase()];
}

/** min over the band of the contrast of an ink (`alpha` over the band colour) against the band. */
function worst(color: HeroColor, light: boolean, ink: Rgb, alpha = 1): number {
  const [from, to] = stops(color, light).map(hex);
  let min = Infinity;
  for (let k = 0; k <= 100; k++) {
    const bg = lerp(from, to, k / 100);
    min = Math.min(min, ratio(over(ink, bg, alpha), bg));
  }
  return floor2(min);
}

/** HSV hue (degrees) and saturation of a colour. */
function hsv([r, g, b]: Rgb): [number, number] {
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d === 0) return [0, 0];
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, d / max];
}

describe('lc-hero — text contrast on the bands (3.38, request 058, 057-s2)', () => {
  describe('the inks (design §5.1, H1)', () => {
    it('a default band has one ink: white on .hero; the body takes no colour and the label no opacity of their own', () => {
      expect(rule('.hero')).toMatch(/\scolor: #fff;/);
      expect(rule('.hero__body')).not.toMatch(/color|opacity/);
      expect(rule('.hero__label')).not.toMatch(/opacity|color/);
      expect(rule('.hero__title')).toMatch(/color: inherit;/);
      // The light variant keeps its three inks.
      expect(rule('.hero--light')).toMatch(/\scolor: #1f2937;/);
      expect(rule('.hero--light .hero__body')).toMatch(/^\s*color: rgba\(31, 41, 55, 0\.75\);\s*$/);
      expect(rule('.hero--light .hero__label')).toMatch(/^\s*opacity: 0\.7;\s*$/);
    });
  });

  describe('the bands (AC-9, design §5.1)', () => {
    // 5 light ends darker (primary, secondary, accent-orange; success and warning
    // both ends); neutral, info, accent-purple and accent-violet as in 3.37.
    const BANDS: Record<HeroColor, [string, string]> = {
      primary: ['#0d353d', '#1f8092'],
      secondary: ['#2d3c46', '#5a798c'],
      neutral: ['#111827', '#4b5563'],
      success: ['#46543b', '#697957'],
      info: ['#27445c', '#3b6588'],
      warning: ['#68481d', '#9b6b2b'],
      'accent-orange': ['#7a3a10', '#b06024'],
      'accent-purple': ['#3a2a52', '#866aa0'],
      'accent-violet': ['#221a42', '#4e3f84'],
    };
    // The 3.37 stops of the five changed bands.
    const BEFORE: Partial<Record<HeroColor, [string, string]>> = {
      primary: ['#0d353d', '#208497'],
      secondary: ['#2d3c46', '#7097af'],
      success: ['#5f7150', '#8ea475'],
      warning: ['#9b6b2b', '#e1a040'],
      'accent-orange': ['#7a3a10', '#df792e'],
    };

    it.each(COLORS)('%s: the stops of design §5.1', (color) => {
      expect(stops(color, false)).toEqual(BANDS[color]);
    });

    it.each(Object.keys(BEFORE) as HeroColor[])('%s keeps its hue (≤ 2°), saturation (≤ .01) and dark-to-light run', (color) => {
      const [from, to] = stops(color, false).map(hex);
      const [oldHue, oldSat] = hsv(hex((BEFORE[color] as [string, string])[1]));
      const [hue, sat] = hsv(to);
      expect(Math.abs(hue - oldHue)).toBeLessThanOrEqual(2);
      expect(Math.abs(sat - oldSat)).toBeLessThanOrEqual(0.0101);
      expect(lum(to)).toBeGreaterThan(lum(from));
    });
  });

  describe('AC-6, AC-7: label, title and body reach 4.5:1 on all 9 bands, both variants', () => {
    // Floored; design §5.1 quotes the same values.
    const DEFAULT: Record<HeroColor, number> = {
      primary: 4.6,
      secondary: 4.61,
      neutral: 7.55,
      success: 4.69,
      info: 6.17,
      warning: 4.63,
      'accent-orange': 4.62,
      'accent-purple': 4.58,
      'accent-violet': 8.86,
    };
    // [body 75 %, label 70 %, title] (design §5.2), unchanged since 3.37.
    const LIGHT: Record<HeroColor, [number, number, number]> = {
      primary: [5.79, 5.0, 12.03],
      secondary: [5.74, 4.98, 11.91],
      neutral: [5.72, 4.98, 11.85],
      success: [6.06, 5.17, 12.94],
      info: [5.79, 5.0, 12.03],
      warning: [6.1, 5.24, 13.18],
      'accent-orange': [6.04, 5.18, 12.81],
      'accent-purple': [5.44, 4.71, 10.78],
      'accent-violet': [5.36, 4.68, 10.57],
    };
    const white = hex('#ffffff');
    const ink = hex('#1f2937');

    it.each(COLORS)('default %s: white label, title and body', (color) => {
      const value = worst(color, false, white);
      expect([color, value]).toEqual([color, DEFAULT[color]]);
      // 4.5:1 for the body and label (small text) and the title at every size,
      // also the slim title below 640 px (18 px bold, not large text).
      expect(value).toBeGreaterThanOrEqual(4.5);
    });

    it.each(COLORS)('light %s: body, label and title', (color) => {
      const values = [worst(color, true, ink, 0.75), worst(color, true, ink, 0.7), worst(color, true, ink)];
      expect([color, values]).toEqual([color, LIGHT[color]]);
      for (const value of values) expect(value).toBeGreaterThanOrEqual(4.5);
    });

    it('negative control: the 3.37 inks (body 85 %, label 80 %) on the 3.37 warning band fail', () => {
      const [from, to] = ['#9b6b2b', '#e1a040'].map(hex);
      let body = Infinity;
      let label = Infinity;
      for (let k = 0; k <= 100; k++) {
        const bg = lerp(from, to, k / 100);
        body = Math.min(body, ratio(over(white, bg, 0.85), bg));
        label = Math.min(label, ratio(over(white, bg, 0.8), bg));
      }
      expect([floor2(body), floor2(label)]).toEqual([2.01, 1.93]);
    });
  });
});
