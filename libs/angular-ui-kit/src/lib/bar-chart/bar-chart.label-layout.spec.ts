import { resolve } from 'path';
import { compile } from 'sass';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarChartComponent, BarChartItem, BarChartValueFormatter } from './bar-chart.component';

/**
 * 3.21 (request 028, finance-intelligence cockpit-2026-11-01 row 1):
 * `labelLayout="wrap"` (HTML labels that wrap: rows for a horizontal chart, a
 * label row under a vertical one), `BarChartItem.valueText` and the bar's item
 * as `formatValue`'s second argument. Without them the SVG is as in 3.20.
 */
describe('BarChartComponent labelLayout, valueText and the item formatter (3.21, request 028)', () => {
  let fixture: ComponentFixture<BarChartComponent>;
  const NBSP = ' ';
  const RANKING: BarChartItem[] = [
    { value: 313000, label: 'Demo Applikation', valueText: `313.000,00 · 54,8${NBSP}%` },
    { value: 180000, label: 'Demo Arbeitsplatz', valueText: `180.000,00 · 31,5${NBSP}%` },
    { value: 78000, label: 'Demo Netz', valueText: `78.000,00 · 13,7${NBSP}%` },
  ];

  const el = () => fixture.nativeElement as HTMLElement;
  const all = (selector: string) => Array.from(el().querySelectorAll(selector)) as HTMLElement[];
  const one = (selector: string) => el().querySelector(selector) as HTMLElement;
  const texts = (selector: string) => all(selector).map((e) => (e.textContent ?? '').trim());
  const imgName = () => one('[role="img"]').getAttribute('aria-label');
  const num = (e: Element, name: string) => parseFloat(e.getAttribute(name) ?? 'NaN');
  const set = (inputs: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    fixture.detectChanges();
  };
  const measure = (width: number) => {
    (fixture.componentInstance as unknown as { _containerWidth: { set(n: number): void } })._containerWidth.set(width);
    fixture.detectChanges();
  };
  const svgHash = () => {
    const s = one('svg').outerHTML.replace(/ _ngcontent-[a-z0-9-]+=""/g, '');
    return { len: s.length, hash: [...s].reduce((x, c) => (x * 31 + c.charCodeAt(0)) | 0, 0) };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BarChartComponent] }).compileComponents();
    fixture = TestBed.createComponent(BarChartComponent);
  });

  describe('default rendering (AC-1, AC-9)', () => {
    const DATA = [{ value: 42, label: 'Q1' }, { value: -18, label: 'Q2' }, { value: 25, label: 'Q3' }];

    it('labelLayout defaults to axis: one SVG, no rows and no label row', () => {
      set({ data: DATA });
      expect(fixture.componentInstance.labelLayout()).toBe('axis');
      expect(el().children.length).toBe(1);
      expect(el().children[0].tagName.toLowerCase()).toBe('svg');
      expect(all('.lc-bar-chart__row, .lc-bar-chart--rows, .lc-bar-chart__category-labels').length).toBe(0);
      expect(texts('.lc-bar-chart__label')).toEqual(['Q1', 'Q2', 'Q3']);
    });

    // Length and hash of the 3.20.0 SVG markup (`_ngcontent` stripped), taken
    // from the 3.20.0 component for the same inputs, before and after the
    // container is measured: attributes, positions, text and comment anchors.
    it('pins the 3.20.0 vertical SVG markup byte for byte', () => {
      set({ data: DATA });
      expect(svgHash()).toEqual({ len: 2738, hash: 1152392471 });
      measure(328);
      expect(svgHash()).toEqual({ len: 2751, hash: -406093170 });
    });

    it('pins the 3.20.0 horizontal SVG markup byte for byte', () => {
      set({ data: DATA, orientation: 'horizontal' });
      expect(svgHash()).toEqual({ len: 2644, hash: 2145069018 });
      measure(328);
      expect(svgHash()).toEqual({ len: 2667, hash: 737768385 });
    });

    it('labelLayout="axis" set explicitly renders the same markup', () => {
      set({ data: DATA, labelLayout: 'axis' });
      expect(svgHash()).toEqual({ len: 2738, hash: 1152392471 });
    });
  });

  describe('valueText and formatValue(value, item) (AC-6, AC-7, AC-8)', () => {
    it('AC-6: valueText replaces the formatted value on the SVG value label', () => {
      set({ data: [{ value: 313000, label: 'A', valueText: '313.000,00 · 54,8 %' }, { value: 2, label: 'B' }], orientation: 'horizontal' });
      expect(texts('.lc-bar-chart__value')).toEqual(['313.000,00 · 54,8 %', '2']);
    });

    it('AC-7: bars pass (value, item), ticks pass the tick alone', () => {
      const items: BarChartItem[] = [{ value: 40, label: 'A' }, { value: 80, label: 'B' }];
      const fmt = jest.fn((v: number, item?: BarChartItem) => (item ? `${v} ${item.label}` : `t${v}`));
      set({ data: items, formatValue: fmt });
      const calls = fmt.mock.calls as unknown[][];
      const barCalls = calls.filter((c) => c.length === 2);
      const tickCalls = calls.filter((c) => c.length === 1);
      expect(barCalls.length).toBeGreaterThan(0);
      for (const c of barCalls) expect(items).toContain(c[1]);
      expect(barCalls.some((c) => c[0] === 40 && c[1] === items[0])).toBe(true);
      expect(tickCalls.length).toBeGreaterThan(0);
      for (const c of tickCalls) expect(c[1]).toBeUndefined();
      expect(texts('.lc-bar-chart__value')).toEqual(['40 A', '80 B']);
      expect(texts('.lc-bar-chart__grid-label')).toContain('t0');
    });

    it('AC-7: a one-argument formatter keeps working and type-checks', () => {
      const oneArg: BarChartValueFormatter = (v: number) => `${v} €`;
      set({ data: [{ value: 5, label: 'A' }], formatValue: oneArg });
      expect(texts('.lc-bar-chart__value')).toEqual(['5 €']);
      expect(one('svg').getAttribute('aria-label')).toBe('Bar chart: A 5 €');
    });

    it('AC-8: precedence valueText → formatValue(value, item); the aria label reads the same text', () => {
      const data: BarChartItem[] = [
        { value: 313000, label: 'Demo Applikation', valueText: '313.000,00 · 54,8 %' },
        { value: 180000, label: 'Demo Arbeitsplatz' },
      ];
      const fmt = (v: number, item?: BarChartItem) => `${v / 1000}k${item ? ` ${(item.label ?? '').length}` : ''}`;
      for (const labelLayout of ['axis', 'wrap']) {
        set({ data, formatValue: fmt, orientation: 'horizontal', labelLayout });
        expect(imgName()).toBe('Bar chart: Demo Applikation 313.000,00 · 54,8 %, Demo Arbeitsplatz 180k 17');
      }
      expect(texts('.lc-bar-chart__row-value')).toEqual(['313.000,00 · 54,8 %', '180k 17']);
    });

    it('AC-8: an explicit ariaLabel still wins; an empty valueText leaves the label alone', () => {
      set({ data: [{ value: 1, label: 'A', valueText: '' }, { value: 2 }], labelLayout: 'wrap', orientation: 'horizontal' });
      expect(imgName()).toBe('Bar chart: A, Bar 2 2');
      expect(all('.lc-bar-chart__row-value').length).toBe(1);
      set({ ariaLabel: 'Teuerste Services' });
      expect(imgName()).toBe('Teuerste Services');
    });
  });

  describe('horizontal labelLayout="wrap" (AC-2, AC-11, AC-13, AC-14)', () => {
    it('renders one row per bar: label, value, then a full-width track', () => {
      set({ data: RANKING, orientation: 'horizontal', labelLayout: 'wrap' });
      expect(all('svg.lc-bar-chart').length).toBe(0);
      const rows = all('.lc-bar-chart--rows > .lc-bar-chart__row');
      expect(rows.length).toBe(3);
      expect(texts('.lc-bar-chart__row-label')).toEqual(['Demo Applikation', 'Demo Arbeitsplatz', 'Demo Netz']);
      expect(texts('.lc-bar-chart__row-value')).toEqual(RANKING.map((r) => r.valueText));
      for (const row of rows) {
        expect(Array.from(row.children).map((c) => c.getAttribute('class'))).toEqual(['lc-bar-chart__row-head', 'lc-bar-chart__row-track']);
        expect(row.querySelector('svg')?.getAttribute('width')).toBe('100%');
      }
    });

    it('AC-11, AC-13: the longest bar fills the track; x and width are percentages, independent of the measured width', () => {
      set({ data: RANKING, orientation: 'horizontal', labelLayout: 'wrap' });
      const read = () => all('.lc-bar-chart__row-bar').map((r) => [r.getAttribute('x'), r.getAttribute('width')]);
      const before = read();
      expect(before[0]).toEqual(['0%', '100%']);
      expect(parseFloat(before[1][1] ?? '')).toBeCloseTo((180000 / 313000) * 100, 6);
      expect(parseFloat(before[2][1] ?? '')).toBeCloseTo((78000 / 313000) * 100, 6);
      for (const [x, w] of before) {
        expect(x).toMatch(/%$/);
        expect(w).toMatch(/%$/);
      }
      measure(294);
      expect(read()).toEqual(before);
      measure(702);
      expect(read()).toEqual(before);
    });

    it('AC-13: no inline style in the rows (strict CSP writes style="" on the server)', () => {
      set({ data: RANKING, orientation: 'horizontal', labelLayout: 'wrap', color: 'var(--color-primary-500)' });
      expect(el().querySelectorAll('[style]').length).toBe(0);
      expect(all('.lc-bar-chart__row-bar').map((r) => r.getAttribute('fill'))).toEqual(Array(3).fill('var(--color-primary-500)'));
    });

    it('bars take the color input, then item.color, then the palette', () => {
      set({ data: [{ value: 1, color: 'red' }, { value: 2 }], orientation: 'horizontal', labelLayout: 'wrap' });
      const fills = all('.lc-bar-chart__row-bar').map((r) => r.getAttribute('fill'));
      expect(fills[0]).toBe('red');
      expect(fills[1]).toMatch(/^var\(--/);
    });

    it('negative values: a zero line in every track, bars grow left from it', () => {
      set({ data: [{ value: 120000, label: 'A' }, { value: -45000, label: 'B' }, { value: 30000, label: 'C' }], orientation: 'horizontal', labelLayout: 'wrap' });
      const zero = (45000 / 165000) * 100;
      const lines = all('.lc-bar-chart__zero-line');
      expect(lines.length).toBe(3);
      for (const l of lines) {
        expect(num(l, 'x1')).toBeCloseTo(zero, 6);
        expect(l.getAttribute('x2')).toBe(l.getAttribute('x1'));
        // Review r1: inside the track the bar covers the line, so it reaches
        // 25 % of the bar size past both ends (a tick above and below the bar).
        expect(l.getAttribute('y1')).toBe('-25%');
        expect(l.getAttribute('y2')).toBe('125%');
        expect(l.nextElementSibling?.classList).toContain('lc-bar-chart__row-bar');
        expect(l.closest('svg')?.classList).toContain('lc-bar-chart__row-track');
      }
      const bars = all('.lc-bar-chart__row-bar').map((r) => [num(r, 'x'), num(r, 'width')]);
      expect(bars[0][0]).toBeCloseTo(zero, 6);
      expect(bars[0][0] + bars[0][1]).toBeCloseTo(100, 6);
      expect(bars[1][0]).toBeCloseTo(0, 6);
      expect(bars[1][0] + bars[1][1]).toBeCloseTo(zero, 6);
    });

    it('no zero line without negative values', () => {
      set({ data: RANKING, orientation: 'horizontal', labelLayout: 'wrap' });
      expect(all('.lc-bar-chart__zero-line').length).toBe(0);
    });

    it('showLabels / showValues drop their part of the head; both false leave the bar alone', () => {
      set({ data: RANKING, orientation: 'horizontal', labelLayout: 'wrap', showValues: false });
      expect(all('.lc-bar-chart__row-value').length).toBe(0);
      expect(all('.lc-bar-chart__row-label').length).toBe(3);
      set({ showValues: true, showLabels: false });
      expect(all('.lc-bar-chart__row-label').length).toBe(0);
      expect(all('.lc-bar-chart__row-value').length).toBe(3);
      set({ showValues: false });
      expect(all('.lc-bar-chart__row-head').length).toBe(0);
      expect(all('.lc-bar-chart__row-track').length).toBe(3);
    });

    it('a missing label has no label span, and the aria label says "Bar n"', () => {
      set({ data: [{ value: 3 }], orientation: 'horizontal', labelLayout: 'wrap' });
      expect(all('.lc-bar-chart__row-label').length).toBe(0);
      expect(texts('.lc-bar-chart__row-value')).toEqual(['3']);
      expect(imgName()).toBe('Bar chart: Bar 1 3');
    });

    it('empty data: the named img with no rows', () => {
      set({ data: [], orientation: 'horizontal', labelLayout: 'wrap' });
      const img = one('[role="img"]');
      expect(img.getAttribute('aria-label')).toBe('Bar chart: no data');
      expect(img.children.length).toBe(0);
    });

    it('NaN and undefined values draw zero-width bars without NaN in the markup', () => {
      set({ data: [{ value: NaN, label: 'A' }, { value: undefined as unknown as number, label: 'B' }, { value: 4, label: 'C' }], orientation: 'horizontal', labelLayout: 'wrap' });
      expect(all('.lc-bar-chart__row-bar').map((r) => r.getAttribute('width'))).toEqual(['0%', '0%', '100%']);
      expect(el().innerHTML).not.toMatch(/NaN|Infinity|undefined/);
    });

    it('AC-14: role="img" with a name, presentational text, hidden tracks, no tab stop', () => {
      set({ data: RANKING, orientation: 'horizontal', labelLayout: 'wrap' });
      const imgs = all('[role="img"]');
      expect(imgs.length).toBe(1);
      expect(imgs[0].classList).toContain('lc-bar-chart--rows');
      expect(imgs[0].getAttribute('aria-label')).toBe(
        `Bar chart: Demo Applikation 313.000,00 · 54,8${NBSP}%, Demo Arbeitsplatz 180.000,00 · 31,5${NBSP}%, Demo Netz 78.000,00 · 13,7${NBSP}%`
      );
      for (const track of all('.lc-bar-chart__row-track')) {
        expect(track.getAttribute('aria-hidden')).toBe('true');
        expect(track.getAttribute('focusable')).toBe('false');
      }
      expect(el().querySelectorAll('[tabindex], title, [title]').length).toBe(0);
    });
  });

  describe('vertical labelLayout="wrap" (AC-5, AC-14)', () => {
    const LABELS = ['Demo Applikation', 'Demo Arbeitsplatz', 'Demo Netz'];
    const data = (values: number[]) => values.map((value, i) => ({ value, label: LABELS[i] }));

    it('keeps the SVG plot, moves the labels into an HTML row under it', () => {
      set({ data: data([313, 180, 78]), labelLayout: 'wrap' });
      const svg = one('svg');
      expect(svg.getAttribute('role')).toBe('img');
      expect(svg.getAttribute('aria-label')).toBe('Bar chart: Demo Applikation 313, Demo Arbeitsplatz 180, Demo Netz 78');
      expect(svg.querySelector('title')?.textContent).toBe(svg.getAttribute('aria-label'));
      expect(svg.querySelectorAll('.lc-bar-chart__label').length).toBe(0);
      expect(svg.querySelectorAll('.lc-bar-chart__bar').length).toBe(3);
      const row = one('.lc-bar-chart__category-labels');
      expect(svg.nextElementSibling).toBe(row);
      expect(row.getAttribute('aria-hidden')).toBe('true');
      expect(texts('.lc-bar-chart__category-label')).toEqual(LABELS);
      expect(el().querySelectorAll('[tabindex]').length).toBe(0);
    });

    it('the plot reaches 2 px above the SVG bottom (18 with a negative value label below)', () => {
      const plotBottom = () => Number(el().querySelectorAll('.lc-bar-chart__axis')[0].getAttribute('y2'));
      set({ data: data([313, 180, 78]), labelLayout: 'wrap', height: 200 });
      expect(plotBottom()).toBe(198);
      set({ data: data([313, -180, 78]) });
      expect(plotBottom()).toBe(182);
      set({ showValues: false });
      expect(plotBottom()).toBe(198);
      set({ labelLayout: 'axis' });
      expect(plotBottom()).toBe(170);
    });

    it('showLabels=false: no label row', () => {
      set({ data: data([1, 2, 3]), labelLayout: 'wrap', showLabels: false });
      expect(el().querySelector('.lc-bar-chart__category-labels')).toBeNull();
      expect(el().children.length).toBe(1);
    });

    it('a horizontal axis chart never renders the label row', () => {
      set({ data: data([1, 2, 3]), orientation: 'horizontal' });
      expect(el().querySelector('.lc-bar-chart__category-labels')).toBeNull();
    });
  });

  describe('styles (AC-12, design §2 and §5)', () => {
    const css = compile(resolve(__dirname, 'bar-chart.component.scss')).css;
    const body = (selector: string, from = 0) => {
      const re = new RegExp(`(^|\\n)\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{`, 'g');
      re.lastIndex = from;
      const at = re.exec(css)?.index ?? -1;
      expect(at).toBeGreaterThan(-1);
      return css.slice(at, css.indexOf('}', at));
    };

    it('reads the two hooks at their point of use with the documented defaults, never on :host', () => {
      expect(body('.lc-bar-chart__row-track')).toMatch(/height: var\(--lc-bar-chart-bar-size, 0\.75rem\);/);
      expect(body('.lc-bar-chart--rows')).toMatch(/gap: var\(--lc-bar-chart-row-gap, var\(--spacing-4\)\);/);
      expect(css).not.toMatch(/--lc-bar-chart-(bar-size|row-gap)\s*:/);
    });

    it('row text is text-primary at 14/21, the value semibold with tabular figures; long words hyphenate', () => {
      const head = body('.lc-bar-chart__row-head');
      expect(head).toMatch(/font-size: var\(--typography-font-size-sm\);/);
      expect(head).toMatch(/line-height: var\(--typography-line-height-normal\);/);
      expect(head).toMatch(/flex-wrap: wrap;/);
      const label = body('.lc-bar-chart__row-label');
      expect(label).toMatch(/color: var\(--color-text-primary\);/);
      expect(label).toMatch(/hyphens: auto;/);
      expect(label).toMatch(/hyphenate-limit-chars: 12 4 3;/);
      const value = body('.lc-bar-chart__row-value');
      expect(value).toMatch(/color: var\(--color-text-primary\);/);
      expect(value).toMatch(/font-weight: var\(--typography-font-weight-semibold\);/);
      expect(value).toMatch(/font-variant-numeric: tabular-nums;/);
      expect(value).toMatch(/margin-inline-start: auto;/);
    });

    it('column labels are text-secondary, centred in cells that line up with the plot (40 / 10)', () => {
      expect(body('.lc-bar-chart__category-labels')).toMatch(/padding: var\(--spacing-1\) 10px 0 40px;/);
      const cell = body('.lc-bar-chart__category-label');
      expect(cell).toMatch(/flex: 1 1 0%;/);
      expect(cell).toMatch(/color: var\(--color-text-secondary\);/);
      expect(cell).toMatch(/text-align: center;/);
    });

    it('the zero line is a 1 px text-tertiary stroke that the track lets out past its ends (review r1)', () => {
      const line = body('.lc-bar-chart__zero-line');
      expect(line).toMatch(/stroke: var\(--color-text-tertiary\);/);
      expect(line).toMatch(/stroke-width: 1;/);
      expect(css).not.toMatch(/\.lc-bar-chart__zero-line \{[^}]*--color-border/);
      expect(body('.lc-bar-chart__row-track')).toMatch(/overflow: visible;/);
    });

    it('forced colours: the row bars are Highlight, the zero line CanvasText', () => {
      const at = css.indexOf('@media (forced-colors: active)');
      expect(at).toBeGreaterThan(-1);
      expect(body('.lc-bar-chart__row-track', at)).toMatch(/forced-color-adjust: none;/);
      expect(body('.lc-bar-chart__row-bar', at)).toMatch(/fill: Highlight;/);
      expect(body('.lc-bar-chart__zero-line', at)).toMatch(/stroke: CanvasText;/);
    });

    it('the row bars have no hover dimming (only the SVG bars do)', () => {
      expect(css).not.toMatch(/\.lc-bar-chart__row-bar:hover/);
      expect(body('.lc-bar-chart__bar:hover')).toMatch(/opacity: 0\.8;/);
    });
  });
});
