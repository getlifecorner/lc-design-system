import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DatepickerComponent, type DatepickerGranularity } from './datepicker.component';

/**
 * 3.30.2 (request 049, follow-up 048-f1, WCAG 3.1.2 Language of Parts): the
 * panel renders in the CDK overlay under `<body>`, outside the host's `lang`,
 * so it takes the host's closest `[lang]`, else `locale`, else none, read at
 * every opening. Design 049 §1, §4, §9; AC-1 … AC-3, AC-6, AC-7.
 */
@Component({
  standalone: true,
  imports: [DatepickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrapper" [attr.lang]="lang()">
      <lc-datepicker [locale]="locale()" [granularity]="granularity()" />
    </div>
  `,
})
class Host {
  readonly lang = signal<string | null>(null);
  readonly locale = signal('');
  readonly granularity = signal<DatepickerGranularity>('day');
}

/** The panel root: the `role="dialog"` element in the overlay container (AC-1). */
const panel = (): HTMLElement | null => document.querySelector('.cdk-overlay-container [role="dialog"]');
const attributeNames = (el: Element): string =>
  el
    .getAttributeNames()
    .filter((n) => !n.startsWith('_ng'))
    .sort()
    .join(' ');

describe('lc-datepicker 3.30.2 panel language (request 049)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  let picker: DatepickerComponent;

  const create = (patch: Partial<{ lang: string | null; locale: string; granularity: DatepickerGranularity }> = {}) => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    if (patch.lang !== undefined) host.lang.set(patch.lang);
    if (patch.locale !== undefined) host.locale.set(patch.locale);
    if (patch.granularity) host.granularity.set(patch.granularity);
    fixture.detectChanges();
    picker = fixture.debugElement.query(By.directive(DatepickerComponent)).componentInstance;
  };
  const open = () => {
    picker.open();
    fixture.detectChanges();
  };
  const close = () => {
    picker.close();
    fixture.detectChanges();
  };

  afterEach(() => fixture?.destroy());

  it('the test page has no <html lang>, so only the wrapper and locale count', () => {
    expect(document.documentElement.hasAttribute('lang')).toBe(false);
  });

  describe('AC-1: an ancestor [lang] of the host', () => {
    it('gives the open panel lang="de"', () => {
      create({ lang: 'de' });
      open();
      expect(panel()?.getAttribute('lang')).toBe('de');
    });

    it('wins over locale (spec assumption 1): lang="en" + locale="de-DE" → en', () => {
      create({ lang: 'en', locale: 'de-DE' });
      open();
      expect(panel()?.getAttribute('lang')).toBe('en');
    });

    it('also marks the month panel (same root, same rule)', () => {
      create({ lang: 'de', locale: 'de-DE', granularity: 'month' });
      open();
      expect(panel()?.classList).toContain('lc-datepicker-calendar--month');
      expect(panel()?.getAttribute('lang')).toBe('de');
    });

    it('adds lang and nothing else to the panel attributes (AC-7, AC-8)', () => {
      create({ lang: 'de' });
      open();
      expect(attributeNames(panel() as HTMLElement)).toBe('aria-label class id lang role');
    });
  });

  describe('AC-2: no [lang] ancestor, locale set', () => {
    it('gives the panel lang="de-DE"', () => {
      create({ locale: 'de-DE' });
      open();
      expect(panel()?.getAttribute('lang')).toBe('de-DE');
    });

    it('follows a locale change while open (design §4)', () => {
      create({ locale: 'de-DE' });
      open();
      host.locale.set('fr-FR');
      fixture.detectChanges();
      expect(panel()?.getAttribute('lang')).toBe('fr-FR');
    });
  });

  describe('AC-3: no [lang] ancestor, no locale', () => {
    it('renders the panel without a lang attribute, as before', () => {
      create();
      open();
      expect(panel()).not.toBeNull();
      expect(panel()?.hasAttribute('lang')).toBe(false);
      expect(attributeNames(panel() as HTMLElement)).toBe('aria-label class id role');
    });
  });

  describe('AC-6: read at every opening', () => {
    it('shows a host lang change made while closed at the next opening', () => {
      create({ lang: 'de' });
      open();
      expect(panel()?.getAttribute('lang')).toBe('de');
      close();
      expect(panel()).toBeNull();
      host.lang.set('fr');
      fixture.detectChanges();
      open();
      expect(panel()?.getAttribute('lang')).toBe('fr');
    });

    it('drops back to locale when the wrapper loses its lang while closed', () => {
      create({ lang: 'de', locale: 'en-GB' });
      open();
      close();
      host.lang.set(null);
      fixture.detectChanges();
      open();
      expect(panel()?.getAttribute('lang')).toBe('en-GB');
    });
  });

  describe('AC-7: the closed field is unchanged', () => {
    it('has no lang attribute and no panel at rest, also after an open and close', () => {
      create({ lang: 'de', locale: 'de-DE' });
      const field = fixture.nativeElement.querySelector('lc-datepicker') as HTMLElement;
      expect(field.querySelectorAll('[lang]')).toHaveLength(0);
      expect(field.hasAttribute('lang')).toBe(false);
      expect(panel()).toBeNull();
      open();
      close();
      expect(field.querySelectorAll('[lang]')).toHaveLength(0);
      expect(document.querySelectorAll('.cdk-overlay-container [lang]')).toHaveLength(0);
    });
  });
});
