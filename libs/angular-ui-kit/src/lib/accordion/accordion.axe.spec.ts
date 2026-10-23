import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AccordionComponent } from './accordion.component';
import { AccordionHeaderDirective } from './accordion-header.directive';
import { LABEL_IN_NAME as RULE, audit, computedName, installFakeCanvas, outcome, outcomeFor, violations } from '../../testing/axe-jsdom';

/**
 * Request 015 (AS-33, AC-1, AC-2, AC-5, AC-7, AC-8): the header button under
 * axe-core 4.14. A plain title is named `ariaLabel` (or the title), then the
 * title unless contained; a rich header with a label is named by its hidden
 * label and the template's text through `aria-labelledby`; a rich header
 * without one by its content, as before.
 */
@Component({
  standalone: true,
  imports: [AccordionComponent, AccordionHeaderDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-accordion class="plain" [title]="title()" [ariaLabel]="label()">Body</lc-accordion>
    <lc-accordion class="rich" [ariaLabel]="label()">
      <ng-template lcAccordionHeader>
        <span>{{ first() }}</span>&ngsp;
        <span class="status">{{ status() }}</span>&ngsp;
        <span style="margin-left: auto;">12:04</span>
      </ng-template>
      Body
    </lc-accordion>
  `,
})
class HostComponent {
  readonly title = signal('Versand');
  readonly label = signal('');
  readonly first = signal('Item One');
  readonly status = signal('Complete');
}

describe('AccordionComponent — axe-core 4.14 (AS-33)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let restoreCanvas: () => void;

  beforeAll(() => {
    restoreCanvas = installFakeCanvas();
  });

  afterAll(() => {
    restoreCanvas();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
  });

  async function render(values: Partial<Record<'title' | 'label' | 'first' | 'status', string>>): Promise<HTMLElement> {
    fixture = TestBed.createComponent(HostComponent);
    const host = fixture.componentInstance;
    for (const [key, value] of Object.entries(values)) host[key as keyof typeof values].set(value);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const button = (root: HTMLElement, which: 'plain' | 'rich') =>
    root.querySelector<HTMLButtonElement>(`lc-accordion.${which} .lc-accordion__header`) as HTMLButtonElement;
  const panel = (root: HTMLElement, which: 'plain' | 'rich') => root.querySelector(`lc-accordion.${which} .lc-accordion__panel`) as HTMLElement;

  /** design.md §4: inputs, the plain and the rich header's computed names. */
  const rows: readonly { case: string; values: Partial<Record<'title' | 'label' | 'first' | 'status', string>>; plain: string; rich: string }[] = [
    { case: 'EN, no label', values: { title: 'Shipping' }, plain: 'Shipping', rich: 'Item One Complete 12:04' },
    { case: 'EN, label', values: { title: 'Shipping', label: 'Pipeline run' }, plain: 'Pipeline run, Shipping', rich: 'Pipeline run, Item One Complete 12:04' },
    {
      case: 'DE, label',
      values: { title: 'Versand', label: 'Pipeline-Lauf', first: 'Schritt Eins', status: 'Fertig' },
      plain: 'Pipeline-Lauf, Versand',
      rich: 'Pipeline-Lauf, Schritt Eins Fertig 12:04',
    },
    // The label already holds the plain title: unchanged.
    { case: 'DE, label holds the title', values: { title: 'Versand', label: 'Versand und Rückgabe' }, plain: 'Versand und Rückgabe', rich: 'Versand und Rückgabe, Item One Complete 12:04' },
  ];

  describe.each(rows)('$case', (row) => {
    it(`names the plain header "${row.plain}" and the rich one "${row.rich}", both pass`, async () => {
      const root = await render(row.values);
      expect(computedName(root, button(root, 'plain'))).toBe(row.plain);
      expect(computedName(root, button(root, 'rich'))).toBe(row.rich);
      // AC-5: the label starts both names.
      if (row.values.label) {
        expect(button(root, 'plain').getAttribute('aria-label')?.startsWith(row.values.label)).toBe(true);
        expect(computedName(root, button(root, 'rich')).startsWith(`${row.values.label}, `)).toBe(true);
      }
      const results = await audit(root);
      expect(violations(results)).toEqual([]);
      expect(outcomeFor(results, RULE, button(root, 'plain'))).toBe('pass');
      expect(outcomeFor(results, RULE, button(root, 'rich'))).not.toBe('violation');
    });
  });

  it('wires a labelled rich header through aria-labelledby, its panel too', async () => {
    const root = await render({ label: 'Pipeline run' });
    const rich = button(root, 'rich');
    expect(rich.hasAttribute('aria-label')).toBe(false);
    const ids = rich.getAttribute('aria-labelledby')?.split(' ') ?? [];
    expect(ids).toEqual([`${rich.id}-label`, `${rich.id}-content`]);
    const label = root.querySelector(`#${ids[0]}`) as HTMLElement;
    expect(label.hidden).toBe(true);
    expect(label.textContent).toBe('Pipeline run,');
    expect(root.querySelector(`#${ids[1]}`)?.classList).toContain('lc-accordion__header-content');
    expect(panel(root, 'rich').getAttribute('aria-labelledby')).toBe(rich.getAttribute('aria-labelledby'));
  });

  it('leaves a rich header without a label as before: no aria-label, no labelledby, panel by header id', async () => {
    const root = await render({});
    const rich = button(root, 'rich');
    expect(rich.hasAttribute('aria-label')).toBe(false);
    expect(rich.hasAttribute('aria-labelledby')).toBe(false);
    expect(rich.querySelector('[hidden]')).toBeNull();
    expect(rich.querySelector('.lc-accordion__header-content')?.hasAttribute('id')).toBe(false);
    expect(panel(root, 'rich').getAttribute('aria-labelledby')).toBe(rich.id);
    expect(panel(root, 'plain').getAttribute('aria-labelledby')).toBe(button(root, 'plain').id);
  });

  it('follows the label and the template text in the same change detection pass (AC-7)', async () => {
    const root = await render({ label: 'Pipeline run' });
    fixture.componentInstance.label.set('Build');
    fixture.componentInstance.status.set('Failed');
    fixture.detectChanges();
    expect(computedName(root, button(root, 'rich'))).toBe('Build, Item One Failed 12:04');
    expect(button(root, 'plain').getAttribute('aria-label')).toBe('Build, Versand');
  });

  it('fails label-content-name-mismatch with the pre-3.11.5 name (negative control, AC-2)', async () => {
    const root = await render({ label: 'Item one details' });
    const rich = button(root, 'rich');
    rich.removeAttribute('aria-labelledby');
    rich.setAttribute('aria-label', 'Item one details');
    const results = await audit(root);
    expect(outcome(results, RULE)).toBe('violation');
    expect(results.violations.map((v) => v.id)).toEqual([RULE]);
    expect(outcomeFor(results, RULE, rich)).toBe('violation');
  });
});
