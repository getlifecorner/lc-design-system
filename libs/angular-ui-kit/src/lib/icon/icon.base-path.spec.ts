import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import type { Provider } from '@angular/core';
import { INLINE_ICON_SVGS } from '@lifecorner/angular-ui-kit/internal/icon-set';
import { ICON_MINUS, ICON_MINUS_SOLID, ICON_PLUS } from '@lifecorner/angular-ui-kit/icons';
import * as ICON_ENTRY from './index';
import { IconComponent, IconVariant, LC_ICON_BASE_PATH, resetIconCache, resetIconWarnings } from './icon.component';
import { isInlineIconName } from './icon-catalog';

/**
 * 3.42 (request 062, usm-x rows 1 and 2): `LC_ICON_BASE_PATH` (AC-11, AC-12)
 * and the hand-picked `minus` (AC-13).
 */
const MOCK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0"/></svg>';

describe('lc-icon base path and minus (3.42, request 062)', () => {
  let httpMock: HttpTestingController;

  const setup = async (providers: Provider[] = []) => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), ...providers],
    }).compileComponents();
    resetIconWarnings();
    resetIconCache();
    httpMock = TestBed.inject(HttpTestingController);
  };

  const render = async (name: string, variant: IconVariant = 'outline') => {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', name);
    fixture.componentRef.setInput('variant', variant);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  };

  afterEach(() => {
    for (const req of httpMock.match(() => true)) if (!req.cancelled) req.flush(MOCK_SVG);
    httpMock.verify();
  });

  it('AC-11: LC_ICON_BASE_PATH is exported from the icon entry', async () => {
    await setup();
    expect((ICON_ENTRY as Record<string, unknown>)['LC_ICON_BASE_PATH']).toBe(LC_ICON_BASE_PATH);
    expect(TestBed.inject(LC_ICON_BASE_PATH)).toBe('/tabler-icons');
  });

  it('AC-12: the default fetches exactly /tabler-icons/<variant>/<name>.svg as before', async () => {
    await setup();
    const fixture = await render('rocket');
    expect(fixture.componentInstance.iconPath()).toBe('/tabler-icons/outline/rocket.svg');
    httpMock.expectOne('/tabler-icons/outline/rocket.svg').flush(MOCK_SVG);
    await render('rocket', 'solid');
    httpMock.expectOne('/tabler-icons/filled/rocket.svg').flush(MOCK_SVG);
  });

  it('AC-11: a sub-path base with a trailing slash builds /usmx/tabler-icons/outline/<name>.svg', async () => {
    await setup([{ provide: LC_ICON_BASE_PATH, useValue: '/usmx/tabler-icons/' }]);
    await render('rocket');
    httpMock.expectOne('/usmx/tabler-icons/outline/rocket.svg').flush(MOCK_SVG);
    await render('rocket', 'solid');
    httpMock.expectOne('/usmx/tabler-icons/filled/rocket.svg').flush(MOCK_SVG);
  });

  it('AC-11: a relative base stays relative (the browser resolves it against <base href>)', async () => {
    await setup([{ provide: LC_ICON_BASE_PATH, useValue: 'tabler-icons' }]);
    await render('rocket');
    httpMock.expectOne('tabler-icons/outline/rocket.svg').flush(MOCK_SVG);
  });

  it('AC-11: inline names are never fetched, whatever the base', async () => {
    await setup([{ provide: LC_ICON_BASE_PATH, useValue: '/usmx/tabler-icons' }]);
    await render('minus');
    await render('plus');
    httpMock.expectNone(() => true);
  });

  describe('AC-13: minus', () => {
    it('is a hand-picked inline name right after plus, the plus\'s horizontal stroke', () => {
      const keys = Object.keys(INLINE_ICON_SVGS);
      expect(keys.indexOf('minus')).toBe(keys.indexOf('plus') + 1);
      expect(isInlineIconName('minus')).toBe(true);
      expect(isInlineIconName('minus', 'solid')).toBe(true);
      expect(ICON_MINUS).toEqual({ name: 'minus', variant: 'outline', svg: INLINE_ICON_SVGS['minus'].outline });
      expect(ICON_MINUS_SOLID).toEqual({ name: 'minus', variant: 'solid', svg: INLINE_ICON_SVGS['minus'].solid });
      // Same <svg> wrapper as plus; the path is plus's second stroke.
      expect(ICON_MINUS.svg).toBe(ICON_PLUS.svg.replace('d="M12 4.5v15m7.5-7.5h-15"', 'd="M19.5 12h-15"'));
      expect(ICON_MINUS_SOLID.svg).toContain('d="M3.75 12a.75.75 0 0 1 .75-.75h15a.75.75 0 0 1 0 1.5h-15a.75.75 0 0 1-.75-.75Z"');
    });
  });
});
