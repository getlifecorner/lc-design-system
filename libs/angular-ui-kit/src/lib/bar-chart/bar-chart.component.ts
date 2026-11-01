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
  formatChartValue,
  niceScale,
  toFinite,
} from '@lifecorner/angular-ui-kit/internal/chart';

export interface BarChartItem {
  /** Bar value. Negative values draw downward (left) from the zero baseline. */
  value: number;
  label?: string;
  color?: string;
  /**
   * The text shown as this bar's value and read in the generated aria label,
   * instead of `formatValue(value, item)`, for example "313.000,00 · 54,8 %".
   * The kit shows it as given and never formats or computes it. An empty
   * string shows no value for this bar.
   */
  valueText?: string;
}

export type BarChartOrientation = 'vertical' | 'horizontal';

/**
 * How the category labels are set: `'axis'` (one line of SVG text on the
 * category axis) or `'wrap'` (HTML text that wraps and follows the text size).
 */
export type BarChartLabelLayout = 'axis' | 'wrap';

/**
 * Signature of `lc-bar-chart`'s `formatValue`. A bar's value label passes the
 * bar's item; an axis tick passes the tick only (`item` is `undefined`).
 * One-argument formatters keep working.
 */
export type BarChartValueFormatter = (value: number, item?: BarChartItem) => string;

/** viewBox width used until the container has been measured. */
const DEFAULT_WIDTH = 400;

@Component({
  selector: 'lc-bar-chart',
  standalone: true,
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.max-width.px]': 'width()',
  },
})
/**
 * Bar chart component for comparing categorical data.
 *
 * Features:
 * - Vertical and horizontal orientation
 * - Per-bar or uniform color support
 * - Negative values drawn from a zero baseline
 * - Optional value labels on bars
 * - Configurable grid and axis labels on a nice tick scale
 * - Adjustable bar gap spacing
 * - Responsive SVG rendering
 *
 * @example
 * ```html
 * <lc-bar-chart [data]="items" orientation="vertical" [showValues]="true" />
 * ```
 */
export class BarChartComponent {
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

  /** Data items. */
  data = input.required<BarChartItem[]>();

  /**
   * Intrinsic chart width in pixels. The chart fills its container (the SVG is
   * `width="100%"` and its viewBox follows the measured container width);
   * `width` is the viewBox width until the container has been measured and,
   * when set, the host's `max-width`, so the chart never grows past it. Leave
   * unset for a fully fluid chart.
   * @default undefined
   */
  width = input<number | undefined>(undefined);

  /**
   * Chart height in pixels. A horizontal `'wrap'` chart takes the height of
   * its rows; a vertical `'wrap'` chart adds its label row below this height.
   * @default 200
   */
  height = input<number>(200);

  /**
   * Bar orientation.
   * @default 'vertical'
   */
  orientation = input<BarChartOrientation>('vertical');

  /**
   * Show value labels on bars. In horizontal `'wrap'` rows the value sits at
   * the end of the label line.
   * @default true
   */
  showValues = input<boolean>(true);

  /**
   * Show axis labels.
   * @default true
   */
  showLabels = input<boolean>(true);

  /**
   * How the category labels are set. `'axis'`: one line of SVG text on the
   * category axis, in a fixed 40 px band left of a horizontal bar or centred
   * under a vertical column. Long labels can run out of the chart. `'wrap'`:
   * HTML text that wraps to the room it needs and follows the text size. A
   * horizontal chart becomes a list of rows: the label and the value on one
   * line (the value moves under the label when both don't fit), and below
   * them the bar across the full width. The longest bar fills the width, and
   * `height`, `barGap` and `showGrid` don't apply. A vertical chart keeps its
   * plot and wraps each label within its column, under the chart.
   * @default 'axis'
   */
  labelLayout = input<BarChartLabelLayout>('axis');

  /**
   * Show grid lines. Not used by horizontal `'wrap'` rows.
   * @default true
   */
  showGrid = input<boolean>(true);

  /**
   * Gap between bars as ratio (0-1). Not used by horizontal `'wrap'` rows.
   * @default 0.3
   */
  barGap = input<number>(0.3);

  /**
   * Use a single color for all bars.
   * @default ''
   */
  color = input<string>('');

  /**
   * Formats the value labels and the axis ticks. For a bar it gets the bar's
   * item as the second argument; for an axis tick it gets the tick only
   * (`item` is `undefined`). An item's `valueText` takes precedence.
   * @default float-safe `String(value)`
   */
  formatValue = input<BarChartValueFormatter>(formatChartValue);

  /**
   * Accessible name of the chart. Defaults to a generated summary that lists
   * every bar's label and value, so assistive technology hears the data and
   * not just "Bar chart".
   * @default ''
   */
  ariaLabel = input<string>('');

  // Layout constants
  private readonly PADDING_LEFT = 40;
  private readonly PADDING_RIGHT = 10;
  private readonly PADDING_TOP = 10;
  private readonly PADDING_BOTTOM = 30;

  protected readonly effectiveWidth = computed(
    () => this._containerWidth() || this.width() || DEFAULT_WIDTH
  );

  protected readonly viewBox = computed(
    () => `0 0 ${this.effectiveWidth()} ${this.height()}`
  );

  protected readonly isVertical = computed(() => this.orientation() === 'vertical');

  /** Horizontal `'wrap'`: HTML rows instead of the SVG plot. */
  protected readonly wrapRows = computed(
    () => this.labelLayout() === 'wrap' && !this.isVertical()
  );

  /** Vertical `'wrap'`: the SVG plot, with the category labels as an HTML row under it. */
  protected readonly wrapColumns = computed(
    () => this.labelLayout() === 'wrap' && this.isVertical()
  );

  /**
   * Room under the plot. `'axis'` keeps 30 for the SVG labels; vertical
   * `'wrap'` labels sit under the SVG, so only 2 are left, or 18 when a
   * negative bar's value label hangs below it.
   */
  private readonly paddingBottom = computed(() => {
    if (!this.wrapColumns()) return this.PADDING_BOTTOM;
    const negative = (this.data() ?? []).some((i) => toFinite(i.value) < 0);
    return this.showValues() && negative ? 18 : 2;
  });

  private readonly plot = computed(() => {
    const w = this.effectiveWidth();
    const h = this.height();
    return {
      x: this.PADDING_LEFT,
      y: this.PADDING_TOP,
      w: w - this.PADDING_LEFT - this.PADDING_RIGHT,
      h: h - this.PADDING_TOP - this.paddingBottom(),
    };
  });

  /** A bar's text: `valueText`, else `formatValue(value, item)`. */
  private textOf(item: BarChartItem, value: number, fmt: BarChartValueFormatter): string {
    return item.valueText ?? fmt(value, item);
  }

  /**
   * One scale for grid *and* bars: bounds are nice multiples of the tick step,
   * always include zero, and extend below zero when the data does — so the top
   * tick is the value at the plot edge and negative bars hang off the baseline.
   */
  protected readonly scale = computed(() => {
    const values = (this.data() ?? []).map((i) => toFinite(i.value));
    return niceScale(Math.min(0, ...values), Math.max(0, ...values), 4);
  });

  /** Maps a data value to a pixel position along the value axis. */
  private valueToPos(value: number): number {
    const { min, max } = this.scale();
    const p = this.plot();
    const frac = (value - min) / (max - min || 1);
    return this.isVertical() ? p.y + p.h - frac * p.h : p.x + frac * p.w;
  }

  protected readonly gridLines = computed(() => {
    if (!this.showGrid() || !this.data()?.length) return [];
    const fmt = this.formatValue();
    return this.scale().ticks.map((tick) => ({
      pos: this.valueToPos(tick),
      label: fmt(tick),
    }));
  });

  protected readonly bars = computed(() => {
    const d = this.data();
    if (!d || d.length === 0) return [];

    const isVertical = this.isVertical();
    const p = this.plot();
    const gap = this.barGap();
    const singleColor = this.color();
    const fmt = this.formatValue();
    const zero = this.valueToPos(0);
    const h = this.height();

    if (isVertical) {
      const totalBarWidth = p.w / d.length;
      const barWidth = totalBarWidth * (1 - gap);
      const barOffset = (totalBarWidth - barWidth) / 2;

      return d.map((item, i) => {
        const value = toFinite(item.value);
        const end = this.valueToPos(value);
        const y = Math.min(zero, end);
        const barH = Math.abs(end - zero);
        return {
          x: p.x + i * totalBarWidth + barOffset,
          y,
          width: barWidth,
          height: barH,
          color: singleColor || item.color || chartColor(i),
          label: item.label || '',
          value,
          valueText: this.textOf(item, value, fmt),
          labelX: p.x + i * totalBarWidth + totalBarWidth / 2,
          labelY: h - this.PADDING_BOTTOM + 16,
          valueX: p.x + i * totalBarWidth + totalBarWidth / 2,
          // Above a positive bar, below a negative one.
          valueY: value >= 0 ? y - 6 : y + barH + 12,
          valueAnchor: 'middle',
        };
      });
    } else {
      const totalBarHeight = p.h / d.length;
      const barHeight = totalBarHeight * (1 - gap);
      const barOffset = (totalBarHeight - barHeight) / 2;

      return d.map((item, i) => {
        const value = toFinite(item.value);
        const end = this.valueToPos(value);
        const x = Math.min(zero, end);
        const barW = Math.abs(end - zero);
        return {
          x,
          y: p.y + i * totalBarHeight + barOffset,
          width: barW,
          height: barHeight,
          color: singleColor || item.color || chartColor(i),
          label: item.label || '',
          value,
          valueText: this.textOf(item, value, fmt),
          labelX: p.x - 6,
          labelY: p.y + i * totalBarHeight + totalBarHeight / 2,
          // Right of a positive bar, left of a negative one.
          valueX: value >= 0 ? x + barW + 6 : x - 6,
          valueY: p.y + i * totalBarHeight + totalBarHeight / 2,
          valueAnchor: value >= 0 ? 'start' : 'end',
        };
      });
    }
  });

  /**
   * Value axis along the plot edge plus the zero baseline, which sits inside
   * the plot when the data goes negative.
   */
  protected readonly axisLine = computed(() => {
    const p = this.plot();
    const isVertical = this.isVertical();
    const zero = this.data()?.length ? this.valueToPos(0) : (isVertical ? p.y + p.h : p.x);
    return {
      x1: isVertical ? p.x : zero,
      y1: p.y,
      x2: isVertical ? p.x : zero,
      y2: p.y + p.h,
      bx1: p.x,
      by1: isVertical ? zero : p.y + p.h,
      bx2: p.x + p.w,
      by2: isVertical ? zero : p.y + p.h,
    };
  });

  /** Bottom edge of the plot — where horizontal-orientation tick labels sit. */
  protected readonly plotBottom = computed(() => this.plot().y + this.plot().h);

  /**
   * Bounds of the horizontal `'wrap'` rows: zero is always inside, and the
   * longest bar fills the track.
   */
  private readonly rowBounds = computed(() => {
    const values = (this.data() ?? []).map((i) => toFinite(i.value));
    const lo = Math.min(0, ...values);
    const hi = Math.max(0, ...values);
    return { values, lo, range: hi - lo || 1 };
  });

  /**
   * Horizontal `'wrap'` rows. Bar `x` and `width` are percentages of the
   * track, so the server HTML is final before the container is measured.
   */
  protected readonly rows = computed(() => {
    const d = this.data() ?? [];
    const { values, lo, range } = this.rowBounds();
    const singleColor = this.color();
    const fmt = this.formatValue();
    return d.map((item, i) => {
      const value = values[i];
      return {
        label: item.label || '',
        valueText: this.textOf(item, value, fmt),
        color: singleColor || item.color || chartColor(i),
        x: `${((Math.min(value, 0) - lo) / range) * 100}%`,
        width: `${(Math.abs(value) / range) * 100}%`,
      };
    });
  });

  /** Position of the zero line in the `'wrap'` rows; `null` without negative values. */
  protected readonly rowZero = computed(() => {
    const { lo, range } = this.rowBounds();
    return lo < 0 ? `${(-lo / range) * 100}%` : null;
  });

  protected readonly effectiveAriaLabel = computed(() => {
    const explicit = this.ariaLabel();
    if (explicit) return explicit;
    const d = this.data() ?? [];
    if (!d.length) return 'Bar chart: no data';
    const fmt = this.formatValue();
    return `Bar chart: ${d
      .map((item, i) => {
        const label = item.label || `Bar ${i + 1}`;
        const text = this.textOf(item, toFinite(item.value), fmt);
        return text === '' ? label : `${label} ${text}`;
      })
      .join(', ')}`;
  });
}
