import {
  Component,
  ChangeDetectionStrategy,
  input,
  model,
  computed,
  signal,
  contentChild,
  effect,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent, ɵprovideKitIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_CHEVRON_DOWN } from '@lifecorner/angular-ui-kit/icons';
import { AccordionHeaderDirective } from './accordion-header.directive';
import { AccordionContentDirective } from './accordion-content.directive';
import { nameWithText } from '@lifecorner/angular-ui-kit/internal/a11y';

/** Unique id source for header/panel wiring (aria-controls / aria-labelledby). */
let accordionUid = 0;

/** Where the disclosure chevron sits relative to the header content. */
export type AccordionChevronPosition = 'leading' | 'trailing';

/**
 * Accordion component for collapsible content sections.
 *
 * Features:
 * - Expandable/collapsible content panels
 * - Two-way binding for expanded state
 * - Animated expand/collapse transitions
 * - Plain-string `title` **or** a rich projected header (`lcAccordionHeader`)
 * - Eager `<ng-content>` body **or** lazy/destroyable template body
 *   (`lcAccordionContent` + `[lazy]` / `[destroyOnClose]`)
 * - Accessible: header is a real `<button>` inside a heading with
 *   `aria-expanded` / `aria-controls`, keyboard support and a visible focus
 *   ring; the collapsed panel is `inert` (not focusable, hidden from AT)
 *
 * @example Plain (unchanged, fully backward compatible)
 * ```html
 * <lc-accordion title="Section Title" [(expanded)]="isOpen">
 *   <p>Collapsible content here</p>
 * </lc-accordion>
 * ```
 *
 * @example Rich header + lazy body
 * ```html
 * <lc-accordion variant="flat" chevronPosition="leading" [lazy]="true">
 *   <ng-template lcAccordionHeader>
 *     <span class="title">Item label</span>&ngsp;
 *     <lc-badge variant="success" size="sm">Done</lc-badge>&ngsp;
 *     <span style="margin-left: auto;">12:04</span>
 *   </ng-template>
 *   <ng-template lcAccordionContent>
 *     <expensive-panel />
 *   </ng-template>
 * </lc-accordion>
 * ```
 */
@Component({
  selector: 'lc-accordion',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet],
  viewProviders: [ɵprovideKitIcons([ICON_CHEVRON_DOWN])],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionComponent {
  /**
   * Title displayed in the accordion header. Optional: when a
   * `lcAccordionHeader` template is projected it takes precedence, and `title`
   * (if set) starts the header's accessible name when `ariaLabel` is empty.
   * @default ''
   */
  readonly title = input<string>('');

  /**
   * Start of the header button's accessible name; falls back to `title`. A
   * plain `title` is appended unless contained (WCAG 2.5.3 Label in Name).
   * With an `lcAccordionHeader` template, the name is this label (or `title`)
   * followed by the template's text, through `aria-labelledby`. Separate the
   * template's parts with whitespace (`&ngsp;`), and set a label only for
   * context that the template doesn't show.
   * @default ''
   */
  readonly ariaLabel = input<string>('');

  /** Whether the accordion is expanded (two-way binding) */
  readonly expanded = model<boolean>(false);

  /** Visual variant */
  readonly variant = input<'outlined' | 'flat'>('outlined');

  /** Size of the header */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /** Whether the accordion is disabled */
  readonly disabled = input<boolean>(false);

  /**
   * Heading level (1–6) announced for the header button, so the accordion
   * fits into the surrounding document outline.
   * @default 3
   */
  readonly headingLevel = input<1 | 2 | 3 | 4 | 5 | 6>(3);

  /**
   * Where the disclosure chevron sits. `'trailing'` (default) preserves the
   * original layout. `'leading'` puts the chevron first so a right-aligned
   * header element (e.g. a timestamp using `margin-left: auto`) stays pinned to
   * the right edge.
   */
  readonly chevronPosition = input<AccordionChevronPosition>('trailing');

  /**
   * When `true`, a `lcAccordionContent` body is not instantiated until the
   * panel is first expanded; once created it is kept in the DOM on collapse.
   * Default `false` = today's behavior (projected immediately). Has no effect
   * on default `<ng-content>` bodies, which Angular always projects eagerly.
   */
  readonly lazy = input<boolean>(false);

  /**
   * When `true`, a `lcAccordionContent` body is destroyed on collapse and
   * recreated on the next open. Takes precedence over {@link lazy}.
   */
  readonly destroyOnClose = input<boolean>(false);

  /** Rich header template, if projected via `lcAccordionHeader`. */
  readonly headerTemplate = contentChild(AccordionHeaderDirective);

  /** Lazy/deferred body template, if projected via `lcAccordionContent`. */
  readonly contentTemplate = contentChild(AccordionContentDirective);

  /** Stable ids wiring the header button to its panel for screen readers. */
  protected readonly headerId = `lc-accordion-header-${accordionUid}`;
  protected readonly panelId = `lc-accordion-panel-${accordionUid++}`;

  /** Latches to `true` the first time the panel is opened (for lazy bodies). */
  private readonly hasBeenOpened = signal(false);

  constructor() {
    // Record the first open so lazy bodies can render (and stay) afterwards.
    effect(() => {
      if (this.expanded()) {
        this.hasBeenOpened.set(true);
      }
    });
  }

  /**
   * Label that starts a rich header's name (`ariaLabel`, else `title`); empty
   * without a header template.
   */
  protected readonly richHeaderLabel = computed(() =>
    this.headerTemplate() ? (this.ariaLabel() || this.title()).trim() : '',
  );

  /**
   * Accessible label of a plain header button (AS-33, WCAG 2.5.3 Label in
   * Name): the explicit override, else the title, then the visible title
   * unless contained. A rich header has none: it is named by its content.
   */
  protected readonly headerAriaLabel = computed(() =>
    this.headerTemplate() ? null : nameWithText(this.ariaLabel() || this.title(), this.title()) || null,
  );

  /** A labelled rich header: its hidden label, then the template's text. */
  protected readonly headerLabelledBy = computed(() =>
    this.richHeaderLabel() ? `${this.headerId}-label ${this.headerId}-content` : null,
  );

  /**
   * Whether the `lcAccordionContent` body should currently be in the DOM.
   * - `destroyOnClose`: only while expanded.
   * - `lazy`: from the first open onward.
   * - otherwise: always (eager).
   */
  protected readonly shouldRenderBody = computed(() => {
    if (this.destroyOnClose()) return this.expanded();
    if (this.lazy()) return this.hasBeenOpened();
    return true;
  });

  /** Computed CSS classes */
  protected accordionClasses = computed(() => {
    const classes = [
      'lc-accordion',
      `lc-accordion--${this.variant()}`,
      `lc-accordion--${this.size()}`,
      `lc-accordion--chevron-${this.chevronPosition()}`,
    ];
    if (this.expanded()) classes.push('lc-accordion--expanded');
    if (this.disabled()) classes.push('lc-accordion--disabled');
    return classes.join(' ');
  });

  /** Toggle expanded state */
  protected toggle(): void {
    if (!this.disabled()) {
      this.expanded.update((v) => !v);
    }
  }

  /** Handle keyboard events for accessibility */
  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle();
    }
  }
}
