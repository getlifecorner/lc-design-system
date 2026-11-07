import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { StackedBarChartComponent, type StackedBarCategory } from './stacked-bar-chart.component';

/**
 * 3.36 (request 056, cockpit row 2, AC-15, AC-16, D-6): `variant="band"`,
 * one horizontal bar edge to edge, its parts as percentages of the width.
 * jsdom has no layout: the 0 px edges are measured in the story.
 */
const PARTS: StackedBarCategory[] = [{ label: 'Verteilung', values: [412, 230, 180, 110, 68] }];
const LEGENDS = [
  { label: 'Personal', color: 'var(--color-primary-700)' },
  { label: 'Sachkosten', color: 'var(--color-primary-500)' },
  { label: 'IT-Leistungen', color: 'var(--color-info-default)' },
  { label: 'Gebäude', color: 'var(--color-secondary-700)' },
  { label: 'Sonstiges', color: 'var(--color-neutral-500)' },
];

describe('StackedBarChartComponent — band (3.36, request 056)', () => {
  let fixture: ComponentFixture<StackedBarChartComponent>;
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    TestBed.configureTestingModule({ imports: [StackedBarChartComponent] });
  });
  afterEach(() => {
    fixture?.destroy();
    warn.mockRestore();
  });

  const render = (inputs: Record<string, unknown>) => {
    fixture = TestBed.createComponent(StackedBarChartComponent);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };
  const svg = (el: HTMLElement) => el.querySelector('svg') as SVGSVGElement;
  const rects = (el: HTMLElement) => Array.from(el.querySelectorAll('rect'));

  it('defaults to chart: the svg keeps its viewBox, axes and labels', () => {
    const el = render({ categories: PARTS, legends: LEGENDS });
    expect(fixture.componentInstance.variant()).toBe('chart');
    expect(svg(el).getAttribute('viewBox')).toBe('0 0 400 200');
    expect(svg(el).getAttribute('class')).toBe('lc-stacked-bar-chart__svg');
    expect(el.querySelectorAll('.lc-stacked-bar-chart__axis')).toHaveLength(2);
    expect(el.querySelector('.lc-stacked-bar-chart__label')?.textContent).toBe('Verteilung');
    expect(el.querySelector('.lc-stacked-bar-chart__band-gap')).toBeNull();
  });

  it('AC-15: parts from 0 to the sum as % of the width, full height, in order and in the legend colours', () => {
    const el = render({ variant: 'band', categories: PARTS, legends: LEGENDS, height: 24 });
    const s = svg(el);
    expect(s.getAttribute('width')).toBe('100%');
    expect(s.getAttribute('height')).toBe('24');
    expect(s.hasAttribute('viewBox')).toBe(false);
    expect(s.getAttribute('class')).toBe('lc-stacked-bar-chart__svg lc-stacked-bar-chart__svg--band');
    const parts = rects(el).map((r) => [r.getAttribute('x'), r.getAttribute('width'), r.getAttribute('y'), r.getAttribute('height'), r.getAttribute('fill')]);
    expect(parts).toEqual([
      ['0%', '41.2%', '0', '100%', 'var(--color-primary-700)'],
      ['41.2%', '23%', '0', '100%', 'var(--color-primary-500)'],
      ['64.2%', '18%', '0', '100%', 'var(--color-info-default)'],
      ['82.2%', '11%', '0', '100%', 'var(--color-secondary-700)'],
      ['93.2%', '6.8%', '0', '100%', 'var(--color-neutral-500)'],
    ]);
    // Edge to edge: the first starts at 0 %, the last ends at 100 %.
    const last = rects(el).at(-1) as SVGRectElement;
    expect(parseFloat(last.getAttribute('x') ?? '') + parseFloat(last.getAttribute('width') ?? '')).toBeCloseTo(100, 6);
  });

  it('AC-15: no axis, grid, labels, values or totals, even when they are switched on', () => {
    const el = render({ variant: 'band', categories: PARTS, showGrid: true, showLabels: true, showValues: true, orientation: 'vertical' });
    expect(el.querySelectorAll('.lc-stacked-bar-chart__axis, .lc-stacked-bar-chart__grid, .lc-stacked-bar-chart__grid-label')).toHaveLength(0);
    expect(el.querySelectorAll('text')).toHaveLength(0);
    // `orientation` is ignored: still a horizontal band (parts side by side).
    expect(rects(el).every((r) => r.getAttribute('height') === '100%')).toBe(true);
  });

  it('AC-16: a gap line at each inner boundary (none at the edges), in the surface colour', () => {
    const el = render({ variant: 'band', categories: PARTS });
    const gaps = Array.from(el.querySelectorAll('.lc-stacked-bar-chart__band-gap'));
    expect(gaps.map((g) => [g.getAttribute('x1'), g.getAttribute('x2'), g.getAttribute('y1'), g.getAttribute('y2')])).toEqual([
      ['41.2%', '41.2%', '0', '100%'],
      ['64.2%', '64.2%', '0', '100%'],
      ['82.2%', '82.2%', '0', '100%'],
      ['93.2%', '93.2%', '0', '100%'],
    ]);
  });

  it('keeps the accessible name, the title and the legend as in chart', () => {
    const el = render({ variant: 'band', categories: PARTS, legends: LEGENDS, ariaLabel: 'Verteilung der Gesamtkosten' });
    expect(svg(el).getAttribute('role')).toBe('img');
    expect(svg(el).getAttribute('aria-label')).toBe('Verteilung der Gesamtkosten');
    expect(svg(el).querySelector('title')?.textContent).toBe('Verteilung der Gesamtkosten');
    expect(Array.from(el.querySelectorAll('.lc-stacked-bar-chart__legend-text')).map((t) => t.textContent)).toEqual(LEGENDS.map((l) => l.label));
    const generated = render({ variant: 'band', categories: PARTS, legends: LEGENDS });
    expect(svg(generated).getAttribute('aria-label')).toBe('Stacked bar chart (Personal, Sachkosten, IT-Leistungen, Gebäude, Sonstiges): Verteilung 1000');
  });

  it('D-6: negative values draw nothing, one part fills the width without a gap, a sum of 0 draws no parts', () => {
    let el = render({ variant: 'band', categories: [{ label: 'A', values: [30, -10, 10] }] });
    expect(rects(el).map((r) => [r.getAttribute('x'), r.getAttribute('width')])).toEqual([
      ['0%', '75%'],
      ['75%', '0%'],
      ['75%', '25%'],
    ]);
    expect(Array.from(el.querySelectorAll('.lc-stacked-bar-chart__band-gap')).map((g) => g.getAttribute('x1'))).toEqual(['75%']);
    el = render({ variant: 'band', categories: [{ label: 'A', values: [5] }] });
    expect(rects(el).map((r) => r.getAttribute('width'))).toEqual(['100%']);
    expect(el.querySelectorAll('.lc-stacked-bar-chart__band-gap')).toHaveLength(0);
    el = render({ variant: 'band', categories: [{ label: 'A', values: [0, 0] }] });
    expect(rects(el)).toHaveLength(0);
  });

  it('D-6: with two categories it renders as chart and warns in dev mode', () => {
    const el = render({ variant: 'band', categories: [{ label: 'A', values: [1] }, { label: 'B', values: [2] }] });
    expect(svg(el).getAttribute('class')).toBe('lc-stacked-bar-chart__svg');
    expect(el.querySelectorAll('.lc-stacked-bar-chart__axis')).toHaveLength(2);
    expect(warn).toHaveBeenCalledWith('[lc-stacked-bar-chart] variant="band" needs exactly one category (got 2): rendering as chart');
  });

  it('styles: no overflow, the gap hooks with their defaults, Canvas gaps in forced colours', () => {
    const css = compile(resolve(__dirname, 'stacked-bar-chart.component.scss')).css;
    expect(css).toMatch(/\n\.lc-stacked-bar-chart__svg--band \{\s*overflow: hidden;\s*\}/);
    expect(css).toMatch(
      /\n\.lc-stacked-bar-chart__band-gap \{\s*stroke: var\(--lc-stacked-bar-chart-band-gap-color, var\(--color-surface\)\);\s*stroke-width: var\(--lc-stacked-bar-chart-band-gap, 2px\);\s*\}/,
    );
    expect(css).toMatch(/@media \(forced-colors: active\) \{\s*\.lc-stacked-bar-chart__band-gap \{\s*stroke: Canvas;\s*\}\s*\}/);
    expect(css.indexOf('.lc-stacked-bar-chart__svg--band')).toBeGreaterThan(css.indexOf('.lc-stacked-bar-chart__svg {'));
  });
});
