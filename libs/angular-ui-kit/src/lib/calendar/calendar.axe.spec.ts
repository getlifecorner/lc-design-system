import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';
import { LABEL_IN_NAME as RULE, audit, computedName, installFakeCanvas, outcome, outcomeFor, violations } from '../../testing/axe-jsdom';

/**
 * Request 015 (AS-33, AC-1, AC-2, AC-7): the week view's column headers under
 * axe-core 4.14. Each is named by its visible text ("Mo., 19."), then its own
 * month and year. The date is set through the protected `currentDate` signal
 * (axe needs real timers, so no fake clock).
 */
describe('CalendarComponent — axe-core 4.14 (AS-33)', () => {
  let fixture: ComponentFixture<CalendarComponent>;
  let restoreCanvas: () => void;

  beforeAll(() => {
    restoreCanvas = installFakeCanvas();
  });

  afterAll(() => {
    restoreCanvas();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CalendarComponent] }).compileComponents();
  });

  async function render(date: Date, inputs: Record<string, unknown> = {}): Promise<HTMLElement> {
    fixture = TestBed.createComponent(CalendarComponent);
    fixture.componentRef.setInput('view', 'week');
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.componentInstance['currentDate'].set(date);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const headers = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLButtonElement>('button.lc-calendar__time-col-header'));

  it('names the week columns "Mo., 19. Oktober 2026" … in de-DE, and every one passes', async () => {
    const root = await render(new Date(2026, 9, 21));
    const columns = headers(root);
    expect(columns.map((b) => computedName(root, b))).toEqual([
      'Mo., 19. Oktober 2026',
      'Di., 20. Oktober 2026',
      'Mi., 21. Oktober 2026',
      'Do., 22. Oktober 2026',
      'Fr., 23. Oktober 2026',
      'Sa., 24. Oktober 2026',
      'So., 25. Oktober 2026',
    ]);
    // The name starts with exactly what the column shows.
    for (const b of columns) expect(b.getAttribute('aria-label')?.startsWith(b.textContent?.trim() ?? '\u0000')).toBe(true);
    const results = await audit(root);
    expect(violations(results)).toEqual([]);
    for (const b of columns) expect(outcomeFor(results, RULE, b)).toBe('pass');
  });

  it('gives each day its own month in a week that spans two', async () => {
    const root = await render(new Date(2026, 9, 28));
    const names = headers(root).map((b) => b.getAttribute('aria-label'));
    expect(names[0]).toBe('Mo., 26. Oktober 2026');
    expect(names[6]).toBe('So., 1. November 2026');
  });

  it('follows the locale (en-US: "19 Mon October 2026")', async () => {
    const root = await render(new Date(2026, 9, 21), { locale: 'en-US' });
    const first = headers(root)[0];
    if (!first) throw new Error('no column header');
    expect(computedName(root, first)).toBe('19 Mon October 2026');
    const results = await audit(root);
    expect(violations(results)).toEqual([]);
    expect(outcomeFor(results, RULE, first)).toBe('pass');
  });

  it('follows navigation in the same change detection pass (AC-7)', async () => {
    const root = await render(new Date(2026, 9, 21));
    fixture.componentInstance['navigateNext']();
    fixture.detectChanges();
    expect(headers(root)[0]?.getAttribute('aria-label')).toBe('Mo., 26. Oktober 2026');
  });

  it('fails label-content-name-mismatch with the pre-3.11.5 name (negative control, AC-2)', async () => {
    const root = await render(new Date(2026, 9, 21));
    const first = headers(root)[0];
    if (!first) throw new Error('no column header');
    first.setAttribute('aria-label', 'Montag, 19. Oktober 2026');
    const results = await audit(root);
    expect(outcome(results, RULE)).toBe('violation');
    expect(results.violations.map((v) => v.id)).toEqual([RULE]);
    expect(outcomeFor(results, RULE, first)).toBe('violation');
  });
});
