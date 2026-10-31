import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { INLINE_TABLER_SVGS } from '@lifecorner/angular-ui-kit/internal/icon-set';
import { isValidIconName } from '@lifecorner/angular-ui-kit/icon-names';
import { IconComponent, IconVariant, resetIconCache, resetIconWarnings } from './icon.component';
import { ICON_ALIASES, isInlineIconName } from './icon-catalog';

/**
 * 3.16 (TD-3, request 022): `wallet` (the Finances destination), `building-bank`
 * (banks, connections) and `shield-lock` (the consent card) are in the inline
 * set, so they render with no request and no `provideLcIcons` registration.
 */
const FINANCE_ICONS = ['wallet', 'building-bank', 'shield-lock'] as const;

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

describe('finance icons in the inline set (3.16, TD-3)', () => {
  it.each(FINANCE_ICONS)('isInlineIconName("%s") is true and the name is valid (no ICON_NAMES warning)', (name) => {
    expect(isInlineIconName(name)).toBe(true);
    expect(isValidIconName(name)).toBe(true);
  });

  it('inlines the filled glyph only where Tabler has one (shield-lock)', () => {
    expect(isInlineIconName('shield-lock', 'solid')).toBe(true);
    expect(isInlineIconName('wallet', 'solid')).toBe(false);
    expect(isInlineIconName('building-bank', 'solid')).toBe(false);
  });

  it('keeps the alias account_balance → building-bank, now inline', () => {
    expect(ICON_ALIASES['account_balance']).toBe('building-bank');
    expect(isInlineIconName('account_balance')).toBe(true);
  });

  it.each(FINANCE_ICONS)('ships "%s" exactly as the generator writes it from Tabler', (name) => {
    expect(INLINE_TABLER_SVGS[name].outline).toBe(compact(readFileSync(TABLER(`outline/${name}.svg`), 'utf-8')));
  });

  it('ships the filled shield-lock exactly as the generator writes it', () => {
    expect(INLINE_TABLER_SVGS['shield-lock'].solid).toBe(compact(readFileSync(TABLER('filled/shield-lock.svg'), 'utf-8')));
    expect(INLINE_TABLER_SVGS['wallet'].solid).toBeUndefined();
    expect(INLINE_TABLER_SVGS['building-bank'].solid).toBeUndefined();
  });

  describe('lc-icon', () => {
    let fixture: ComponentFixture<IconComponent>;
    let httpMock: HttpTestingController;

    beforeEach(async () => {
      // No provideLcIcons: the kit's own set is loaded lazily.
      await TestBed.configureTestingModule({
        imports: [IconComponent],
        providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
      }).compileComponents();
      resetIconWarnings();
      resetIconCache();
      fixture = TestBed.createComponent(IconComponent);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
      for (const req of httpMock.match(() => true)) if (!req.cancelled) req.flush(MOCK_SVG);
      httpMock.verify();
    });

    const render = async (name: string, variant: IconVariant = 'outline'): Promise<string> => {
      fixture.componentRef.setInput('name', name);
      fixture.componentRef.setInput('variant', variant);
      fixture.detectChanges();
      await fixture.whenStable();
      return (fixture.nativeElement.querySelector('.icon-container') as HTMLElement).innerHTML;
    };

    it.each([...FINANCE_ICONS, 'account_balance'])('renders "%s" in outline without a request', async (name) => {
      const html = await render(name);
      httpMock.expectNone(() => true);
      expect(html).toContain('<svg');
      expect(html).toContain('stroke="currentColor"');
      expect(html).not.toContain('stroke-dasharray');
    });

    it('renders the filled shield-lock without a request', async () => {
      const html = await render('shield-lock', 'solid');
      httpMock.expectNone(() => true);
      expect(html).toContain('fill="currentColor"');
    });

    it('fetches filled/wallet.svg for variant="solid" (Tabler has no filled wallet; documented fallback)', async () => {
      await render('wallet', 'solid');
      httpMock.expectOne('/tabler-icons/filled/wallet.svg').flush(MOCK_SVG);
    });
  });
});
