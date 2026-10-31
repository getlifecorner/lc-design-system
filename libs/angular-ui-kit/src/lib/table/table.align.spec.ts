import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { TableComponent, type TableAction, type TableColumn } from './table.component';

/**
 * 3.17 (request 021, finance-intelligence sources page, gap row 1):
 * `TableColumn.align: 'end'` for number columns, and the actions header that
 * follows `actionsAlign` (022 N1).
 */
const data = [
  { source: 'Bankkonto', bookings: 1111, amount: 1111.11 },
  { source: 'Kreditkarte', bookings: 8888, amount: 8888.88 },
  { source: 'USM', bookings: 342, amount: 87000 },
];

describe('TableComponent column alignment (3.17, request 021)', () => {
  let fixture: ComponentFixture<TableComponent>;
  const el = () => fixture.nativeElement as HTMLElement;
  const headers = () => [...el().querySelectorAll('thead tr:last-child th')] as HTMLElement[];
  /** The `td`s of one column (index among the data columns), every body row. */
  const cells = (column: number) =>
    [...el().querySelectorAll('tbody tr')].map((tr) => tr.querySelectorAll('td')[column] as HTMLElement);

  async function render(columns: TableColumn[], inputs: Record<string, unknown> = {}) {
    await TestBed.configureTestingModule({ imports: [TableComponent] }).compileComponents();
    fixture = TestBed.createComponent(TableComponent);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('data', data);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  describe('AC-14: without align nothing changes', () => {
    const columns: TableColumn[] = [
      { key: 'source', label: 'Quelle', sortable: true },
      { key: 'bookings', label: 'Buchungen' },
    ];

    it('keeps the header and cell classes and the header text of 3.16', async () => {
      await render(columns);
      expect(headers().map((th) => th.className)).toEqual(['sortable', '']);
      expect(headers().map((th) => th.textContent)).toEqual([' Quelle ', ' Buchungen ']);
      expect(cells(0).map((td) => td.className)).toEqual(['', '', '']);
      expect(cells(1).map((td) => td.className)).toEqual(['', '', '']);
      expect(el().querySelector('.lc-table__sort-label, [class*="lc-table__cell--"]')).toBeNull();
    });

    it("renders align: 'start' like no align (no --start class)", async () => {
      await render([{ ...columns[0], align: 'start' }, { ...columns[1], align: 'start' }]);
      expect(headers().map((th) => th.className)).toEqual(['sortable', '']);
      expect(cells(1).map((td) => td.className)).toEqual(['', '', '']);
      expect(el().querySelector('.lc-table__sort-label')).toBeNull();
    });

    it('keeps the sorted header: the arrow right after the label text, no wrapper', async () => {
      await render(columns);
      fixture.componentInstance.handleSort('source');
      fixture.detectChanges();
      const th = headers()[0];
      expect(th.className).toBe('sortable sorted-asc');
      // Rendered nodes (Angular's comment anchors aside): the label text, then the arrow.
      const rendered = [...th.childNodes].filter((n) => n.nodeType !== Node.COMMENT_NODE);
      expect(rendered.map((n) => [n.nodeName, n.textContent])).toEqual([
        ['#text', ' Quelle '],
        ['SPAN', ' ↑ '],
      ]);
      expect((rendered[1] as HTMLElement).className).toBe('sort-indicator');
    });
  });

  describe("AC-1: align: 'end'", () => {
    const columns: TableColumn[] = [
      { key: 'source', label: 'Quelle' },
      { key: 'bookings', label: 'Buchungen', align: 'end' },
    ];

    it('adds lc-table__cell--end to the th and every td of that column only', async () => {
      await render(columns);
      expect(headers().map((th) => th.className)).toEqual(['', 'lc-table__cell--end']);
      expect(cells(1).map((td) => td.className)).toEqual(Array(3).fill('lc-table__cell--end'));
      expect(cells(0).map((td) => td.className)).toEqual(['', '', '']);
    });

    it('wraps the label in lc-table__sort-label without whitespace around it', async () => {
      await render(columns);
      const label = headers()[1].querySelector('.lc-table__sort-label') as HTMLElement;
      expect(label.textContent).toBe('Buchungen');
      expect(headers()[1].textContent?.trim()).toBe('Buchungen');
    });
  });

  describe('AC-3: with sorting, cellClass, cssClass, paginate and actions', () => {
    it('keeps the arrow inside the label box, after the label in the DOM (name "Betrag ↑")', async () => {
      await render([
        { key: 'source', label: 'Quelle' },
        { key: 'amount', label: 'Betrag', sortable: true, align: 'end' },
      ]);
      const th = headers()[1];
      expect(th.getAttribute('tabindex')).toBe('0');
      th.click();
      fixture.detectChanges();
      expect([...th.classList].sort()).toEqual(['lc-table__cell--end', 'sortable', 'sorted-asc']);
      expect(th.getAttribute('aria-sort')).toBe('ascending');
      const label = th.querySelector('.lc-table__sort-label') as HTMLElement;
      const indicator = label.querySelector(':scope > .sort-indicator') as HTMLElement;
      expect(indicator.getAttribute('aria-label')).toBe('sorted ascending');
      // The label text is the first node, the arrow follows with no text node between.
      expect(label.firstChild?.textContent).toBe('Betrag');
      const between = [...label.childNodes].slice(1, [...label.childNodes].indexOf(indicator));
      expect(between.every((n) => n.nodeType === Node.COMMENT_NODE)).toBe(true);
      expect(label.textContent).toBe('Betrag ↑ ');
      expect(cells(1).map((td) => td.textContent?.trim())).toEqual(['1111.11', '8888.88', '87000']);
      th.click();
      fixture.detectChanges();
      expect([...th.classList].sort()).toEqual(['lc-table__cell--end', 'sortable', 'sorted-desc']);
      expect(label.querySelector('.sort-indicator')?.textContent).toBe(' ↓ ');
    });

    it('adds the class next to cellClass (string and resolver) and cssClass', async () => {
      await render([
        { key: 'bookings', label: 'Buchungen', align: 'end', cellClass: 'page-cell' },
        {
          key: 'amount',
          label: 'Betrag',
          align: 'end',
          cssClass: 'page-col',
          cellClass: (value) => (Number(value) > 5000 ? 'page-high' : ''),
        },
      ]);
      expect([...cells(0)[0].classList].sort()).toEqual(['lc-table__cell--end', 'page-cell']);
      expect([...headers()[1].classList].sort()).toEqual(['lc-table__cell--end', 'page-col']);
      expect([...cells(1)[0].classList].sort()).toEqual(['lc-table__cell--end', 'page-col']);
      expect([...cells(1)[1].classList].sort()).toEqual(['lc-table__cell--end', 'page-col', 'page-high']);
    });

    it('keeps the class on every page', async () => {
      await render([{ key: 'source', label: 'Quelle' }, { key: 'amount', label: 'Betrag', align: 'end' }], {
        paginate: true,
        pageSize: 2,
      });
      expect(cells(1).map((td) => td.className)).toEqual(['lc-table__cell--end', 'lc-table__cell--end']);
      (el().querySelector('.lc-table-pagination__btn[aria-label="Next page"]') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(cells(1).map((td) => td.className)).toEqual(['lc-table__cell--end']);
      expect(cells(1)[0].textContent?.trim()).toBe('87000');
    });

    it('sits next to an actions column that keeps its own alignment class', async () => {
      const actions: TableAction[] = [{ key: 'more', icon: 'chevron-right', tooltip: 'Mehr' }];
      await render([{ key: 'source', label: 'Quelle' }, { key: 'amount', label: 'Betrag', align: 'end' }], {
        actions,
        actionsLabel: 'Aktionen',
        actionsAlign: 'end',
      });
      const th = headers();
      expect(th[1].className).toBe('lc-table__cell--end');
      expect(th[2].classList).toContain('lc-table__actions-cell--end');
      expect(th[2].classList).not.toContain('lc-table__cell--end');
      const row = el().querySelectorAll('tbody tr')[0].querySelectorAll('td');
      expect(row[1].className).toBe('lc-table__cell--end');
      expect(row[2].classList).toContain('lc-table__actions-cell--end');
    });
  });
});

describe('TableComponent alignment styles (3.17, request 021)', () => {
  const css = '\n' + compile(resolve(__dirname, 'table.component.scss')).css;
  /** The declarations of the rule whose selector list is exactly `selector`. */
  const rule = (selector: string) => {
    const at = css.indexOf(`\n${selector} {`);
    expect(at).toBeGreaterThan(-1);
    return css.slice(at, css.indexOf('}', at));
  };

  // Each selector repeats the base path `.lc-table thead tr th` (0,5,3 under
  // emulation) and adds one class, so it is (0,6,3) and wins without !important.
  it('AC-1, AC-2: aligns the end th and td at the end with tabular figures, above the base th rule', () => {
    const end = rule('.lc-table thead tr th.lc-table__cell--end,\n.lc-table tbody tr td.lc-table__cell--end');
    expect(end).toMatch(/text-align: end;/);
    expect(end).toMatch(/font-variant-numeric: tabular-nums;/);
    expect(rule('.lc-table thead tr th')).toMatch(/text-align: left;/);
    expect(css.indexOf('\n.lc-table thead tr th.lc-table__cell--end')).toBeGreaterThan(css.indexOf('\n.lc-table thead tr th {'));
  });

  it('AC-3: a sortable end header moves the 32 px reserve to the start side and keeps the cell padding at the end', () => {
    const md = rule('.lc-table thead tr th.sortable.lc-table__cell--end');
    expect(md).toMatch(/padding-inline-start: var\(--spacing-8\);/);
    expect(md).toMatch(/padding-inline-end: var\(--lc-density-padding-md, var\(--spacing-4\)\);/);
    expect(rule('.lc-table--sm thead tr th.sortable.lc-table__cell--end')).toMatch(
      /padding-inline-end: var\(--lc-density-padding-sm, var\(--spacing-3\)\);/,
    );
    expect(rule('.lc-table--lg thead tr th.sortable.lc-table__cell--end')).toMatch(/padding-inline-end: var\(--spacing-5\);/);
    // The same end padding as the td of each size.
    expect(rule('.lc-table tbody tr td')).toMatch(/padding: var\(--lc-density-padding-sm, var\(--spacing-3\)\) var\(--lc-density-padding-md, var\(--spacing-4\)\);/);
    expect(rule('.lc-table--sm thead tr th,\n.lc-table--sm tbody tr td')).toMatch(/var\(--lc-density-padding-sm, var\(--spacing-3\)\);/);
    expect(rule('.lc-table--lg thead tr th,\n.lc-table--lg tbody tr td')).toMatch(/var\(--spacing-5\);/);
  });

  it('AC-3: places the arrow 8 px before the label, in the label box', () => {
    const arrow = rule('.lc-table thead tr th.sortable.lc-table__cell--end .sort-indicator');
    expect(arrow).toMatch(/right: auto;\s*inset-inline-end: calc\(100% \+ var\(--spacing-2\)\);/);
    expect(rule('.lc-table__sort-label')).toMatch(/position: relative;\s*display: inline-block;/);
  });

  it('aligns the inline edit input of an end cell too', () => {
    const input = rule('.lc-table__cell--end .lc-table__edit-input');
    expect(input).toMatch(/text-align: end;/);
    expect(input).toMatch(/font-variant-numeric: tabular-nums;/);
  });

  it('022 N1: the actions header and cells follow actionsAlign at the weight of the base th rule', () => {
    expect(rule('.lc-table thead tr th.lc-table__actions-cell--start,\n.lc-table tbody tr td.lc-table__actions-cell--start')).toMatch(/text-align: left;/);
    expect(rule('.lc-table thead tr th.lc-table__actions-cell--center,\n.lc-table tbody tr td.lc-table__actions-cell--center')).toMatch(/text-align: center;/);
    expect(rule('.lc-table thead tr th.lc-table__actions-cell--end,\n.lc-table tbody tr td.lc-table__actions-cell--end')).toMatch(/text-align: right;/);
    expect(css).not.toMatch(/\n\.lc-table th\.lc-table__actions-cell/);
  });
});
