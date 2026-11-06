import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { ComboboxComponent, type ComboboxOption } from './combobox.component';

/**
 * 3.30.2 (request 049, follow-up 048-f1, WCAG 3.1.2 Language of Parts): the
 * dropdown renders in the CDK overlay under `<body>`, outside the host's
 * `lang`, so it takes the host's closest `[lang]` (the combobox has no
 * `locale`), read at every opening. Design 049 §1, §9; AC-4, AC-6, AC-7.
 */
const MONTHS: ComboboxOption[] = ['Juli', 'August'].map((name, i) => ({ value: `2026-0${7 + i}`, label: `${name} 2026` }));

@Component({
  standalone: true,
  imports: [ComboboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrapper" [attr.lang]="lang()">
      <lc-combobox label="Gilt ab" emptyMessage="Keine Treffer" [options]="options" [multiple]="multiple()" />
    </div>
  `,
})
class Host {
  readonly options = MONTHS;
  readonly lang = signal<string | null>(null);
  readonly multiple = signal(false);
}

/** The dropdown root: `.lc-combobox__dropdown`, `role="listbox"` (AC-4). */
const dropdown = (): HTMLElement | null => document.querySelector('.cdk-overlay-container .lc-combobox__dropdown');
const attributeNames = (el: Element): string =>
  el
    .getAttributeNames()
    .filter((n) => !n.startsWith('_ng'))
    .sort()
    .join(' ');

describe('lc-combobox 3.30.2 dropdown language (request 049)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const input = () => (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;

  const create = (patch: Partial<{ lang: string | null; multiple: boolean }> = {}) => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    if (patch.lang !== undefined) host.lang.set(patch.lang);
    if (patch.multiple) host.multiple.set(true);
    fixture.detectChanges();
  };
  /** Opens the dropdown the way a user does: focus on the input. */
  const open = () => {
    input().dispatchEvent(new Event('focus'));
    fixture.detectChanges();
  };
  const close = () => {
    input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
  };

  afterEach(() => fixture?.destroy());

  it('the test page has no <html lang>', () => {
    expect(document.documentElement.hasAttribute('lang')).toBe(false);
  });

  describe('AC-4: the closest [lang] of the host', () => {
    it('gives the open dropdown (role="listbox") lang="de"', () => {
      create({ lang: 'de' });
      open();
      expect(dropdown()?.getAttribute('role')).toBe('listbox');
      expect(dropdown()?.getAttribute('lang')).toBe('de');
    });

    it('renders no lang attribute when there is none', () => {
      create();
      open();
      expect(dropdown()).not.toBeNull();
      expect(dropdown()?.hasAttribute('lang')).toBe(false);
      // 3.33 (request 052, D-6): + `style`, the field width as a private
      // custom property on the open list (combobox.panel-width.spec.ts).
      expect(attributeNames(dropdown() as HTMLElement)).toBe('class id role style');
    });

    it('adds lang and nothing else to the dropdown attributes (AC-7, AC-8)', () => {
      create({ lang: 'de' });
      open();
      expect(attributeNames(dropdown() as HTMLElement)).toBe('class id lang role style');
    });

    it('keeps aria-multiselectable next to lang in multiple mode', () => {
      create({ lang: 'de', multiple: true });
      open();
      expect(attributeNames(dropdown() as HTMLElement)).toBe('aria-multiselectable class id lang role style');
    });

    it('keeps focus on the input (AC-8)', () => {
      create({ lang: 'de' });
      input().focus();
      fixture.detectChanges();
      expect(dropdown()?.getAttribute('lang')).toBe('de');
      expect(document.activeElement).toBe(input());
    });
  });

  describe('AC-6: read at every opening', () => {
    it('shows a host lang change made while closed at the next opening', () => {
      create({ lang: 'de' });
      open();
      expect(dropdown()?.getAttribute('lang')).toBe('de');
      close();
      expect(dropdown()).toBeNull();
      host.lang.set('fr');
      fixture.detectChanges();
      open();
      expect(dropdown()?.getAttribute('lang')).toBe('fr');
    });

    it('drops the attribute when the wrapper loses its lang while closed', () => {
      create({ lang: 'de' });
      open();
      close();
      host.lang.set(null);
      fixture.detectChanges();
      open();
      expect(dropdown()?.hasAttribute('lang')).toBe(false);
    });
  });

  describe('AC-7: the closed field is unchanged', () => {
    it('has no lang attribute at rest', () => {
      create({ lang: 'de' });
      const field = fixture.nativeElement.querySelector('lc-combobox') as HTMLElement;
      expect(field.hasAttribute('lang')).toBe(false);
      expect(field.querySelectorAll('[lang]')).toHaveLength(0);
      expect(dropdown()).toBeNull();
    });
  });
});
