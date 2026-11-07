import { TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { resolve } from 'path';
import { compile } from 'sass';
import { ButtonComponent, type ButtonVariant } from './button.component';
import { ButtonLinkComponent } from './button-link.component';

/**
 * 3.36 (request 056, monatsstand row 2, AC-27, AC-28, D-9): `inverse-outline`,
 * the quieter action beside `inverse` on the lc-hero bands, and the dark inner
 * band of the `inverse` focus ring. Values computed from the compiled CSS and
 * the hero's band gradients (as the inverse spec of 3.13).
 */
const css = '\n' + compile(resolve(__dirname, 'button.component.scss')).css;
const hero = compile(resolve(__dirname, '../hero/hero.component.scss')).css;

/** The declarations of the rule whose selector list is exactly `selector`. */
function rule(selector: string, text = css): string {
  const start = text.indexOf(`\n${selector} {`);
  expect(start).toBeGreaterThan(-1);
  return text.slice(start, text.indexOf('}', start));
}

type Rgb = [number, number, number];
const hex = (h: string): Rgb => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb;
const lum = (c: Rgb) =>
  c
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const mix = (top: Rgb, base: Rgb, alpha: number): Rgb => [0, 1, 2].map((i) => top[i] * alpha + base[i] * (1 - alpha)) as Rgb;
const lerp = (a: Rgb, b: Rgb, t: number): Rgb => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as Rgb;
const r2 = (n: number) => Math.round(n * 100) / 100;

const WHITE: Rgb = [255, 255, 255];
/** The nine default bands (light end and dark end of each gradient). */
const BANDS = [...hero.matchAll(/\n\.hero--([\w-]+) \{\s*background: linear-gradient\(135deg, (#[0-9a-f]{6}) 0%, (#[0-9a-f]{6}) 100%\)/gi)].map(
  (m) => [m[1], hex(m[2]), hex(m[3])] as const,
);
const BODY = Number(hero.match(/\n\.hero__body \{[^}]*?opacity:\s*([\d.]+)/)?.[1]);

/** min over every band and t = 0 … 1 of `f(band colour)`. */
const worst = (f: (bg: Rgb) => number) =>
  Math.min(...BANDS.flatMap(([, from, to]) => Array.from({ length: 101 }, (_, k) => f(lerp(from, to, k / 100)))));

/** `rgba(r, g, b, a)` → [rgb, a]. */
function rgba(value: string): [Rgb, number] {
  const m = value.match(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/);
  expect(m).not.toBeNull();
  return [[Number(m?.[1]), Number(m?.[2]), Number(m?.[3])], Number(m?.[4])];
}

describe('lc-button inverse-outline (3.36, request 056)', () => {
  describe('markup (AC-27)', () => {
    it.each<ButtonVariant>(['inverse-outline', 'inverse'])('lc-button %s sets only its own variant class', (variant) => {
      TestBed.configureTestingModule({ imports: [ButtonComponent] });
      const fixture = TestBed.createComponent(ButtonComponent);
      fixture.componentRef.setInput('variant', variant);
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      const button = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
      expect(button.className.split(' ').sort()).toEqual(['btn', `btn-${variant}`, 'btn-lg'].sort());
      fixture.destroy();
    });

    it('keeps loading, disabled, ariaDescribedBy and the icon slots of inverse', () => {
      @Component({
        standalone: true,
        imports: [ButtonComponent],
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
          <lc-button variant="inverse-outline" size="lg" [loading]="true" ariaDescribedBy="hint">Herkunft</lc-button>
          <lc-button variant="inverse-outline" [disabled]="true">Herkunft</lc-button>
          <lc-button variant="inverse-outline"><span slot="icon-before" class="icon">i</span>Herkunft</lc-button>
        `,
      })
      class Host {}
      TestBed.configureTestingModule({ imports: [Host] });
      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      const [loading, disabled, icon] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
      expect(loading.classList).toContain('btn-loading');
      expect(loading.getAttribute('aria-busy')).toBe('true');
      expect(loading.getAttribute('aria-describedby')).toBe('hint');
      expect(loading.querySelector('.loading-spinner')).not.toBeNull();
      expect(disabled.disabled).toBe(true);
      expect(icon.firstElementChild?.className).toBe('icon');
      fixture.destroy();
    });

    it('a[lcButton] gets the same class', () => {
      @Component({
        standalone: true,
        imports: [ButtonLinkComponent],
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `<a lcButton variant="inverse-outline" size="lg" href="#herkunft">Herkunft</a>`,
      })
      class Host {}
      TestBed.configureTestingModule({ imports: [Host] });
      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      const a = (fixture.nativeElement as HTMLElement).querySelector('a') as HTMLAnchorElement;
      expect(a.className).toBe('btn btn-inverse-outline btn-lg');
      fixture.destroy();
    });
  });

  describe('styles (AC-27, AC-28)', () => {
    it('scrim .5 / .62 / .74 of #111827, white border and text, a 1 px #111827 keyline', () => {
      const base = rule('.btn-inverse-outline');
      expect(base).toMatch(/background-color: rgba\(17, 24, 39, 0\.5\);/);
      expect(base).toMatch(/border-color: var\(--color-neutral-white\);/);
      expect(base).toMatch(/\scolor: var\(--color-neutral-white\);/);
      expect(base).toMatch(/box-shadow: 0 0 0 1px #111827;/);
      expect(rule('.btn-inverse-outline:hover:not(:disabled, .btn-loading)')).toMatch(/background-color: rgba\(17, 24, 39, 0\.62\);/);
      expect(rule('.btn-inverse-outline:active:not(:disabled, .btn-loading)')).toMatch(/background-color: rgba\(17, 24, 39, 0\.74\);/);
    });

    it('AC-28: the .btn box, so the height equals inverse at every size (no box declarations of its own)', () => {
      const own = [...css.matchAll(/\n([^{}\n]*btn-inverse-outline[^{}\n]*)\{([^}]*)\}/g)].map(([, , body]) => body).join('\n');
      expect(own).not.toMatch(/padding|border-width|border:|height|font|line-height|gap|min-|max-/);
    });

    it('the focus ring: white over a 2 px #111827 band, on inverse too (D-9), after the .btn ring', () => {
      for (const selector of ['.btn-inverse:focus-visible', '.btn-inverse-outline:focus-visible']) {
        const ring = rule(selector);
        expect(ring).toMatch(/outline-color: var\(--color-neutral-white\);/);
        expect(ring).toMatch(/box-shadow: 0 0 0 2px #111827;/);
        expect(css.indexOf(`\n${selector} {`)).toBeGreaterThan(css.indexOf('\n.btn:focus-visible {'));
      }
      // At rest `inverse` has no shadow: nothing changes until focus.
      expect(rule('.btn-inverse')).not.toMatch(/box-shadow/);
    });

    it('a focused loading inverse-outline is opaque with the white ring, at (0,4,0)', () => {
      expect(rule('.btn.btn-inverse-outline.btn-loading:focus-visible')).toMatch(/opacity: 1;\s*outline-color: var\(--color-neutral-white\);/);
    });

    it('forced colours: ButtonText / LinkText boundary and a Highlight ring', () => {
      const blocks = [...css.matchAll(/@media \(forced-colors: active\) \{([\s\S]*?)\n\}/g)].map((m) => m[1]).join('\n');
      expect(blocks).toMatch(/\.btn-inverse-outline \{\s*border-color: ButtonText;\s*\}/);
      expect(blocks).toMatch(/a\.btn-inverse-outline \{\s*border-color: LinkText;\s*\}/);
      expect(blocks).toMatch(/\.btn-inverse-outline:focus-visible \{\s*outline-color: Highlight;\s*\}/);
      expect(blocks).toMatch(/\.btn\.btn-inverse-outline\.btn-loading:focus-visible \{\s*outline-color: Highlight;\s*\}/);
    });
  });

  describe('contrast on every lc-hero band (AC-27, D-9, design §5)', () => {
    const [scrim, alpha] = rgba(rule('.btn-inverse-outline').match(/background-color: (rgba\([^)]*\))/)?.[1] ?? '');
    const keyline = hex(rule('.btn-inverse-outline').match(/box-shadow: 0 0 0 1px (#[0-9a-f]{6})/)?.[1] ?? '');
    const band = hex(rule('.btn-inverse-outline:focus-visible').match(/box-shadow: 0 0 0 2px (#[0-9a-f]{6})/)?.[1] ?? '');

    const text = (a: number, o: number) => worst((bg) => ratio(mix(WHITE, bg, o), mix(mix(scrim, bg, a), bg, o)));
    /** Two-tone: the better of the two colours against the band. */
    const twoTone = (dark: Rgb, o: number) => worst((bg) => Math.max(ratio(mix(WHITE, bg, o), bg), ratio(mix(dark, bg, o), bg)));

    it('reads nine bands, the body opacity .85 and #111827', () => {
      expect(BANDS.map(([name]) => name)).toEqual([
        'primary', 'secondary', 'neutral', 'success', 'info', 'warning', 'accent-orange', 'accent-purple', 'accent-violet',
      ]);
      expect(BODY).toBe(0.85);
      expect(scrim).toEqual(hex('#111827'));
      expect(keyline).toEqual(scrim);
      expect(band).toEqual(scrim);
    });

    it('text 4.5:1: min 4.66 under the body opacity, 6.19 at full opacity; hover and active higher', () => {
      expect(alpha).toBe(0.5);
      expect([r2(text(alpha, BODY)), r2(text(alpha, 1))]).toEqual([4.66, 6.19]);
      expect(text(0.62, BODY)).toBeGreaterThan(text(alpha, BODY));
      expect(text(0.74, BODY)).toBeGreaterThan(text(0.62, BODY));
    });

    it('keyline and ring 3:1: min 3.56 / 4.23 (white alone 2.01 / 2.26)', () => {
      expect([r2(twoTone(keyline, BODY)), r2(twoTone(keyline, 1))]).toEqual([3.56, 4.23]);
      expect([r2(twoTone(band, BODY)), r2(twoTone(band, 1))]).toEqual([3.56, 4.23]);
      expect([r2(twoTone(WHITE, BODY)), r2(twoTone(WHITE, 1))]).toEqual([2.01, 2.26]);
    });
  });
});
