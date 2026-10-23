import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Marks an `<ng-template>` as the rich header content for an `<lc-accordion>`.
 *
 * When present, the projected template is rendered inside the header button
 * instead of the plain `title` string. The accordion still owns the disclosure
 * chevron, click/keyboard handling and focus ring — the consumer only supplies
 * the (non-interactive) inner content.
 *
 * A11y constraint: the header is itself a `<button>`, so the template must not
 * contain nested interactive elements (no button/link/input). Text, badges and
 * other non-interactive nodes only.
 *
 * Name (WCAG 2.5.3 Label in Name): the header is named by the template's
 * text; the accordion's `ariaLabel` (or `title`), if set, comes first through
 * `aria-labelledby`. Separate the template's parts with whitespace
 * (`&ngsp;`), so they read as words ("Item label Done 12:04"), and set a
 * label only for context that the template doesn't show.
 *
 * @example
 * ```html
 * <lc-accordion variant="flat" chevronPosition="leading">
 *   <ng-template lcAccordionHeader>
 *     <span class="title">Item label</span>&ngsp;
 *     <lc-badge variant="success" size="sm">Done</lc-badge>&ngsp;
 *     <span style="margin-left: auto;">12:04</span>
 *   </ng-template>
 *   <div>Body…</div>
 * </lc-accordion>
 * ```
 */
@Directive({
  selector: '[lcAccordionHeader]',
  standalone: true,
})
export class AccordionHeaderDirective {
  public readonly template = inject(TemplateRef<unknown>);
}
