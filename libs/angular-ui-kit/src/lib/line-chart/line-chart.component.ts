import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  computed,
  signal,
} from '@angular/core';
import { chartColor } from '@lifecorner/angular-ui-kit/internal/chart';
import {
  chartDashArray,
  chartDotArray,
  linearPath,
  smoothPath,
  type ChartPoint,
} from '@lifecorner/angular-ui-kit/internal/chart';
import {
  ChartValueFormatter,
  formatChartValue,
  niceScale,
  toFinite,
} from '@lifecorner/angular-ui-kit/internal/chart';

export interface LineChartSeries {
  label: string;
  /**
   * One value per label. `null` means no value (3.43): no point, and the line
   * breaks there. A lone value between two gaps is drawn as a dot, also with
   * `showDots` false. `NaN` and `undefined` are drawn as 0, as before.
   */
  data: (number | null)[];
  color?: string;
  /**
   * Draws the series dashed, in its colour (3.43): dashes 3 × and gaps 2 ×
   * `strokeWidth` (6/4 px at the default 2), in the plot and in the legend
   * swatch. To join a forecast to the actuals, repeat the last actual value at
   * the forecast's first index.
   * @default false
   */
  dashed?: boolean;
  /**
   * Draws the series as round dots, in its colour (3.45, request 065): each
   * dot `strokeWidth` wide, one every 2 × `strokeWidth`, in the plot and in
   * the legend swatch. A non-colour cue next to solid and `dashed` series (a
   * plan beside actuals and a forecast). Wins over `dashed`.
   * @default false
   */
  dotted?: boolean;
}

/** viewBox width used until the container has been measured. */
const DEFAULT_WIDTH = 400;

let nextClipId = 0;

@Component({
  selector: 'lc-line-chart',
  standalone: true,
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.max-width.px]': 'width()',
  },
})
/**
 * Line chart component for visualizing data trends.
 *
 * Features:
 * - Multiple data series support
 * - Smooth or linear curve interpolation
 * - Optional area fill below lines
 * - Configurable grid on a nice tick scale, axis labels, dots, and legend
 * - Responsive SVG rendering with configurable dimensions
 *
 * @example
 * ```html
 * <lc-line-chart [series]="data" [labels]="months" [smooth]="true" />
 * ```
 */
export class LineChartComponent {
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
  }

  /** One or more data series. */
  series = input.required<LineChartSeries[]>();

  /** X-axis labels. */
  labels = input<string[]>([]);

  /**
   * Intrinsic chart width in pixels. The chart fills its container (the SVG is
   * `width="100%"` and its viewBox follows the measured container width);
   * `width` is the viewBox width until the container has been measured and,
   * when set, the host's `max-width`, so the chart never grows past it. Leave
   * unset for a fully fluid chart.
   */
  width = input<number | undefined>(undefined);

  /** Chart height in pixels. */
  height = input<number>(200);

  /** Stroke width for lines. */
  strokeWidth = input<number>(2);

  /** Show dots at data points. */
  showDots = input<boolean>(true);

  /** Show grid lines. */
  showGrid = input<boolean>(true);

  /** Show X-axis labels. */
  showXLabels = input<boolean>(true);

  /** Show Y-axis labels. */
  showYLabels = input<boolean>(true);

  /** Show area fill under lines. */
  filled = input<boolean>(false);

  /** Show legend. */
  showLegend = input<boolean>(false);

  /** Use smooth curves. */
  smooth = input<boolean>(true);

  /** Force a minimum Y value (e.g. 0 for cost charts to avoid negative baseline). */
  yMin = input<number | null>(null);

  /** Formats Y-axis tick labels. Defaults to a float-safe `String(value)`. */
  formatValue = input<ChartValueFormatter>(formatChartValue);

  /**
   * Accessible name of the chart. Defaults to a generated summary naming each
   * series with its point count and value range.
   */
  ariaLabel = input<string>('');

  private readonly PL = 40;
  private readonly PR = 10;
  private readonly PT = 10;
  private readonly PB = 30;

  protected readonly effectiveWidth = computed(
    () => this._containerWidth() || this.width() || DEFAULT_WIDTH
  );

  protected readonly viewBox = computed(
    () => `0 0 ${this.effectiveWidth()} ${this.height()}`
  );

  /** `null` stays a gap (3.43); every other value is coerced as before. */
  private readonly cleanSeries = computed(() =>
    (this.series() ?? []).map((ser) => ({
      ...ser,
      data: (ser.data ?? []).map((v) => (v === null ? null : toFinite(v))),
    }))
  );

  /** The values the scale and the summary read: gaps left out. */
  protected readonly allValues = computed(() =>
    this.cleanSeries().flatMap((ser) => ser.data.filter((v): v is number => v !== null))
  );

  protected readonly minValue = computed(() => {
    const dataMin = this.allValues().length ? Math.min(...this.allValues()) : 0;
    const forced = this.yMin();
    return forced !== null ? Math.min(forced, dataMin) : dataMin;
  });

  protected readonly maxValue = computed(() =>
    this.allValues().length ? Math.max(...this.allValues()) : 0
  );

  /** Y scale with nice tick bounds; the plot edges sit on the outermost ticks. */
  protected readonly scale = computed(() => niceScale(this.minValue(), this.maxValue(), 4));

  protected readonly maxDataLength = computed(() =>
    Math.max(...this.cleanSeries().map((s) => s.data.length), 0)
  );

  protected readonly plotArea = computed(() => ({
    x: this.PL,
    y: this.PT,
    w: this.effectiveWidth() - this.PL - this.PR,
    h: this.height() - this.PT - this.PB,
  }));

  private valueToY(value: number): number {
    const { min, max } = this.scale();
    const pa = this.plotArea();
    return pa.y + pa.h - ((value - min) / (max - min || 1)) * pa.h;
  }

  protected readonly gridLines = computed(() => {
    if (!this.showGrid()) return [];
    const fmt = this.formatValue();
    return this.scale().ticks.map((tick) => ({ y: this.valueToY(tick), label: fmt(tick) }));
  });

  protected readonly xLabels = computed(() => {
    const lbls = this.labels();
    if (!this.showXLabels() || lbls.length === 0) return [];
    const pa = this.plotArea();
    const count = lbls.length;

    return lbls.map((label, i) => ({
      x: pa.x + (count > 1 ? (i / (count - 1)) * pa.w : pa.w / 2),
      y: this.height() - this.PB + 16,
      label,
    }));
  });

  protected readonly renderedSeries = computed(() => {
    const pa = this.plotArea();

    const build = this.smooth() ? smoothPath : linearPath;
    const bottomY = pa.y + pa.h;

    return this.cleanSeries().map((ser, si) => {
      const color = ser.color || chartColor(si);
      const n = ser.data.length;
      // A `null` ends a segment (3.43); without one the series is one segment.
      const segments: ChartPoint[][] = [];
      let current: ChartPoint[] = [];
      ser.data.forEach((v, i) => {
        if (v === null) {
          if (current.length) segments.push(current);
          current = [];
          return;
        }
        current.push({
          x: pa.x + (n > 1 ? (i / (n - 1)) * pa.w : pa.w / 2),
          y: this.valueToY(v),
        });
      });
      if (current.length) segments.push(current);

      const paths = segments.map((points) => ({ points, d: build(points) }));
      const pathD = paths.map((p) => p.d).filter(Boolean).join(' ');

      let areaD = '';
      if (this.filled() && pathD) {
        areaD = paths
          .filter((p) => p.d)
          .map(({ points, d }) => {
            const lastX = points[points.length - 1].x;
            const firstX = points[0].x;
            return `${d} L${lastX},${bottomY} L${firstX},${bottomY} Z`;
          })
          .join(' ');
      }

      // A lone value next to a gap has no segment to draw, so it is a dot.
      const hasGap = ser.data.includes(null);
      const points = this.showDots()
        ? segments.flat()
        : hasGap
          ? segments.filter((s) => s.length === 1).flat()
          : [];

      return {
        label: ser.label,
        color,
        pathD,
        areaD,
        points,
        dashed: !ser.dotted && !!ser.dashed,
        dotted: !!ser.dotted,
        dashArray: ser.dotted
          ? chartDotArray(this.strokeWidth())
          : ser.dashed
            ? chartDashArray(this.strokeWidth())
            : null,
      };
    });
  });

  protected readonly axisLine = computed(() => {
    const pa = this.plotArea();
    return {
      vx1: pa.x, vy1: pa.y,
      vx2: pa.x, vy2: pa.y + pa.h,
      hx1: pa.x, hy1: pa.y + pa.h,
      hx2: pa.x + pa.w, hy2: pa.y + pa.h,
    };
  });

  protected readonly legendItems = computed(() => {
    if (!this.showLegend()) return [];
    return this.renderedSeries().map((s) => ({
      label: s.label,
      color: s.color,
      dashed: s.dashed,
      dotted: s.dotted,
      // 3.45: a patterned swatch takes its colour as `color` (the pattern's currentColor).
      patterned: s.dashed || s.dotted,
    }));
  });

  private readonly _clipId = `lc-chart-clip-${++nextClipId}`;
  protected readonly clipId = () => this._clipId;

  protected readonly effectiveAriaLabel = computed(() => {
    const explicit = this.ariaLabel();
    if (explicit) return explicit;
    const series = this.cleanSeries();
    if (!series.length) return 'Line chart: no data';
    const fmt = this.formatValue();
    const parts = series.map((s, i) => {
      const name = s.label || `Series ${i + 1}`;
      if (!s.data.length) return `${name} (no data)`;
      const values = s.data.filter((v): v is number => v !== null);
      const total = s.data.length;
      const n = values.length;
      const k = total - n;
      // 3.43: gaps are named and left out of the range.
      if (!n) return `${name} (${total} ${total === 1 ? 'point' : 'points'} with no value)`;
      const gaps = k ? `, ${k} with no value` : '';
      return `${name} (${n} ${n === 1 ? 'point' : 'points'}${gaps}, ${fmt(Math.min(...values))} to ${fmt(Math.max(...values))})`;
    });
    return `Line chart: ${parts.join(', ')}`;
  });
}
