import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { AXE_TAGS, audit, violations } from '../../testing/axe-jsdom';
import { TableComponent, type RowToggleEvent, type TableColumn } from './table.component';

/**
 * Request 063 (kosten-2026-11-17 row 1, design §2/§6/§9): `hasChildrenKey`
 * marks a tree row as expandable before its children are loaded. The table
 * only shows the chevron; the page adds the children after `rowToggle`.
 */
const columns: TableColumn[] = [
  { key: 'name', label: 'Budget' },
  { key: 'plan', label: 'Plan (€)', align: 'end' },
];
const budgets = [
  { id: 'b1', parentId: '', name: 'IT-Betrieb', plan: '120.000', hasPlanItems: true },
  { id: 'b2', parentId: '', name: 'Lizenzen', plan: '80.000', hasPlanItems: true },
  { id: 'b3', parentId: '', name: 'Beratung', plan: '20.000', hasPlanItems: false },
];
const planItems = [
  { id: 'p1', parentId: 'b2', name: 'Office-Lizenzen', plan: '50.000' },
  { id: 'p2', parentId: 'b2', name: 'Grafik-Lizenzen', plan: '30.000' },
];

describe('TableComponent lazy tree rows (3.43, request 063)', () => {
  let fixture: ComponentFixture<TableComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const rows = () => Array.from(el().querySelectorAll<HTMLTableRowElement>('tbody tr'));
  const row = (name: string) => rows().find((r) => r.textContent?.includes(name)) as HTMLTableRowElement;
  const chevron = (name: string) => row(name).querySelector<HTMLButtonElement>('.lc-table__chevron-btn');
  const toggles: RowToggleEvent[] = [];
  const idLists: string[][] = [];

  const setUp = (inputs: Record<string, unknown> = {}) => {
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('data', budgets);
    fixture.componentRef.setInput('idKey', 'id');
    fixture.componentRef.setInput('parentKey', 'parentId');
    fixture.componentRef.setInput('hasChildrenKey', 'hasPlanItems');
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
  };
  const key = (name: string, k: string) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
    row(name).dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  beforeEach(async () => {
    toggles.length = 0;
    idLists.length = 0;
    await TestBed.configureTestingModule({ imports: [TableComponent] }).compileComponents();
    fixture = TestBed.createComponent(TableComponent);
    fixture.componentInstance.rowToggle.subscribe((e) => toggles.push(e));
    fixture.componentInstance.expandedIdsChange.subscribe((ids) => idLists.push(ids));
  });

  it('defaults to undefined', () => {
    expect(fixture.componentInstance.hasChildrenKey()).toBeUndefined();
  });

  it('AC-5: without hasChildrenKey a truthy field adds no chevron (default unchanged)', () => {
    setUp({ hasChildrenKey: undefined });
    expect(el().querySelectorAll('.lc-table__chevron-btn')).toHaveLength(0);
    expect(rows().map((r) => r.getAttribute('aria-expanded'))).toEqual([null, null, null]);
    expect(el().querySelectorAll('.lc-table__row--group')).toHaveLength(0);
  });

  it('AC-1: a lazy row shows the chevron collapsed, also with defaultExpanded true', () => {
    setUp();
    expect(fixture.componentInstance.defaultExpanded()).toBe(true);
    expect(rows().map((r) => r.getAttribute('aria-expanded'))).toEqual(['false', 'false', null]);
    expect(chevron('Lizenzen')?.getAttribute('aria-expanded')).toBe('false');
    expect(chevron('Lizenzen')?.getAttribute('aria-label')).toBe('Aufklappen: Lizenzen');
    expect(chevron('Beratung')).toBeNull();
    expect(row('Lizenzen').classList.contains('lc-table__row--group')).toBe(true);
  });

  it('AC-2: opening emits rowToggle once, adds no row; children added later render indented with no second emit', () => {
    setUp();
    (chevron('Lizenzen') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(toggles).toEqual([{ id: 'b2', expanded: true, row: budgets[1] }]);
    expect(rows()).toHaveLength(3);
    expect(row('Lizenzen').getAttribute('aria-expanded')).toBe('true');
    expect(chevron('Lizenzen')?.classList.contains('lc-table__chevron-btn--expanded')).toBe(true);

    fixture.componentRef.setInput('data', [...budgets, ...planItems]);
    fixture.detectChanges();
    expect(rows().map((r) => [r.querySelector('.lc-table__tree-content')?.textContent?.trim(), r.getAttribute('aria-level')])).toEqual([
      ['IT-Betrieb', '1'],
      ['Lizenzen', '1'],
      ['Office-Lizenzen', '2'],
      ['Grafik-Lizenzen', '2'],
      ['Beratung', '1'],
    ]);
    expect(row('Office-Lizenzen').querySelectorAll('.lc-table__tree-indent')).toHaveLength(1);
    expect(row('Lizenzen').getAttribute('aria-expanded')).toBe('true');
    expect(toggles).toHaveLength(1);
  });

  it('AC-3: ArrowRight opens, ArrowRight on an open row without children does nothing, ArrowLeft closes', () => {
    setUp();
    const open = key('Lizenzen', 'ArrowRight');
    expect(open.defaultPrevented).toBe(true);
    expect(toggles).toEqual([{ id: 'b2', expanded: true, row: budgets[1] }]);

    row('Lizenzen').focus();
    const again = key('Lizenzen', 'ArrowRight');
    expect(again.defaultPrevented).toBe(false);
    expect(toggles).toHaveLength(1);
    expect(document.activeElement).toBe(row('Lizenzen'));

    const close = key('Lizenzen', 'ArrowLeft');
    expect(close.defaultPrevented).toBe(true);
    expect(toggles[1]).toEqual({ id: 'b2', expanded: false, row: budgets[1] });
    expect(row('Lizenzen').getAttribute('aria-expanded')).toBe('false');
  });

  it('AC-3: Enter emits rowClick and the chevron closes an open lazy row', () => {
    setUp();
    const clicks: unknown[] = [];
    fixture.componentInstance.rowClick.subscribe((r) => clicks.push(r));
    key('IT-Betrieb', 'Enter');
    expect(clicks).toEqual([budgets[0]]);
    (chevron('IT-Betrieb') as HTMLButtonElement).click();
    fixture.detectChanges();
    (chevron('IT-Betrieb') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(toggles.map((t) => [t.id, t.expanded])).toEqual([
      ['b1', true],
      ['b1', false],
    ]);
  });

  it('AC-4: preloaded children follow defaultExpanded; removing them leaves the chevron (collapsed when never toggled)', () => {
    setUp({ data: [...budgets, ...planItems] });
    expect(row('Lizenzen').getAttribute('aria-expanded')).toBe('true');
    expect(rows()).toHaveLength(5);

    fixture.componentRef.setInput('data', budgets);
    fixture.detectChanges();
    expect(rows()).toHaveLength(3);
    expect(chevron('Lizenzen')).not.toBeNull();
    expect(row('Lizenzen').getAttribute('aria-expanded')).toBe('false');
  });

  it('AC-4: a row the user opened stays open when its children are removed', () => {
    setUp({ data: [...budgets, ...planItems], defaultExpanded: false });
    (chevron('Lizenzen') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(rows()).toHaveLength(5);
    fixture.componentRef.setInput('data', budgets);
    fixture.detectChanges();
    expect(row('Lizenzen').getAttribute('aria-expanded')).toBe('true');
    expect(rows()).toHaveLength(3);
  });

  it('expandedIdsChange lists open lazy ids after the ids with loaded children', () => {
    setUp({ data: [...budgets, ...planItems] });
    (chevron('IT-Betrieb') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(idLists).toEqual([['b2', 'b1']]);
  });

  it('a controlled expandedIds opens a lazy row', () => {
    setUp({ expandedIds: ['b1'] });
    expect(rows().map((r) => r.getAttribute('aria-expanded'))).toEqual(['true', 'false', null]);
  });

  it('axe: no violation on the lazy tree, open and closed', async () => {
    setUp({ caption: 'Budgets mit Planposten' });
    (chevron('Lizenzen') as HTMLButtonElement).click();
    fixture.detectChanges();
    const results = await audit(el());
    expect(violations(results)).toEqual([]);
    expect(AXE_TAGS.length).toBeGreaterThan(0);
  });

  describe('SCSS: chevron hit area (design §6)', () => {
    const css = compile(resolve(__dirname, 'table.component.scss')).css;
    const body = (selector: string) => {
      const found = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => m[1].trim() === selector);
      expect([selector, found.length]).toEqual([selector, 1]);
      return found[0][2].replace(/\s+/g, ' ').trim();
    };

    it('32 × 44 at md/lg, 32 × 36 at sm, never past the button end; turned back when expanded', () => {
      expect(body('.lc-table__chevron-btn')).toContain('position: relative;');
      expect(body('.lc-table__chevron-btn::before')).toBe('content: ""; position: absolute; inset: -12px 0 -12px -12px;');
      expect(body('.lc-table__chevron-btn--expanded::before')).toBe('inset: 0 -12px -12px -12px;');
      expect(body('.lc-table--sm .lc-table__chevron-btn::before')).toBe('inset: -8px 0 -8px -12px;');
      expect(body('.lc-table--sm .lc-table__chevron-btn--expanded::before')).toBe('inset: 0 -8px -12px -8px;');
    });
  });
});
