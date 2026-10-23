import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';
import { LABEL_IN_NAME as RULE, audit, computedName, installFakeCanvas, outcome, outcomeFor, violations } from '../../testing/axe-jsdom';

/**
 * Request 015 (AS-33, AC-1, AC-2, AC-5, AC-7): the previous and next buttons
 * under axe-core 4.14. jsdom ignores media queries, so their text counts as
 * visible at every width (the strict case; below 640 px it is display: none).
 */
describe('PaginationComponent — axe-core 4.14 (AS-33)', () => {
  let fixture: ComponentFixture<PaginationComponent>;
  let restoreCanvas: () => void;

  beforeAll(() => {
    restoreCanvas = installFakeCanvas();
  });

  afterAll(() => {
    restoreCanvas();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PaginationComponent] }).compileComponents();
  });

  async function render(inputs: Record<string, unknown>): Promise<HTMLElement> {
    fixture = TestBed.createComponent(PaginationComponent);
    for (const [name, value] of Object.entries({ totalItems: 50, currentPage: 2, ...inputs })) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const prev = (root: HTMLElement) => root.querySelector<HTMLButtonElement>('.lc-pagination__button--prev') as HTMLButtonElement;
  const next = (root: HTMLElement) => root.querySelector<HTMLButtonElement>('.lc-pagination__button--next') as HTMLButtonElement;

  const DE = { previousLabel: 'Zurück', nextLabel: 'Weiter', previousAriaLabel: 'Vorherige Seite', nextAriaLabel: 'Nächste Seite', pageAriaLabel: 'Seite {page}' };

  /** design.md §4: inputs, the computed names of previous and next. */
  const rows: readonly { case: string; inputs: Record<string, unknown>; names: [string, string] }[] = [
    // The default names already contain "Previous" and "Next": unchanged.
    { case: 'EN defaults', inputs: {}, names: ['Previous page', 'Next page'] },
    { case: 'DE (Localized story)', inputs: DE, names: ['Vorherige Seite, Zurück', 'Nächste Seite, Weiter'] },
    {
      case: 'DE, label holds the text',
      inputs: { ...DE, previousAriaLabel: 'Zurück zur vorherigen Seite', nextAriaLabel: 'Weiter zur nächsten Seite' },
      names: ['Zurück zur vorherigen Seite', 'Weiter zur nächsten Seite'],
    },
  ];

  describe.each(rows)('$case', (row) => {
    it(`names previous "${row.names[0]}" and next "${row.names[1]}", both pass`, async () => {
      const root = await render(row.inputs);
      expect([computedName(root, prev(root)), computedName(root, next(root))]).toEqual(row.names);
      // AC-5: the consumer's label stays the prefix.
      expect(prev(root).getAttribute('aria-label')?.startsWith(String(row.inputs['previousAriaLabel'] ?? 'Previous page'))).toBe(true);
      const results = await audit(root);
      expect(violations(results)).toEqual([]);
      expect(outcomeFor(results, RULE, prev(root))).toBe('pass');
      expect(outcomeFor(results, RULE, next(root))).toBe('pass');
    });
  });

  it('follows a new previousLabel in the same change detection pass, on any page (AC-7)', async () => {
    const root = await render(DE);
    fixture.componentRef.setInput('previousLabel', 'Vorige');
    fixture.componentRef.setInput('currentPage', 5);
    fixture.detectChanges();
    expect(prev(root).getAttribute('aria-label')).toBe('Vorherige Seite, Vorige');
    expect(next(root).getAttribute('aria-label')).toBe('Nächste Seite, Weiter');
  });

  it('fails label-content-name-mismatch with the pre-3.11.5 names (negative control, AC-2)', async () => {
    const root = await render(DE);
    prev(root).setAttribute('aria-label', 'Vorherige Seite');
    next(root).setAttribute('aria-label', 'Nächste Seite');
    const results = await audit(root);
    expect(outcome(results, RULE)).toBe('violation');
    expect(results.violations.map((v) => v.id)).toEqual([RULE]);
    expect(outcomeFor(results, RULE, prev(root))).toBe('violation');
    expect(outcomeFor(results, RULE, next(root))).toBe('violation');
  });
});
