import { Directive, ElementRef, Renderer2, effect, inject, input, isDevMode } from '@angular/core';

/** 3.50 (usm-x row 80): the attribute names `MenuItem.attrs` may set. */
const ALLOWED_ATTR = /^(id|data-[a-z0-9][a-z0-9._-]*)$/;

/**
 * Kit-internal (3.50, usm-x row 80): writes `MenuItem.attrs` onto a menu item
 * element: `id` and `data-*` only; any other name is dropped (with a
 * `console.warn` in dev mode), so no event handler, `class`, `style` or link
 * target can be injected. Attributes of an earlier value are removed.
 */
@Directive({
  selector: '[lcMenuItemAttrs]',
  standalone: true,
})
export class MenuItemAttrsDirective {
  /** The item's `attrs`. @default undefined */
  readonly lcMenuItemAttrs = input<Readonly<Record<string, string>> | undefined>(undefined);

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private written: string[] = [];

  constructor() {
    effect(() => {
      const attrs = this.lcMenuItemAttrs();
      const element = this.element.nativeElement;
      for (const name of this.written) this.renderer.removeAttribute(element, name);
      this.written = [];
      if (!attrs) return;
      for (const [name, value] of Object.entries(attrs)) {
        if (!ALLOWED_ATTR.test(name)) {
          if (isDevMode()) console.warn(`lc-menu: MenuItem.attrs "${name}" is not rendered; only "id" and "data-*" are allowed.`);
          continue;
        }
        this.renderer.setAttribute(element, name, String(value));
        this.written.push(name);
      }
    });
  }
}
