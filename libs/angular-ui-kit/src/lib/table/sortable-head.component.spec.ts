import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createHash } from 'crypto';
import { resolve } from 'path';
import { compile } from 'sass';
import { computeAccessibleName } from 'dom-accessibility-api';
import { SortableHeadComponent } from './sortable-head.component';
import type { SortEvent, TableSortDirection } from './table.component';
import { audit, violations } from '../../testing/axe-jsdom';

@Component({
  standalone: true,
  imports: [SortableHeadComponent],
  template: `
    <table>
      <thead>
        <tr>
          <th lcSortableHead="name" scope="col" [sortDirection]="dir('name')" (sortChange)="onSort($event)">Name</th>
          <th
            lcSortableHead="amount"
            scope="col"
            align="end"
            [sortDirection]="dir('amount')"
            sortedAscendingLabel="aufsteigend sortiert"
            sortedDescendingLabel="absteigend sortiert"
            (sortChange)="onSort($event)"
          >
            Betrag
          </th>
          <th lcSortableHead scope="col" [sortable]="false">Notiz</th>
        </tr>
      </thead>
      <tbody><tr><td>A</td><td>1</td><td>x</td></tr></tbody>
    </table>
  `,
})
class Host {
  readonly sort = signal<SortEvent | null>({ column: 'name', direction: 'asc' });
  readonly events: SortEvent[] = [];
  dir(column: string): TableSortDirection | null {
    const s = this.sort();
    return s && s.column === column ? s.direction : null;
  }
  onSort(event: SortEvent): void {
    this.events.push(event);
    this.sort.set(event);
  }
}

/** Request 065 (usm-x row 33): `th[lcSortableHead]` outside lc-table (AC-6, AC-7). */
describe('th[lcSortableHead] (3.45)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const th = (i: number): HTMLTableCellElement => fixture.nativeElement.querySelectorAll('th')[i];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('AC-6: a sorted column has aria-sort, a tab stop, the arrow and the state in its name', () => {
    expect(th(0).getAttribute('aria-sort')).toBe('ascending');
    expect(th(0).getAttribute('tabindex')).toBe('0');
    expect(th(0).querySelector('.sort-indicator')?.textContent).toBe('↑');
    expect(th(0).querySelector('.sort-indicator')?.getAttribute('aria-hidden')).toBe('true');
    expect(computeAccessibleName(th(0))).toBe('Name sorted ascending');
    expect(th(0).querySelector('[aria-label]')).toBeNull();
    expect(th(0).classList).toContain('lc-sortable-head--sorted');
  });

  it('AC-6: an unsorted column has a tab stop but no aria-sort and no arrow', () => {
    expect(th(1).getAttribute('tabindex')).toBe('0');
    expect(th(1).hasAttribute('aria-sort')).toBe(false);
    expect(th(1).querySelector('.sort-indicator')).toBeNull();
    expect(computeAccessibleName(th(1))).toBe('Betrag');
  });

  it('AC-6: click, Enter and Space emit the next direction; the app sets it', () => {
    th(0).click();
    fixture.detectChanges();
    expect(host.events.at(-1)).toEqual({ column: 'name', direction: 'desc' });
    expect(th(0).getAttribute('aria-sort')).toBe('descending');

    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    th(1).dispatchEvent(enter);
    fixture.detectChanges();
    expect(enter.defaultPrevented).toBe(true);
    expect(host.events.at(-1)).toEqual({ column: 'amount', direction: 'asc' });
    expect(th(0).hasAttribute('aria-sort')).toBe(false);
    expect(computeAccessibleName(th(1))).toBe('Betrag aufsteigend sortiert');

    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    th(1).dispatchEvent(space);
    fixture.detectChanges();
    expect(space.defaultPrevented).toBe(true);
    expect(host.events.at(-1)).toEqual({ column: 'amount', direction: 'desc' });
  });

  it('AC-6: sortable=false gives the look only', () => {
    expect(th(2).hasAttribute('tabindex')).toBe(false);
    expect(th(2).classList).not.toContain('lc-sortable-head--sortable');
    th(2).click();
    expect(host.events).toEqual([]);
    const tab = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    th(2).dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
  });

  it('AC-6: the end variant carries its class (arrow placed before the label in CSS)', () => {
    expect(th(1).classList).toContain('lc-sortable-head--end');
  });

  it('AC-6: no axe violations', async () => {
    expect(violations(await audit(fixture.nativeElement))).toEqual([]);
  });

  describe('AC-6/AC-7: one look with lc-table', () => {
    const css = compile(resolve(__dirname, 'sortable-head.component.scss')).css;

    it('draws the lc-table header values on the host', () => {
      expect(css).toMatch(/:host \{[^}]*text-transform: uppercase;[^}]*letter-spacing: 0\.04em;[^}]*color: var\(--color-text-secondary\);[^}]*background-color: var\(--color-surface-2\);[^}]*border-bottom: 2px solid var\(--color-border-strong\);/);
      expect(css).toMatch(/:host\(\.lc-sortable-head--sortable\) \{[^}]*padding-right: var\(--spacing-8\);/);
      expect(css).toMatch(/\.sort-indicator \{[^}]*right: var\(--spacing-3\);[^}]*font-size: var\(--typography-font-size-xs\);[^}]*color: var\(--color-primary\);/);
    });

    it("leaves lc-table's compiled CSS byte-identical (the mixins replace its rules in place)", () => {
      const table = compile(resolve(__dirname, 'table.component.scss')).css;
      // sha256 of main 5dd20b9's compiled table.component.scss (3.44.0).
      expect(createHash('sha256').update(table).digest('hex')).toBe(
        'a11830c61ae426c68e368297f43635a24edd189f57e2d2a0c21792d2c64c2e1e',
      );
    });
  });
});
