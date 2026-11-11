import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { INLINE_TABLER_NAMES, INLINE_TABLER_SVGS } from '@lifecorner/angular-ui-kit/internal/icon-set';
import { isValidIconName } from '@lifecorner/angular-ui-kit/icon-names';
import {
  ICON_GIFT,
  ICON_GIFT_SOLID,
  ICON_HEART,
  ICON_HEART_SOLID,
  ICON_SHOPPING_BAG,
  ICON_TARGET,
} from '@lifecorner/angular-ui-kit/icons';
import { IconComponent, IconVariant, resetIconCache, resetIconWarnings } from './icon.component';
import { isInlineIconName } from './icon-catalog';
import { resetIconRendering } from './icon-dom';
import { resolveInlineGlyph } from './icon-inline-lookup';
import { resetIconSet } from './icon-set-loader';

/**
 * 3.40 (request 060, life-os G-HV1, AC-1 to AC-3, design D-1): the glyphs of
 * the life areas on a public website, `shopping-bag` (shopping), `target`
 * (goals), `heart` (health) and `gift` (people who matter), are in the inline
 * set. Tabler has filled `heart` and `gift`, so those two ship a solid glyph
 * too. They render with no request; an app registers `ICON_HEART`, … like any
 * other constant.
 */
const NEW_KEYS = ['shopping-bag', 'target', 'heart', 'gift'] as const;
const WITH_SOLID = ['heart', 'gift'] as const;

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

describe('shopping-bag, target, heart and gift in the inline set (3.40, G-HV1)', () => {
  it('appends the four to the generator list, after arrow-down', () => {
    expect(INLINE_TABLER_NAMES.slice(-5)).toEqual(['arrow-down', ...NEW_KEYS]);
    const script = readFileSync(resolve(__dirname, '../../../../../scripts/generate-icon-names.mjs'), 'utf-8');
    expect(script).toContain("'shopping-bag', 'target', 'heart', 'gift',");
  });

  it.each(NEW_KEYS)('"%s" resolves to its own inline key; the name is valid', (name) => {
    expect(resolveInlineGlyph(name, 'outline')).toBe(name);
    expect(isInlineIconName(name)).toBe(true);
    expect(isValidIconName(name)).toBe(true);
  });

  it.each(NEW_KEYS)('ships the outline "%s" exactly as the generator writes it from Tabler', (name) => {
    expect(INLINE_TABLER_SVGS[name].outline).toBe(compact(readFileSync(TABLER(`outline/${name}.svg`), 'utf-8')));
  });

  it.each(WITH_SOLID)('ships the filled "%s" exactly as the generator writes it', (name) => {
    expect(INLINE_TABLER_SVGS[name].solid).toBe(compact(readFileSync(TABLER(`filled/${name}.svg`), 'utf-8')));
    expect(isInlineIconName(name, 'solid')).toBe(true);
  });

  it.each(['shopping-bag', 'target'])('has no filled "%s" (Tabler has none; variant="solid" is fetched as before)', (name) => {
    expect(INLINE_TABLER_SVGS[name].solid).toBeUndefined();
    expect(isInlineIconName(name, 'solid')).toBe(false);
  });

  it('AC-1: the constants are the inline markup, drawn in currentColor with no fixed size', () => {
    const outline = [ICON_SHOPPING_BAG, ICON_TARGET, ICON_HEART, ICON_GIFT];
    expect(outline.map((icon) => [icon.name, icon.variant, icon.svg])).toEqual(NEW_KEYS.map((name) => [name, 'outline', INLINE_TABLER_SVGS[name].outline]));
    expect(ICON_HEART_SOLID).toEqual({ name: 'heart', variant: 'solid', svg: INLINE_TABLER_SVGS['heart'].solid });
    expect(ICON_GIFT_SOLID).toEqual({ name: 'gift', variant: 'solid', svg: INLINE_TABLER_SVGS['gift'].solid });
    for (const icon of outline) {
      expect([icon.name, icon.svg]).toEqual([icon.name, expect.stringContaining('stroke="currentColor"')]);
      expect(icon.svg).not.toMatch(/ (width|height)="/);
    }
    for (const icon of [ICON_HEART_SOLID, ICON_GIFT_SOLID]) expect(icon.svg).toContain('fill="currentColor"');
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

    const render = async (inputs: Record<string, unknown>, variant: IconVariant = 'outline'): Promise<Element | null> => {
      for (const [key, value] of Object.entries({ ...inputs, variant })) fixture.componentRef.setInput(key, value);
      fixture.detectChanges();
      await fixture.whenStable();
      return (fixture.nativeElement as HTMLElement).querySelector('.icon-container > svg');
    };

    it.each(NEW_KEYS)('AC-2: renders "%s" in outline without a request, decorative by default', async (name) => {
      const svg = await render({ name, decorative: true });
      expect(httpMock.match(() => true)).toEqual([]);
      expect(svg?.getAttribute('stroke')).toBe('currentColor');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
    });

    it('AC-2: labelled, the glyph is an image with that name', async () => {
      const svg = await render({ name: 'heart', ariaLabel: 'Gesundheit' });
      expect([svg?.getAttribute('role'), svg?.getAttribute('aria-label'), svg?.getAttribute('aria-hidden')]).toEqual(['img', 'Gesundheit', null]);
    });

    it.each(WITH_SOLID)('renders the filled "%s" without a request', async (name) => {
      const svg = await render({ name, decorative: true }, 'solid');
      expect(httpMock.match(() => true)).toEqual([]);
      expect(svg?.getAttribute('fill')).toBe('currentColor');
    });
  });
});
