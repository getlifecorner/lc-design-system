import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { chartDotArray } from '@lifecorner/angular-ui-kit/internal/chart';
import { LineChartComponent, type LineChartSeries } from './line-chart.component';

/** Request 065, backlog 063-n1 (AC-37): a dotted series as the non-colour cue for Plan. */
describe('LineChartComponent dotted series (3.45)', () => {
  let fixture: ComponentFixture<LineChartComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const lines = () => Array.from(el().querySelectorAll<SVGPathElement>('.lc-line-chart__line'));
  const swatches = () => Array.from(el().querySelectorAll<HTMLElement>('.lc-line-chart__legend-line'));

  const render = (series: LineChartSeries[], inputs: Record<string, unknown> = {}) => {
    fixture.componentRef.setInput('series', series);
    fixture.componentRef.setInput('labels', ['Jan', 'Feb', 'Mar']);
    fixture.componentRef.setInput('showLegend', true);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LineChartComponent] }).compileComponents();
    fixture = TestBed.createComponent(LineChartComponent);
  });

  it('draws zero-length dashes every 2·sw with the round caps (dots of the stroke width)', () => {
    render([
      { label: 'Plan', data: [40, 41, 42], color: 'rgb(112, 151, 175)', dotted: true },
      { label: 'Ist', data: [38, 41, 43], color: 'rgb(32, 132, 151)' },
    ]);
    const [plan, actual] = lines();
    expect(plan.getAttribute('stroke-dasharray')).toBe('0 4');
    expect(plan.getAttribute('stroke-linecap')).toBe('round');
    expect(plan.classList.contains('lc-line-chart__line--dotted')).toBe(true);
    expect(plan.classList.contains('lc-line-chart__line--dashed')).toBe(false);
    expect(actual.getAttribute('class')).toBe('lc-line-chart__line');
    expect(actual.hasAttribute('stroke-dasharray')).toBe(false);
  });

  it('follows strokeWidth and wins over dashed', () => {
    render([{ label: 'Plan', data: [1, 2, 3], dotted: true, dashed: true }], { strokeWidth: 3 });
    expect(lines()[0].getAttribute('stroke-dasharray')).toBe('0 6');
    expect(lines()[0].classList.contains('lc-line-chart__line--dashed')).toBe(false);
    expect(chartDotArray(2)).toBe('0 4');
    expect(chartDotArray(1.5)).toBe('0 3');
  });

  it('the legend swatch is dotted in the series colour; plain and dashed swatches as before', () => {
    render([
      { label: 'Plan', data: [1, 2, 3], color: 'rgb(112, 151, 175)', dotted: true },
      { label: 'Ist', data: [1, 2, 3], color: 'rgb(32, 132, 151)' },
      { label: 'Prognose', data: [2, 3, 4], color: 'rgb(32, 132, 151)', dashed: true },
    ]);
    const [plan, actual, forecast] = swatches();
    expect(plan.classList.contains('lc-line-chart__legend-line--dotted')).toBe(true);
    expect(plan.style.color).toBe('rgb(112, 151, 175)');
    expect(plan.style.backgroundColor).toBe('');
    expect(actual.getAttribute('class')).toBe('lc-line-chart__legend-line');
    expect(actual.getAttribute('style')).toBe('background-color: rgb(32, 132, 151);');
    expect(forecast.getAttribute('class')).toBe('lc-line-chart__legend-line lc-line-chart__legend-line--dashed');
    expect(forecast.style.color).toBe('rgb(32, 132, 151)');
  });

  it('SCSS: 3 px dots every 6 px in currentColor', () => {
    const css = compile(resolve(__dirname, 'line-chart.component.scss')).css.replace(/\s+/g, ' ');
    expect(css).toContain(
      '.lc-line-chart__legend-line--dotted { border-radius: 0; background: radial-gradient(circle closest-side, currentColor 96%, transparent) 0 50%/6px 3px repeat-x; }',
    );
  });
});
