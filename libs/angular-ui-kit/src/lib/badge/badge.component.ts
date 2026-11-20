import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { IconComponent } from '@lifecorner/angular-ui-kit/icon';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Badge component for displaying status, notifications, or counts.
 *
 * Features:
 * - Semantic color variants (primary, secondary, success, warning, error, info, neutral)
 * - Multiple size options (xs, sm, md, lg)
 * - Pill-shaped rounded mode
 * - Optional wrapping for long, sentence-like labels (`wrap`)
 * - Content projection for labels or count values: 3.49 puts it in one
 *   inline label (`.lc-badge__label`), so mixed content keeps its spaces
 *   („Aufnahme läuft in <strong>USM-1209</strong>“); a projected `lc-icon`
 *   sits before the label, outside it (prefer `icon`)
 * - 3.49: `maxWidth` cuts a long label with an ellipsis and a `title`
 * - 3.50: with `maxWidth`, a projected element with the class
 *   `lc-badge__cut` is the only run that is cut; the rest stays visible
 *
 * @example
 * ```html
 * <lc-badge variant="primary" size="md">New</lc-badge>
 * <lc-badge variant="error" size="sm" [rounded]="true">5</lc-badge>
 * ```
 */
@Component({
  selector: 'lc-badge',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None, // Required for dynamic variant class styling
})
export class BadgeComponent {
  /** Visual variant of the badge */
  variant = input<BadgeVariant>('default');

  /** Size of the badge */
  size = input<BadgeSize>('md');

  /** Whether the badge has fully rounded corners (pill shape) */
  rounded = input<boolean>(false);

  /**
   * Render a small leading status dot, filled in the variant's `currentColor`,
   * before the label (the "● label" pattern). Purely additive.
   * @default false
   */
  dot = input<boolean>(false);

  /**
   * Let a long label wrap onto centred lines instead of staying on one line:
   * the fixed height becomes a minimum height, lines are 1.25 high, and the
   * badge is never wider than its container (a word wider than the container
   * breaks). With `rounded`, the corners keep the one-line pill radius, so a
   * two-line badge isn't clipped by half-circle ends. A label that fits looks
   * as before. Use it for sentence-like status labels (SI-15), not for counts.
   * @default false
   */
  wrap = input<boolean>(false);

  /**
   * Leading decorative icon (3.44, usm-x row 28): an `lc-icon` name, drawn
   * 1em square in the label ink after the dot and before the label, with a
   * gap of `--lc-badge-gap` (default `0.4em` with an icon, `0` without; set it
   * on the badge or any ancestor, as `--lc-chip-gap`). The app registers the
   * icon (`provideLcIcons`). With `wrap` it stays on the first line.
   * @default undefined
   */
  icon = input<string | undefined>(undefined);

  /**
   * Caps the badge's width (3.49, usm-x row 72): any CSS length (`16rem`,
   * `22ch`). The label is cut on one line with an ellipsis, the dot and the
   * icon stay visible, and the badge's `title` is the label's whole text (not
   * when the `lc-badge` host has its own `title`); the text stays in the DOM
   * for assistive tech. Ignored with `wrap` (`wrap` wins: no ellipsis). A
   * percentage needs a container of definite width. 3.50 (usm-x row 83):
   * give one projected element the class `lc-badge__cut` and only that run
   * is cut (at least 2em stay); the text before and after it (an end, a
   * count) stays whole, e.g.
   * `Recording in <span class="lc-badge__cut">{{ name }}</span> · 3 objects`.
   * Without `maxWidth` the class has no effect. Empty: no cap.
   * @default ''
   */
  readonly maxWidth = input<string>('');

  /** 3.49: `maxWidth` applies (set, and no `wrap`). */
  protected readonly truncate = computed(() => !!this.maxWidth().trim() && !this.wrap());

  /** 3.49: the label's whole text as the `title` of a cut badge; null otherwise. */
  protected readonly autoTitle = signal<string | null>(null);

  private readonly label = viewChild<ElementRef<HTMLElement>>('label');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // 3.49 (design §3C): the label's text, whitespace collapsed, read after
    // render and on every change of the projected content while the badge is
    // cut. Not on the server: prerendered HTML gets no `title`.
    afterRenderEffect((onCleanup) => {
      const label = this.label()?.nativeElement;
      if (!this.truncate() || !label || this.host.nativeElement.hasAttribute('title')) {
        this.autoTitle.set(null);
        return;
      }
      const read = () => this.autoTitle.set((label.textContent ?? '').replace(/\s+/g, ' ').trim() || null);
      read();
      if (typeof MutationObserver === 'undefined') return;
      const observer = new MutationObserver(read);
      observer.observe(label, { childList: true, characterData: true, subtree: true });
      onCleanup(() => observer.disconnect());
    });
  }

  /**
   * Computed CSS classes for the badge
   */
  badgeClasses = computed(() => {
    const classes = ['lc-badge'];

    classes.push(`lc-badge--${this.variant()}`);
    classes.push(`lc-badge--${this.size()}`);

    if (this.rounded()) {
      classes.push('lc-badge--rounded');
    }

    if (this.dot()) {
      classes.push('lc-badge--has-dot');
    }

    if (this.wrap()) {
      classes.push('lc-badge--wrap');
    }

    if (this.icon()) {
      classes.push('lc-badge--has-icon');
    }

    if (this.truncate()) {
      classes.push('lc-badge--truncate');
    }

    return classes.join(' ');
  });
}
