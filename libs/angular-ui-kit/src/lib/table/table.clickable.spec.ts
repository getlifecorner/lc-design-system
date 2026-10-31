import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import * as axe from 'axe-core';
import { SwitchComponent } from '@lifecorner/angular-ui-kit/switch';
import { TableComponent, type TableAction, type TableColumn } from './table.component';
import { TableCellDirective } from './table-cell.directive';

/**
 * 3.16 (BA-3, request 022): `clickable` rows (tab stops, Enter/Space emit
 * `rowClick`, nested controls keep their keys) and the `caption`.
 */
const columns: TableColumn[] = [
  { key: 'date', label: 'Datum' },
  { key: 'party', label: 'Gegenpartei' },
  { key: 'link', label: 'Beleg' },
  { key: 'shared', label: 'Geteilt' },
];
const data = [
  { id: 't1', date: '30.10.2026', party: 'REWE Markt GmbH' },
  { id: 't2', date: '31.10.2026', party: 'Stadtwerke Beispielstadt' },
];
const actions: TableAction[] = [{ key: 'details', icon: 'chevron-right', tooltip: 'Details' }];

@Component({
  standalone: true,
  imports: [TableComponent, TableCellDirective, SwitchComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-table
      [columns]="columns"
      [data]="data"
      [actions]="actions"
      [clickable]="clickable"
      [caption]="caption"
      [showCaption]="showCaption"
      (rowClick)="clicks.push($event)"
    >
      <ng-template lcTableCell="link" let-row>
        <a class="cell-link" href="/beleg/{{ row.id }}">Beleg</a>
        <span class="cell-text">Text</span>
      </ng-template>
      <ng-template lcTableCell="shared" let-row>
        <lc-switch [ariaLabel]="'Teilen ' + row.party" />
      </ng-template>
    </lc-table>
  `,
})
class ClickableHostComponent {
  columns = columns;
  data: Record<string, unknown>[] = data;
  actions = actions;
  clickable = true;
  caption = '';
  showCaption = true;
  clicks: unknown[] = [];
}

describe('TableComponent clickable rows and caption (3.16, BA-3)', () => {
  let fixture: ComponentFixture<ClickableHostComponent>;
  let host: ClickableHostComponent;

  const el = () => fixture.nativeElement as HTMLElement;
  const rows = () => [...el().querySelectorAll<HTMLTableRowElement>('tbody tr')];
  const key = (target: Element, k: string) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ClickableHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(ClickableHostComponent);
    host = fixture.componentInstance;
  });

  describe('clickable (AC-5, AC-6)', () => {
    beforeEach(() => fixture.detectChanges());

    it('makes every flat data row a tab stop in DOM order', () => {
      expect(rows().map((r) => r.getAttribute('tabindex'))).toEqual(['0', '0']);
      expect(el().querySelector('table')?.classList).toContain('lc-table--clickable');
    });

    it('emits rowClick on Enter and Space on the row, and prevents the page scroll on Space', () => {
      const enter = key(rows()[0], 'Enter');
      const space = key(rows()[1], ' ');
      expect(host.clicks).toEqual([data[0], data[1]]);
      expect(space.defaultPrevented).toBe(true);
      expect(enter.defaultPrevented).toBe(true);
    });

    it('ignores other keys', () => {
      const tab = key(rows()[0], 'Tab');
      key(rows()[0], 'ArrowDown');
      expect(host.clicks).toEqual([]);
      expect(tab.defaultPrevented).toBe(false);
    });

    it('still emits rowClick for a click on a cell', () => {
      (rows()[1].querySelector('.cell-text') as HTMLElement).click();
      expect(host.clicks).toEqual([data[1]]);
    });

    it('emits nothing for keys on a link, a switch or an action button inside the row (AC-6)', () => {
      const row = rows()[0];
      const link = row.querySelector('.cell-link') as HTMLElement;
      const toggle = row.querySelector('button[role="switch"]') as HTMLElement;
      const action = row.querySelector('.lc-table__actions button') as HTMLElement;
      for (const control of [link, toggle, action]) {
        const enter = key(control, 'Enter');
        const space = key(control, ' ');
        expect(enter.defaultPrevented).toBe(false);
        expect(space.defaultPrevented).toBe(false);
      }
      expect(host.clicks).toEqual([]);
    });

    it('emits nothing for clicks on a link or a switch inside the row (AC-6)', () => {
      const row = rows()[0];
      const link = row.querySelector('.cell-link') as HTMLAnchorElement;
      link.addEventListener('click', (e) => e.preventDefault()); // jsdom: no navigation
      link.click();
      (row.querySelector('button[role="switch"]') as HTMLElement).click();
      (row.querySelector('.lc-table__actions button') as HTMLElement).click();
      expect(host.clicks).toEqual([]);
      fixture.detectChanges();
      // The switch handled its own click.
      expect(row.querySelector('button[role="switch"]')?.getAttribute('aria-checked')).toBe('true');
    });

    it('does not make the empty row focusable', () => {
      host.data = [];
      fixture.changeDetectorRef.detectChanges();
      expect(rows()).toHaveLength(1);
      expect(rows()[0].hasAttribute('tabindex')).toBe(false);
    });
  });

  describe('without clickable (AC-8)', () => {
    beforeEach(() => {
      host.clickable = false;
      fixture.detectChanges();
    });

    it('renders no tabindex, no clickable class and no caption', () => {
      expect(rows().every((r) => !r.hasAttribute('tabindex'))).toBe(true);
      expect(el().querySelector('table')?.className).toBe('lc-table lc-table--default lc-table--md');
      expect(el().querySelector('caption')).toBeNull();
      expect(el().querySelector('table')?.firstElementChild?.tagName).toBe('THEAD');
    });

    it('keeps the 3.15 click behaviour: a click on a nested link or switch still emits rowClick', () => {
      const row = rows()[0];
      const link = row.querySelector('.cell-link') as HTMLAnchorElement;
      link.addEventListener('click', (e) => e.preventDefault());
      link.click();
      (row.querySelector('button[role="switch"]') as HTMLElement).click();
      expect(host.clicks).toEqual([data[0], data[0]]);
    });

    it('ignores Enter and Space on flat rows', () => {
      const space = key(rows()[0], ' ');
      key(rows()[0], 'Enter');
      expect(host.clicks).toEqual([]);
      expect(space.defaultPrevented).toBe(false);
    });
  });

  describe('caption (AC-7)', () => {
    it('renders the caption as the first child of the table and names the table', () => {
      host.caption = 'Umsätze Oktober 2026';
      fixture.detectChanges();
      const table = el().querySelector('table') as HTMLTableElement;
      expect(table.firstElementChild?.tagName).toBe('CAPTION');
      expect(table.caption?.textContent?.trim()).toBe('Umsätze Oktober 2026');
      expect(table.caption?.className).toBe('lc-table__caption');
      axe.setup(el());
      try {
        expect(axe.commons.text.accessibleText(table)).toBe('Umsätze Oktober 2026');
      } finally {
        axe.teardown();
      }
    });

    it('keeps a hidden caption in the DOM for screen readers (showCaption=false)', () => {
      host.caption = 'Umsätze Oktober 2026';
      host.showCaption = false;
      fixture.detectChanges();
      const caption = el().querySelector('caption') as HTMLElement;
      expect(caption.className).toBe('lc-table__caption lc-table__caption--hidden');
      expect(caption.textContent?.trim()).toBe('Umsätze Oktober 2026');
    });
  });

});

describe('TableComponent tree mode with clickable (3.16, AC-6)', () => {
  it('keeps the roving tab stop and emits rowClick once on Enter', async () => {
    await TestBed.configureTestingModule({ imports: [TableComponent] }).compileComponents();
    const fixture = TestBed.createComponent(TableComponent);
    fixture.componentRef.setInput('columns', [{ key: 'title', label: 'Title' }]);
    fixture.componentRef.setInput('data', [
      { id: 'e1', parentId: '', title: 'Epic Alpha' },
      { id: 's1', parentId: 'e1', title: 'Child One' },
    ]);
    fixture.componentRef.setInput('idKey', 'id');
    fixture.componentRef.setInput('parentKey', 'parentId');
    fixture.componentRef.setInput('clickable', true);
    fixture.detectChanges();
    const clicks: unknown[] = [];
    fixture.componentInstance.rowClick.subscribe((r) => clicks.push(r));
    const rows = [...(fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr')];
    expect(rows.map((r) => r.getAttribute('tabindex'))).toEqual(['0', '-1']);
    expect((fixture.nativeElement as HTMLElement).querySelector('table')?.getAttribute('role')).toBe('treegrid');
    rows[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(clicks).toEqual([expect.objectContaining({ id: 'e1' })]);
  });
});

describe('TableComponent styles (3.16, BA-3)', () => {
  const css = compile(resolve(__dirname, 'table.component.scss')).css;

  it('shows the row ring in every variant, in forced colours as Highlight (AC-5)', () => {
    expect(css).toMatch(/\n\.lc-table tbody tr:focus-visible \{\s*outline: 2px solid var\(--color-primary-500\);\s*outline-offset: -2px;/);
    expect(css).not.toMatch(/\.lc-table--striped tbody tr:focus-visible/);
    expect(css).toMatch(/@media \(forced-colors: active\) \{\s*\.lc-table tbody tr:focus-visible \{\s*outline: 2px solid Highlight;/);
  });

  it('gives clickable rows the pointer and hover of hoverable ones', () => {
    expect(css).toMatch(/\.lc-table--hoverable tbody tr, \.lc-table--clickable tbody tr \{[^}]*cursor: pointer;/);
    expect(css).toMatch(/\.lc-table--hoverable tbody tr:hover, \.lc-table--clickable tbody tr:hover \{\s*background-color: var\(--color-surface-hover\);/);
  });

  it('sets the caption 16/600/24, 12 px above the table, and hides it with the clip pattern', () => {
    const at = css.indexOf('\n.lc-table__caption {');
    const caption = css.slice(at, css.indexOf('}', at));
    expect(caption).toContain('font-size: var(--typography-font-size-base)');
    expect(caption).toContain('font-weight: var(--typography-font-weight-semibold)');
    expect(caption).toContain('line-height: var(--typography-line-height-normal)');
    expect(caption).toContain('padding: 0 0 var(--spacing-3)');
    expect(caption).toContain('text-align: start');
    const hiddenAt = css.indexOf('\n.lc-table__caption--hidden {');
    expect(css.slice(hiddenAt, css.indexOf('}', hiddenAt))).toContain('clip: rect(0, 0, 0, 0)');
  });
});
