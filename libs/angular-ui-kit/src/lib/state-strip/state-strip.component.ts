import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  linkedSignal,
  signal,
  viewChildren,
} from '@angular/core';
import { nameWithText } from '@lifecorner/angular-ui-kit/internal/a11y';

/** State of one run in `lc-state-strip` (3.36). */
export type StateStripState = 'success' | 'warning' | 'error' | 'neutral';

/** One run of `lc-state-strip`: its state, and a `label` that names it („Mo 06.10., 06:00“). */
export interface StateStripSegment {
  state: StateStripState;
  label: string;
}

/** The words of the four states, for the counts and the segment names. */
export type StateStripLabels = Record<StateStripState, string>;

/** English state words of `lc-state-strip`; pass `stateLabels` for another language. */
export const DEFAULT_STATE_STRIP_LABELS: Readonly<StateStripLabels> = {
  success: 'succeeded',
  warning: 'with warnings',
  error: 'failed',
  neutral: 'pending',
};

/** The order of the counts in the accessible name. */
const STATES: readonly StateStripState[] = ['success', 'warning', 'error', 'neutral'];

/**
 * The states of the last runs at a glance (3.36, quellen row 1): one segment
 * per run, oldest first. The state is a shape, not only a colour: success a
 * block in the upper half, error one in the lower half, warning a centred
 * block, neutral a flat dash, so the strip reads without hue and in forced
 * colours.
 *
 * Accessibility: an APG single-row grid. The strip is named by `ariaLabel`
 * and the count per state („Letzte 10 Ladeläufe, 9 geladen, 1
 * fehlgeschlagen“); each segment is a grid cell named by its `label` and
 * state word. One Tab stop (the newest run first), Arrow Left/Right, Home and
 * End move between the runs, Escape hides the caption. Hovering or focusing a
 * segment shows its name below the strip (hidden from screen readers, which
 * read the cell). 3.37: the pointer uses the whole strip (one layer over the
 * row picks the run under it), so dense strips need no 24 px cells.
 *
 * Without segments it renders nothing. The segments are in the prerendered
 * HTML. CSS hooks: `--lc-state-strip-height` (default `2rem`) and
 * `--lc-state-strip-segment-max-width` (default `1.5rem`; more segments than
 * fit share the width, never overflowing).
 *
 * @example
 * ```html
 * <lc-state-strip
 *   ariaLabel="Letzte 10 Ladeläufe"
 *   [stateLabels]="{ success: 'geladen', warning: 'teilweise geladen', error: 'fehlgeschlagen', neutral: 'ausstehend' }"
 *   [segments]="runs"
 * />
 * ```
 */
@Component({
  selector: 'lc-state-strip',
  standalone: true,
  templateUrl: './state-strip.component.html',
  styleUrl: './state-strip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'lc-state-strip',
    '[class.lc-state-strip--empty]': '!cells().length',
  },
})
export class StateStripComponent {
  /**
   * The runs, in order, oldest first: one segment each. Empty renders nothing
   * (no box, no accessibility node).
   *
   * More runs than fit at 24 px (13 and more in 328 px) narrow the cells below
   * 24 px; the pointer then uses the whole strip: pointing at it, or sliding a
   * pressed finger along it, shows that run; the keyboard moves with the
   * arrows (3.37).
   * @default []
   */
  readonly segments = input<readonly StateStripSegment[]>([]);

  /**
   * Start of the strip's accessible name; the count per state follows it
   * („Letzte 10 Ladeläufe, 9 geladen, 1 fehlgeschlagen“).
   * @default ''
   */
  readonly ariaLabel = input<string>('');

  /**
   * The state words for the counts and the segment names, over the English
   * defaults (`DEFAULT_STATE_STRIP_LABELS`: succeeded, with warnings, failed,
   * pending). German: `{ success: 'geladen', warning: 'teilweise geladen',
   * error: 'fehlgeschlagen', neutral: 'ausstehend' }`.
   * @default {}
   */
  readonly stateLabels = input<Partial<StateStripLabels>>({});

  private readonly cellEls = viewChildren<ElementRef<HTMLElement>>('cell');

  /** The state words in use. */
  private readonly words = computed<StateStripLabels>(() => ({ ...DEFAULT_STATE_STRIP_LABELS, ...this.stateLabels() }));

  /** One entry per segment: its state (unknown states draw as neutral) and its name. */
  protected readonly cells = computed(() => {
    const words = this.words();
    return (this.segments() ?? []).map((segment) => {
      const state: StateStripState = STATES.includes(segment.state) ? segment.state : 'neutral';
      return { state, name: nameWithText(segment.label ?? '', words[state]) };
    });
  });

  /** The strip's name: `ariaLabel`, then the count per state (0 left out). */
  protected readonly gridLabel = computed(() => {
    const words = this.words();
    const counts = STATES.map((state) => [state, this.cells().filter((c) => c.state === state).length] as const)
      .filter(([, count]) => count > 0)
      .map(([state, count]) => `${count} ${words[state]}`)
      .join(', ');
    const label = this.ariaLabel().trim();
    return label ? `${label}, ${counts}` : counts;
  });

  /** The roving Tab stop: the newest run until the user moves. */
  protected readonly current = linkedSignal(() => Math.max(0, this.cells().length - 1));

  /** The segment under the pointer, the one with focus, and whether Escape hid the caption. */
  protected readonly hovered = signal<number | null>(null);
  private readonly focused = signal<number | null>(null);
  private readonly dismissed = signal(false);

  /** The segment whose name the caption shows, if any. */
  private readonly captionIndex = computed(() => {
    const hovered = this.hovered();
    if (hovered !== null) return hovered;
    return this.dismissed() ? null : this.focused();
  });

  /** The caption's text: the name of the hovered or focused segment ('' hides it). */
  protected readonly caption = computed(() => {
    const index = this.captionIndex();
    return index === null ? '' : (this.cells()[index]?.name ?? '');
  });

  protected onFocus(index: number): void {
    this.current.set(index);
    this.focused.set(index);
    this.dismissed.set(false);
  }

  protected onBlur(): void {
    this.focused.set(null);
  }

  protected onPointerEnter(index: number): void {
    this.hovered.set(index);
  }

  protected onPointerLeave(): void {
    this.hovered.set(null);
  }

  /** The run the scrub layer last picked; a move within it changes nothing (as entering a cell). */
  private scrubbed: number | null = null;

  /**
   * The pointer over the strip (3.37, request 057, 056 S-1): the run whose
   * cell spans the pointer's x shows in the caption; outside every cell none.
   */
  protected onScrubMove(event: PointerEvent): void {
    const index = this.cellAt(event.clientX);
    if (index === this.scrubbed) return;
    this.scrubbed = index;
    this.hovered.set(index);
  }

  /** Releasing the pointer (a click, a lifted finger) focuses the run under it. */
  protected onScrubUp(event: PointerEvent): void {
    const index = this.cellAt(event.clientX);
    if (index !== null) this.cellEls()[index]?.nativeElement.focus();
  }

  protected onScrubLeave(): void {
    this.scrubbed = null;
    this.hovered.set(null);
  }

  /** The index of the cell whose box spans `x`, any writing direction. */
  private cellAt(x: number): number | null {
    const cells = this.cellEls();
    for (let i = 0; i < cells.length; i++) {
      const box = cells[i].nativeElement.getBoundingClientRect();
      if (x >= box.left && x < box.right) return i;
    }
    return null;
  }

  /** Arrow Left/Right, Home, End move between the runs (no wrap); Escape hides the caption. */
  protected onKeydown(event: KeyboardEvent): void {
    const last = this.cells().length - 1;
    const from = this.current();
    let to: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
        to = Math.min(from + 1, last);
        break;
      case 'ArrowLeft':
        to = Math.max(from - 1, 0);
        break;
      case 'Home':
        to = 0;
        break;
      case 'End':
        to = last;
        break;
      case 'Escape':
        if (this.captionIndex() !== null) {
          this.hovered.set(null);
          this.dismissed.set(true);
          event.preventDefault();
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    this.current.set(to);
    this.cellEls()[to]?.nativeElement.focus();
  }
}
