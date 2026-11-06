import {
  Directive,
  input,
  ElementRef,
  OnDestroy,
  Renderer2,
  ViewContainerRef,
  ComponentRef,
  HostListener,
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { Overlay, OverlayRef, ConnectedPosition, FlexibleConnectedPositionStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subscription } from 'rxjs';
import { OverlayStackService } from '@lifecorner/angular-ui-kit/internal/overlay';
import { closestLang } from '@lifecorner/angular-ui-kit/internal/a11y';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Internal tooltip content component
 */
@Component({
  selector: 'lc-tooltip-content',
  standalone: true,
  imports: [],
  template: `<div class="lc-tooltip-inner">{{ content }}</div>`,
  styles: [
    `
      :host {
        display: block;
        /* Inverted surface: reads as a tooltip in both themes and keeps AAA
           contrast — near-white on the dark theme, near-black on the light one. */
        background-color: var(--color-text-primary);
        color: var(--color-surface);
        padding: 0.5rem 0.75rem;
        border-radius: var(--border-radius-md, 0.375rem);
        font-size: var(--font-size-sm, 0.875rem);
        line-height: 1.25rem;
        max-width: 300px;
        word-wrap: break-word;
        box-shadow: var(--elevation-2);
      }

      .lc-tooltip-inner {
        position: relative;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'lc-tooltip',
    role: 'tooltip',
  },
})
export class TooltipContentComponent {
  content = '';
}

const POSITIONS: Record<TooltipPosition, ConnectedPosition> = {
  top: {
    originX: 'center',
    originY: 'top',
    overlayX: 'center',
    overlayY: 'bottom',
    offsetY: -8,
    panelClass: 'lc-tooltip--top',
  },
  bottom: {
    originX: 'center',
    originY: 'bottom',
    overlayX: 'center',
    overlayY: 'top',
    offsetY: 8,
    panelClass: 'lc-tooltip--bottom',
  },
  left: {
    originX: 'start',
    originY: 'center',
    overlayX: 'end',
    overlayY: 'center',
    offsetX: -8,
    panelClass: 'lc-tooltip--left',
  },
  right: {
    originX: 'end',
    originY: 'center',
    overlayX: 'start',
    overlayY: 'center',
    offsetX: 8,
    panelClass: 'lc-tooltip--right',
  },
};

const POSITION_NAMES = Object.keys(POSITIONS) as TooltipPosition[];

/** Fallback order when the preferred side does not fit the viewport. */
const FALLBACKS: Record<TooltipPosition, TooltipPosition[]> = {
  top: ['bottom', 'right', 'left'],
  bottom: ['top', 'right', 'left'],
  left: ['right', 'top', 'bottom'],
  right: ['left', 'top', 'bottom'],
};

/**
 * What the tooltip describes (3.32, request 051): the host when it matches,
 * else the first element inside it that does (`lc-button`'s `<button>`).
 */
const CONTROL =
  'a[href], button, input:not([type=hidden]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Tooltip directive for displaying contextual information.
 * Uses Angular CDK Overlay for positioning; flips to the opposite side when
 * the preferred one does not fit the viewport, and can be dismissed with
 * Escape (WCAG 1.4.13).
 *
 * The tooltip takes the `lang` of the host's closest `[lang]` (3.31).
 *
 * Shows on hover and on keyboard focus of the host or of an element inside it
 * (3.32). On a wrapper such as `lc-button`, the tooltip describes and anchors
 * to the wrapped `<button>`. On a host with several controls, the one that
 * has focus is described (3.33); on hover, the first.
 *
 * @example
 * ```html
 * <button lcTooltip="Click me!" tooltipPosition="top">
 *   Hover or focus
 * </button>
 * ```
 */
@Directive({
  selector: '[lcTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  private static nextId = 0;

  /**
   * Tooltip content text
   */
  lcTooltip = input.required<string>();

  /**
   * Tooltip position
   * @default 'top'
   */
  tooltipPosition = input<TooltipPosition>('top');

  /**
   * Show delay in milliseconds
   * @default 0
   */
  tooltipShowDelay = input<number>(0);

  /**
   * Hide delay in milliseconds
   * @default 0
   */
  tooltipHideDelay = input<number>(0);

  /**
   * Whether tooltip is disabled
   * @default false
   */
  tooltipDisabled = input<boolean>(false);

  /**
   * Id of the tooltip element; while shown, the `aria-describedby` of the
   * described element (the host, or the focusable element it wraps, such as
   * `lc-button`'s `<button>`) points at it.
   */
  readonly tooltipId = `lc-tooltip-${++TooltipDirective.nextId}`;

  private overlayRef?: OverlayRef;
  private tooltipRef?: ComponentRef<TooltipContentComponent>;
  private positionStrategy?: FlexibleConnectedPositionStrategy;
  /** The element whose `aria-describedby` holds the tooltip id while shown. */
  private describedEl?: HTMLElement;
  private positionSubscription?: Subscription;
  private showTimeout?: number;
  private hideTimeout?: number;
  private escapeListener?: (event: KeyboardEvent) => void;

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly renderer = inject(Renderer2);
  private readonly overlayStack = inject(OverlayStackService);

  ngOnDestroy(): void {
    this.hide();
    this.cleanup();
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.showWithDelay();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hideWithDelay();
  }

  @HostListener('focus')
  onFocus(): void {
    this.showWithDelay();
  }

  @HostListener('blur')
  onBlur(): void {
    this.hideWithDelay();
  }

  /**
   * 3.32 (request 051, 050-f3): `focus` does not bubble, so focus on an
   * element inside the host (`lc-button`'s `<button>`) arrives as `focusin`.
   * The host's own focus is handled by `onFocus`, so it is skipped here.
   */
  @HostListener('focusin', ['$event'])
  onFocusIn(event: FocusEvent): void {
    if (event.target === this.elementRef.nativeElement) return;
    // 3.33 (request 052, 051-n1): focus moved to another control inside the
    // host while the tooltip shows: that control is described now.
    const target = event.target as HTMLElement | null;
    if (this.tooltipRef && target?.matches?.(CONTROL) && target !== this.describedEl) {
      this.removeDescribedBy();
      this.addDescribedBy(target);
    }
    this.showWithDelay();
  }

  /** Hides when focus leaves the host from an element inside it (not when it moves within). */
  @HostListener('focusout', ['$event'])
  onFocusOut(event: FocusEvent): void {
    const host = this.elementRef.nativeElement;
    if (event.target === host) return;
    const next = event.relatedTarget as Node | null;
    if (next && host.contains(next)) return;
    this.hideWithDelay();
  }

  /**
   * Show tooltip programmatically
   */
  show(): void {
    if (this.tooltipDisabled() || !this.lcTooltip()) {
      return;
    }

    this.clearTimeouts();

    if (!this.overlayRef) {
      this.createOverlay();
    }

    if (!this.tooltipRef && this.overlayRef) {
      // Resolved at every show: the wrapped control is described, and it is
      // the anchor when it is the host's only child (3.32, request 051)
      const control = this.resolveControl();
      this.positionStrategy?.setOrigin(this.resolveAnchor(control));

      const portal = new ComponentPortal(TooltipContentComponent, this.viewContainerRef);
      this.tooltipRef = this.overlayRef.attach(portal) as ComponentRef<TooltipContentComponent>;
      this.tooltipRef.instance.content = this.lcTooltip();

      const tooltipEl = this.tooltipRef.location.nativeElement as HTMLElement;
      // The id is what the described element's aria-describedby points at
      this.renderer.setAttribute(tooltipEl, 'id', this.tooltipId);
      // The overlay renders under <body>, outside the host's lang (WCAG 3.1.2):
      // the tooltip takes the host's closest [lang], read at every show
      const lang = closestLang(this.elementRef.nativeElement);
      if (lang !== null) this.renderer.setAttribute(tooltipEl, 'lang', lang);
      this.addDescribedBy(control);
      this.setPositionClass(this.tooltipPosition());

      // Escape dismisses the tooltip (WCAG 1.4.13) — only when it is the
      // top-most overlay, so a modal underneath is not closed by the same key
      this.overlayStack.push(this.tooltipId);
      if (typeof document !== 'undefined') {
        this.escapeListener = (event: KeyboardEvent) => {
          if (event.key !== 'Escape' || !this.overlayStack.claim(this.tooltipId, event)) return;
          event.stopPropagation();
          this.hide();
        };
        document.addEventListener('keydown', this.escapeListener);
      }
    }
  }

  /**
   * Hide tooltip programmatically
   */
  hide(): void {
    this.clearTimeouts();

    if (this.escapeListener) {
      document.removeEventListener('keydown', this.escapeListener);
      this.escapeListener = undefined;
    }
    this.overlayStack.remove(this.tooltipId);

    if (this.tooltipRef) {
      this.tooltipRef.destroy();
      this.tooltipRef = undefined;
    }

    if (this.overlayRef) {
      this.overlayRef.detach();
    }

    this.removeDescribedBy();
  }

  /**
   * Toggle tooltip visibility
   */
  toggle(): void {
    if (this.tooltipRef) {
      this.hide();
    } else {
      this.show();
    }
  }

  private showWithDelay(): void {
    this.clearTimeouts();
    const delay = this.tooltipShowDelay();

    if (delay > 0) {
      this.showTimeout = window.setTimeout(() => this.show(), delay);
    } else {
      this.show();
    }
  }

  private hideWithDelay(): void {
    this.clearTimeouts();
    const delay = this.tooltipHideDelay();

    if (delay > 0) {
      this.hideTimeout = window.setTimeout(() => this.hide(), delay);
    } else {
      this.hide();
    }
  }

  private createOverlay(): void {
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions(this.getPositions());
    this.positionStrategy = positionStrategy;

    // Keep the tooltip element's position class in sync with the side the
    // overlay actually chose (it flips at viewport edges)
    this.positionSubscription = positionStrategy.positionChanges.subscribe((change) => {
      const applied = POSITION_NAMES.find((p) => POSITIONS[p] === change.connectionPair);
      if (applied) this.setPositionClass(applied);
    });

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    }) as OverlayRef;
  }

  /** Preferred position first, then the fallbacks the overlay may flip to. */
  private getPositions(): ConnectedPosition[] {
    const position = this.tooltipPosition();
    return [position, ...FALLBACKS[position]].map((p) => POSITIONS[p]);
  }

  private setPositionClass(position: TooltipPosition): void {
    const tooltipEl = this.tooltipRef?.location.nativeElement as HTMLElement | undefined;
    if (!tooltipEl) return;
    for (const p of POSITION_NAMES) {
      this.renderer.removeClass(tooltipEl, `lc-tooltip--${p}`);
    }
    this.renderer.addClass(tooltipEl, `lc-tooltip--${position}`);
  }

  /**
   * The described element: the host if it is a control, else the control
   * inside it that has focus (3.33, request 052, 051-n1: a host with several
   * controls), else the first control inside it, else the host.
   */
  private resolveControl(): HTMLElement {
    const host = this.elementRef.nativeElement;
    if (host.matches(CONTROL)) return host;
    const focused = host.ownerDocument?.activeElement as HTMLElement | null | undefined;
    if (focused && focused !== host && host.contains(focused) && focused.matches(CONTROL)) return focused;
    return host.querySelector<HTMLElement>(CONTROL) ?? host;
  }

  /** The overlay origin: the control when it is the host's only element child (a wrapper), else the host. */
  private resolveAnchor(control: HTMLElement): HTMLElement {
    const host = this.elementRef.nativeElement;
    return control !== host && host.childElementCount === 1 && host.firstElementChild === control ? control : host;
  }

  /** Append the tooltip id to the element's aria-describedby without clobbering ids the caller set. */
  private addDescribedBy(el: HTMLElement): void {
    this.describedEl = el;
    const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    if (!ids.includes(this.tooltipId)) ids.push(this.tooltipId);
    this.renderer.setAttribute(el, 'aria-describedby', ids.join(' '));
  }

  /** Removes the tooltip id from the element it was added to, keeping the other ids. */
  private removeDescribedBy(): void {
    const el = this.describedEl ?? this.elementRef.nativeElement;
    this.describedEl = undefined;
    const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
    if (!ids.includes(this.tooltipId)) return;
    const rest = ids.filter((id) => id !== this.tooltipId);
    if (rest.length) {
      this.renderer.setAttribute(el, 'aria-describedby', rest.join(' '));
    } else {
      this.renderer.removeAttribute(el, 'aria-describedby');
    }
  }

  private clearTimeouts(): void {
    if (this.showTimeout) {
      window.clearTimeout(this.showTimeout);
      this.showTimeout = undefined;
    }
    if (this.hideTimeout) {
      window.clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }
  }

  private cleanup(): void {
    this.clearTimeouts();
    this.positionSubscription?.unsubscribe();
    this.positionSubscription = undefined;
    this.positionStrategy = undefined;
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
  }
}
