import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { StatTrendComponent, StatTrendLabels, StatTrendSentiment } from './stat-trend.component';
import { CardComponent } from '../card/card.component';
import { LABEL_IN_NAME as RULE, audit, installFakeCanvas, outcome, outcomeFor, violations } from '../../testing/axe-jsdom';

/**
 * Request 031 (gap file cockpit-2026-11-01 row 2, AC-3): a stat trend inside
 * a clickable card under axe-core 4.14. The card's name starts with the
 * visible label and holds the value, so with the separators the visible text
 * is a contiguous run of the name's words and WCAG 2.5.3 passes.
 *
 * jsdom has no component styles: the sentiment's visually hidden words count
 * as visible here, not in the browser. The sentiment row therefore puts them
 * right after the change, where both readings are contained; the sparkline row
 * has no sentiment (design.md §6, B3).
 */
@Component({
  standalone: true,
  imports: [CardComponent, StatTrendComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-card variant="outlined" padding="md" borderRadius="md" [clickable]="true" [ariaLabel]="name()">
      <lc-stat-trend
        [label]="label()"
        [value]="value()"
        [icon]="icon()"
        [change]="change()"
        [sentiment]="sentiment()"
        [labels]="labels()"
        [sparklineData]="data()"
      />
    </lc-card>
  `,
})
class HostComponent {
  readonly name = signal('');
  readonly label = signal('Gesamtkosten Plan 2026');
  readonly value = signal('571.000,00 €');
  readonly icon = signal('');
  readonly change = signal('');
  readonly sentiment = signal<StatTrendSentiment | undefined>(undefined);
  readonly labels = signal<Partial<StatTrendLabels>>({});
  readonly data = signal<number[]>([]);
}

interface Inputs {
  icon?: string;
  change?: string;
  sentiment?: StatTrendSentiment;
  labels?: Partial<StatTrendLabels>;
  data?: number[];
}

const DE: Partial<StatTrendLabels> = { up: 'gestiegen', negative: 'ungünstig' };
const SOURCE = 'Herkunft anzeigen';

describe('StatTrendComponent in a clickable card — axe-core 4.14 (031)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let restoreCanvas: () => void;

  beforeAll(() => {
    restoreCanvas = installFakeCanvas();
  });

  afterAll(() => {
    restoreCanvas();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(withXhr())],
    }).compileComponents();
  });

  async function render(inputs: Inputs, name: (root: HTMLElement) => string): Promise<{ root: HTMLElement; card: HTMLElement }> {
    fixture = TestBed.createComponent(HostComponent);
    const host = fixture.componentInstance;
    if (inputs.icon !== undefined) host.icon.set(inputs.icon);
    if (inputs.change !== undefined) host.change.set(inputs.change);
    if (inputs.sentiment !== undefined) host.sentiment.set(inputs.sentiment);
    if (inputs.labels !== undefined) host.labels.set(inputs.labels);
    if (inputs.data !== undefined) host.data.set(inputs.data);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    host.name.set(name(root));
    fixture.detectChanges();
    await fixture.whenStable();
    return { root, card: root.querySelector('[role="button"]') as HTMLElement };
  }

  /** The sparkline's own name, as the consumer repeats it in the card's name (design.md §6). */
  const sparklineName = (root: HTMLElement) => root.querySelector('lc-sparkline svg')?.getAttribute('aria-label') ?? '';

  const rows: readonly { case: string; inputs: Inputs; name: (root: HTMLElement) => string }[] = [
    { case: 'label and value', inputs: {}, name: () => `Gesamtkosten Plan 2026: 571.000,00 €. ${SOURCE}` },
    { case: 'with icon', inputs: { icon: 'wallet' }, name: () => `Gesamtkosten Plan 2026: 571.000,00 €. ${SOURCE}` },
    { case: 'with change', inputs: { icon: 'wallet', change: '+3,1 %' }, name: () => `Gesamtkosten Plan 2026: 571.000,00 €, +3,1 %. ${SOURCE}` },
    {
      case: 'with sentiment (DE)',
      inputs: { icon: 'wallet', change: '+3,1 %', sentiment: 'negative', labels: DE },
      name: () => `Gesamtkosten Plan 2026: 571.000,00 €, +3,1 %, gestiegen, ungünstig. ${SOURCE}`,
    },
    {
      case: 'with sparkline',
      inputs: { change: '+3,1 %', data: [44.1, 46.4, 48.2] },
      name: (root) => `Gesamtkosten Plan 2026: 571.000,00 €, +3,1 %, ${sparklineName(root)}. ${SOURCE}`,
    },
  ];

  describe.each(rows)('$case', (row) => {
    it('passes label-content-name-mismatch on the card', async () => {
      const { root, card } = await render(row.inputs, row.name);
      expect(card.getAttribute('aria-label')).toBe(row.name(root));
      const results = await audit(root);
      expect(violations(results)).toEqual([]);
      expect(outcomeFor(results, RULE, card)).toBe('pass');
    });
  });

  it('fails without the separators (negative control: the 3.22.0 text)', async () => {
    const row = rows[2];
    const { root, card } = await render(row.inputs, row.name);
    const header = root.querySelector('.lc-stat-trend__header') as HTMLElement;
    const value = root.querySelector('.lc-stat-trend__value') as HTMLElement;
    for (const separator of [header.nextSibling, value.nextSibling]) {
      expect(separator?.nodeType).toBe(Node.TEXT_NODE);
      separator?.remove();
    }
    const results = await audit(root);
    expect(outcome(results, RULE)).toBe('violation');
    expect(results.violations.map((v) => v.id)).toEqual([RULE]);
    expect(outcomeFor(results, RULE, card)).toBe('violation');
  });
});
