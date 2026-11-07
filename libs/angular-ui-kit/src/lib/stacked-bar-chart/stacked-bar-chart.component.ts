import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  isDevMode,
  computed,
  signal,
} from '@angular/core';
import { chartColor } from '@lifecorner/angular-ui-kit/internal/chart';
import {
  ChartValueFormatter,
  formatChartValue,
  niceScale,
  toFinite,
} from '@lifecorner/angular-ui-kit/internal/chart';

export interface StackedBarCategory {
  label: string;
  /** One value per series. Negative values stack downward (left) from the zero baseline. */
  values: number[];
}

export interface StackedBarLegend {
  label: string;
  color?: string;
}

export type StackedBarOrientation = 'vertical' | 'horizontal';

/**
 * Form of `lc-stacked-bar-chart` (3.36): `chart` (axes, grid, labels and
 * paddings, as before) or `band` (one horizontal bar edge to edge).
 */
export type StackedBarVariant = 'chart' | 'band';

/** Percentages are rounded so the prerendered markup is the same everywhere. */
const roundPercent = (value: number): number => Math.round(value * 10000) / 10000;

/** viewBox width used until the container has been measured. */
const DEFAULT_WIDTH = 400;

/** Segments shorter than this along the value axis get no inline value label. */
const MIN_SEGMENT_LABEL_PX = 14;

@Component({
  selector: 'lc-stacked-bar-chart',
  standalone: true,
  templateUrl: './stacked-bar-chart.component.html',
  styleUrls: ['./stacked-bar-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.max-width.px]': 'width()',
  },
})
/**
 * Stacked bar chart component for comparing category compositions.
 *
 * Features:
 * - Multiple stacked value segments per category
 * - Vertical and horizontal orientation
 * - Negative values stacked downward from a zero baseline
 * - Optional legend, grid, value labels (segments + totals), and axis labels
 * - Configurable bar gap spacing
 * - Color-coded segments with legend mapping
 * - Responsive SVG rendering
 * - `variant="band"` (3.36): one horizontal distribution bar edge to edge,
 *   without axes, grid or paddings
 *
 * @example
 * ```html
 * <lc-stacked-bar-chart [categories]="data" [legends]="legends" [showLegend]="true" />
 * ```
 */
export class StackedBarChartComponent {
  private readonly _el = inject(ElementRef);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _containerWidth = signal<number>(0);

  constructor() {
    afterNextRender(() => {
      const obs = new ResizeObserver(([entry]) => {
        this._containerWidth.set(entry.contentRect.width);
      });
      obs.observe(this._el.nativeElement);
      this._destroyRef.onDestroy(() => obs.disconnect());
    });
    if (isDevMode()) {
      effect(() => {
        const count = (this.categories() ?? []).length;
        if (this.variant() === 'band' && count !== 1) {
          console.warn(`[lc-stacked-bar-chart] variant="band" needs exactly one category (got ${count}): rendering as chart`);
        }
      });
    }
  }

  /** Categories with stacked values. */
  categories = input.required<StackedBarCategory[]>();

  /** Legend items mapping to each value index. */
  legends = input<StackedBarLegend[]>([]);

  /**
   * Intrinsic chart width in pixels. The chart fills its container (the SVG is
   * `width="100%"` and its viewBox follows the measured container width);
   * `width` is the viewBox width until the container has been measured and,
   * when set, the host's `max-width`, so the chart never grows past it. Leave
   * unset for a fully fluid chart.
   */
  width = input<number | undefined>(undefined);
  height = input<number>(200);
  orientation = input<StackedBarOrientation>('vertical');
  showLabels = input<boolean>(true);
  /** Show the value inside each segment (when it fits) and the total at the end of each stack. */
  showValues = input<boolean>(false);
  showLegend = input<boolean>(true);
  showGrid = input<boolean>(true);
  barGap = input<number>(0.3);

  /** Formats segment/total value labels and axis ticks. Defaults to a float-safe `String(value)`. */
  formatValue = input<ChartValueFormatter>(formatChartValue);

  /**
   * Accessible name of the chart. Defaults to a generated summary listing the
   * series names and every category's total.
   */
  ariaLabel = input<string>('');

  /**
   * Form of the chart (3.36, cockpit row 2). `chart`: axes, grid, labels and
   * paddings, as before. `band`: one horizontal bar that fills the host's
   * width edge to edge, `height` px thick, scaled from 0 to the sum of the
   * values, without axes, grid, labels, values or paddings; the parts are
   * split by a 2 px gap in the surface colour (CSS hooks
   * `--lc-stacked-bar-chart-band-gap`, default `2px`, and
   * `--lc-stacked-bar-chart-band-gap-color`, default `var(--color-surface)`:
   * set it to the band's background off a card). `ariaLabel`, `legends` and
   * the legend work as in `chart`. Needs exactly one category (otherwise it
   * renders as `chart`, with a warning in dev mode); `orientation` is
   * ignored; negative values draw nothing, and a sum of 0 draws no parts.
   * Part widths are percentages, so the band is exact in prerendered HTML.
   * @default 'chart'
   */
  variant = input<StackedBarVariant>('chart');

  /** `band` with exactly one category (3.36); otherwise the chart renders. */
  protected readonly isBand = computed(() => this.variant() === 'band' && (this.categories() ?? []).length === 1);

  /** The band's parts as percentages of the width: 0 … sum of the positive values. */
  protected readonly bandParts = computed(() => {
    if (!this.isBand()) return [];
    const legs = this.legends();
    const values = (this.categories()[0].values ?? []).map((raw) => Math.max(0, toFinite(raw)));
    const sum = values.reduce((a, b) => a + b, 0);
    if (sum <= 0) return [];
    let at = 0;
    return values.map((value, i) => {
      const x = (at / sum) * 100;
      at += value;
      return { x: roundPercent(x), w: roundPercent((value / sum) * 100), color: legs[i]?.color || chartColor(i) };
    });
  });

  /** The boundaries between two drawn parts, where the band's gap lines sit. */
  protected readonly bandGaps = computed(() => {
    const drawn = this.bandParts().filter((part) => part.w > 0);
    return drawn.slice(1).map((part) => part.x);
  });

  private readonly PL = 40;
  private readonly PR = 10;
  private readonly PT = 10;
  private readonly PB = 30;

  protected readonly effectiveWidth = computed(
    () => this._containerWidth() || this.width() || DEFAULT_WIDTH
  );

  protected readonly viewBox = computed(() => `0 0 ${this.effectiveWidth()} ${this.height()}`);

  protected readonly isVertical = computed(() => this.orientation() === 'vertical');

  private readonly plot = computed(() => ({
    x: this.PL,
    y: this.PT,
    w: this.effectiveWidth() - this.PL - this.PR,
    h: this.height() - this.PT - this.PB,
  }));

  /** Positive and negative stack extents per category (positives and negatives stack separately). */
  private readonly extents = computed(() =>
    (this.categories() ?? []).map((c) => {
      let pos = 0;
      let neg = 0;
      for (const raw of c.values ?? []) {
        const v = toFinite(raw);
        if (v >= 0) pos += v;
        else neg += v;
      }
      return { pos, neg, total: pos + neg };
    })
  );

  /**
   * One scale for grid *and* segments: nice tick bounds that always include
   * zero and extend below it when a stack goes negative.
   */
  protected readonly scale = computed(() => {
    const ext = this.extents();
    const max = Math.max(0, ...ext.map((e) => e.pos));
    const min = Math.min(0, ...ext.map((e) => e.neg));
    return niceScale(min, max, 4);
  });

  private valueToPos(value: number): number {
    const { min, max } = this.scale();
    const p = this.plot();
    const frac = (value - min) / (max - min || 1);
    return this.isVertical() ? p.y + p.h - frac * p.h : p.x + frac * p.w;
  }

  protected readonly gridLines = computed(() => {
    if (!this.showGrid() || !this.categories()?.length) return [];
    const fmt = this.formatValue();
    return this.scale().ticks.map((tick) => ({ pos: this.valueToPos(tick), label: fmt(tick) }));
  });

  protected readonly stacks = computed(() => {
    const cats = this.categories();
    const legs = this.legends();
    if (!cats?.length) return [];

    const p = this.plot();
    const h = this.height();
    const isV = this.isVertical();
    const gap = this.barGap();
    const fmt = this.formatValue();
    const ext = this.extents();

    const slot = (isV ? p.w : p.h) / cats.length;
    const thickness = slot * (1 - gap);
    const off = (slot - thickness) / 2;

    return cats.map((cat, ci) => {
      const along = (isV ? p.x : p.y) + ci * slot + off;
      let cumPos = 0;
      let cumNeg = 0;

      const segments = (cat.values ?? []).map((raw, vi) => {
        const val = toFinite(raw);
        const color = legs[vi]?.color || chartColor(vi);
        const from = val >= 0 ? cumPos : cumNeg;
        const to = from + val;
        if (val >= 0) cumPos = to;
        else cumNeg = to;

        const a = this.valueToPos(from);
        const b = this.valueToPos(to);
        const start = Math.min(a, b);
        const len = Math.abs(b - a);
        const rect = isV
          ? { x: along, y: start, w: thickness, h: len }
          : { x: start, y: along, w: len, h: thickness };
        return {
          ...rect,
          color,
          value: val,
          valueText: fmt(val),
          showValue: len >= MIN_SEGMENT_LABEL_PX,
          valueX: rect.x + rect.w / 2,
          valueY: rect.y + rect.h / 2,
        };
      });

      const total = ext[ci].total;
      const posEnd = this.valueToPos(ext[ci].pos);
      const labelPos = isV
        ? { x: p.x + (ci + 0.5) * slot, y: h - this.PB + 16 }
        : { x: p.x - 6, y: p.y + (ci + 0.5) * slot };
      // Total sits past the positive end of the stack (or at the baseline for all-negative stacks).
      const totalPos = isV
        ? { x: along + thickness / 2, y: posEnd - 6, anchor: 'middle' }
        : { x: posEnd + 6, y: along + thickness / 2, anchor: 'start' };

      return { label: cat.label, segments, labelPos, total, totalText: fmt(total), totalPos };
    });
  });

  protected readonly legendItems = computed(() => {
    const legs = this.legends();
    return legs.map((l, i) => ({
      label: l.label,
      color: l.color || chartColor(i),
    }));
  });

  /** Value axis along the plot edge plus the zero baseline (inside the plot when data goes negative). */
  protected readonly axisLine = computed(() => {
    const p = this.plot();
    const isV = this.isVertical();
    const zero = this.categories()?.length ? this.valueToPos(0) : (isV ? p.y + p.h : p.x);
    return {
      vx1: isV ? p.x : zero, vy1: p.y,
      vx2: isV ? p.x : zero, vy2: p.y + p.h,
      hx1: p.x, hy1: isV ? zero : p.y + p.h,
      hx2: p.x + p.w, hy2: isV ? zero : p.y + p.h,
    };
  });

  protected readonly plotBottom = computed(() => this.plot().y + this.plot().h);

  protected readonly effectiveAriaLabel = computed(() => {
    const explicit = this.ariaLabel();
    if (explicit) return explicit;
    const cats = this.categories() ?? [];
    if (!cats.length) return 'Stacked bar chart: no data';
    const fmt = this.formatValue();
    const ext = this.extents();
    const seriesNames = this.legends().map((l) => l.label).filter(Boolean);
    const series = seriesNames.length ? ` (${seriesNames.join(', ')})` : '';
    const totals = cats.map((c, i) => `${c.label} ${fmt(ext[i].total)}`).join(', ');
    return `Stacked bar chart${series}: ${totals}`;
  });
}
