import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { SortableHeadComponent } from './sortable-head.component';
import type { TableColumnAlign, TableSortDirection } from './table.component';

/**
 * Request 071 (3.50, usm-x row 82, AC-15; backlog 068-n1, AC-22): the arrow
 * reserve of `th[lcSortableHead]` reads `--lc-sortable-head-unsorted-reserve`
 * (default 32 px) while the head is neither sorted nor busy; sorted and busy
 * heads keep 32 px. Reserve, arrow and busy ring use logical properties, so
 * they follow `dir`. Widths are measured on the story *Sortable Head Reserve
 * And RTL*; here the rules, their order and the state classes.
 */
@Component({
  imports: [SortableHeadComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table>
      <thead>
        <tr>
          <th lcSortableHead="name" scope="col" [sortDirection]="direction()" [busy]="busy()" [align]="align()">Name</th>
        </tr>
      </thead>
    </table>
  `,
})
class HostComponent {
  readonly direction = signal<TableSortDirection | null>(null);
  readonly busy = signal(false);
  readonly align = signal<TableColumnAlign>('start');
}

describe('th[lcSortableHead] arrow reserve and RTL (3.50)', () => {
  const css = '\n' + compile(resolve(__dirname, 'sortable-head.component.scss')).css;
  const rule = (selector: string) => {
    const start = css.indexOf(`\n${selector} {`);
    expect([selector, start > -1]).toEqual([selector, true]);
    return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
  };
  const at = (selector: string) => css.indexOf(`\n${selector} {`);

  it('the state classes: unsorted has neither class; sorted and busy set theirs', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const th = fixture.nativeElement.querySelector('th') as HTMLElement;
    const state = () => ['lc-sortable-head--sorted', 'lc-sortable-head--busy'].map((c) => th.classList.contains(c));
    expect(state()).toEqual([false, false]);
    fixture.componentInstance.direction.set('asc');
    fixture.detectChanges();
    expect(state()).toEqual([true, false]);
    fixture.componentInstance.direction.set(null);
    fixture.componentInstance.busy.set(true);
    fixture.detectChanges();
    expect(state()).toEqual([false, true]);
  });

  it('AC-15: an unsorted sortable head reserves the hook (default 32 px) at the inline end', () => {
    expect(rule(':host(.lc-sortable-head--sortable)')).toBe(
      'cursor: pointer; position: relative; padding-inline-end: var(--lc-sortable-head-unsorted-reserve, var(--spacing-8)); transition: background-color 0.2s ease;',
    );
  });

  it('AC-15: sorted and busy heads keep 32 px, after the sortable rule at the same weight', () => {
    const selector = ':host(.lc-sortable-head--sorted),\n:host(.lc-sortable-head--busy)';
    expect(rule(selector)).toBe('padding-inline-end: var(--spacing-8);');
    expect(at(selector)).toBeGreaterThan(at(':host(.lc-sortable-head--sortable)'));
  });

  it('AC-15: end-aligned heads reserve the hook on the start side; sorted/busy keep 32 px; the own end padding wins over the sorted rule', () => {
    expect(rule(':host(.lc-sortable-head--end.lc-sortable-head--sortable)')).toBe(
      'padding-inline-start: var(--spacing-8); padding-inline-end: var(--lc-density-padding-md, var(--spacing-4)); padding-inline-start: var(--lc-sortable-head-unsorted-reserve, var(--spacing-8));',
    );
    const selector = ':host(.lc-sortable-head--end.lc-sortable-head--sorted),\n:host(.lc-sortable-head--end.lc-sortable-head--busy)';
    expect(rule(selector)).toBe('padding-inline-start: var(--spacing-8);');
    expect(at(selector)).toBeGreaterThan(at(':host(.lc-sortable-head--end.lc-sortable-head--sortable)'));
  });

  it('AC-22: the arrow and the busy ring are placed with logical properties (12 px from the inline end)', () => {
    expect(rule('.sort-indicator')).toBe(
      'position: absolute; inset-inline-end: var(--spacing-3); top: 50%; transform: translateY(-50%); font-size: var(--typography-font-size-xs); color: var(--color-primary);',
    );
    expect(rule('.lc-sortable-head__busy')).toContain('inset-inline-end: var(--spacing-3);');
    expect(rule('.lc-sortable-head__busy')).toContain('border-inline-end-color: transparent;');
    expect(rule(':host(.lc-sortable-head--end) .lc-sortable-head__busy')).toBe('inset-inline-end: auto; inset-inline-start: var(--spacing-3);');
  });

  it('AC-22: no physical left/right placement or padding is left (only the shared end-arrow mixin’s harmless `right: auto`)', () => {
    const physical = [...css.matchAll(/(?:^|[\s;{])((?:right|left|padding-right|padding-left|border-right-color|border-left-color): [^;]+);/g)].map((m) => m[1]);
    expect(physical).toEqual(['right: auto']);
    expect(rule(':host(.lc-sortable-head--end) .sort-indicator')).toBe('right: auto; inset-inline-end: calc(100% + var(--spacing-2));');
  });

  it('the hook is read, never declared', () => {
    expect(css).not.toMatch(/--lc-sortable-head-unsorted-reserve:/);
  });
});
