import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { compile } from 'sass';
import { resolve } from 'path';
import { audit, violations } from '../../testing/axe-jsdom';
import { SelectComponent, type SelectOption, type SelectOptionGroup, type SelectValue } from './select.component';

/**
 * 3.42 (request 062, finance-intelligence services-prove row 1): option groups
 * render a header each; keyboard, ids and the option count stay on the flat
 * list (AC-8 to AC-10); the keyboard highlight scrolls into view (design D-6).
 */
const GROUPS: SelectOptionGroup[] = [
  {
    label: 'Kundenart',
    options: [
      { value: 'intern', label: 'Intern' },
      { value: 'extern', label: 'Extern' },
    ],
  },
  {
    label: 'Kunden',
    options: [
      { value: 'allianz', label: 'Allianz Lebensversicherungs-AG' },
      { value: 'swm', label: 'Stadtwerke Musterstadt Versorgungs- und Verkehrsgesellschaft mbH' },
      { value: 'ukm', label: 'Universitätsklinikum Musterstadt' },
    ],
  },
  {
    label: 'Kunden mit Leistungsverrechnungsvereinbarung',
    options: [{ value: 'ksk', label: 'Kreissparkasse Musterstadt' }],
  },
];

const FLAT: SelectOption[] = [
  { value: 'de', label: 'Deutschland' },
  { value: 'at', label: 'Österreich' },
];

@Component({
  imports: [SelectComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div lang="de">
      <lc-select
        ariaLabel="Kunde"
        noOptionsLabel="Keine Treffer"
        [searchable]="searchable()"
        [multiple]="multiple()"
        [options]="options()"
        (selectionChange)="values.push($event)"
      />
    </div>
  `,
})
class Host {
  readonly options = signal<SelectOption[] | SelectOptionGroup[]>(GROUPS);
  readonly searchable = signal(false);
  readonly multiple = signal(false);
  readonly values: SelectValue[] = [];
}

const css = compile(resolve(__dirname, 'select.component.scss')).css;

describe('lc-select option groups (3.42, request 062)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const root = () => fixture.nativeElement as HTMLElement;
  const trigger = () => root().querySelector('[role="combobox"]') as HTMLElement;
  const panel = () => document.querySelector('.cdk-overlay-container .lc-select__dropdown') as HTMLElement;
  const listbox = () => panel().querySelector('[role="listbox"]') as HTMLElement;
  const groups = () => Array.from(listbox().querySelectorAll(':scope > [role="group"]')) as HTMLElement[];
  const options = () => Array.from(listbox().querySelectorAll('[role="option"]')) as HTMLElement[];
  const key = (k: string) => {
    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    fixture.detectChanges();
  };
  const open = () => {
    trigger().click();
    fixture.detectChanges();
  };
  const search = async (text: string) => {
    const input = panel().querySelector('.lc-select__search-input') as HTMLInputElement;
    input.value = text;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  describe('AC-8: a header per group', () => {
    it('listbox > group (named by its header) > presentation header + options', () => {
      open();
      expect(groups()).toHaveLength(3);
      groups().forEach((group, g) => {
        const header = group.firstElementChild as HTMLElement;
        expect(header.className).toBe('lc-select__group-label');
        expect(header.getAttribute('role')).toBe('presentation');
        expect(header.id).toMatch(new RegExp(`^lc-select-\\d+-listbox-group-${g}$`));
        expect(group.getAttribute('aria-labelledby')).toBe(header.id);
        expect(group.className).toBe('lc-select__group');
        expect(header.textContent?.trim()).toBe(GROUPS[g].label);
        expect(Array.from(group.querySelectorAll('[role="option"]')).map((o) => o.textContent?.trim())).toEqual(
          GROUPS[g].options.map((o) => o.label),
        );
      });
    });

    it('options keep their flat ids 0…n−1, and a one-option group has its header', () => {
      open();
      const listboxId = listbox().id;
      expect(options().map((o) => o.id)).toEqual(Array.from({ length: 6 }, (_, i) => `${listboxId.replace('-listbox', '')}-option-${i}`));
      expect(groups()[2].querySelectorAll('[role="option"]')).toHaveLength(1);
    });

    it('a header is not selectable', () => {
      open();
      (groups()[1].firstElementChild as HTMLElement).click();
      fixture.detectChanges();
      expect(host.values).toEqual([]);
      expect(panel()).not.toBeNull();
    });

    it('search hides groups without hits; group ids stay, option ids are re-counted', async () => {
      host.searchable.set(true);
      fixture.detectChanges();
      open();
      await search('stadt');
      expect(groups().map((g) => g.firstElementChild?.textContent?.trim())).toEqual([
        'Kunden',
        'Kunden mit Leistungsverrechnungsvereinbarung',
      ]);
      expect(groups()[0].getAttribute('aria-labelledby')).toMatch(/-group-1$/);
      expect(groups()[1].getAttribute('aria-labelledby')).toMatch(/-group-2$/);
      expect(options().map((o) => o.id.replace(/^.*-option-/, ''))).toEqual(['0', '1', '2']);
    });

    it('nothing matches: the "no results" row, no groups', async () => {
      host.searchable.set(true);
      fixture.detectChanges();
      open();
      await search('zzz');
      expect(groups()).toHaveLength(0);
      expect(options()).toHaveLength(1);
      expect(options()[0].textContent?.trim()).toBe('Keine Treffer');
    });

    it('multiple mode: the same headers, a checkbox in each option', () => {
      host.multiple.set(true);
      fixture.detectChanges();
      open();
      expect(groups()).toHaveLength(3);
      expect(listbox().querySelectorAll('[role="option"] .lc-select__checkbox')).toHaveLength(6);
      options()[3].click();
      fixture.detectChanges();
      expect(host.values).toEqual([['swm']]);
      expect(options()[3].getAttribute('aria-selected')).toBe('true');
    });
  });

  describe('AC-9: keyboard and screen reader', () => {
    it('arrow keys move over the options only; aria-activedescendant points at an option', () => {
      open();
      key('ArrowDown');
      key('ArrowDown');
      key('ArrowDown');
      const active = trigger().getAttribute('aria-activedescendant') as string;
      const option = document.getElementById(active) as HTMLElement;
      expect(option.getAttribute('role')).toBe('option');
      expect(option.textContent?.trim()).toBe('Allianz Lebensversicherungs-AG');
      expect(option.classList).toContain('lc-select__option--highlighted');
      key('End');
      expect(document.getElementById(trigger().getAttribute('aria-activedescendant') as string)?.textContent?.trim()).toBe(
        'Kreissparkasse Musterstadt',
      );
      key('ArrowDown');
      expect(document.getElementById(trigger().getAttribute('aria-activedescendant') as string)?.textContent?.trim()).toBe('Intern');
    });

    it('Enter selects the highlighted option of a later group; aria-selected follows', () => {
      open();
      key('End');
      key('Enter');
      expect(host.values).toEqual(['ksk']);
      open();
      expect(options()[5].getAttribute('aria-selected')).toBe('true');
      expect(options().filter((o) => o.getAttribute('aria-selected') === 'true')).toHaveLength(1);
    });

    it('the listbox owns 6 options (headers are not counted)', () => {
      open();
      expect(options()).toHaveLength(6);
      expect(listbox().querySelectorAll('.lc-select__group-label[role="option"]')).toHaveLength(0);
    });

    it('axe has no violations in the open panel', async () => {
      open();
      key('ArrowDown');
      expect(violations(await audit(panel()))).toEqual([]);
    });
  });

  describe('D-6: the keyboard highlight scrolls into view', () => {
    /** Lays the rows out 37 px apart in a 200 px panel (jsdom has no layout). */
    const layout = () => {
      const p = panel();
      let scrollTop = 0;
      Object.defineProperty(p, 'scrollTop', {
        configurable: true,
        get: () => scrollTop,
        set: (v: number) => (scrollTop = v),
      });
      Object.defineProperty(p, 'clientHeight', { configurable: true, value: 200 });
      Object.defineProperty(p, 'clientTop', { configurable: true, value: 1 });
      p.getBoundingClientRect = () => ({ top: 100, bottom: 302 }) as DOMRect;
      const rows = Array.from(listbox().querySelectorAll('.lc-select__group-label, [role="option"]')) as HTMLElement[];
      rows.forEach((row, i) => {
        row.getBoundingClientRect = () => {
          const top = 101 + 8 + i * 37 - p.scrollTop;
          return { top, bottom: top + 37 } as DOMRect;
        };
      });
    };

    it('ArrowDown/End scroll down by the least amount, Home back to the first header', () => {
      open();
      layout();
      key('ArrowDown');
      expect(panel().scrollTop).toBe(0);
      key('End');
      // last row (index 8) bottom = 8 + 9 × 37 = 341 → scrollTop 341 − 200
      expect(panel().scrollTop).toBe(141);
      key('Home');
      // first option's header top = 8
      expect(panel().scrollTop).toBe(8);
    });

    it('ArrowUp to the first option of a group shows its header too', () => {
      open();
      layout();
      key('End');
      key('ArrowUp'); // Universitätsklinikum (row 6): visible, no scroll
      expect(panel().scrollTop).toBe(141);
      key('ArrowUp'); // Stadtwerke (row 5): visible
      key('ArrowUp'); // Allianz (row 4), header "Kunden" row 3 → top 8 + 3 × 37 = 119
      expect(panel().scrollTop).toBe(119);
    });

    it('hover does not scroll', () => {
      open();
      layout();
      options()[5].dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      expect(panel().scrollTop).toBe(0);
    });
  });

  describe('AC-10: flat options', () => {
    it('render no group markup', () => {
      host.options.set(FLAT);
      fixture.detectChanges();
      open();
      expect(listbox().querySelectorAll('.lc-select__group, .lc-select__group-label')).toHaveLength(0);
      expect(Array.from(listbox().children).map((c) => c.getAttribute('role'))).toEqual(['option', 'option']);
    });
  });

  describe('styles', () => {
    const rule = (selector: string) => {
      const start = css.indexOf(`\n${selector} {`);
      expect([selector, start > -1]).toEqual([selector, true]);
      return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
    };

    it('the header has the combobox header look and wraps hyphenated', () => {
      expect(rule('.lc-select__group-label')).toBe(
        'padding: var(--spacing-1-5) var(--lc-density-padding-sm, var(--spacing-3)); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); line-height: 1.5; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; overflow-wrap: break-word; hyphens: auto; hyphenate-limit-chars: 12 4 3; cursor: default; user-select: none;',
      );
    });

    it('groups after the first get a divider', () => {
      expect(rule('.lc-select__group + .lc-select__group')).toBe(
        'margin-top: var(--spacing-1); padding-top: var(--spacing-1); border-top: 1px solid var(--color-border);',
      );
    });
  });
});
