import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { HeroComponent, type HeroColor, type HeroHeadingLevel, type HeroSize, type HeroVariant } from './hero.component';
import { PageHeaderComponent } from '../page-header/page-header.component';

/**
 * 3.36 (request 056): `headingLevel` (cockpit row 1, AC-13, AC-14) and
 * `focusTitle()` (monatsstand row 1, AC-25, AC-26, D-5).
 */
@Component({
  standalone: true,
  imports: [HeroComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="before">Freigeben</button>
    <lc-hero
      [title]="title()"
      [label]="label()"
      [headingLevel]="level()"
      [color]="color()"
      [variant]="variant()"
      [size]="size()"
    >
      <p>Fassung 1 ist eingefroren.</p>
    </lc-hero>
  `,
})
class Host {
  readonly title = signal('522.530,00 €');
  readonly label = signal<string | undefined>('Monatsstand Oktober 2026');
  readonly level = signal<HeroHeadingLevel>(1);
  readonly color = signal<HeroColor>('primary');
  readonly variant = signal<HeroVariant>('default');
  readonly size = signal<HeroSize>('md');
  readonly hero = viewChild.required(HeroComponent);
}

describe('HeroComponent — headingLevel and focusTitle() (3.36, request 056)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const root = () => fixture.nativeElement as HTMLElement;
  const title = () => root().querySelector('.hero__title') as HTMLElement;
  const label = () => root().querySelector('.hero__label') as HTMLElement | null;

  const create = (patch: Partial<{ level: HeroHeadingLevel; label: string | undefined; color: HeroColor; variant: HeroVariant; size: HeroSize }> = {}) => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    if (patch.level !== undefined) host.level.set(patch.level);
    if ('label' in patch) host.label.set(patch.label);
    if (patch.color) host.color.set(patch.color);
    if (patch.variant) host.variant.set(patch.variant);
    if (patch.size) host.size.set(patch.size);
    fixture.detectChanges();
  };

  afterEach(() => fixture?.destroy());

  describe('headingLevel (AC-13, AC-14)', () => {
    it('defaults to 1: the title is the same <h1> as in 3.35 (only comment anchors differ)', () => {
      TestBed.configureTestingModule({ imports: [HeroComponent] });
      const plain = TestBed.createComponent(HeroComponent);
      plain.componentRef.setInput('title', 'Willkommen');
      plain.componentRef.setInput('label', 'MEINE APP');
      plain.detectChanges();
      expect(plain.componentInstance.headingLevel()).toBe(1);
      const html = (plain.nativeElement as HTMLElement).innerHTML
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s_ngcontent-[\w-]+=""/g, '');
      // The 3.35 markup of `<lc-hero title="Willkommen" label="MEINE APP">` (jsdom lists the `[class]` classes sorted).
      expect(html).toBe(
        '<div class="hero hero--content-full hero--default hero--md hero--primary hero--radius-lg">' +
          '<div class="hero__inner"><div class="hero__content">' +
          '<span class="hero__label">MEINE APP</span>' +
          '<h1 class="hero__title">Willkommen</h1>' +
          '<div class="hero__body"></div></div>' +
          '<div class="hero__media"></div></div></div>',
      );
      plain.destroy();
    });

    it.each([1, 2, 3, 4, 5, 6] as const)('level %i renders the title as h%i with the same class and text', (level) => {
      create({ level });
      expect(title().tagName).toBe(`H${level}`);
      expect(title().className).toBe('hero__title');
      expect(title().textContent).toBe('522.530,00 €');
      expect(root().querySelectorAll('.hero__title')).toHaveLength(1);
    });

    it('AC-14: under an lc-page-header the page has one h1 with headingLevel 2', () => {
      @Component({
        standalone: true,
        imports: [HeroComponent, PageHeaderComponent],
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
          <lc-page-header title="Cockpit" />
          <lc-hero label="Gesamtkosten Ist" title="522.530,00 €" [headingLevel]="2" />
        `,
      })
      class Page {}
      TestBed.configureTestingModule({ imports: [Page] });
      const page = TestBed.createComponent(Page);
      page.detectChanges();
      const el = page.nativeElement as HTMLElement;
      expect(el.querySelectorAll('h1')).toHaveLength(1);
      expect(el.querySelector('h1')?.textContent?.trim()).toBe('Cockpit');
      expect(el.querySelector('lc-hero h2')?.textContent).toBe('522.530,00 €');
      page.destroy();
    });

    it('AC-13: no rule of the stylesheet names a heading element, so every level gets the .hero__title look', () => {
      const css = compile(resolve(__dirname, 'hero.component.scss')).css;
      const selectors = [...css.matchAll(/(?:^|\n)\s*([^{}@\n][^{}\n]*)\{/g)].map((m) => m[1]);
      expect(selectors.length).toBeGreaterThan(20);
      for (const selector of selectors) expect(selector).not.toMatch(/(^|[\s,>+~(])h[1-6]\b/);
      // Size, weight, line height and margin come from .hero__title rules only.
      expect(css).toMatch(/\n\.hero__title \{\s*margin: 0;\s*font-weight: 800;\s*line-height: 1\.1;\s*color: inherit;\s*\}/);
    });
  });

  describe('focusTitle() (AC-25, AC-26, D-5)', () => {
    it('without a call nothing changes: no tabindex, no ids, no aria-labelledby', () => {
      create();
      expect(title().getAttributeNames().filter((n) => !n.startsWith('_ng'))).toEqual(['class']);
      expect(label()?.getAttributeNames().filter((n) => !n.startsWith('_ng'))).toEqual(['class']);
      expect(title().tabIndex).toBe(-1); // a heading is not focusable: not in the Tab order
    });

    it('focuses the title with tabindex="-1" and names it "label title"', () => {
      create({ level: 2 });
      host.hero().focusTitle();
      expect(document.activeElement).toBe(title());
      expect(title().getAttribute('tabindex')).toBe('-1');
      expect(title().tabIndex).toBe(-1);
      const ids = (title().getAttribute('aria-labelledby') ?? '').split(' ');
      expect(ids).toEqual([label()?.id, title().id]);
      expect(ids.every((id) => /^lc-hero-(label|title)-\d+$/.test(id))).toBe(true);
      expect(ids.map((id) => document.getElementById(id)?.textContent).join(' ')).toBe('Monatsstand Oktober 2026 522.530,00 €');
    });

    it('a second call keeps the ids; without a label the title is named by its text', () => {
      create();
      host.hero().focusTitle();
      const first = title().getAttribute('aria-labelledby');
      (root().querySelector('.before') as HTMLButtonElement).focus();
      host.hero().focusTitle();
      expect(title().getAttribute('aria-labelledby')).toBe(first);
      expect(document.activeElement).toBe(title());

      host.label.set(undefined);
      fixture.detectChanges();
      host.hero().focusTitle();
      expect(title().hasAttribute('aria-labelledby')).toBe(false);
      expect(document.activeElement).toBe(title());
    });

    it.each([
      ['secondary', 'default', 'sm', 1],
      ['warning', 'slim', 'md', 3],
      ['accent-orange', 'light', 'lg', 6],
      ['neutral', 'default', 'lg', 2],
    ] as const)('works on %s / %s / %s / h%i', (color, variant, size, level) => {
      create({ color, variant, size, level });
      host.hero().focusTitle();
      expect(document.activeElement).toBe(title());
      expect(title().tagName).toBe(`H${level}`);
    });

    it('re-rendering with a new level and calling again focuses the new element', () => {
      create({ level: 1 });
      host.level.set(3);
      fixture.detectChanges();
      host.hero().focusTitle();
      expect(document.activeElement?.tagName).toBe('H3');
    });
  });

  describe('focus ring (AC-26)', () => {
    const css = compile(resolve(__dirname, 'hero.component.scss')).css;
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
    const lerp = (a: Rgb, b: Rgb, t: number): Rgb => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t)) as Rgb;
    const r2 = (n: number) => Math.round(n * 100) / 100;
    const bands = (light: boolean) =>
      [...css.matchAll(/\n\.hero--([\w-]+)(\.hero--([\w-]+))? \{\s*background: linear-gradient\(135deg, (#[0-9a-f]{6}) 0%, (#[0-9a-f]{6}) 100%\)/gi)]
        .filter((m) => (light ? m[1] === 'light' : !m[2]))
        .map((m) => [hex(m[4]), hex(m[5])] as [Rgb, Rgb]);
    /** min over the band (t = 0 … 1) of the better of the two ring colours. */
    const worst = (list: [Rgb, Rgb][], a: Rgb, b: Rgb) =>
      Math.min(...list.flatMap(([from, to]) => Array.from({ length: 101 }, (_, k) => {
        const bg = lerp(from, to, k / 100);
        return Math.max(ratio(a, bg), ratio(b, bg));
      })));

    it('is a two-tone ring only in the focused state: currentColor outline, #111827 band, Highlight in forced colours', () => {
      expect(css).toMatch(
        /\n\.hero__title:focus-visible \{\s*outline: 2px solid currentColor;\s*outline-offset: 2px;\s*box-shadow: 0 0 0 2px #111827;\s*border-radius: var\(--border-radius-sm\);\s*\}/,
      );
      expect(css).toMatch(/\n\.hero--light \.hero__title:focus-visible \{\s*box-shadow: 0 0 0 2px #fff;\s*\}/);
      expect(css).toMatch(/@media \(forced-colors: active\) \{\s*\.hero__title:focus-visible \{\s*outline-color: Highlight;\s*box-shadow: none;\s*\}/);
      expect(css).not.toMatch(/hero__title[^{]*:focus(?!-visible)/);
    });

    it('meets 3:1 on all 9 bands (min 4.23) and on the light variant (min 10.57); white alone would be 2.26', () => {
      const dark = bands(false);
      const light = bands(true);
      expect(dark).toHaveLength(9);
      expect(light).toHaveLength(9);
      const white = hex('#ffffff');
      expect(r2(worst(dark, white, hex('#111827')))).toBe(4.23);
      expect(r2(worst(dark, white, white))).toBe(2.26);
      expect(r2(worst(light, hex('#1f2937'), white))).toBe(10.57);
    });
  });
});
