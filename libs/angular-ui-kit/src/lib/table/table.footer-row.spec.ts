import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { TableComponent, type TableAction, type TableColumn } from './table.component';
import { TableCellDirective } from './table-cell.directive';

/**
 * 3.36 (request 056): `footerRow` (services row 1, AC-17 to AC-19, D-7) and
 * `TableAction.ariaLabel` (services row 2, AC-20).
 */
const COLUMNS: TableColumn[] = [
  { key: 'name', label: 'Service', sortable: true },
  { key: 'actual', label: 'Ist', sortable: true, align: 'end', formatter: (v) => `${v} €` },
  { key: 'plan', label: 'Plan', align: 'end' },
];
const DATA = [
  { id: 'net', parent: '', name: 'Demo Netz', actual: 300, plan: 320 },
  { id: 'wan', parent: 'net', name: 'WAN', actual: 120, plan: 130 },
  { id: 'lan', parent: 'net', name: 'LAN', actual: 180, plan: 190 },
  { id: 'mail', parent: '', name: 'Mail', actual: 90, plan: 100 },
  { id: 'none', parent: '', name: 'Keinem Service zugeordnet', actual: 132.53, plan: 0 },
];
const FOOTER = { name: 'Gesamtkosten Ist', actual: 522.53, plan: 600 };

describe('TableComponent — footerRow and TableAction.ariaLabel (3.36, request 056)', () => {
  let fixture: ComponentFixture<TableComponent>;
  const el = () => fixture.nativeElement as HTMLElement;
  const footerRows = () => Array.from(el().querySelectorAll<HTMLTableRowElement>('tfoot tr'));
  const bodyNames = () => Array.from(el().querySelectorAll('tbody tr')).map((tr) => tr.querySelector('td')?.textContent?.trim());
  const footerTexts = () => Array.from(footerRows()[0].children).map((c) => c.textContent?.trim());

  beforeEach(() => TestBed.configureTestingModule({ imports: [TableComponent] }));
  afterEach(() => fixture?.destroy());

  function render(inputs: Record<string, unknown> = {}) {
    fixture = TestBed.createComponent(TableComponent);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('data', DATA);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  describe('footerRow (AC-17 to AC-19)', () => {
    it('defaults to undefined: no tfoot', () => {
      render();
      expect(fixture.componentInstance.footerRow()).toBeUndefined();
      expect(el().querySelector('tfoot')).toBeNull();
      expect([...(el().querySelector('table') as HTMLTableElement).children].map((c) => c.tagName)).toEqual(['THEAD', 'TBODY']);
    });

    it('AC-17: one tfoot row after tbody, the columns with formatter, alignment and the first cell as row header', () => {
      render({ footerRow: FOOTER });
      const table = el().querySelector('table') as HTMLTableElement;
      expect([...table.children].map((c) => c.tagName)).toEqual(['THEAD', 'TBODY', 'TFOOT']);
      expect(footerRows()).toHaveLength(1);
      const cells = Array.from(footerRows()[0].children) as HTMLElement[];
      expect(cells.map((c) => c.tagName)).toEqual(['TH', 'TD', 'TD']);
      expect(cells[0].getAttribute('scope')).toBe('row');
      expect(footerTexts()).toEqual(['Gesamtkosten Ist', '522.53 €', '600']);
      expect(cells[1].classList).toContain('lc-table__cell--end');
      expect(footerRows()[0].hasAttribute('tabindex')).toBe(false);
      expect(footerRows()[0].hasAttribute('role')).toBe(false);
    });

    it('AC-17 (D-7): formatter, cellClass and cellStyle get rowIndex −1', () => {
      const seen: number[] = [];
      const columns: TableColumn[] = [
        { key: 'name', label: 'Service', cellClass: (_v, _r, _c, i) => (seen.push(i), i < 0 ? 'is-sum' : '') },
        { key: 'actual', label: 'Ist', cellStyle: (_v, _r, _c, i) => (i < 0 ? { 'font-style': 'italic' } : {}), formatter: (v, _r, _c, i) => `${v}${i < 0 ? ' Σ' : ''}` },
      ];
      render({ columns, footerRow: FOOTER });
      const [th, td] = Array.from(footerRows()[0].children) as HTMLElement[];
      expect(th.classList).toContain('is-sum');
      expect(td.style.fontStyle).toBe('italic');
      expect(td.textContent?.trim()).toBe('522.53 Σ');
      expect(seen.filter((i) => i === -1)).toHaveLength(1);
    });

    it('AC-18: stays last and unchanged under sort, filter and paging; not counted', () => {
      render({ footerRow: FOOTER, filterable: true, paginate: true, pageSize: 2 });
      const before = footerTexts();
      expect(el().querySelector('.lc-table-pagination__info')?.textContent?.trim()).toBe('1–2 of 5');
      fixture.componentInstance.handleSort('actual');
      fixture.detectChanges();
      expect(footerTexts()).toEqual(before);
      (fixture.componentInstance as unknown as { goToPage(p: number): void }).goToPage(2);
      fixture.detectChanges();
      expect(bodyNames()).toHaveLength(1);
      expect(footerTexts()).toEqual(before);
      const filter = el().querySelector('.lc-table__filter-input .input-field') as HTMLInputElement;
      filter.value = 'ZZZ';
      filter.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(el().querySelector('.lc-table__empty')).not.toBeNull();
      expect(footerTexts()).toEqual(before);
      expect((el().querySelector('table') as HTMLTableElement).lastElementChild?.tagName).toBe('TFOOT');
    });

    it('AC-18: selection never includes it; select and action columns get empty cells', () => {
      const actions: TableAction[] = [{ key: 'origin', label: 'Herkunft' }];
      render({ footerRow: FOOTER, selectable: true, actions });
      const selected: unknown[][] = [];
      fixture.componentInstance.selectionChange.subscribe((e) => selected.push(e.selected));
      (el().querySelector('thead .lc-table__checkbox') as HTMLInputElement).click();
      fixture.detectChanges();
      expect(selected.at(-1)).toHaveLength(DATA.length);
      expect(selected.at(-1)).not.toContain(FOOTER);
      const cells = Array.from(footerRows()[0].children) as HTMLElement[];
      expect(cells.map((c) => c.tagName)).toEqual(['TD', 'TH', 'TD', 'TD', 'TD']);
      expect(cells[0].className).toBe('lc-table__select-cell');
      expect(cells[0].children).toHaveLength(0);
      expect(cells.at(-1)?.classList).toContain('lc-table__actions-cell');
      expect(cells.at(-1)?.children).toHaveLength(0);
      expect(footerRows()[0].querySelectorAll('input, button')).toHaveLength(0);
    });

    it('AC-19 (tree): rowgroup row with a rowheader, gridcells, the level-0 label slot; stays last when collapsed', () => {
      render({ footerRow: FOOTER, idKey: 'id', parentKey: 'parent' });
      expect(el().querySelector('table')?.getAttribute('role')).toBe('treegrid');
      const tr = footerRows()[0];
      expect(tr.getAttribute('role')).toBe('row');
      const cells = Array.from(tr.children) as HTMLElement[];
      expect(cells.map((c) => c.getAttribute('role'))).toEqual(['rowheader', 'gridcell', 'gridcell']);
      const slot = cells[0].querySelector('.lc-table__tree-cell > .lc-table__tree-chevron') as HTMLElement;
      expect(slot.style.width).toBe('20px');
      expect(slot.children).toHaveLength(0);
      expect(cells[0].querySelector('.lc-table__tree-content')?.textContent?.trim()).toBe('Gesamtkosten Ist');
      // Not in the roving model, never aria-level/posinset.
      expect(tr.hasAttribute('tabindex')).toBe(false);
      expect(tr.hasAttribute('aria-level')).toBe(false);
      (el().querySelector('.lc-table__chevron-btn') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(bodyNames()).toEqual(['Demo Netz', 'Mail', 'Keinem Service zugeordnet']);
      expect(footerTexts()).toEqual(['Gesamtkosten Ist', '522.53 €', '600']);
    });

    it('AC-17: lcTableCell templates render in the footer with footer: true', () => {
      @Component({
        standalone: true,
        imports: [TableComponent, TableCellDirective],
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
          <lc-table [columns]="columns" [data]="data" [footerRow]="footer()">
            <ng-template lcTableCell="name" let-row let-footer="footer">
              <span class="cell">{{ row.name }}{{ footer ? ' (Summe)' : '' }}</span>
            </ng-template>
          </lc-table>
        `,
      })
      class Host {
        readonly columns = COLUMNS;
        readonly data = DATA.slice(0, 2);
        readonly footer = signal<Record<string, unknown> | undefined>(FOOTER);
      }
      const host = TestBed.createComponent(Host);
      host.detectChanges();
      const root = host.nativeElement as HTMLElement;
      expect(Array.from(root.querySelectorAll('tbody .cell')).map((c) => c.textContent)).toEqual(['Demo Netz', 'WAN']);
      expect(root.querySelector('tfoot th .cell')?.textContent).toBe('Gesamtkosten Ist (Summe)');
      host.componentInstance.footer.set(undefined);
      host.detectChanges();
      expect(root.querySelector('tfoot')).toBeNull();
      host.destroy();
    });

    it('styles: field-border rules, body-cell padding per size, semibold tabular, no hover', () => {
      const css = compile(resolve(__dirname, 'table.component.scss')).css;
      expect(css).toMatch(/\n\.lc-table tfoot tr \{\s*border-top: 1px solid var\(--color-field-border\);\s*border-bottom: 3px double var\(--color-field-border\);\s*\}/);
      expect(css).toMatch(
        /\n\.lc-table tfoot tr th,\s*\.lc-table tfoot tr td \{\s*padding: var\(--lc-density-padding-sm, var\(--spacing-3\)\) var\(--lc-density-padding-md, var\(--spacing-4\)\);\s*text-align: start;\s*font-weight: var\(--typography-font-weight-semibold\);\s*font-variant-numeric: tabular-nums;\s*\}/,
      );
      expect(css).toMatch(/\.lc-table tfoot tr th\.lc-table__cell--end,\s*\.lc-table tfoot tr td\.lc-table__cell--end \{\s*text-align: end;\s*\}/);
      expect(css).toMatch(/\n:where\(\.lc-table tfoot tr th, \.lc-table tfoot tr td\) \{\s*font-size: var\(--typography-font-size-sm\);\s*color: var\(--color-text-primary\);\s*\}/);
      expect(css).not.toMatch(/tfoot[^{]*:hover/);
    });
  });

  describe('TableAction.ariaLabel (AC-20)', () => {
    const names = () => Array.from(el().querySelectorAll('tbody .lc-table__actions button')).map((b) => b.getAttribute('aria-label'));
    const labels = () => Array.from(el().querySelectorAll('tbody .lc-table__actions button')).map((b) => b.textContent?.trim());

    it('without it the name is as before: tooltip, label, then key', () => {
      render({ data: DATA.slice(0, 3), actions: [{ key: 'origin', label: 'Herkunft' }] });
      expect(names()).toEqual(['Herkunft', 'Herkunft', 'Herkunft']);
      render({ data: DATA.slice(0, 1), actions: [{ key: 'origin', label: 'Herkunft', tooltip: 'Herkunft anzeigen' }, { key: 'edit', icon: 'pencil' }] });
      expect(names()).toEqual(['Herkunft anzeigen', 'edit']);
    });

    it('a function names every row\'s button after its object; label and look stay', () => {
      const actions: TableAction[] = [{ key: 'origin', label: 'Herkunft', ariaLabel: (row) => `Herkunft von ${row['name']}` }];
      render({ data: DATA.slice(0, 3), actions });
      expect(names()).toEqual(['Herkunft von Demo Netz', 'Herkunft von WAN', 'Herkunft von LAN']);
      expect(new Set(names()).size).toBe(3);
      expect(labels()).toEqual(['Herkunft', 'Herkunft', 'Herkunft']);
    });

    it('gets the data index; a string wins over tooltip; an empty result falls back', () => {
      const indexes: number[] = [];
      render({
        data: DATA.slice(0, 2),
        actions: [
          { key: 'a', label: 'Öffnen', tooltip: 'Tip', ariaLabel: 'Öffnen, Liste' },
          { key: 'b', label: 'Herkunft', ariaLabel: (_row, i) => (indexes.push(i), i === 0 ? '' : 'Herkunft von WAN') },
        ],
      });
      expect(names()).toEqual(['Öffnen, Liste', 'Herkunft', 'Öffnen, Liste', 'Herkunft von WAN']);
      expect(indexes).toEqual([0, 1]);
    });
  });
});
