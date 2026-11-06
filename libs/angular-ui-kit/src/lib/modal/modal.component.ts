import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  input,
  output,
  computed,
  effect,
  linkedSignal,
  HostListener,
  OnDestroy,
  inject,
  afterNextRender,
  untracked,
  EnvironmentInjector,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { IconComponent, ɵprovideKitIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_X_MARK } from '@lifecorner/angular-ui-kit/icons';
import { OverlayStackService, focusReturnTarget } from '@lifecorner/angular-ui-kit/internal/overlay';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Where the dialog sits.
 * - `center`: centred on every screen (3.2)
 * - `auto`: a bottom sheet below 640 px viewport width (full width, top
 *   corners rounded, above the safe-area inset, in thumb reach), centred above
 * - `sheet`: a bottom sheet on every screen
 */
export type ModalPlacement = 'center' | 'auto' | 'sheet';

/**
 * Modal dialog component for focused user interactions.
 *
 * Features:
 * - Size presets (sm, md, lg, xl, full)
 * - Placement: centred, or a bottom sheet on phones (`placement="auto"`)
 * - Header and footer stay visible while the body scrolls; the close button
 *   is a 44 px target
 * - Focus trap for keyboard accessibility; `returnFocusTo` (3.34) names the
 *   element that gets the focus back after the dialog closed (WebKit doesn't
 *   focus a tapped button, so the one captured at open is `body`)
 * - Backdrop click and Escape key to close
 * - Two-way open binding
 * - Header, body, and footer content slots
 * - Optional close button
 * - Accessible with ARIA dialog role
 *
 * @example
 * ```html
 * <lc-modal [(open)]="isOpen" size="md" [closeOnBackdropClick]="true">
 *   <div slot="header"><h2>Title</h2></div>
 *   <div slot="body">Content</div>
 *   <div slot="footer"><lc-button (click)="close()">Close</lc-button></div>
 * </lc-modal>
 * ```
 */
@Component({
  selector: 'lc-modal',
  standalone: true,
  imports: [A11yModule, IconComponent],
  viewProviders: [ɵprovideKitIcons([ICON_X_MARK])],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None, // Required for dynamic size class styling
})
export class ModalComponent implements OnDestroy {
  private static nextId = 0;

  /**
   * Whether the modal is open (input from parent)
   * @default false
   */
  open = input<boolean>(false);

  /**
   * Modal size
   * @default 'md'
   */
  size = input<ModalSize>('md');

  /**
   * Where the dialog sits: `center` (3.2), `auto` — a bottom sheet below
   * 640 px viewport width and centred above — or `sheet` (always a bottom
   * sheet). The sheet spans the width, rounds its top corners, keeps clear of
   * `env(safe-area-inset-bottom)` and is at most 90 % of the dynamic viewport
   * high; header and footer stay visible while the body scrolls. `full`
   * size ignores it.
   * @default 'center'
   */
  placement = input<ModalPlacement>('center');

  /**
   * Whether clicking backdrop closes modal
   * @default true
   */
  closeOnBackdropClick = input<boolean>(true);

  /**
   * Whether pressing Escape closes modal
   * @default true
   */
  closeOnEscape = input<boolean>(true);

  /**
   * Whether to show close button in header
   * @default true
   */
  showCloseButton = input<boolean>(true);

  /**
   * ARIA label for accessibility
   */
  ariaLabel = input<string>();

  /**
   * ARIA labelledby ID
   */
  ariaLabelledBy = input<string>();

  /**
   * ARIA describedby ID
   */
  ariaDescribedBy = input<string>();

  /** Accessible name of the close button (`showCloseButton`). */
  closeAriaLabel = input('Close modal');

  /**
   * Element that gets the focus back after the dialog closed (3.34), instead
   * of the one that had it at open. Set it to the trigger: WebKit (Safari,
   * every iOS browser) doesn't focus a tapped button, so the captured element
   * is `body`. Applied after the next render, once the dialog has left the DOM
   * and the focus trap has restored its captured element. This holds on every
   * close: ×, Escape, backdrop, `open` false, `closeModal()`, and destroying an
   * open modal. A custom-element host that can't take focus (`<lc-button>`)
   * hands it to its first focusable descendant. Ignored when the element is no
   * longer in the document or can't take focus; the captured element then
   * keeps it. `null`: as before.
   * @default null
   */
  returnFocusTo = input<HTMLElement | null>(null);

  /**
   * Emitted when modal opens
   */
  readonly modalOpened = output<void>();

  /**
   * Emitted when modal closes
   */
  readonly modalClosed = output<void>();

  /**
   * Two-way binding for open state
   */
  readonly openChange = output<boolean>();

  /**
   * Emitted when backdrop is clicked
   */
  readonly backdropClicked = output<MouseEvent>();

  /**
   * Internal open state (protected for AOT); follows the `open` input and is
   * also set by the programmatic open/close methods.
   */
  protected _open = linkedSignal(() => this.open());

  /**
   * Computed modal classes
   */
  protected modalClasses = computed(() => {
    return `lc-modal lc-modal--${this.size()} lc-modal--placement-${this.placement()}`;
  });

  private readonly overlayStack = inject(OverlayStackService);
  /** Identifies this instance in the overlay stack. */
  private readonly modalId = `lc-modal-${++ModalComponent.nextId}`;
  private originalOverflow?: string;
  /**
   * The environment injector: a node injector would cancel the focus-return
   * hook when the modal is destroyed while open (`ConfirmService`).
   */
  private readonly environmentInjector = inject(EnvironmentInjector);
  /** Whether `showModal()` ran without a `hideModal()` after it. */
  private shown = false;

  constructor() {
    // Watch for open state changes
    effect(() => {
      if (this._open()) {
        this.showModal();
      } else {
        this.hideModal();
      }
    });
  }

  ngOnDestroy(): void {
    this.hideModal();
  }

  /**
   * Open the modal programmatically
   */
  openModal(): void {
    this._open.set(true);
    this.openChange.emit(true);
    this.modalOpened.emit();
  }

  /**
   * Close the modal programmatically
   */
  closeModal(): void {
    this._open.set(false);
    this.openChange.emit(false);
    this.modalClosed.emit();
  }

  /**
   * Handle backdrop click. Ignored while another overlay (popover, menu,
   * confirm dialog, …) sits above this modal — the click belongs to that layer.
   */
  protected onBackdropClick(event: MouseEvent): void {
    if (!this.overlayStack.claim(this.modalId, event)) return;
    this.backdropClicked.emit(event);
    if (this.closeOnBackdropClick()) {
      this.closeModal();
    }
  }

  /**
   * Handle close button click
   */
  protected onCloseClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.closeModal();
  }

  /**
   * Escape closes the modal only while it is the top-most overlay; the event
   * is consumed either way so overlays underneath stay open.
   */
  @HostListener('document:keydown', ['$event'])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this._open()) return;
    if (!this.overlayStack.claim(this.modalId, event)) return;
    event.stopPropagation();
    if (this.closeOnEscape()) {
      this.closeModal();
    }
  }

  /**
   * Show the modal. Focus is moved inside and restored on close by the
   * template's `cdkTrapFocus` / `cdkTrapFocusAutoCapture`, then given to
   * `returnFocusTo` when set (3.34).
   */
  private showModal(): void {
    this.shown = true;
    this.overlayStack.push(this.modalId);

    // Lock body scroll
    if (typeof document !== 'undefined' && this.originalOverflow === undefined) {
      this.originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Hide the modal
   */
  private hideModal(): void {
    this.overlayStack.remove(this.modalId);

    // Restore body scroll
    if (typeof document !== 'undefined' && this.originalOverflow !== undefined) {
      document.body.style.overflow = this.originalOverflow;
      this.originalOverflow = undefined;
    }

    if (!this.shown) return;
    this.shown = false;
    // Untracked: this runs inside the open effect, and a tracked read would
    // re-run it (and re-push the modal above a nested overlay) when the input
    // changes.
    if (untracked(this.returnFocusTo)) this.scheduleFocusReturn();
  }

  /**
   * Focuses `returnFocusTo` after the next render: the template refresh has
   * removed the dialog, and `cdkTrapFocus` has restored its captured element
   * on destroy, so this is the last focus write. Reads the input again then,
   * so a trigger re-rendered meanwhile is taken from a fresh query.
   */
  private scheduleFocusReturn(): void {
    afterNextRender(
      () => {
        const target = this.returnFocusTo();
        if (this.shown || !target?.isConnected) return;
        focusReturnTarget(target);
      },
      { injector: this.environmentInjector },
    );
  }
}
