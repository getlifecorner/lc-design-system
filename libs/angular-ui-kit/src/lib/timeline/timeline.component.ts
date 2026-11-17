import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  contentChild,
  inject,
  input,
  linkedSignal,
  model,
  output,
  computed,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '@lifecorner/angular-ui-kit/icon';
import { BadgeComponent, BadgeVariant } from '@lifecorner/angular-ui-kit/badge';
import {
  TimelineContentDirective,
  TimelineMetaDirective,
} from './timeline-templates.directive';

/**
 * Semantic state of a timeline entry (e.g. one step of a run transcript).
 * Drives the marker color via the semantic tokens; `running` additionally
 * pulses (respecting `prefers-reduced-motion`).
 */
export type TimelineItemState = 'success' | 'running' | 'failed' | 'pending';

/** Heading level of the item titles (3.3, G-11). */
export type TimelineHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface TimelineItem {
  /**
   * Optional stable identity for rendering (falls back to the list index).
   * 3.45: a `selectable` timeline needs it to show the item as selected.
   */
  id?: string;
  /**
   * Title of the event. 3.45 (usm-x row 36): `''` renders no title element
   * (before, an empty one); name a selectable untitled item with `ariaLabel`.
   */
  title: string;
  /**
   * Accessible name of the item's button in a `selectable` timeline (3.45).
   * Default: the title, else the description, else the timestamp.
   */
  ariaLabel?: string;
  /** Optional monospace suffix after the title (e.g. a tool id like `gate_test`). */
  titleMono?: string;
  /** Optional badge label in the header line (e.g. "Fehlgeschlagen"). */
  badge?: string;
  /** Variant of the header badge. @default 'default' */
  badgeVariant?: BadgeVariant;
  /** Optional right-aligned header meta (duration / time). */
  meta?: string;
  /** Optional description */
  description?: string;
  /** Optional timestamp string */
  timestamp?: string;
  /**
   * Machine-readable moment of the timestamp (ISO 8601, e.g.
   * `2026-10-12T18:05:00+02:00`), set as the `<time datetime>` attribute so
   * „heute 18:05“ carries its exact date (3.3, G-11).
   */
  datetime?: string;
  /** Optional icon name (heroicon) */
  icon?: string;
  /** Optional color for the dot/icon */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  /**
   * Semantic entry state — colors the marker from the semantic tokens and
   * takes precedence over `color`. `running` pulses the marker.
   */
  state?: TimelineItemState;
}

export type TimelineOrientation = 'vertical' | 'horizontal';

/** Payload of `itemClick` (3.45): the item and its position in `items`. */
export interface TimelineItemClickEvent {
  item: TimelineItem;
  index: number;
}

let nextTimelineId = 0;

/** Marker color class per entry state. */
const STATE_COLORS: Record<TimelineItemState, string> = {
  success: 'success',
  running: 'primary',
  failed: 'error',
  pending: 'neutral',
};

/**
 * Timeline component for chronological event display.
 *
 * Features:
 * - Vertical timeline with connecting line
 * - Semantic status colors per event (info, success, warning, error)
 * - Entry states (`success | running | failed | pending`); `running` pulses
 * - Composable header line: title + monospace suffix (`titleMono`) + badge
 *   (`badge`/`badgeVariant`) + right-aligned meta (`meta` or the
 *   `lcTimelineMeta` template for live values)
 * - Free content per entry below the header via the `lcTimelineContent`
 *   template (code blocks, prose, diffs, …)
 * - Date and description display per item
 * - Icon support for timeline markers
 * - Dark mode support
 *
 * @example
 * ```html
 * <lc-timeline [items]="events"></lc-timeline>
 * ```
 */
@Component({
  selector: 'lc-timeline',
  standalone: true,
  imports: [IconComponent, BadgeComponent, NgTemplateOutlet],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  /**
   * List of timeline events.
   */
  items = input.required<TimelineItem[]>();

  /**
   * Layout orientation.
   * @default 'vertical'
   */
  orientation = input<TimelineOrientation>('vertical');

  /**
   * Compact mode reduces spacing.
   * @default false
   */
  compact = input<boolean>(false);

  /**
   * Heading level of the item titles (`h2`–`h6`), so each event is reachable
   * by heading navigation. Unset: a plain paragraph (3.2). Semantics only,
   * the look stays the same.
   */
  headingLevel = input<TimelineHeadingLevel | undefined>(undefined);

  /**
   * Makes the items selectable (3.45, usm-x row 36): each item's title
   * becomes a button over the whole entry (inside the heading, when
   * `headingLevel` is set). One tab stop (the selected item, else the first);
   * the arrow keys, Home and End move between the items, Enter, Space or a
   * click emit `itemClick` and select the item (`aria-current`). Links in the
   * `lcTimelineContent` body stay clickable. Off: the DOM is as before.
   * @default false
   */
  selectable = input<boolean>(false);

  /**
   * `id` of the selected item in a `selectable` timeline (two-way); a click,
   * Enter or Space sets it. `null`: none.
   * @default null
   */
  readonly selectedId = model<string | null>(null);

  /** An item of a `selectable` timeline was activated (click, Enter, Space). */
  readonly itemClick = output<TimelineItemClickEvent>();

  private readonly baseId = `lc-timeline-${++nextTimelineId}`;
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Index of the item that owns the tab stop: the selected one, else the first. */
  protected readonly focusIndex = linkedSignal(() => {
    const id = this.selectedId();
    const index = id === null ? -1 : this.items().findIndex((item) => item.id === id);
    return Math.max(0, index);
  });

  /** Optional per-item content template (below the header line). */
  protected contentTemplate = contentChild(TimelineContentDirective);

  /** Optional per-item live meta template (right-aligned in the header). */
  protected metaTemplate = contentChild(TimelineMetaDirective);

  protected timelineClasses = computed(() => {
    return [
      'timeline',
      `timeline--${this.orientation()}`,
      this.compact() ? 'timeline--compact' : '',
      this.selectable() ? 'timeline--selectable' : '',
    ]
      .filter(Boolean)
      .join(' ');
  });

  protected isSelected(item: TimelineItem): boolean {
    return this.selectable() && item.id !== undefined && item.id === this.selectedId();
  }

  /** id of an item's description or time, only in a selectable timeline. */
  protected partId(index: number, part: 'desc' | 'time'): string | null {
    return this.selectable() ? `${this.baseId}-${index}-${part}` : null;
  }

  /** `aria-label` of an item's button: only when the title doesn't name it. */
  protected buttonLabel(item: TimelineItem): string | null {
    if (item.ariaLabel) return item.ariaLabel;
    if (item.title) return null;
    return item.description || item.timestamp || null;
  }

  /** `aria-describedby` of an item's button: description and time, unless one is its name. */
  protected describedBy(item: TimelineItem, index: number): string | null {
    const name = item.ariaLabel || item.title ? null : item.description ? 'desc' : item.timestamp ? 'time' : null;
    const ids: string[] = [];
    if (item.description && name !== 'desc') ids.push(`${this.baseId}-${index}-desc`);
    if (item.timestamp && name !== 'time') ids.push(`${this.baseId}-${index}-time`);
    return ids.length ? ids.join(' ') : null;
  }

  protected onItemActivate(item: TimelineItem, index: number): void {
    this.focusIndex.set(index);
    if (item.id !== undefined) this.selectedId.set(item.id);
    this.itemClick.emit({ item, index });
  }

  /** Arrow keys (both axes, in either orientation), Home and End move the focus. */
  protected onItemKeydown(event: KeyboardEvent, index: number): void {
    const last = this.items().length - 1;
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        next = Math.min(last, index + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        next = Math.max(0, index - 1);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.focusIndex.set(next);
    this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.timeline__button')[next]?.focus();
  }

  /**
   * Brings the focused item fully into view, its box outset included
   * (`scroll-margin`): Chromium's `focus()` leaves a partly visible button
   * where it is, cut off in the horizontal scroller (review r3 M6).
   * `?.()`: jsdom has no `scrollIntoView`.
   */
  protected onItemFocus(event: FocusEvent): void {
    (event.target as HTMLElement).closest('li')?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }

  protected markerClasses(item: TimelineItem): string {
    const color = item.state ? STATE_COLORS[item.state] : item.color || 'primary';
    return [
      'timeline__marker',
      `timeline__marker--${color}`,
      item.state === 'running' ? 'timeline__marker--running' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }
}
