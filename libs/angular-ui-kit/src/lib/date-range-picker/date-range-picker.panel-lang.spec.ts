import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { DateRangePickerComponent } from './date-range-picker.component';

/**
 * 3.30.2 (request 049, follow-up 048-f1, WCAG 3.1.2 Language of Parts): the
 * panel is rendered inside the host, so a `[lang]` ancestor already reaches
 * it through the DOM and it gets no attribute of its own; only without any
 * `[lang]` it takes `locale` (default `de-DE`). Design 049 §1, §9; AC-5, AC-6.
 */
@Component({
  standalone: true,
  imports: [DateRangePickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrapper" [attr.lang]="lang()">
      @if (locale(); as l) {
        <lc-date-range-picker label="Zeitraum" [locale]="l" />
      } @else {
        <lc-date-range-picker label="Zeitraum" />
      }
    </div>
  `,
})
class Host {
  readonly lang = signal<string | null>(null);
  /** `null` leaves `locale` unbound, so its default applies. */
  readonly locale = signal<string | null>(null);
}

const attributeNames = (el: Element): string =>
  el
    .getAttributeNames()
    .filter((n) => !n.startsWith('_ng'))
    .sort()
    .join(' ');

describe('lc-date-range-picker 3.30.2 panel language (request 049)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const root = () => fixture.nativeElement as HTMLElement;
  const panel = () => root().querySelector<HTMLElement>('.lc-drp__dropdown');

  const create = (patch: Partial<{ lang: string | null; locale: string | null }> = {}) => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    if (patch.lang !== undefined) host.lang.set(patch.lang);
    if (patch.locale !== undefined) host.locale.set(patch.locale);
    fixture.detectChanges();
  };
  const toggle = () => {
    root().querySelector<HTMLButtonElement>('.lc-drp__trigger')?.click();
    fixture.detectChanges();
  };

  afterEach(() => fixture?.destroy());

  it('the test page has no <html lang>', () => {
    expect(document.documentElement.hasAttribute('lang')).toBe(false);
  });

  describe('AC-5: in a [lang] wrapper the panel inherits it', () => {
    it('resolves to the wrapper\'s "de" through the DOM and has no lang of its own', () => {
      create({ lang: 'de' });
      toggle();
      expect(panel()?.getAttribute('role')).toBe('dialog');
      expect(panel()?.closest('[lang]')?.getAttribute('lang')).toBe('de');
      expect(panel()?.hasAttribute('lang')).toBe(false);
      expect(attributeNames(panel() as HTMLElement)).toBe('aria-label class id role');
    });

    it('keeps the wrapper\'s language over locale (lang="en" + locale="de-DE" → inherits en)', () => {
      create({ lang: 'en', locale: 'de-DE' });
      toggle();
      expect(panel()?.hasAttribute('lang')).toBe(false);
      expect(panel()?.closest('[lang]')?.getAttribute('lang')).toBe('en');
    });
  });

  describe('AC-5: without any [lang] the panel takes locale', () => {
    it('is lang="de-DE" with the default locale', () => {
      create();
      toggle();
      expect(panel()?.getAttribute('lang')).toBe('de-DE');
      expect(panel()?.closest('[lang]')).toBe(panel());
    });

    it('is lang="en-GB" with locale="en-GB"', () => {
      create({ locale: 'en-GB' });
      toggle();
      expect(panel()?.getAttribute('lang')).toBe('en-GB');
    });
  });

  describe('AC-6: read at every opening', () => {
    it('drops its own lang at the next opening once a wrapper lang appears while closed', () => {
      create();
      toggle();
      expect(panel()?.getAttribute('lang')).toBe('de-DE');
      toggle();
      expect(panel()).toBeNull();
      host.lang.set('fr');
      fixture.detectChanges();
      toggle();
      expect(panel()?.hasAttribute('lang')).toBe(false);
      expect(panel()?.closest('[lang]')?.getAttribute('lang')).toBe('fr');
    });
  });

  describe('AC-7: the closed field is unchanged', () => {
    it('has no lang attribute at rest', () => {
      create();
      const field = root().querySelector('lc-date-range-picker') as HTMLElement;
      expect(field.hasAttribute('lang')).toBe(false);
      expect(field.querySelectorAll('[lang]')).toHaveLength(0);
    });
  });
});
