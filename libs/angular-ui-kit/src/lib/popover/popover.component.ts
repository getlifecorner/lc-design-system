import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  untracked,
  afterNextRender,
  afterRenderEffect,
  ElementRef,
  HostListener,
  Injector,
  Renderer2,
  inject,
  OnDestroy,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { OverlayStackService } from '@lifecorner/angular-ui-kit/internal/overlay';

export type PopoverPosition = 'top' | 'bottom' | 'left' | 'right';
export type PopoverTrigger = 'click' | 'hover';

/**
 * One way to open `lc-popover` (3.45, usm-x row 35): `click`, `hover`,
 * `focus` (keyboard focus on the trigger) or `longpress` (a touch hold, right
 * click, Shift+F10 or the Menu key).
 */
export type PopoverTriggerKind = 'click' | 'hover' | 'focus' | 'longpress';

/**
 * Edge of the panel that lines up with the trigger (3.45): `start` / `end`
 * put the panel's start / end edge on the trigger's; `center` centres it.
 */
export type PopoverAlign = 'start' | 'center' | 'end';

/**
 * Role of the `lc-popover` panel (3.48, usm-x row 64): `auto` (a dialog with
 * `click` or `longpress`, else a tooltip) or `tooltip` (a long press only
 * shows a description).
 */
export type PopoverPanelRole = 'auto' | 'tooltip';

/** Natively focusable elements a projected trigger may be or contain. */
const INTERACTIVE_SELECTOR = 'button, a[href], input, select, textarea, [tabindex]';

/** Distance of the panel from the viewport edges and from the trigger (px). */
const VIEWPORT_MARGIN = 8;
const GAP = 8;
/** Closest the arrow gets to a panel edge (px). */
const ARROW_INSET = 16;
/** A long press is cancelled by a move of more than this (px). */
const LONG_PRESS_SLOP = 10;

/**
 * Popover component for displaying rich floating content.
 *
 * Features:
 * - Position options (top, bottom, left, right); 3.45: `align` (start,
 *   center, end), and the panel flips to the other side and shifts along it
 *   to stay 8 px inside the viewport, the arrow following the trigger
 * - Trigger kinds: click, hover; 3.45: `focus` (keyboard focus), `longpress`
 *   (touch hold, right click, Shift+F10, Menu key), several at once as an
 *   array; `openDelay` / `closeDelay` for hover and focus
 * - 3.45: public `open()`, `close()` and `toggle()`; `openChange` emits once
 *   per real change
 * - Optional arrow indicator
 * - Click-outside and Escape to close (top-most overlay only)
 * - Content projection for trigger and body
 *
 * Accessibility: with `click` or `longpress` the trigger gets
 * `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`, and the panel
 * is a non-modal `dialog`. With only `hover` / `focus` (3.45) the panel is a
 * `tooltip` the trigger is described by while it is open; it stays open while
 * the pointer moves onto it and closes with Escape (WCAG 1.4.13). Interactive
 * content needs `click` or `longpress`.
 *
 * @example
 * ```html
 * <lc-popover position="bottom" trigger="click">
 *   <button popover-trigger>Open</button>
 *   <div popover-content>Rich content here</div>
 * </lc-popover>
 * ```
 */
@Component({
  selector: 'lc-popover',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverComponent implements OnDestroy {
  private static nextId = 0;
  /** Identifies this instance in the overlay stack. */
  private readonly overlayId = `lc-popover-${++PopoverComponent.nextId}`;

  /**
   * Position relative to the trigger element. 3.45: when the panel doesn't
   * fit there, it flips (top ↔ bottom; left and right fall back to bottom,
   * then top).
   * @default 'bottom'
   */
  position = input<PopoverPosition>('bottom');

  /**
   * How the popover is triggered: `click`, `hover`, and since 3.45 `focus`
   * (keyboard focus on the trigger) and `longpress` (a touch hold of
   * `longPressMs` that a move of 10 px cancels, a right click, Shift+F10 or
   * the Menu key), or several of them as an array (`['hover', 'focus',
   * 'longpress']` for an info card). Interactive content needs `click` or
   * `longpress`.
   * @default 'click'
   */
  trigger = input<PopoverTriggerKind | readonly PopoverTriggerKind[]>('click');

  /**
   * Whether to show an arrow pointing at the trigger.
   * @default true
   */
  showArrow = input<boolean>(true);

  /**
   * Delay in ms before a `hover` / `focus` opens the panel (3.45).
   * @default 0
   */
  openDelay = input<number>(0);

  /**
   * Delay in ms before leaving the trigger and the panel closes a `hover` /
   * `focus` panel (3.45).
   * @default 0
   */
  closeDelay = input<number>(0);

  /**
   * Hold time in ms of a `longpress` (3.45).
   * @default 500
   */
  longPressMs = input<number>(500);

  /**
   * Edge of the panel on the trigger's edge (3.45): `start` / `end` line up
   * the start / end edges (top and bottom panels; left and right panels line
   * up their top / bottom edges), `center` centres the panel as before.
   * @default 'center'
   */
  align = input<PopoverAlign>('center');

  /**
   * Role of the panel (3.48, usm-x row 64). `'auto'`: a dialog with `click`
   * or `longpress`, else a tooltip (as before). `'tooltip'`: a `longpress`
   * (with or without `hover` / `focus`) keeps the panel `role="tooltip"`, for
   * a card the long press only shows while the trigger's own click does
   * something else (a relation chip opens the object): the trigger gets no
   * `aria-haspopup` / `aria-expanded` / `aria-controls`, only
   * `aria-describedby` while open, and a tap outside or Escape closes it.
   * Ignored with `click` (its panel is a dialog).
   * @default 'auto'
   */
  panelRole = input<PopoverPanelRole>('auto');

  /**
   * Emitted when the popover opens or closes (3.45: once per real change).
   */
  readonly openChange = output<boolean>();

  protected isOpen = signal(false);

  /** Id of the panel, referenced by the trigger's `aria-controls`. */
  protected readonly panelId = `${this.overlayId}-panel`;

  /** The trigger kinds in use. */
  protected readonly kinds = computed<ReadonlySet<PopoverTriggerKind>>(() => {
    const t = this.trigger();
    return new Set(typeof t === 'string' ? [t] : t);
  });

  /**
   * A dialog (click / longpress) rather than a tooltip (hover / focus only).
   * 3.48: `panelRole="tooltip"` keeps a long-press panel a tooltip.
   */
  protected readonly interactive = computed(
    () => this.kinds().has('click') || (this.kinds().has('longpress') && this.panelRole() !== 'tooltip'),
  );

  /** The side the panel is on after flipping; `null` until it is placed. */
  private readonly placed = signal<PopoverPosition | null>(null);

  protected panelClasses = computed(() => {
    const align = this.align();
    const kinds = this.kinds();
    return [
      'popover__panel',
      `popover__panel--${this.placed() ?? this.position()}`,
      this.showArrow() ? 'popover__panel--arrow' : '',
      align !== 'center' ? `popover__panel--align-${align}` : '',
      kinds.has('hover') || kinds.has('focus') ? 'popover__panel--bridge' : '',
    ]
      .filter(Boolean)
      .join(' ');
  });

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly overlayStack = inject(OverlayStackService);
  private readonly injector = inject(Injector);

  private openTimer: ReturnType<typeof setTimeout> | undefined;
  private closeTimer: ReturnType<typeof setTimeout> | undefined;
  private pressTimer: ReturnType<typeof setTimeout> | undefined;
  private pressStart: { x: number; y: number } | null = null;
  /** A long press opened the panel: the click after it is cancelled. */
  private swallowClick = false;
  /** Escape closed a hover / focus panel: it stays closed until pointer and focus have left. */
  private dismissed = false;
  private readonly unlisten: (() => void)[] = [];
  private unlistenResize: (() => void) | null = null;

  constructor() {
    effect(() => {
      const open = this.isOpen();
      untracked(() => {
        if (open) {
          this.overlayStack.push(this.overlayId);
          afterNextRender(() => this.place(), { injector: this.injector });
          this.unlistenResize ??= this.renderer.listen('window', 'resize', () => this.place());
          this.watchLayout();
        } else {
          this.overlayStack.remove(this.overlayId);
          this.placed.set(null);
          this.unlistenResize?.();
          this.unlistenResize = null;
          this.layoutObserver?.disconnect();
        }
      });
    });

    // Mirror the open state onto the projected trigger so assistive tech knows
    // it controls a popup (the trigger is caller-supplied, so we set the
    // attributes rather than bind them). 3.45: a hover / focus-only panel is a
    // tooltip that describes the trigger while it is open.
    afterRenderEffect(() => {
      const open = this.isOpen();
      const interactive = this.interactive();
      const trigger = this.triggerElement();
      if (!trigger) return;
      if (interactive) {
        this.renderer.setAttribute(trigger, 'aria-haspopup', 'dialog');
        this.renderer.setAttribute(trigger, 'aria-expanded', String(open));
        if (open) {
          this.renderer.setAttribute(trigger, 'aria-controls', this.panelId);
        } else {
          this.renderer.removeAttribute(trigger, 'aria-controls');
        }
        this.setDescribedBy(trigger, false);
      } else {
        this.renderer.removeAttribute(trigger, 'aria-haspopup');
        this.renderer.removeAttribute(trigger, 'aria-expanded');
        this.renderer.removeAttribute(trigger, 'aria-controls');
        this.setDescribedBy(trigger, open);
      }
    });

    // The focus and long-press listeners are added in code, so prerendered
    // HTML carries none of them.
    afterNextRender(() => this.listen());
  }

  /**
   * Click outside closes the popover — only while it is the top-most overlay,
   * so a click inside a layer above it (a modal opened from the popover) is
   * left alone.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // 3.48: a long-press tooltip (`panelRole="tooltip"`) closes on a tap outside too
    if (!this.isOpen() || !(this.interactive() || this.kinds().has('longpress'))) return;
    const el = this.elementRef.nativeElement;
    if (el.contains(event.target as Node)) return;
    if (!this.overlayStack.claim(this.overlayId, event)) return;
    this.close();
  }

  /**
   * Escape closes the popover only while it is the top-most overlay; the event
   * is consumed so overlays underneath stay open.
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    if (!this.isOpen()) return;
    if (!this.overlayStack.claim(this.overlayId, event)) return;
    event.stopPropagation();
    this.dismissed = this.kinds().has('hover') || this.kinds().has('focus');
    this.close();
  }

  ngOnDestroy(): void {
    this.clearTimers();
    this.unlisten.forEach((off) => off());
    this.unlistenResize?.();
    this.layoutObserver?.disconnect();
    if (this.placeFrame !== null) cancelAnimationFrame(this.placeFrame);
    this.overlayStack.remove(this.overlayId);
  }

  /** Re-places an open panel when the page, the trigger or the panel resize (a late layout, fonts, a sidebar). */
  private layoutObserver?: ResizeObserver;
  /** One placement per frame. */
  private placeFrame: number | null = null;

  private watchLayout(): void {
    if (typeof ResizeObserver === 'undefined' || typeof document === 'undefined') return;
    this.layoutObserver ??= new ResizeObserver(() => {
      if (this.placeFrame !== null) return;
      this.placeFrame = requestAnimationFrame(() => {
        this.placeFrame = null;
        this.place();
      });
    });
    this.layoutObserver.disconnect();
    this.layoutObserver.observe(document.documentElement);
    if (document.body) this.layoutObserver.observe(document.body);
    afterNextRender(
      () => {
        const host = this.elementRef.nativeElement;
        const anchor = host.querySelector('.popover__trigger');
        const panel = host.querySelector('.popover__panel');
        if (anchor) this.layoutObserver?.observe(anchor);
        if (panel) this.layoutObserver?.observe(panel);
      },
      { injector: this.injector },
    );
  }

  /** Opens the panel (3.45: public). Emits `openChange` only when it was closed. */
  open(): void {
    clearTimeout(this.closeTimer);
    if (this.isOpen()) return;
    this.isOpen.set(true);
    this.openChange.emit(true);
  }

  /** Closes the panel (3.45: public). Emits `openChange` only when it was open. */
  close(): void {
    clearTimeout(this.openTimer);
    if (!this.isOpen()) return;
    this.restoreFocus();
    this.isOpen.set(false);
    this.openChange.emit(false);
  }

  /** Opens a closed panel and closes an open one (3.45: public). */
  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  protected onTriggerClick(): void {
    if (this.kinds().has('click')) this.toggle();
  }

  protected onMouseEnter(): void {
    if (this.kinds().has('hover')) this.scheduleOpen();
  }

  protected onMouseLeave(): void {
    if (!this.kinds().has('hover')) return;
    if (this.focusInside() && this.kinds().has('focus')) return;
    this.dismissed = false;
    this.scheduleClose();
  }

  private scheduleOpen(): void {
    clearTimeout(this.closeTimer);
    if (this.dismissed || this.isOpen()) return;
    const ms = this.openDelay();
    if (ms <= 0) {
      this.open();
      return;
    }
    clearTimeout(this.openTimer);
    this.openTimer = setTimeout(() => this.open(), ms);
  }

  private scheduleClose(): void {
    clearTimeout(this.openTimer);
    const ms = this.closeDelay();
    if (ms <= 0) {
      this.close();
      return;
    }
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.close(), ms);
  }

  private listen(): void {
    const host = this.elementRef.nativeElement;
    const wrapper = host.querySelector<HTMLElement>('.popover__trigger');
    if (!wrapper) return;
    const on = <K extends keyof HTMLElementEventMap>(
      el: HTMLElement,
      type: K,
      handler: (e: HTMLElementEventMap[K]) => void,
      capture = false,
    ): void => {
      el.addEventListener(type, handler as EventListener, capture);
      this.unlisten.push(() => el.removeEventListener(type, handler as EventListener, capture));
    };

    // focus: keyboard focus on the trigger opens; leaving trigger and panel closes.
    on(wrapper, 'focusin', (e) => {
      if (!this.kinds().has('focus') || !isFocusVisible(e.target)) return;
      this.scheduleOpen();
    });
    on(host, 'focusout', (e) => {
      if (!this.kinds().has('focus')) return;
      const next = e.relatedTarget as Node | null;
      if (next && host.contains(next)) return;
      this.dismissed = false;
      if (this.kinds().has('hover') && host.matches(':hover')) return;
      this.scheduleClose();
    });

    // longpress: a touch hold, a right click, Shift+F10 or the Menu key.
    on(wrapper, 'pointerdown', (e) => {
      if (!this.kinds().has('longpress') || e.pointerType === 'mouse' || (e.button ?? 0) !== 0) return;
      this.pressStart = { x: e.clientX, y: e.clientY };
      clearTimeout(this.pressTimer);
      this.pressTimer = setTimeout(() => {
        this.pressStart = null;
        this.swallowClick = true;
        this.open();
      }, this.longPressMs());
    });
    on(wrapper, 'pointermove', (e) => {
      if (!this.pressStart) return;
      if (Math.hypot(e.clientX - this.pressStart.x, e.clientY - this.pressStart.y) > LONG_PRESS_SLOP) this.cancelPress();
    });
    on(wrapper, 'pointerup', () => this.cancelPress());
    on(wrapper, 'pointercancel', () => this.cancelPress());
    on(wrapper, 'contextmenu', (e) => {
      if (!this.kinds().has('longpress')) return;
      e.preventDefault();
      this.cancelPress();
      this.open();
    });
    on(wrapper, 'keydown', (e) => {
      if (!this.kinds().has('longpress')) return;
      if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
        e.preventDefault();
        this.open();
      }
    });
    // The click that ends a long press is cancelled before it reaches the trigger.
    on(
      wrapper,
      'click',
      (e) => {
        if (!this.swallowClick) return;
        this.swallowClick = false;
        e.preventDefault();
        e.stopPropagation();
      },
      true,
    );
  }

  private cancelPress(): void {
    clearTimeout(this.pressTimer);
    this.pressStart = null;
  }

  private clearTimers(): void {
    clearTimeout(this.openTimer);
    clearTimeout(this.closeTimer);
    clearTimeout(this.pressTimer);
  }

  /**
   * Flips the panel to a side where it fits, shifts it along that side into
   * the viewport (8 px margin) and points the arrow at the trigger's centre.
   * Computed from the trigger's rect and the panel's layout size (not its
   * current rect), so the result doesn't depend on the side or shift the
   * panel had when it was measured (a flip needs no second pass).
   */
  private place(): void {
    if (typeof window === 'undefined' || !this.isOpen()) return;
    const host = this.elementRef.nativeElement;
    const anchor = host.querySelector<HTMLElement>('.popover__trigger');
    const panel = host.querySelector<HTMLElement>('.popover__panel');
    if (!anchor || !panel) return;
    const vw = document.documentElement.clientWidth || window.innerWidth;
    const vh = document.documentElement.clientHeight || window.innerHeight;
    const t = anchor.getBoundingClientRect();
    // The border box without transforms (shift, entrance scale): the same on every side.
    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    if (!width && !height) return;

    const fits: Record<PopoverPosition, boolean> = {
      bottom: t.bottom + GAP + height <= vh - VIEWPORT_MARGIN,
      top: t.top - GAP - height >= VIEWPORT_MARGIN,
      left: t.left - GAP - width >= VIEWPORT_MARGIN,
      right: t.right + GAP + width <= vw - VIEWPORT_MARGIN,
    };
    const wanted = this.position();
    const order: PopoverPosition[] =
      wanted === 'bottom' ? ['bottom', 'top'] : wanted === 'top' ? ['top', 'bottom'] : [wanted, 'bottom', 'top'];
    const side = order.find((p) => fits[p]) ?? wanted;
    this.placed.set(side);

    // Where the CSS puts the panel's start edge on the cross axis, unshifted.
    const align = this.align();
    const rtl = getComputedStyle(host).direction === 'rtl';
    const horizontal = side === 'top' || side === 'bottom';
    let start: number;
    let length: number;
    let limit: number;
    let centre: number;
    if (horizontal) {
      length = width;
      limit = vw;
      centre = t.left + t.width / 2;
      if (align === 'center') start = centre - width / 2;
      else start = (align === 'start') !== rtl ? t.left : t.right - width;
    } else {
      length = height;
      limit = vh;
      centre = t.top + t.height / 2;
      start = align === 'center' ? centre - height / 2 : align === 'start' ? t.top : t.bottom - height;
    }
    let shift = 0;
    if (start < VIEWPORT_MARGIN) shift = VIEWPORT_MARGIN - start;
    else if (start + length > limit - VIEWPORT_MARGIN) shift = limit - VIEWPORT_MARGIN - (start + length);
    if (length + 2 * VIEWPORT_MARGIN > limit) shift = VIEWPORT_MARGIN - start;
    shift = Math.round(shift);
    if (shift) panel.style.setProperty('--_lc-popover-shift', `${shift}px`);
    else panel.style.removeProperty('--_lc-popover-shift');
    const arrow = Math.min(Math.max(centre - (start + shift), ARROW_INSET), Math.max(ARROW_INSET, length - ARROW_INSET));
    // The arrow is placed in the padding box: 1 px (the border) less.
    if (Math.abs(arrow - length / 2) > 0.5) panel.style.setProperty('--_lc-popover-arrow', `${Math.round(arrow - 1)}px`);
    else panel.style.removeProperty('--_lc-popover-arrow');
  }

  /** Adds or removes the panel id in the trigger's `aria-describedby`, keeping the page's ids. */
  private setDescribedBy(trigger: HTMLElement, on: boolean): void {
    const ids = (trigger.getAttribute('aria-describedby') ?? '').split(/\s+/).filter((id) => id && id !== this.panelId);
    if (on) ids.push(this.panelId);
    if (ids.length) this.renderer.setAttribute(trigger, 'aria-describedby', ids.join(' '));
    else this.renderer.removeAttribute(trigger, 'aria-describedby');
  }

  private focusInside(): boolean {
    return typeof document !== 'undefined' && this.elementRef.nativeElement.contains(document.activeElement);
  }

  /**
   * The element that carries the popup ARIA attributes and receives focus back:
   * the projected `[popover-trigger]` node itself when it is natively
   * interactive, otherwise the first interactive element inside it (e.g. the
   * `<button>` inside an `<lc-button popover-trigger>`).
   */
  private triggerElement(): HTMLElement | null {
    const slot = this.elementRef.nativeElement.querySelector<HTMLElement>('[popover-trigger]');
    if (!slot) return null;
    return slot.matches(INTERACTIVE_SELECTOR)
      ? slot
      : (slot.querySelector<HTMLElement>(INTERACTIVE_SELECTOR) ?? slot);
  }

  /**
   * Closing removes the panel from the DOM; if focus is inside it (Escape after
   * tabbing in) it would silently drop to `<body>`, so send it back to the trigger.
   */
  private restoreFocus(): void {
    if (typeof document === 'undefined') return;
    const panel = this.elementRef.nativeElement.querySelector<HTMLElement>('.popover__panel');
    if (panel?.contains(document.activeElement)) {
      this.triggerElement()?.focus();
    }
  }
}

/** Whether focus arrived by keyboard (`:focus-visible`); true where the selector is unknown. */
function isFocusVisible(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  try {
    return target.matches(':focus-visible');
  } catch {
    return true;
  }
}
