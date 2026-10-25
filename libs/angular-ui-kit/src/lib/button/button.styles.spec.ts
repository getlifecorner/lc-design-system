import { compile } from 'sass';
import { resolve } from 'path';

/**
 * Stylesheet contract of lc-button and a[lcButton] (one shared stylesheet).
 * jsdom applies no stylesheets, so the rules are read from the compiled CSS.
 */
const css = '\n' + compile(resolve(__dirname, 'button.component.scss')).css;

/** The declarations of the rule whose selector list is exactly `selector`. */
function rule(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  expect(start).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf('}', start));
}

describe('lc-button styles', () => {
  // SI-7 (WCAG 1.4.4, 1.4.10): a nowrap label wider than the viewport overflows
  // at 320 px or 200 % text. Every button wraps, as a[lcButton] already did.
  describe('labels wrap (SI-7)', () => {
    it('lets <button> labels wrap and centres the lines', () => {
      const base = rule('.btn');
      expect(base).toMatch(/white-space:\s*normal/);
      expect(base).not.toMatch(/white-space:\s*nowrap/);
      expect(base).toMatch(/text-align:\s*center/);
    });

    it('breaks a single word that is wider than the button instead of overflowing', () => {
      // 3.11 (AS-30): through the hook --lc-btn-overflow-wrap, whose default is
      // the same break-word (see button.overflow-wrap.spec.ts).
      expect(rule('.btn')).toMatch(/overflow-wrap:\s*var\(--lc-btn-overflow-wrap, break-word\)/);
    });

    it('nothing re-enables nowrap for a button or a link variant', () => {
      expect(css).not.toMatch(/white-space:\s*nowrap/);
    });

    it('the inline variant keeps flowing with the surrounding text', () => {
      const inline = rule('.btn-inline');
      expect(inline).toMatch(/white-space:\s*normal/);
      expect(inline).toMatch(/text-align:\s*inherit/);
    });
  });

  // G-41 (request 012, AC-8): `transition: all` animated padding and font size
  // on the first layout inside lc-next-step-card, so the CTAs grew for 150 ms.
  describe('transition list (G-41)', () => {
    function transitionProperties(selector: string): string[] {
      const list = rule(selector).match(/transition-property:\s*([^;]+);/)?.[1] ?? '';
      return list.split(',').map((p) => p.trim());
    }

    it('.btn animates only color, background-color, border-color and box-shadow', () => {
      expect(transitionProperties('.btn')).toEqual(['color', 'background-color', 'border-color', 'box-shadow']);
    });

    it('.btn keeps the duration and the timing of 3.11.1', () => {
      const base = rule('.btn');
      expect(base).toMatch(/transition-duration:\s*var\(--animation-duration-base\);/);
      expect(base).toMatch(/transition-timing-function:\s*var\(--animation-timing-ease\);/);
    });

    it('no rule of the stylesheet animates every property, and no shorthand resets the list', () => {
      expect(css).not.toMatch(/transition:\s*all\b/);
      expect(css).not.toMatch(/transition-property:\s*all\b/);
      expect(css).not.toMatch(/\stransition:/);
    });

    it('.btn.btn-inline keeps its own, identical list', () => {
      expect(transitionProperties('.btn.btn-inline')).toEqual(['color', 'background-color', 'border-color', 'box-shadow']);
    });
  });

  // AS-19 (WCAG 1.4.1, axe link-in-text-block): the inline link carries a
  // non-colour cue at rest, through a documented hook (AC-13 to AC-15, request 002).
  describe('inline link underline (AS-19)', () => {
    it('underlines .btn.btn-inline at rest through --lc-btn-inline-text-decoration (default underline)', () => {
      const inline = rule('.btn.btn-inline');
      expect(inline).toMatch(/text-decoration:\s*var\(--lc-btn-inline-text-decoration,\s*underline\)/);
      expect(inline).toMatch(/text-decoration-thickness:\s*max\(1px,\s*0\.0625em\)/);
      expect(inline).toMatch(/text-underline-offset:\s*0\.15em/);
    });

    it('outranks the a.btn reset (no underline on button links) by specificity', () => {
      // a.btn is (0,1,1); .btn.btn-inline is (0,2,0).
      expect(rule('a.btn')).toMatch(/text-decoration:\s*none/);
      expect(css.indexOf('\n.btn.btn-inline {')).toBeGreaterThan(-1);
    });

    it('keeps the line on hover, thicker, without animating it', () => {
      expect(rule('.btn.btn-inline:hover:not(:disabled)')).toMatch(/text-decoration-thickness:\s*max\(2px,\s*0\.125em\)/);
      const transition = rule('.btn.btn-inline').match(/transition-property:\s*([^;]+);/)?.[1] ?? '';
      expect(transition.split(',').map((p) => p.trim())).toEqual(['color', 'background-color', 'border-color', 'box-shadow']);
    });

    it('no rule removes the line from the inline variant (focus, disabled and forced colours keep it)', () => {
      const removing = [...css.matchAll(/\n([^{}\n]*btn-inline[^{}\n]*)\{([^}]*)\}/g)]
        .filter(([, , body]) => /text-decoration(-line)?:\s*none/.test(body))
        .map(([, selector]) => selector.trim());
      expect(removing).toEqual([]);
    });
  });

  // G-WL1 (request 017, life-os waitlist): no variant had a visible boundary on
  // the teal lc-hero band. `inverse` is a white pill with dark ink and a white
  // ring, the same in both themes because the bands are.
  describe('inverse variant (G-WL1)', () => {
    type Rgb = [number, number, number];

    function parse(value: string): Rgb {
      const h = value.trim().replace(/^#/, '');
      expect(h).toMatch(/^[0-9a-f]{6}$/i);
      return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
    }
    const mix = (top: Rgb, base: Rgb, alpha: number): Rgb =>
      [0, 1, 2].map((i) => top[i] * alpha + base[i] * (1 - alpha)) as Rgb;
    const lerp = (a: Rgb, b: Rgb, t: number): Rgb =>
      [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as Rgb;
    function luminance(rgb: Rgb): number {
      const [r, g, b] = rgb.map((c) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    function ratio(a: Rgb, b: Rgb): number {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    }
    const r2 = (n: number) => Math.round(n * 100) / 100;

    /** `--color-neutral-white` in a compiled theme file. */
    function themeWhite(file: string): string {
      const theme = compile(resolve(__dirname, '../../styles', file)).css;
      return theme.match(/--color-neutral-white:\s*([^;]+);/)?.[1] ?? '';
    }

    // The real values: the compiled button rules, the theme files and the hero's
    // band gradients and body opacity.
    const ink = rule('.btn-inverse').match(/\scolor:\s*var\(--lc-button-inverse-fg,\s*(#[0-9a-f]{6})\)/i)?.[1] ?? '';
    const hoverFill = rule('.btn-inverse:hover:not(:disabled)').match(/background-color:\s*(#[0-9a-f]{6})/i)?.[1] ?? '';
    const activeFill = rule('.btn-inverse:active:not(:disabled)').match(/background-color:\s*(#[0-9a-f]{6})/i)?.[1] ?? '';
    const hero = compile(resolve(__dirname, '../hero/hero.component.scss')).css;
    // The default body (the light variant's own `.hero--light .hero__body` is .75).
    const bodyOpacity = Number(hero.match(/\n\.hero__body \{[^}]*?opacity:\s*([\d.]+)/)?.[1]);
    function band(name: string): [Rgb, Rgb] {
      const m = hero.match(new RegExp(`\\.hero--${name} \\{\\s*background: linear-gradient\\(135deg, (#[0-9a-f]{6}) 0%, (#[0-9a-f]{6}) 100%\\)`, 'i'));
      expect(m).not.toBeNull();
      return [parse(m?.[1] ?? ''), parse(m?.[2] ?? '')];
    }

    /** Text, fill and ring ratios of one state at one band colour, under the body's opacity. */
    function at(fill: string, bandRgb: Rgb) {
      const f = mix(parse(fill), bandRgb, bodyOpacity);
      return {
        text: ratio(mix(parse(ink), bandRgb, bodyOpacity), f),
        fill: ratio(f, bandRgb),
        ring: ratio(mix(parse('#ffffff'), bandRgb, bodyOpacity), bandRgb),
      };
    }
    /** The minimum of each ratio over the whole band, t = 0 … 1 in 0.01 steps. */
    function worst(fill: string, name: string) {
      const [from, to] = band(name);
      const min = { text: Infinity, fill: Infinity, ring: Infinity };
      for (let k = 0; k <= 100; k++) {
        const r = at(fill, lerp(from, to, k / 100));
        min.text = Math.min(min.text, r.text);
        min.fill = Math.min(min.fill, r.fill);
        min.ring = Math.min(min.ring, r.ring);
      }
      return min;
    }

    it('fills white in both themes, with ink #0d353d through the hook --lc-button-inverse-fg', () => {
      expect(rule('.btn-inverse')).toMatch(/background-color:\s*var\(--color-neutral-white\);/);
      expect(themeWhite('_theme-light.scss').toLowerCase()).toBe('#ffffff');
      expect(themeWhite('_theme-dark.scss').toLowerCase()).toBe('#ffffff');
      expect(ink.toLowerCase()).toBe('#0d353d');
      expect(hoverFill.toLowerCase()).toBe('#f0f8fa');
      expect(activeFill.toLowerCase()).toBe('#e0f1f4');
    });

    it('turns the focus ring white, after the .btn ring at equal specificity', () => {
      expect(rule('.btn-inverse:focus-visible')).toMatch(/outline-color:\s*var\(--color-neutral-white\);/);
      expect(rule('.btn:focus-visible')).toMatch(/outline:\s*2px solid var\(--color-primary-500\);/);
      expect(css.indexOf('\n.btn-inverse:focus-visible {')).toBeGreaterThan(css.indexOf('\n.btn:focus-visible {'));
    });

    it('measures the design values on the teal band at its light end #208497 under the body opacity .85', () => {
      expect(bodyOpacity).toBe(0.85);
      const end = band('primary')[1];
      expect(end).toEqual(parse('#208497'));
      const states = ['#ffffff', hoverFill, activeFill].map((fill) => at(fill, end));
      expect(states.map((s) => r2(s.text))).toEqual([9.28, 8.69, 8.11]);
      expect(states.map((s) => r2(s.fill))).toEqual([3.62, 3.39, 3.16]);
      expect(r2(states[0].ring)).toBe(3.62);
    });

    it('meets 4.5:1 text and 3:1 fill and ring over the whole teal band in every state', () => {
      for (const fill of ['#ffffff', hoverFill, activeFill]) {
        const min = worst(fill, 'primary');
        expect(min.text).toBeGreaterThanOrEqual(4.5);
        expect(min.fill).toBeGreaterThanOrEqual(3);
        expect(min.ring).toBeGreaterThanOrEqual(3);
      }
      // The worst point is the light end (t = 1), so the values above are the minimum.
      expect(r2(worst('#ffffff', 'primary').fill)).toBe(3.62);
    });

    it.each(['neutral', 'info', 'accent-purple', 'accent-violet'])(
      'also passes on the %s band named in the JSDoc',
      (name) => {
        for (const fill of ['#ffffff', hoverFill, activeFill]) {
          const min = worst(fill, name);
          expect(min.text).toBeGreaterThanOrEqual(4.5);
          expect(min.fill).toBeGreaterThanOrEqual(3);
          expect(min.ring).toBeGreaterThanOrEqual(3);
        }
      },
    );

    it('draws a system-colour boundary and ring in forced colours', () => {
      const forced = css.match(/@media \(forced-colors: active\) \{([\s\S]*?)\n\}/)?.[1] ?? '';
      expect(forced).toMatch(/\.btn-inverse \{\s*border-color: ButtonText;\s*\}/);
      expect(forced).toMatch(/a\.btn-inverse \{\s*border-color: LinkText;\s*\}/);
      expect(forced).toMatch(/\.btn-inverse:focus-visible \{\s*outline-color: Highlight;\s*\}/);
    });

    it('adds no motion and leaves the other variants alone', () => {
      const inverse = [...css.matchAll(/\n([^{}\n]*btn-inverse[^{}\n]*)\{([^}]*)\}/g)];
      expect(inverse.length).toBeGreaterThanOrEqual(7);
      for (const [, selector, body] of inverse) {
        expect(body).not.toMatch(/transition|animation|filter/);
        expect(selector.split(',').every((s) => s.includes('btn-inverse'))).toBe(true);
      }
    });
  });
});
