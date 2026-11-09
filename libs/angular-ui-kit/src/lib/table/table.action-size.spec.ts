import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent, type TableAction, type TableColumn } from './table.component';

/**
 * 3.37 (request 057, finance-intelligence services row 3, design D-3): an
 * optional `size` on `TableAction`; without it the action stays `xs`. The
 * heights (lg 48.5 / 45.6 px) are measured in the story *Action Sizes*.
 */
const columns: TableColumn[] = [{ key: 'name', label: 'Service' }];
const data = [
  { id: 's1', name: 'Demo Netz' },
  { id: 's2', name: 'Arbeitsplatz' },
];

@Component({
  standalone: true,
  imports: [TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-table [columns]="columns" [data]="data" [actions]="actions()" [clickable]="true" (rowClick)="rows.push($event)" (actionClick)="clicks.push($event.action)" />
  `,
})
class Host {
  readonly columns = columns;
  readonly data = data;
  readonly actions = signal<TableAction[]>([]);
  readonly rows: unknown[] = [];
  readonly clicks: string[] = [];
}

describe('lc-table — TableAction.size (3.37, request 057)', () => {
  let fixture: ComponentFixture<Host>;
  const el = () => fixture.nativeElement as HTMLElement;
  const buttons = () => Array.from(el().querySelectorAll<HTMLButtonElement>('tbody .lc-table__actions button'));
  const render = (actions: TableAction[]) => {
    fixture.componentInstance.actions.set(actions);
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('AC-10: without size every action is xs, as in 3.36', () => {
    render([
      { key: 'origin', label: 'Herkunft', icon: 'information-circle' },
      { key: 'details', icon: 'chevron-right', tooltip: 'Details' },
    ]);
    expect(buttons()).toHaveLength(4);
    for (const button of buttons()) {
      expect(button.classList.contains('btn-xs')).toBe(true);
      expect(['btn-sm', 'btn-md', 'btn-lg'].some((c) => button.classList.contains(c))).toBe(false);
    }
  });

  it.each(['xs', 'sm', 'md', 'lg'] as const)('AC-9: size %s renders the lc-button at that size, the icon stays sm (20 px)', (size) => {
    render([
      { key: 'origin', label: 'Herkunft', icon: 'information-circle', size, ariaLabel: (row) => `Herkunft von ${row['name']}` },
      { key: 'details', icon: 'chevron-right', tooltip: 'Details', size },
    ]);
    const [origin, details] = buttons();
    expect(origin.classList.contains(`btn-${size}`)).toBe(true);
    expect(origin.classList.contains('btn-icon-only')).toBe(false);
    expect(origin.textContent?.trim()).toBe('Herkunft');
    expect(origin.getAttribute('aria-label')).toBe('Herkunft von Demo Netz');
    expect(details.classList.contains(`btn-${size}`)).toBe(true);
    expect(details.classList.contains('btn-icon-only')).toBe(true);
    expect(details.getAttribute('aria-label')).toBe('Details');
    const icons = Array.from(el().querySelectorAll('tbody .lc-table__actions lc-icon'));
    expect(icons.length).toBe(4);
    expect(icons.every((icon) => icon.getAttribute('size') === 'sm')).toBe(true);
  });

  it('sizes are per action: a mixed list keeps each own size', () => {
    render([
      { key: 'origin', label: 'Herkunft', size: 'lg' },
      { key: 'details', label: 'Details' },
    ]);
    const [origin, details] = buttons();
    expect(origin.classList.contains('btn-lg')).toBe(true);
    expect(details.classList.contains('btn-xs')).toBe(true);
  });

  it('AC-10: a click on an lg action emits actionClick and never rowClick', () => {
    render([{ key: 'origin', label: 'Herkunft', size: 'lg' }]);
    buttons()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.clicks).toEqual(['origin']);
    expect(fixture.componentInstance.rows).toEqual([]);
  });
});
