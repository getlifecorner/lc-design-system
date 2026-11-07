import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  computed,
  viewChild,
} from '@angular/core';

export type HeroColor =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'success'
  | 'info'
  | 'warning'
  | 'accent-orange'
  | 'accent-purple'
  | 'accent-violet';

export type HeroSize = 'sm' | 'md' | 'lg';
export type HeroVariant = 'default' | 'slim' | 'light';

/**
 * Width of the hero's content box.
 * - `full`: the content runs to the hero's own padding (default, as before 3.4)
 * - `lg`: from 1024 px the content sits on the `lc-container` `lg` page column
 *   (1024 px minus its 48 px sides, so at most 928 px), centred, while the
 *   background stays full-bleed
 */
export type HeroContentWidth = 'full' | 'lg';

/** Heading level of `lc-hero`'s title (3.36): `h1`–`h6`, the same look at every level. */
export type HeroHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Ids of the title and label, set by `focusTitle()` (module counter, only at the call). */
let nextHeroId = 0;

/**
 * Hero component for prominent page headers with gradient backgrounds.
 *
 * Features:
 * - Color gradient variants (primary, secondary, success, warning, info, neutral, accent-orange, accent-purple, accent-violet)
 * - 3 visual variants: default (dark gradient), slim (compact banner), light (pastel gradient with dark text)
 * - Size options (sm, md, lg)
 * - Optional label text above the title
 * - Configurable border radius
 * - Content projection for body and footer sections
 * - Footer slot for metadata, stats, or CTAs
 * - Media slot (`[hero-media]`) for a visual: below the text on small screens,
 *   beside it from 1024 px, never under the body's 85 % opacity
 * - Content width `lg`: a full-bleed band whose text lines up with the page column
 * - `headingLevel` (3.36): the title as `h1`–`h6`, the same look at every level
 * - `focusTitle()` (3.36): moves focus to the title (`tabindex="-1"`, out of the
 *   Tab order) after an action replaced the stage (WCAG 2.4.3)
 *
 * @example
 * ```html
 * <lc-hero label="MY APP" title="Welcome" color="primary" variant="slim">
 *   <p>Description text</p>
 *   <div hero-footer>Status: Active</div>
 * </lc-hero>
 *
 * <lc-hero title="Everything in view" borderRadius="none" contentWidth="lg">
 *   <p>Description text</p>
 *   <lc-card hero-media variant="elevated">…</lc-card>
 * </lc-hero>
 * ```
 */
@Component({
  selector: 'lc-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  /**
   * Small uppercase label displayed above the title.
   */
  label = input<string | undefined>(undefined);

  /**
   * Main headline text.
   */
  title = input.required<string>();

  /**
   * Color theme for the gradient background.
   * @default 'primary'
   */
  color = input<HeroColor>('primary');

  /**
   * Size variant controlling padding and font sizes.
   * @default 'md'
   */
  size = input<HeroSize>('md');

  /**
   * Border radius of the hero container.
   * @default 'lg'
   */
  borderRadius = input<'none' | 'sm' | 'md' | 'lg'>('lg');

  /**
   * Visual variant.
   * - `default`: dark gradient with white text
   * - `slim`: compact single-line banner
   * - `light`: softer pastel gradient with dark text
   * @default 'default'
   */
  variant = input<HeroVariant>('default');

  /**
   * Width of the content box. `lg` keeps the background full-bleed and, from
   * 1024 px, puts the label, title, body, media and footer on the 1024 px page
   * column (the `lc-container` `lg` content box), never closer to the edge than
   * the size padding. Use it for a full-width band (`borderRadius="none"`) whose
   * text should line up with the page content below.
   * @default 'full'
   */
  contentWidth = input<HeroContentWidth>('full');

  /**
   * Element of the title (`h1`–`h6`), so the hero fits the page's outline
   * (3.36, cockpit row 1). Only the element changes: size, weight, line height
   * and spacing are the same at every level, `size`, `variant` and breakpoint.
   * Use 2 under an `lc-page-header`, which holds the page's `h1`.
   * @default 1
   */
  headingLevel = input<HeroHeadingLevel>(1);

  private readonly titleEl = viewChild<ElementRef<HTMLElement>>('titleEl');
  private readonly labelEl = viewChild<ElementRef<HTMLElement>>('labelEl');

  /**
   * Moves the focus to the title (3.36, monatsstand row 1), e.g. after an
   * action replaced the stage and the button that was used is gone, so focus
   * doesn't fall back to the page (WCAG 2.4.3). Gives the title
   * `tabindex="-1"` first: it stays out of the Tab order. With a `label`, the
   * title is named "label title" (`aria-labelledby` on both, ids set at the
   * call), so the label is read before it. Call it after the new state has
   * rendered, e.g. `afterNextRender(() => this.hero().focusTitle(), { injector })`
   * with `hero = viewChild.required(HeroComponent)`, as
   * `lc-next-step-card.focusTitle()`. Without a call nothing changes.
   */
  focusTitle(): void {
    const title = this.titleEl()?.nativeElement;
    if (!title) return;
    const label = this.labelEl()?.nativeElement;
    if (label) {
      title.id ||= `lc-hero-title-${++nextHeroId}`;
      label.id ||= `lc-hero-label-${++nextHeroId}`;
      title.setAttribute('aria-labelledby', `${label.id} ${title.id}`);
    } else {
      title.removeAttribute('aria-labelledby');
    }
    title.setAttribute('tabindex', '-1');
    title.focus();
  }

  protected heroClasses = computed(() => {
    return [
      'hero',
      `hero--${this.color()}`,
      `hero--${this.size()}`,
      `hero--radius-${this.borderRadius()}`,
      `hero--${this.variant()}`,
      `hero--content-${this.contentWidth()}`,
    ].join(' ');
  });
}
