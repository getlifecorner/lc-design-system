import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { resolve } from 'node:path';
import { compile } from 'sass';
import { BUNDLED_ICONS } from '@lifecorner/angular-ui-kit/icons';
import { IconComponent, IconSize, IconVariant, resetIconCache, resetIconWarnings } from './icon.component';
import { provideLcIcons } from './icon-registry';
import { decorateSvg, isDefaultIconColor, resetIconRendering } from './icon-dom';

/**
 * lc-icon without inline styles (3.11.1, G-37): the website ships under
 * `style-src 'self'`, which blocks every `style` attribute in prerendered
 * HTML. The box size is the `icon-<size>` class and the default colour the
 * stylesheet's `color: inherit`; only a custom `color` writes the svg's inline
 * colour, through CSSOM. jsdom applies no component CSS, so the rules are read
 * from the compiled stylesheet and the boxes measured in the stories.
 */

const SIZES: ReadonlyArray<[IconSize, string]> = [
  ['xs', '16px'],
  ['sm', '20px'],
  ['md', '24px'],
  ['lg', '32px'],
  ['xl', '40px'],
];
const VARIANTS: IconVariant[] = ['outline', 'solid'];

/** A fetched Tabler-like asset (no inline name): rebuilt from the allow-list. */
const FETCHED_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M0 0h24"/></svg>';

/** The compiled stylesheet, with a leading line feed so every rule starts on one. */
const css = '\n' + compile(resolve(__dirname, 'icon.component.scss')).css;

/** The declarations of the rule whose selector list is exactly `selector`. */
function rule(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  expect(start).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf('}', start));
}

describe('lc-icon without inline styles (3.11.1, G-37)', () => {
  let httpMock: HttpTestingController;

  function setup(platform: 'browser' | 'server' = 'browser'): void {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [IconComponent],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: platform },
        provideLcIcons(BUNDLED_ICONS),
      ],
    });
    resetIconWarnings();
    resetIconCache();
    resetIconRendering();
    httpMock = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => setup());

  afterEach(() => {
    httpMock.verify();
    resetIconRendering();
    jest.restoreAllMocks();
  });

  function render(inputs: Record<string, unknown>): ComponentFixture<IconComponent> {
    const fixture = TestBed.createComponent(IconComponent);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture;
  }

  const hostOf = (f: ComponentFixture<IconComponent>) => f.nativeElement as HTMLElement;
  const containerOf = (f: ComponentFixture<IconComponent>) => hostOf(f).querySelector('.icon-container') as HTMLElement;
  const svgOf = (f: ComponentFixture<IconComponent>) => hostOf(f).querySelector('.icon-container > svg') as SVGElement | null;
  /** The host and every element inside it that has a `style` attribute. */
  const styled = (f: ComponentFixture<IconComponent>) =>
    [hostOf(f), ...Array.from(hostOf(f).querySelectorAll('[style]'))].filter((el) => el.hasAttribute('style'));
  /** The class list, sorted: Angular's `[class]` order is not the input order. */
  const classes = (el: Element) => [...el.classList].sort();

  describe('AC-1: no style attribute with the default colour', () => {
    const cases = VARIANTS.flatMap((variant) => SIZES.map(([size, px]) => [variant, size, px] as const));

    it.each(cases)('home, %s, %s: no [style] in the host, the size class on the box, %s on the svg', (variant, size, px) => {
      const fixture = render({ name: 'home', variant, size });
      expect(styled(fixture)).toEqual([]);
      expect(classes(containerOf(fixture))).toEqual(['icon-container', `icon-${size}`, `icon-${variant}`].sort());
      const svg = svgOf(fixture);
      expect(svg?.getAttribute('width')).toBe(px);
      expect(svg?.getAttribute('height')).toBe(px);
    });

    it.each([
      ['decorative', { name: 'clock', decorative: true }],
      ['labelled', { name: 'shield-check', ariaLabel: 'Geschützt' }],
      ['the placeholder for an unknown name', { name: 'beaker' }],
      ['currentColor in another letter case', { name: 'home', color: 'CURRENTCOLOR' }],
      ['an empty colour', { name: 'home', color: ' ' }],
    ])('%s: no [style]', (_label, inputs) => {
      jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      const fixture = render(inputs);
      expect(svgOf(fixture)).not.toBeNull();
      expect(styled(fixture)).toEqual([]);
    });

    it('a fetched icon: no [style] while it loads and after', () => {
      const fixture = render({ name: 'anchor', size: 'lg' });
      expect(containerOf(fixture).childNodes).toHaveLength(0);
      expect(styled(fixture)).toEqual([]);
      httpMock.expectOne('/tabler-icons/outline/anchor.svg').flush(FETCHED_SVG);
      fixture.detectChanges();
      expect(svgOf(fixture)?.getAttribute('width')).toBe('32px');
      expect(styled(fixture)).toEqual([]);
    });
  });

  describe('AC-2 (unit side): on the server', () => {
    beforeEach(() => setup('server'));

    it.each([
      ['a bundled glyph, labelled', { name: 'home', ariaLabel: 'Start' }],
      ['a bundled glyph, decorative', { name: 'clock', decorative: true, size: 'sm' }],
      ['the placeholder', { name: 'beaker' }],
    ])('%s serialises without style=', (_label, inputs) => {
      jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      const fixture = render(inputs);
      expect(svgOf(fixture)).not.toBeNull();
      expect(hostOf(fixture).outerHTML).not.toContain('style=');
    });

    it('a custom colour is a style on the svg only (the documented exception)', () => {
      const fixture = render({ name: 'check', color: 'var(--color-primary-500)' });
      expect(styled(fixture)).toEqual([svgOf(fixture)]);
      expect(svgOf(fixture)?.style.color).toBe('var(--color-primary-500)');
    });
  });

  describe('AC-5: a custom colour goes through CSSOM only', () => {
    it.each([
      ['#FF5733', 'rgb(255, 87, 51)'],
      ['var(--color-primary-500)', 'var(--color-primary-500)'],
    ])('%s colours the svg, written without setAttribute("style")', (color, expected) => {
      const setAttribute = jest.spyOn(Element.prototype, 'setAttribute');
      const inline = render({ name: 'home', color });
      const fetched = render({ name: 'anchor', color });
      httpMock.expectOne('/tabler-icons/outline/anchor.svg').flush(FETCHED_SVG);
      fetched.detectChanges();
      for (const fixture of [inline, fetched]) {
        expect(svgOf(fixture)?.style.color).toBe(expected);
        expect(styled(fixture)).toEqual([svgOf(fixture)]);
      }
      expect(setAttribute.mock.calls.filter(([name]) => name.toLowerCase() === 'style')).toEqual([]);
    });
  });

  describe('AC-6: no stale style or size class', () => {
    it('custom → default colour leaves no style attribute, on an inline icon', () => {
      const fixture = render({ name: 'home', color: '#FF5733' });
      const svg = svgOf(fixture);
      expect(svg?.style.color).toBe('rgb(255, 87, 51)');
      fixture.componentRef.setInput('color', 'currentColor');
      fixture.detectChanges();
      expect(svgOf(fixture)).toBe(svg);
      expect(svg?.hasAttribute('style')).toBe(false);
      expect(styled(fixture)).toEqual([]);
    });

    it('custom → default colour leaves no style attribute, on a fetched icon', () => {
      const fixture = render({ name: 'anchor', color: '#FF5733' });
      httpMock.expectOne('/tabler-icons/outline/anchor.svg').flush(FETCHED_SVG);
      fixture.detectChanges();
      expect(svgOf(fixture)?.style.color).toBe('rgb(255, 87, 51)');
      fixture.componentRef.setInput('color', 'currentColor');
      fixture.detectChanges();
      expect(svgOf(fixture)?.hasAttribute('style')).toBe(false);
      expect(styled(fixture)).toEqual([]);
    });

    it.each([
      ['an inline icon', 'home'],
      ['a fetched icon', 'anchor'],
    ])('xl → xs on %s: icon-xs only, 16px on the svg', (_label, name) => {
      const fixture = render({ name, size: 'xl' });
      if (name === 'anchor') {
        httpMock.expectOne('/tabler-icons/outline/anchor.svg').flush(FETCHED_SVG);
        fixture.detectChanges();
      }
      expect(containerOf(fixture).classList.contains('icon-xl')).toBe(true);
      fixture.componentRef.setInput('size', 'xs');
      fixture.detectChanges();
      expect(classes(containerOf(fixture))).toEqual(['icon-container', 'icon-outline', 'icon-xs']);
      expect(svgOf(fixture)?.getAttribute('width')).toBe('16px');
      expect(styled(fixture)).toEqual([]);
    });

    it('taking back a custom colour keeps any other inline property of the svg', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.opacity = '0.5';
      const decoration = { size: '24px', decorative: true, label: undefined };
      decorateSvg(svg, { ...decoration, color: '#FF5733' });
      expect(svg.style.color).toBe('rgb(255, 87, 51)');
      decorateSvg(svg, { ...decoration, color: 'currentColor' });
      expect(svg.style.color).toBe('');
      expect(svg.style.opacity).toBe('0.5');
    });
  });

  describe('the default colour', () => {
    it.each([
      ['currentColor', true],
      ['currentcolor', true],
      [' CurrentColor ', true],
      ['', true],
      ['  ', true],
      ['#FF5733', false],
      ['var(--color-primary-500)', false],
      ['inherit', false],
    ])('isDefaultIconColor(%j) is %s', (color, expected) => {
      expect(isDefaultIconColor(color)).toBe(expected);
    });
  });

  describe('AC-11: the defaults render as before', () => {
    it('keeps the default inputs and internals', () => {
      const fixture = render({ name: 'home' });
      const icon = fixture.componentInstance;
      expect(icon.size()).toBe('md');
      expect(icon.color()).toBe('currentColor');
      expect(icon.sizeInPixels()).toBe('24px');
      expect(icon.colorStyle()).toBe('currentColor');
      expect(icon.computedClasses()).toBe('icon-container icon-md icon-outline');
      expect(containerOf(fixture).className).toBe('icon-container icon-md icon-outline');
      expect(svgOf(fixture)?.getAttribute('role')).toBe('img');
    });
  });

  describe('Stylesheet contract (AC-3, AC-4)', () => {
    it.each(SIZES)('.icon-%s is %s × %s', (size, px) => {
      const block = rule(`.icon-${size}`);
      expect(block).toContain(`width: ${px};`);
      expect(block).toContain(`height: ${px};`);
    });

    it('the svg fills the box and inherits the colour; no other colour rule', () => {
      const svg = rule('.icon-container ::ng-deep svg');
      expect(svg).toContain('width: 100%;');
      expect(svg).toContain('height: 100%;');
      expect(svg).toContain('color: inherit;');
      expect(css.match(/(^|[\s;{])color:[^;]*;/g)?.map((d) => d.trim())).toEqual(['color: inherit;']);
    });
  });
});
