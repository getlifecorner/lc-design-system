import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DescriptionListComponent, type DescriptionListItem } from './description-list.component';
import { computedName } from '../../testing/axe-jsdom';

/**
 * 3.39 (request 059, finance-intelligence services-prove bug, AC-17, D-7): a
 * row's text has exactly one space between its parts. 3.37 put a space
 * between dt and leader and another between leader and dd, and the dd kept
 * the template's spaces round its text, so „Gesamtkosten Ist   522.530,00 €“.
 * The rows are compared as exact strings, as a consumer's spec does.
 */
describe('lc-description-list — single spaces in the text (3.39, request 059)', () => {
  let fixture: ComponentFixture<DescriptionListComponent>;
  let root: HTMLElement;

  beforeEach(() => TestBed.configureTestingModule({ imports: [DescriptionListComponent] }));
  afterEach(() => fixture?.destroy());

  const render = (items: DescriptionListItem[], inputs: Record<string, unknown> = {}) => {
    fixture = TestBed.createComponent(DescriptionListComponent);
    fixture.componentRef.setInput('items', items);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    root = fixture.nativeElement as HTMLElement;
  };
  const rowTexts = () => Array.from(root.querySelectorAll('.lc-dl__row')).map((row) => row.textContent);

  const TOTAL: DescriptionListItem[] = [
    { term: 'Personalkosten', value: '412.300,00 €' },
    { term: 'Gesamtkosten Ist', value: '522.530,00 €', total: true },
  ];
  const KINDS: DescriptionListItem[] = [
    { term: 'Zustand', value: '', badge: 'Geladen', badgeVariant: 'success' },
    { term: 'Fassung', value: '1', badge: 'Freigegeben', badgeVariant: 'success' },
    { term: 'Access', value: 'Token stored · read only', valueSuffix: 'x' },
    { term: 'Beleg', value: 'Details', href: '#beleg', valueSuffix: 'ansehen' },
    { term: 'Letzter Lauf', value: 'heute 06:00', datetime: '2026-11-09T06:00:00+01:00', valueSuffix: '(automatisch)' },
    { term: 'Plan', value: '', badge: 'Entwurf', valueSuffix: 'offen' },
    { term: 'Zeilen', value: '12.408' },
  ];
  const KIND_TEXTS = [
    'Zustand Geladen',
    'Fassung 1 Freigegeben',
    'Access Token stored · read only x',
    'Beleg Details ansehen',
    'Letzter Lauf heute 06:00 (automatisch)',
    'Plan Entwurf offen',
    'Zeilen 12.408',
  ];

  it('the total row with totalAriaLabel: „Summe, Gesamtkosten Ist 522.530,00 €“', () => {
    render(TOTAL, { totalAriaLabel: 'Summe' });
    expect(rowTexts()).toEqual(['Personalkosten 412.300,00 €', 'Summe, Gesamtkosten Ist 522.530,00 €']);
  });

  it('the total row without totalAriaLabel: „Gesamtkosten Ist 522.530,00 €“', () => {
    render(TOTAL);
    expect(rowTexts()[1]).toBe('Gesamtkosten Ist 522.530,00 €');
    expect(root.querySelector('.lc-dl__sr-only')).toBeNull();
  });

  it('badge, badge after a value, suffix after text, a link, a time and a badge, plain value', () => {
    render(KINDS);
    expect(rowTexts()).toEqual(KIND_TEXTS);
  });

  it.each([
    ['rows', 'md', false],
    ['rows', 'sm', true],
    ['stacked', 'md', true],
    ['stacked', 'sm', false],
  ] as const)('%s %s clickable=%s: no run of whitespace and no space at a row or dd edge', (layout, size, clickable) => {
    render([...KINDS, ...TOTAL], { layout, size, clickable, totalAriaLabel: 'Summe', leaders: true });
    const rows = Array.from(root.querySelectorAll('.lc-dl__row'));
    for (const row of rows) {
      expect(row.textContent).not.toMatch(/\s{2,}/);
      expect(row.textContent).not.toMatch(/^\s|\s$/);
      expect(row.querySelector('dd')?.textContent).not.toMatch(/^\s|\s$/);
    }
    expect(rows.map((row) => row.textContent)).toEqual([...KIND_TEXTS, 'Personalkosten 412.300,00 €', 'Summe, Gesamtkosten Ist 522.530,00 €']);
  });

  it('the hidden prefix is still read and the leader stays hidden; the button is named by term and value', () => {
    render(TOTAL, { totalAriaLabel: 'Summe', clickable: true });
    const total = root.querySelectorAll('.lc-dl__row')[1] as HTMLElement;
    expect(total.querySelector('.lc-dl__sr-only')?.textContent).toBe('Summe,');
    expect(total.querySelector('.lc-dl__leader')?.getAttribute('aria-hidden')).toBe('true');
    expect(computedName(root, total.querySelector('.lc-dl__action') as HTMLElement)).toBe('Summe, Gesamtkosten Ist 522.530,00 €');
  });

  it('keeps the spaces inside a value as given (only the template spaces are gone)', () => {
    render([{ term: 'Notiz', value: 'a  b' }]);
    expect(rowTexts()).toEqual(['Notiz a  b']);
  });
});
