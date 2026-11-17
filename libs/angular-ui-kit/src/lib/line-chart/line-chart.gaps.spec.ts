import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { audit, violations } from '../../testing/axe-jsdom';
import { chartDashArray } from '@lifecorner/angular-ui-kit/internal/chart';
import { LineChartComponent, type LineChartSeries } from './line-chart.component';

/**
 * Request 063 (kosten-2026-11-17 row 2, design §2/§6/§9): `null` in
 * `LineChartSeries.data` is a gap, and `dashed` draws a series dashed.
 */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ACTUAL = [38, 41, 43, null, 45, null, 44, 49, 50, 52, null, null];
const FORECAST = [null, null, null, null, null, null, null, null, null, 52, 54, 55];

describe('LineChartComponent gaps and dashed series (3.43, request 063)', () => {
  let fixture: ComponentFixture<LineChartComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const lines = () => Array.from(el().querySelectorAll<SVGPathElement>('.lc-line-chart__line'));
  const dots = () => el().querySelectorAll('.lc-line-chart__dot');
  const label = () => el().querySelector('svg')?.getAttribute('aria-label');
  const yLabels = () => Array.from(el().querySelectorAll('.lc-line-chart__y-label')).map((t) => t.textContent?.trim());
  const moves = (d: string | null) => (d ?? '').match(/M/g)?.length ?? 0;

  const render = (series: LineChartSeries[], inputs: Record<string, unknown> = {}) => {
    fixture.componentRef.setInput('series', series);
    fixture.componentRef.setInput('labels', MONTHS);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LineChartComponent] }).compileComponents();
    fixture = TestBed.createComponent(LineChartComponent);
  });

  describe('AC-7: a null breaks the line', () => {
    it('draws one M per segment, linear and smooth', () => {
      render([{ label: 'A', data: [1, 2, null, 4, 5, null, 7, 8], color: '#208497' }], { smooth: false });
      expect(moves(lines()[0].getAttribute('d'))).toBe(3);
      render([{ label: 'A', data: [1, 2, null, 4, 5, null, 7, 8], color: '#208497' }], { smooth: true });
      expect(moves(lines()[0].getAttribute('d'))).toBe(3);
      expect(lines()[0].getAttribute('d')).toContain(' C');
    });

    it('a lone value between two gaps is a dot, also with showDots false', () => {
      render([{ label: 'Actual', data: ACTUAL, color: '#208497' }], { showDots: false, smooth: false });
      // Segments Jan–Mar, May (lone), Jul–Oct.
      expect(moves(lines()[0].getAttribute('d'))).toBe(2);
      expect(dots()).toHaveLength(1);
      const x = Number(dots()[0].getAttribute('cx'));
      const xs = Array.from(el().querySelectorAll('.lc-line-chart__x-label')).map((t) => Number(t.getAttribute('x')));
      expect(x).toBeCloseTo(xs[4], 6);
    });

    it('with showDots every value is a dot and no gap is one', () => {
      render([{ label: 'Actual', data: ACTUAL, color: '#208497' }]);
      expect(dots()).toHaveLength(8);
    });

    it('a filled series draws one area per segment', () => {
      render([{ label: 'A', data: [1, 2, null, 4, 5], color: '#208497' }], { filled: true, smooth: false });
      const area = el().querySelector('.lc-line-chart__area')?.getAttribute('d') ?? '';
      expect(area.match(/Z/g)).toHaveLength(2);
      expect(area).not.toMatch(/NaN|null/);
    });
  });

  describe('AC-8: the scale ignores null', () => {
    it('ticks equal those of the finite values alone', () => {
      render([{ label: 'A', data: [100, null, 200] }]);
      const withGap = yLabels();
      render([{ label: 'A', data: [100, 200] }]);
      expect(withGap).toEqual(yLabels());
      expect(withGap[0]).toBe('100');
    });

    it('an all-null series draws nothing, keeps its legend entry and does not throw', () => {
      expect(() =>
        render([{ label: 'Plan', data: [10, 20, 30] }, { label: 'Leer', data: [null, null, null] }], { showLegend: true }),
      ).not.toThrow();
      expect(lines()).toHaveLength(1);
      expect(dots()).toHaveLength(3);
      expect(Array.from(el().querySelectorAll('.lc-line-chart__legend-label')).map((l) => l.textContent)).toEqual(['Plan', 'Leer']);
    });

    it('all series null: the scale of empty data, no NaN', () => {
      render([{ label: 'A', data: [null, null] }], { filled: true });
      expect(lines()).toHaveLength(0);
      expect(el().querySelectorAll('.lc-line-chart__area')).toHaveLength(0);
      expect(el().innerHTML).not.toMatch(/NaN|Infinity/);
      expect(yLabels()).toEqual(['0', '0.25', '0.5', '0.75', '1']);
    });
  });

  describe('AC-9: dashed series', () => {
    it('dashes the path 3·sw / 2·sw with butt caps, also smooth', () => {
      render([
        { label: 'Actual', data: ACTUAL, color: '#208497' },
        { label: 'Forecast', data: FORECAST, color: '#208497', dashed: true },
      ]);
      const [actual, forecast] = lines();
      expect(forecast.getAttribute('stroke-dasharray')).toBe('6 4');
      expect(forecast.classList.contains('lc-line-chart__line--dashed')).toBe(true);
      expect(forecast.getAttribute('d')).toContain(' C');
      expect(actual.hasAttribute('stroke-dasharray')).toBe(false);
      expect(actual.getAttribute('class')).toBe('lc-line-chart__line');
    });

    it('follows strokeWidth', () => {
      render([{ label: 'F', data: [1, 2], dashed: true }], { strokeWidth: 3 });
      expect(lines()[0].getAttribute('stroke-dasharray')).toBe('9 6');
      expect(chartDashArray(2)).toBe('6 4');
      expect(chartDashArray(1.5)).toBe('4.5 3');
    });

    it('the legend swatch is dashed in the series colour', () => {
      render(
        [
          { label: 'Plan', data: [1, 2], color: 'rgb(112, 151, 175)' },
          { label: 'Forecast', data: [2, 3], color: 'rgb(32, 132, 151)', dashed: true },
        ],
        { showLegend: true },
      );
      const [plan, forecast] = Array.from(el().querySelectorAll<HTMLElement>('.lc-line-chart__legend-line'));
      expect(plan.getAttribute('style')).toBe('background-color: rgb(112, 151, 175);');
      expect(plan.getAttribute('class')).toBe('lc-line-chart__legend-line');
      expect(forecast.classList.contains('lc-line-chart__legend-line--dashed')).toBe(true);
      expect(forecast.style.color).toBe('rgb(32, 132, 151)');
      expect(forecast.style.backgroundColor).toBe('');
    });

    it('SCSS: butt caps, the 6/4 swatch gradient, and swatches kept in forced colours', () => {
      const css = compile(resolve(__dirname, 'line-chart.component.scss')).css.replace(/\s+/g, ' ');
      expect(css).toContain('.lc-line-chart__line--dashed { stroke-linecap: butt; }');
      expect(css).toContain(
        '.lc-line-chart__legend-line--dashed { background: repeating-linear-gradient(90deg, currentColor 0 6px, transparent 6px 10px); }',
      );
      expect(css).toContain('@media (forced-colors: active) { .lc-line-chart__legend-line { forced-color-adjust: none; } }');
    });
  });

  describe('AC-10: the summary reads null as no value', () => {
    it('names the gaps and reads the range from the values', () => {
      render([
        { label: 'Plan', data: [40, 42, 44, 45, 46, 47, 48, 48, 49, 50, 50, 50] },
        { label: 'Actual', data: ACTUAL },
        { label: 'Forecast', data: FORECAST, dashed: true },
        { label: 'Empty', data: [null, null] },
        { label: 'One', data: [5, null] },
      ]);
      expect(label()).toBe(
        'Line chart: Plan (12 points, 40 to 50), Actual (8 points, 4 with no value, 38 to 52), ' +
          'Forecast (3 points, 9 with no value, 52 to 55), Empty (2 points with no value), One (1 point, 1 with no value, 5 to 5)',
      );
      render([{ label: 'Z', data: [null] }]);
      expect(label()).toBe('Line chart: Z (1 point with no value)');
    });

    it('ariaLabel replaces it (the German text of the story)', () => {
      const de = 'Liniendiagramm, Kosten in Tausend Euro: Ist (10 Werte, 2 ohne Wert, 38 bis 52)';
      render([{ label: 'Ist', data: ACTUAL }], { ariaLabel: de });
      expect(label()).toBe(de);
    });
  });

  describe('AC-11: numbers only and no dashed render as before', () => {
    it('pins the path, its attributes and the swatch', () => {
      render([{ label: 'A', data: [10, 20, 30], color: '#208497' }], { smooth: false, width: 400, showLegend: true, labels: [] });
      const [line] = lines();
      expect(line.getAttribute('d')).toBe('M40,170 L215,90 L390,10');
      expect(line.getAttributeNames().filter((n) => !n.startsWith('_ng')).sort()).toEqual(
        ['class', 'clip-path', 'd', 'fill', 'stroke', 'stroke-linecap', 'stroke-linejoin', 'stroke-width'],
      );
      expect(line.getAttribute('class')).toBe('lc-line-chart__line');
      expect(dots()).toHaveLength(3);
      const swatch = el().querySelector('.lc-line-chart__legend-line') as HTMLElement;
      expect(swatch.getAttributeNames().filter((n) => !n.startsWith('_ng')).sort()).toEqual(['class', 'style']);
      expect(label()).toBe('Line chart: A (3 points, 10 to 30)');
    });
  });

  it('AC-12: axe passes on the forecast chart', async () => {
    render(
      [
        { label: 'Plan', data: [40, 42, 44, 45, 46, 47, 48, 48, 49, 50, 50, 50] },
        { label: 'Actual', data: ACTUAL },
        { label: 'Forecast', data: FORECAST, dashed: true },
      ],
      { showLegend: true },
    );
    expect(violations(await audit(el()))).toEqual([]);
  });
});
