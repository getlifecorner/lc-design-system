import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { audit, violations } from '../../testing/axe-jsdom';
import { MenuComponent, type MenuItem } from './menu.component';

/**
 * Request 063 (usm-x row 12, design §2/§3/§6/§9): `MenuItem.children` makes
 * an item a section with a heading; `indentChildren` indents its items.
 */
const SECTIONS: MenuItem[] = [
  {
    id: 'view',
    label: 'Diese Ansicht',
    icon: 'ignored',
    dividerAfter: true,
    children: [
      { id: 'columns', label: 'Spalten anpassen', icon: 'columns' },
      { id: 'reset', label: 'Ansicht zurücksetzen', icon: 'refresh' },
    ],
  },
  {
    id: 'export',
    label: 'Exportieren',
    indentChildren: true,
    children: [
      // 3.50 (request 071, usm-x row 78, AC-9): a member's `children` are no
      // longer ignored but nest as a section (menu.nested.spec.ts), so this
      // member lost the `children` that only proved them ignored.
      { id: 'csv', label: 'Als CSV-Datei', href: '#csv' },
      { id: 'pdf', label: 'Als PDF-Datei', disabled: true },
    ],
  },
  { id: 'empty', label: 'Leer', children: [] },
  { id: 'help', label: 'Hilfe' },
];

@Component({
  standalone: true,
  imports: [MenuComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-menu [items]="items()" [isOpen]="isOpen()" (itemClick)="clicked.push($event)" (closed)="isOpen.set(false)">
      <button trigger type="button" class="trigger">Ansicht</button>
    </lc-menu>
  `,
})
class SectionsHostComponent {
  readonly items = signal<MenuItem[]>(SECTIONS);
  readonly isOpen = signal(false);
  readonly clicked: MenuItem[] = [];
}

describe('MenuComponent sections (3.43, request 063)', () => {
  let fixture: ComponentFixture<SectionsHostComponent>;
  let host: SectionsHostComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const panel = () => el().querySelector('[role="menu"]') as HTMLElement;
  const items = () => Array.from(el().querySelectorAll<HTMLElement>('[role="menuitem"]'));
  const labels = () => items().map((i) => i.querySelector('.lc-menu__item-label')?.textContent);
  const keydown = (key: string) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    (document.activeElement ?? panel()).dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };
  const focused = () => (document.activeElement as HTMLElement).querySelector('.lc-menu__item-label')?.textContent;
  const open = () => {
    host.isOpen.set(true);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionsHostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(SectionsHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => (document.body as HTMLElement).focus());

  describe('AC-24: semantics', () => {
    it('renders each section as a group named by its hidden heading; members are menu items', () => {
      open();
      const groups = Array.from(panel().querySelectorAll<HTMLElement>('[role="group"]'));
      expect(groups).toHaveLength(2);
      const names = groups.map((g) => {
        const heading = el().querySelector(`#${g.getAttribute('aria-labelledby')}`) as HTMLElement;
        expect(heading.getAttribute('aria-hidden')).toBe('true');
        expect(heading.hasAttribute('tabindex')).toBe(false);
        expect(heading.classList.contains('lc-menu__section-heading')).toBe(true);
        expect(g.contains(heading)).toBe(true);
        return [heading.textContent?.trim(), g.querySelectorAll('[role="menuitem"]').length];
      });
      expect(names).toEqual([
        ['Diese Ansicht', 2],
        ['Exportieren', 2],
      ]);
      expect(labels()).toEqual(['Spalten anpassen', 'Ansicht zurücksetzen', 'Als CSV-Datei', 'Als PDF-Datei', 'Hilfe']);
    });

    it('a section ignores its icon; dividerAfter follows the whole group (3.50: member children nest, see menu.nested.spec.ts)', () => {
      open();
      const [view, exportGroup] = Array.from(panel().querySelectorAll<HTMLElement>('.lc-menu__section'));
      expect(view.querySelectorAll('lc-icon')).toHaveLength(2);
      expect(view.nextElementSibling?.tagName).toBe('HR');
      expect(exportGroup.querySelector('a[role="menuitem"]')?.getAttribute('href')).toBe('#csv');
    });

    it('indentChildren adds the indented class; an empty section is a heading without a group role', () => {
      open();
      const sections = Array.from(panel().querySelectorAll<HTMLElement>('.lc-menu__section'));
      expect(sections.map((s) => s.classList.contains('lc-menu__section--indented'))).toEqual([false, true, false]);
      expect(sections[2].hasAttribute('role')).toBe(false);
      expect(sections[2].hasAttribute('aria-labelledby')).toBe(false);
      expect(sections[2].textContent?.trim()).toBe('Leer');
    });

    it('itemClick gives the member; a disabled member stays silent', () => {
      open();
      items()[1].click();
      items()[3].click();
      expect(host.clicked.map((i) => i.id)).toEqual(['reset']);
    });

    it('axe: no violation with sections', async () => {
      open();
      expect(violations(await audit(el()))).toEqual([]);
    });
  });

  describe('AC-25: keys run over the items of every section, skipping headings and disabled items', () => {
    it('focuses the first member on open and gives it the roving tab stop', () => {
      open();
      expect(focused()).toBe('Spalten anpassen');
      expect(items().map((i) => i.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1', '-1']);
    });

    it('ArrowDown crosses sections, skips the disabled member and wraps; ArrowUp back', () => {
      open();
      const path = ['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown'].map((k) => (keydown(k), focused()));
      expect(path).toEqual(['Ansicht zurücksetzen', 'Als CSV-Datei', 'Hilfe', 'Spalten anpassen']);
      keydown('ArrowUp');
      expect(focused()).toBe('Hilfe');
      keydown('ArrowUp');
      expect(focused()).toBe('Als CSV-Datei');
    });

    it('Home and End', () => {
      open();
      keydown('End');
      expect(focused()).toBe('Hilfe');
      keydown('Home');
      expect(focused()).toBe('Spalten anpassen');
    });
  });

  describe('SCSS', () => {
    const css = compile(resolve(__dirname, 'menu.component.scss')).css;
    const body = (selector: string) => {
      const found = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => m[1].trim() === selector);
      expect([selector, found.length]).toEqual([selector, 1]);
      return found[0][2].replace(/\s+/g, ' ').trim();
    };

    it('the heading: 12 px semibold capitals in secondary ink, 8/16/4 at md', () => {
      expect(body('.lc-menu__section-heading')).toBe(
        'padding: var(--spacing-2) var(--lc-density-padding-md, var(--spacing-4)) var(--spacing-1); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); line-height: var(--line-height-normal); letter-spacing: 0.05em; text-transform: uppercase; overflow-wrap: break-word; color: var(--color-text-secondary); cursor: default;',
      );
      expect(body('.lc-menu__dropdown--sm .lc-menu__section-heading')).toBe(
        'padding: var(--spacing-1) var(--lc-density-padding-sm, var(--spacing-3)) var(--spacing-0-5);',
      );
    });

    it('the indent: one step more at the start per size (md 32, sm 24, lg 40 px)', () => {
      expect(body('.lc-menu__section--indented .lc-menu__item')).toBe(
        'padding-inline-start: calc(var(--lc-density-padding-md, var(--spacing-4)) + var(--spacing-4));',
      );
      expect(body('.lc-menu__dropdown--sm .lc-menu__section--indented .lc-menu__item')).toBe(
        'padding-inline-start: calc(var(--lc-density-padding-sm, var(--spacing-3)) + var(--spacing-3));',
      );
      expect(body('.lc-menu__dropdown--lg .lc-menu__section--indented .lc-menu__item')).toBe(
        'padding-inline-start: calc(var(--spacing-5) + var(--spacing-5));',
      );
    });
  });
});
