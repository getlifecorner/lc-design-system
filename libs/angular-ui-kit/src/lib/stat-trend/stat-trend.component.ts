import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
} from '@angular/core';
import { SparklineComponent, SparklineColor } from '@lifecorner/angular-ui-kit/sparkline';
import { IconComponent } from '@lifecorner/angular-ui-kit/icon';

export type StatTrendDirection = 'up' | 'down' | 'neutral';

/** Whether a change is good or bad for the reader, independent of its direction. */
export type StatTrendSentiment = 'positive' | 'negative' | 'neutral';

/**
 * Words of the screen-reader text that `lc-stat-trend` adds to the change when
 * `sentiment` is set (", up, unfavourable"). Override single keys via `labels`.
 */
export interface StatTrendLabels {
  /** Direction up. EN "up", DE "gestiegen". */
  up: string;
  /** Direction down. EN "down", DE "gesunken". */
  down: string;
  /** Direction neutral. EN "unchanged", DE "unverändert". */
  unchanged: string;
  /** Sentiment positive. EN "favourable", DE "günstig". */
  positive: string;
  /** Sentiment negative. EN "unfavourable", DE "ungünstig". */
  negative: string;
  /** Sentiment neutral. EN "neutral", DE "neutral". */
  neutral: string;
}

const DEFAULT_LABELS: StatTrendLabels = {
  up: 'up',
  down: 'down',
  unchanged: 'unchanged',
  positive: 'favourable',
  negative: 'unfavourable',
  neutral: 'neutral',
};

@Component({
  selector: 'lc-stat-trend',
  standalone: true,
  imports: [SparklineComponent, IconComponent],
  templateUrl: './stat-trend.component.html',
  styleUrls: ['./stat-trend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Stat trend component for displaying KPI values with change indicators.
 *
 * Features:
 * - Value display with label and optional icon
 * - Change percentage with auto-detected trend direction (up/down/neutral)
 * - Color-coded trend indicator (green for up, red for down), or by `sentiment`
 *   when a rise is bad (costs) or a fall is good (churn)
 * - Optional embedded sparkline chart
 * - Configurable sparkline color theme
 *
 * With `sentiment` set, the arrow is hidden from screen readers and a visually
 * hidden text names the direction and the sentiment ("+3.1 %, up, unfavourable"),
 * so the meaning never rests on colour alone. Translate it with `labels`.
 *
 * @example
 * ```html
 * <lc-stat-trend label="Revenue" value="$42,350" change="+12.5%" [sparklineData]="data" />
 * <lc-stat-trend label="Costs" value="€48.2m" change="+3.1%" sentiment="negative" />
 * ```
 */
export class StatTrendComponent {
  /** Main KPI label. */
  label = input<string>('');

  /** Main KPI value to display. */
  value = input.required<string>();

  /** Change value text, e.g. "+12%" or "-3.5%". */
  change = input<string>('');

  /** Trend direction for color coding. Auto-detected from change if not set. */
  direction = input<StatTrendDirection | undefined>(undefined);

  /**
   * Whether the change is good or bad, independent of its direction (a rise in
   * costs is negative). Colours the change and the default sparkline; the arrow
   * keeps the direction. Unset: derived from the direction.
   * @default undefined
   */
  sentiment = input<StatTrendSentiment | undefined>(undefined);

  /**
   * Words of the screen-reader text added to the change when `sentiment` is set.
   * Missing keys fall back to the English defaults (up, down, unchanged,
   * favourable, unfavourable, neutral).
   * @default {}
   */
  labels = input<Partial<StatTrendLabels>>({});

  /** Sparkline data points. If empty, no sparkline is shown. */
  sparklineData = input<number[]>([]);

  /** Color of the sparkline. Auto-matched to trend direction if not set. */
  sparklineColor = input<SparklineColor | undefined>(undefined);

  /** Optional icon name (Tabler icon). */
  icon = input<string>('');

  protected readonly resolvedDirection = computed<StatTrendDirection>(() => {
    const dir = this.direction();
    if (dir) return dir;
    const c = this.change();
    if (c.startsWith('+') || c.startsWith('↑')) return 'up';
    if (c.startsWith('-') || c.startsWith('↓')) return 'down';
    return 'neutral';
  });

  protected readonly trendColorClass = computed(() => {
    const sentiment = this.sentiment();
    if (sentiment) return `lc-stat-trend__change--${sentiment}`;
    const map: Record<StatTrendDirection, string> = {
      up: 'lc-stat-trend__change--up',
      down: 'lc-stat-trend__change--down',
      neutral: 'lc-stat-trend__change--neutral',
    };
    return map[this.resolvedDirection()];
  });

  protected readonly resolvedSparklineColor = computed<SparklineColor>(() => {
    const c = this.sparklineColor();
    if (c) return c;
    const sentiment = this.sentiment();
    if (sentiment) {
      const bySentiment: Record<StatTrendSentiment, SparklineColor> = {
        positive: 'success',
        negative: 'error',
        neutral: 'info',
      };
      return bySentiment[sentiment];
    }
    const map: Record<StatTrendDirection, SparklineColor> = {
      up: 'success',
      down: 'error',
      neutral: 'info',
    };
    return map[this.resolvedDirection()];
  });

  protected readonly trendIcon = computed(() => {
    const map: Record<StatTrendDirection, string> = {
      up: '↑',
      down: '↓',
      neutral: '→',
    };
    return map[this.resolvedDirection()];
  });

  /** ", up, unfavourable": rendered only when `sentiment` is set. */
  protected readonly srText = computed(() => {
    const sentiment = this.sentiment();
    if (!sentiment) return '';
    const text: StatTrendLabels = { ...DEFAULT_LABELS, ...this.labels() };
    const dir = this.resolvedDirection();
    const direction = dir === 'neutral' ? text.unchanged : text[dir];
    return `, ${direction}, ${text[sentiment]}`;
  });

  protected readonly hasSparkline = computed(() => this.sparklineData().length >= 2);
}
