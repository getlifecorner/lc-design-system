import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { SelectComponent, type SelectOption } from './select.component';

/**
 * 3.31 (request 050, follow-up 049-f1, WCAG 3.1.2 Language of Parts): the
 * dropdown renders in the CDK overlay under `<body>`, outside the host's
 * `lang`, so it takes the host's closest `[lang]`, read at every opening.
 * Design 050 §1, §9; AC-1, AC-2.
 */
const COUNTRIES: SelectOption[] = ['Deutschland', 'Österreich', 'Schweiz'].map((label, i) => ({ value: `c${i}`, label }));

@Component({
  standalone: true,
  imports: [SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrapper" [attr.lang]="lang()">
      <lc-select
        ariaLabel="Land"
        placeholder="Land wählen"
        searchPlaceholder="Land suchen …"
        noOptionsLabel="Keine Treffer"
        [searchable]="searchable()"
        [options]="options"
      />
    </div>
  `,
})
class Host {
  readonly options = COUNTRIES;
  readonly lang = signal<string | null>(null);
  readonly searchable = signal(false);
}

/** The dropdown root in the overlay container. */
const dropdown = (): HTMLElement | null => document.querySelector('.cdk-overlay-container .lc-select__dropdown');
const attributeNames = (el: Element): string =>
  el
    .getAttributeNames()
    .filter((n) => !n.startsWith('_ng'))
    .sort()
    .join(' ');

describe('lc-select 3.31 dropdown language (request 050)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const trigger = () => (fixture.nativeElement as HTMLElement).querySelector('[role="combobox"]') as HTMLElement;

  const create = (patch: Partial<{ lang: string | null; searchable: boolean }> = {}) => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    if (patch.lang !== undefined) host.lang.set(patch.lang);
    if (patch.searchable) host.searchable.set(true);
    fixture.detectChanges();
  };
  /** Opens and closes the dropdown the way a user does: a click on the trigger. */
  const toggle = () => {
    trigger().click();
    fixture.detectChanges();
  };

  afterEach(() => fixture?.destroy());

  it('the test page has no <html lang>', () => {
    expect(document.documentElement.hasAttribute('lang')).toBe(false);
  });

  describe('AC-1: the closest [lang] of the host', () => {
    it('gives the open dropdown lang="de"', () => {
      create({ lang: 'de' });
      toggle();
      expect(dropdown()).not.toBeNull();
      expect(dropdown()?.getAttribute('lang')).toBe('de');
      expect(dropdown()?.closest('[lang]')?.getAttribute('lang')).toBe('de');
    });

    it('takes a region subtag as it is (fr-CH)', () => {
      create({ lang: 'fr-CH' });
      toggle();
      expect(dropdown()?.closest('[lang]')?.getAttribute('lang')).toBe('fr-CH');
    });

    it('covers the search field and the empty message inside the panel', () => {
      create({ lang: 'de', searchable: true });
      toggle();
      const search = dropdown()?.querySelector('.lc-select__search-input') as HTMLElement;
      expect(search.closest('[lang]')?.getAttribute('lang')).toBe('de');
      expect(dropdown()?.querySelectorAll('[role="option"]').length).toBe(3);
      for (const option of Array.from(dropdown()?.querySelectorAll('[role="option"]') ?? [])) {
        expect(option.closest('[lang]')?.getAttribute('lang')).toBe('de');
      }
    });

    it('adds lang and nothing else to the dropdown attributes', () => {
      create({ lang: 'de' });
      toggle();
      // 3.33 (request 052, D-6): + `style`, the field width as a private
      // custom property on the open panel (select.panel-width.spec.ts).
      expect(attributeNames(dropdown() as HTMLElement)).toBe('class lang style');
    });

    it('shows a host lang change made while closed at the next opening', () => {
      create({ lang: 'de' });
      toggle();
      expect(dropdown()?.getAttribute('lang')).toBe('de');
      toggle();
      expect(dropdown()).toBeNull();
      host.lang.set('fr');
      fixture.detectChanges();
      toggle();
      expect(dropdown()?.getAttribute('lang')).toBe('fr');
    });
  });

  describe('AC-2: no ancestor lang, closed', () => {
    it('renders no lang attribute when there is none', () => {
      create();
      toggle();
      expect(dropdown()).not.toBeNull();
      expect(dropdown()?.hasAttribute('lang')).toBe(false);
      // 3.33 (request 052, D-6): + `style` (the field width).
      expect(attributeNames(dropdown() as HTMLElement)).toBe('class style');
    });

    it('drops the attribute when the wrapper loses its lang while closed', () => {
      create({ lang: 'de' });
      toggle();
      toggle();
      host.lang.set(null);
      fixture.detectChanges();
      toggle();
      expect(dropdown()?.hasAttribute('lang')).toBe(false);
    });

    it('has no panel and no lang attribute in the field while closed', () => {
      create({ lang: 'de' });
      const field = (fixture.nativeElement as HTMLElement).querySelector('lc-select') as HTMLElement;
      expect(dropdown()).toBeNull();
      expect(field.hasAttribute('lang')).toBe(false);
      expect(field.querySelectorAll('[lang]')).toHaveLength(0);
    });
  });
});
