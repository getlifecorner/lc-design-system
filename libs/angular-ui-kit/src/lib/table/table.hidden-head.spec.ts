import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { computeAccessibleName } from 'dom-accessibility-api';
import { SortableHeadComponent } from './sortable-head.component';
import { TableComponent, type TableAction, type TableColumn } from './table.component';
import { audit, outcome, violations } from '../../testing/axe-jsdom';

/**
 * Request 068 (3.48, design §2, §3, §9): finance-intelligence row 7
 * (`showActionsLabel`) and usm-x row 60 (sortable head hooks and `busy`).
 */
const COLUMNS: TableColumn[] = [
  { key: 'position', label: 'Position', sortable: true },
  { key: 'betrag', label: 'Betrag', align: 'end' },
];
const DATA = [
  { id: 1, position: 'Lizenz', betrag: '1.200,00 €' },
  { id: 2, position: 'Wartung', betrag: '480,00 €' },
];
const ACTIONS: TableAction[] = [
  { key: 'explain', label: 'Erklären' },
  { key: 'withdraw', label: 'Zurückziehen' },
];

@Component({
  standalone: true,
  imports: [TableComponent],
  template: `
    <div lang="de">
      <lc-table
        caption="Offene Positionen"
        [columns]="columns"
        [data]="data"
        [actions]="actions"
        actionsLabel="Aktionen"
        actionsWidth="240px"
        [showActionsLabel]="show()"
      />
    </div>
  `,
})
class TableHost {
  readonly columns = COLUMNS;
  readonly data = DATA;
  readonly actions = ACTIONS;
  readonly show = signal(true);
}

@Component({
  standalone: true,
  imports: [SortableHeadComponent],
  template: `
    <table>
      <thead>
        <tr>
          <th lcSortableHead="betrag" scope="col" [busy]="busy()" sortDirection="asc" (sortChange)="events.push($event.direction)">Betrag</th>
          <th lcSortableHead scope="col" [sortable]="false" [busy]="true">Notiz</th>
        </tr>
      </thead>
      <tbody><tr><td>1</td><td>x</td></tr></tbody>
    </table>
  `,
})
class HeadHost {
  readonly busy = signal(false);
  readonly events: string[] = [];
}

describe('lc-table showActionsLabel (3.48, F7)', () => {
  let fixture: ComponentFixture<TableHost>;
  let host: TableHost;
  const head = () => fixture.nativeElement.querySelector('th.lc-table__actions-cell') as HTMLTableCellElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TableHost] });
    fixture = TestBed.createComponent(TableHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('default: the label is the head’s visible text, as before', () => {
    expect(head().textContent?.trim()).toBe('Aktionen');
    expect(head().querySelector('.lc-table__sr-only')).toBeNull();
    expect(head().childElementCount).toBe(0);
    expect(head().className).toBe('lc-table__actions-cell lc-table__actions-cell--start');
  });

  it('false: the head is the hidden span’s containing block, so the span can’t widen the page (review r1, F-1)', () => {
    host.show.set(false);
    fixture.detectChanges();
    expect(head().classList).toContain('lc-table__actions-cell--label-hidden');
    const css = compile(resolve(__dirname, 'table.component.scss')).css;
    expect(css.replace(/\s+/g, ' ')).toContain('.lc-table__actions-cell--label-hidden { position: relative; }');
    // applied to the rendered head (jsdom resolves the cascade, not the layout)
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    try {
      expect(getComputedStyle(head()).position).toBe('relative');
      expect(getComputedStyle(head().querySelector('.lc-table__sr-only') as HTMLElement).position).toBe('absolute');
    } finally {
      style.remove();
    }
    // back to the visible label: the modifier goes with the span
    host.show.set(true);
    fixture.detectChanges();
    expect(head().classList).not.toContain('lc-table__actions-cell--label-hidden');
  });

  it('false: no visible text, the name „Aktionen“ from hidden text (not aria-label), the width kept', () => {
    host.show.set(false);
    fixture.detectChanges();
    const hidden = head().querySelector('.lc-table__sr-only') as HTMLElement;
    expect(hidden.textContent).toBe('Aktionen');
    expect(head().hasAttribute('aria-label')).toBe(false);
    expect(computeAccessibleName(head())).toBe('Aktionen');
    expect(head().style.width).toBe('240px');
    // the other heads and the row actions are unchanged
    const heads = Array.from(fixture.nativeElement.querySelectorAll('thead th') as NodeListOf<HTMLElement>).map((t) => t.textContent?.trim());
    expect(heads.slice(0, 2).map((t) => t?.startsWith('Position') || t === 'Betrag')).toEqual([true, true]);
    expect(Array.from(fixture.nativeElement.querySelectorAll('tbody button') as NodeListOf<HTMLElement>).map((b) => b.textContent?.trim())).toEqual([
      'Erklären',
      'Zurückziehen',
      'Erklären',
      'Zurückziehen',
    ]);
  });

  it('false: axe passes, empty-table-header included (best practice)', async () => {
    host.show.set(false);
    fixture.detectChanges();
    expect(violations(await audit(fixture.nativeElement))).toEqual([]);
    const { axe } = await import('../../testing/axe-jsdom');
    const results = await axe.run(fixture.nativeElement, { runOnly: ['empty-table-header'] });
    expect(outcome(results, 'empty-table-header')).toBe('pass');
  });

  it('the hidden text uses the caption’s recipe', () => {
    const css = compile(resolve(__dirname, 'table.component.scss')).css.replace(/\s+/g, ' ');
    expect(css).toContain(
      '.lc-table__sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }',
    );
  });
});

describe('th[lcSortableHead] busy and hooks (3.48, usm-x row 60)', () => {
  let fixture: ComponentFixture<HeadHost>;
  let host: HeadHost;
  const th = (i: number): HTMLTableCellElement => fixture.nativeElement.querySelectorAll('th')[i];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HeadHost] });
    fixture = TestBed.createComponent(HeadHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('default: no aria-busy, no ring, the arrow shows', () => {
    expect(th(0).hasAttribute('aria-busy')).toBe(false);
    expect(th(0).classList).not.toContain('lc-sortable-head--busy');
    expect(th(0).querySelector('.lc-sortable-head__busy')).toBeNull();
    expect(th(0).querySelector('.sort-indicator')).not.toBeNull();
  });

  it('busy: aria-busy, the ring instead of the arrow, the state text stays, clicks still emit', () => {
    host.busy.set(true);
    fixture.detectChanges();
    expect(th(0).getAttribute('aria-busy')).toBe('true');
    expect(th(0).classList).toContain('lc-sortable-head--busy');
    expect(th(0).querySelector('.lc-sortable-head__busy')?.getAttribute('aria-hidden')).toBe('true');
    expect(th(0).querySelector('.sort-indicator')).toBeNull();
    expect(computeAccessibleName(th(0))).toBe('Betrag sorted ascending');
    th(0).click();
    th(0).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    expect(host.events).toEqual(['desc', 'desc']);
  });

  it('a head that is not sortable shows no busy state', () => {
    expect(th(1).hasAttribute('aria-busy')).toBe(false);
    expect(th(1).querySelector('.lc-sortable-head__busy')).toBeNull();
  });

  it('axe: no violations while busy', async () => {
    host.busy.set(true);
    fixture.detectChanges();
    expect(violations(await audit(fixture.nativeElement))).toEqual([]);
  });

  describe('stylesheet', () => {
    const css = compile(resolve(__dirname, 'sortable-head.component.scss')).css.replace(/\s+/g, ' ');

    it('the hooks fall back to today’s values (md 12/16, sm 8/12, lg 16/20, 2 px rule)', () => {
      expect(css).toMatch(
        /:host \{[^}]*padding-block: var\(--lc-sortable-head-padding-block, var\(--lc-density-padding-sm, var\(--spacing-3\)\)\); padding-inline: var\(--lc-sortable-head-padding-inline, var\(--lc-density-padding-md, var\(--spacing-4\)\)\);[^}]*border-bottom: var\(--lc-sortable-head-border-bottom, 2px solid var\(--color-border-strong\)\);/,
      );
      expect(css).toMatch(/:host\(\.lc-sortable-head--sm\) \{[^}]*padding-block: var\(--lc-sortable-head-padding-block, var\(--lc-density-padding-xs, var\(--spacing-2\)\)\); padding-inline: var\(--lc-sortable-head-padding-inline, var\(--lc-density-padding-sm, var\(--spacing-3\)\)\);/);
      expect(css).toMatch(/:host\(\.lc-sortable-head--lg\) \{[^}]*padding-block: var\(--lc-sortable-head-padding-block, var\(--lc-density-padding-md, var\(--spacing-4\)\)\); padding-inline: var\(--lc-sortable-head-padding-inline, var\(--spacing-5\)\);/);
      // the 32 px arrow reserve comes later and wins at the same weight
      expect(css.indexOf(':host(.lc-sortable-head--sortable) {')).toBeGreaterThan(css.indexOf(':host(.lc-sortable-head--lg) {'));
      expect(css).not.toMatch(/--lc-sortable-head-[a-z-]+:/);
    });

    it('the ring: 12 px, 2 px, 3/4 arc, primary; static under reduced motion; CanvasText in forced colours', () => {
      // 3.50 (request 071, backlog 068-n1, AC-22): `right` and
      // `border-right-color` became `inset-inline-end` and
      // `border-inline-end-color` (same values; in RTL the ring sits over the reserve).
      expect(css).toContain(
        '.lc-sortable-head__busy { position: absolute; top: 50%; inset-inline-end: var(--spacing-3); box-sizing: border-box; width: 0.75rem; height: 0.75rem; margin-top: -0.375rem; border: 2px solid var(--color-primary); border-inline-end-color: transparent; border-radius: 50%; animation: lc-sortable-head-spin 0.8s linear infinite; }',
      );
      expect(css).toContain('@media (prefers-reduced-motion: reduce) { .lc-sortable-head__busy { animation: none; } }');
      expect(css).toContain('@media (forced-colors: active) { .lc-sortable-head__busy { border-color: CanvasText; } }');
      expect(css).toContain(':host(.lc-sortable-head--busy) { cursor: progress; }');
    });
  });
});
