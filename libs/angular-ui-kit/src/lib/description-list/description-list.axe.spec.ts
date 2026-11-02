import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DescriptionListComponent, DescriptionListItem, DescriptionListLayout } from './description-list.component';
import { audit, computedName, installFakeCanvas, outcome, violations } from '../../testing/axe-jsdom';

/**
 * Request 039 (F-17, AC-7) under axe-core 4.14: clickable rows keep the
 * description-list group. Before 3.25 the row was a `role="button"` div,
 * which made its `dt` and `dd` presentational children (`definition-list`
 * and `dlitem` failed in the browser, design 039 §6).
 */
@Component({
  standalone: true,
  imports: [DescriptionListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<lc-description-list [items]="items" [layout]="layout()" [clickable]="clickable()" />`,
})
class Host {
  readonly items: DescriptionListItem[] = [
    { term: 'Bank', value: 'Sparkasse KölnBonn' },
    { term: 'Freigabe', value: 'Alle Erwachsenen', emphasis: 'primary' },
    { term: 'Letzter Abruf', value: 'heute 09:14', datetime: '2026-11-02T09:14:00+01:00', emphasis: 'muted' },
  ];
  readonly layout = signal<DescriptionListLayout>('rows');
  readonly clickable = signal(true);
}

describe('DescriptionListComponent clickable rows — axe-core 4.14 (F-17)', () => {
  let fixture: ComponentFixture<Host>;
  let restoreCanvas: () => void;

  beforeAll(() => {
    restoreCanvas = installFakeCanvas();
  });

  afterAll(() => {
    restoreCanvas();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
  });

  async function render(layout: DescriptionListLayout, clickable: boolean): Promise<HTMLElement> {
    fixture.componentInstance.layout.set(layout);
    fixture.componentInstance.clickable.set(clickable);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it.each(['rows', 'stacked'] as const)('%s, clickable: definition-list, dlitem and button-name pass, no violations', async (layout) => {
    const root = await render(layout, true);
    const results = await audit(root);
    expect(violations(results)).toEqual([]);
    for (const rule of ['definition-list', 'dlitem', 'button-name']) expect([rule, outcome(results, rule)]).toEqual([rule, 'pass']);
    expect(outcome(results, 'nested-interactive')).not.toBe('violation');
  });

  it('names each row button "term value"', async () => {
    const root = await render('rows', true);
    const names = Array.from(root.querySelectorAll('.lc-dl__action')).map((button) => computedName(root, button));
    expect(names).toEqual(['Bank Sparkasse KölnBonn', 'Freigabe Alle Erwachsenen', 'Letzter Abruf heute 09:14']);
  });

  it('the default list has no violations either', async () => {
    const root = await render('rows', false);
    const results = await audit(root);
    expect(violations(results)).toEqual([]);
    expect(outcome(results, 'definition-list')).toBe('pass');
  });
});
