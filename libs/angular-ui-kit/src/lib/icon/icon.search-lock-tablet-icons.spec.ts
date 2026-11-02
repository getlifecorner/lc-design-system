import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { INLINE_TABLER_SVGS } from '@lifecorner/angular-ui-kit/internal/icon-set';
import { isValidIconName } from '@lifecorner/angular-ui-kit/icon-names';
import { BUNDLED_ICONS, ICON_DEVICE_TABLET, ICON_LOCK, ICON_SEARCH } from '@lifecorner/angular-ui-kit/icons';
import { IconComponent, IconVariant, resetIconCache, resetIconWarnings } from './icon.component';
import { ICON_ALIASES, isInlineIconName } from './icon-catalog';
import { resetIconRendering } from './icon-dom';
import { resolveInlineGlyph } from './icon-inline-lookup';
import { provideLcIcons } from './icon-registry';
import { resetIconSet } from './icon-set-loader';

/**
 * 3.22 (BA-6, BA-7, request 030): `search` (the magnifier, alias
 * `magnifying-glass`), `lock` (aliases `lock-closed`, `locked`) and
 * `device-tablet` are in the inline set, plus the glyphs lc-log-viewer,
 * lc-code-block, lc-copy-field and lc-kanban-board draw (`player-play`,
 * `player-pause`, `clipboard`, `arrow-down`), so those components can register
 * them. They render with no request; an app registers `ICON_LOCK`, … like
 * any other constant.
 */
const NEW_KEYS = ['search', 'lock', 'device-tablet', 'player-play', 'player-pause', 'clipboard', 'arrow-down'] as const;

/** Name as written → the inline key it resolves to. */
const RESOLVES: Array<[string, string]> = [
  ['magnifying-glass', 'search'],
  ['search', 'search'],
  ['lock', 'lock'],
  ['lock-closed', 'lock'],
  ['locked', 'lock'],
  ['device-tablet', 'device-tablet'],
  ['player-play', 'player-play'],
  ['player-pause', 'player-pause'],
  ['clipboard-document', 'clipboard'],
  ['clipboard', 'clipboard'],
  ['arrow-down', 'arrow-down'],
];

const TABLER = (path: string) => resolve(__dirname, '../../../../../node_modules/@tabler/icons/icons', path);

/** The generator's transform (`scripts/generate-icon-names.mjs`, readTablerSvg). */
const compact = (svg: string) =>
  svg
    .replace(/\s+/g, ' ')
    .replace(/<path stroke="none" d="M0 0h24v24H0z" fill="none" ?\/>/g, '')
    .replace(/ (class|width|height)="[^"]*"/g, '')
    .replace(/\s*(\/?>)\s*/g, '$1')
    .trim();

const MOCK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0"/></svg>';

const isPlaceholder = (svg: Element | null) => !!svg && Array.from(svg.children).map((c) => c.tagName).join(',') === 'rect,text';

describe('search, lock and device-tablet in the inline set (3.22, BA-6, BA-7)', () => {
  it.each(RESOLVES)('resolveInlineGlyph("%s") is the inline key "%s"; the name is valid', (name, key) => {
    expect(resolveInlineGlyph(name, 'outline')).toBe(key);
    expect(isInlineIconName(name)).toBe(true);
    expect(isValidIconName(name)).toBe(true);
  });

  it('keeps magnifying-glass, lock-closed, locked and clipboard-document as aliases (no second key)', () => {
    expect(ICON_ALIASES['magnifying-glass']).toBe('search');
    expect(ICON_ALIASES['lock-closed']).toBe('lock');
    expect(ICON_ALIASES['locked']).toBe('lock');
    expect(ICON_ALIASES['clipboard-document']).toBe('clipboard');
    expect(Object.keys(INLINE_TABLER_SVGS)).not.toContain('magnifying-glass');
    expect(BUNDLED_ICONS.map((icon) => icon.name)).not.toContain('magnifying-glass');
  });

  it.each(NEW_KEYS)('ships the outline "%s" exactly as the generator writes it from Tabler', (name) => {
    expect(INLINE_TABLER_SVGS[name].outline).toBe(compact(readFileSync(TABLER(`outline/${name}.svg`), 'utf-8')));
  });

  it.each(NEW_KEYS.filter((name) => name !== 'arrow-down'))('ships the filled "%s" exactly as the generator writes it', (name) => {
    expect(INLINE_TABLER_SVGS[name].solid).toBe(compact(readFileSync(TABLER(`filled/${name}.svg`), 'utf-8')));
    expect(isInlineIconName(name, 'solid')).toBe(true);
  });

  it('has no filled arrow-down (Tabler has none; variant="solid" is fetched as before)', () => {
    expect(INLINE_TABLER_SVGS['arrow-down'].solid).toBeUndefined();
    expect(isInlineIconName('arrow-down', 'solid')).toBe(false);
  });

  it('the constants are the inline markup (one copy of the artwork per glyph)', () => {
    expect(ICON_SEARCH).toEqual({ name: 'search', variant: 'outline', svg: INLINE_TABLER_SVGS['search'].outline });
    expect(ICON_LOCK).toEqual({ name: 'lock', variant: 'outline', svg: INLINE_TABLER_SVGS['lock'].outline });
    expect(ICON_DEVICE_TABLET).toEqual({ name: 'device-tablet', variant: 'outline', svg: INLINE_TABLER_SVGS['device-tablet'].outline });
  });

  describe('lc-icon with no registration (the lazy kit set)', () => {
    let fixture: ComponentFixture<IconComponent>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [IconComponent],
        providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
      }).compileComponents();
      resetIconWarnings();
      resetIconCache();
      resetIconRendering();
      resetIconSet();
      fixture = TestBed.createComponent(IconComponent);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      for (const req of httpMock.match(() => true)) if (!req.cancelled) req.flush(MOCK_SVG);
      httpMock.verify();
    });

    const render = async (name: string, variant: IconVariant = 'outline'): Promise<Element | null> => {
      fixture.componentRef.setInput('name', name);
      fixture.componentRef.setInput('variant', variant);
      fixture.detectChanges();
      await fixture.whenStable();
      return (fixture.nativeElement as HTMLElement).querySelector('.icon-container > svg');
    };

    it.each(RESOLVES.map(([name]) => name))('renders "%s" in outline without a request', async (name) => {
      const svg = await render(name);
      expect(httpMock.match(() => true)).toEqual([]);
      expect(svg?.getAttribute('stroke')).toBe('currentColor');
      expect(isPlaceholder(svg)).toBe(false);
    });

    it.each(['search', 'lock', 'device-tablet'])('renders the filled "%s" without a request', async (name) => {
      const svg = await render(name, 'solid');
      expect(httpMock.match(() => true)).toEqual([]);
      expect(svg?.getAttribute('fill')).toBe('currentColor');
    });
  });

  // AC-5 and design D5: the life-os setup. A glyph the app draws follows the
  // app's setting: registered, it draws; unregistered, it shows the placeholder.
  describe("lc-icon under provideLcIcons([ICON_LOCK, ICON_DEVICE_TABLET], { unregistered: 'placeholder' })", () => {
    let httpMock: HttpTestingController;
    let warnSpy: jest.SpyInstance;

    function setup(providers: unknown[]): void {
      TestBed.configureTestingModule({
        imports: [IconComponent],
        providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), ...(providers as never[])],
      });
      httpMock = TestBed.inject(HttpTestingController);
    }

    beforeEach(() => {
      resetIconWarnings();
      resetIconCache();
      resetIconRendering();
      resetIconSet();
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      warnSpy.mockRestore();
      httpMock.verify();
    });

    function render(inputs: Record<string, unknown>): Element | null {
      const fixture = TestBed.createComponent(IconComponent);
      for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
      fixture.detectChanges();
      return (fixture.nativeElement as HTMLElement).querySelector('.icon-container > svg');
    }

    const paths = (svg: Element | null | string) =>
      Array.from((typeof svg === 'string' ? new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement : (svg as Element)).querySelectorAll('path')).map(
        (p) => p.getAttribute('d'),
      );

    it('draws a decorative lock, a labelled lock-closed (alias) and a labelled device-tablet; no warning, no request', () => {
      setup([provideLcIcons([ICON_LOCK, ICON_DEVICE_TABLET], { unregistered: 'placeholder' })]);
      const lock = render({ name: 'lock', size: 'xs', decorative: true });
      const closed = render({ name: 'lock-closed', ariaLabel: 'Gesperrt' });
      const tablet = render({ name: 'device-tablet', ariaLabel: 'Tablet' });
      for (const svg of [lock, closed, tablet]) expect(isPlaceholder(svg)).toBe(false);
      expect(paths(lock)).toEqual(paths(ICON_LOCK.svg));
      expect(paths(closed)).toEqual(paths(ICON_LOCK.svg));
      expect(paths(tablet)).toEqual(paths(ICON_DEVICE_TABLET.svg));
      expect([lock?.getAttribute('aria-hidden'), lock?.getAttribute('role'), lock?.getAttribute('aria-label')]).toEqual(['true', null, null]);
      expect([closed?.getAttribute('role'), closed?.getAttribute('aria-label'), closed?.getAttribute('aria-hidden')]).toEqual(['img', 'Gesperrt', null]);
      expect([tablet?.getAttribute('role'), tablet?.getAttribute('aria-label')]).toEqual(['img', 'Tablet']);
      expect(warnSpy).not.toHaveBeenCalled();
      expect(httpMock.match(() => true)).toEqual([]);
    });

    it('an app that registers nothing gets the placeholder for its own lock, and the warning names ICON_LOCK (D5)', () => {
      setup([provideLcIcons([], { unregistered: 'placeholder' })]);
      expect(isPlaceholder(render({ name: 'lock', ariaLabel: 'Nur für dich' }))).toBe(true);
      expect(warnSpy.mock.calls.map(([m]) => String(m))).toEqual([
        '[lc-icon] "lock" is not registered. Add ICON_LOCK from @lifecorner/angular-ui-kit/icons to provideLcIcons(). Rendering a placeholder instead.',
      ]);
      expect(httpMock.match(() => true)).toEqual([]);
    });

    it('the warning for magnifying-glass names ICON_SEARCH', () => {
      setup([provideLcIcons([], { unregistered: 'placeholder' })]);
      render({ name: 'magnifying-glass', decorative: true });
      expect(warnSpy.mock.calls.map(([m]) => String(m))).toEqual([
        '[lc-icon] "magnifying-glass" is not registered. Add ICON_SEARCH from @lifecorner/angular-ui-kit/icons to provideLcIcons(). Rendering a placeholder instead.',
      ]);
    });
  });
});
