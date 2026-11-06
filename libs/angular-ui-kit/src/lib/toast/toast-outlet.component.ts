import { Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';
import { OverlayInsetsService } from '@lifecorner/angular-ui-kit/internal/overlay';
import { ToastComponent } from './toast.component';
import { ToastService, type Toast, type ToastPosition } from './toast.service';

/** Politeness of the live region a toast is announced from. */
type ToastLive = 'polite' | 'assertive';

const POSITIONS: readonly ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

/**
 * Renders the toasts of {@link ToastService}. Place it once in the application
 * shell; without it `ToastService.show()` has no visible effect.
 *
 * ```html
 * <lc-toast-outlet />
 * ```
 *
 * Toasts are stacked per `position`. Every position owns two live regions that
 * exist from the start — screen readers only announce content that is inserted
 * into an *existing* live region — one `polite` for success/info toasts and one
 * `assertive` for error/warning toasts. Dismissing a toast (close button,
 * action, auto-dismiss) removes it from the service.
 *
 * Offsets (3.28, AS-34): with `lc-app-shell` in the app (the outlet may sit
 * before or after it), the `top-*` stacks start below the shell's header and
 * the `bottom-*` stacks end above its bottom bar, each with the stack's 16 px
 * padding as the gap. The shell measures both in the browser (the header's
 * bottom edge with the top inset; the shown bar's top edge, from the
 * viewport's bottom, with the bottom inset). From 1024 px, where the bar is
 * hidden, the bottom offset is the safe-area inset. Without a shell, and in
 * prerendered HTML, both are `0px`, as before. Every stack is at most as high
 * as the space between the offsets and scrolls when its toasts need more
 * (200 % text), so each toast stays reachable.
 *
 * Bottom stacks show the newest toast nearest the edge (3.33). A top stack
 * shows its assertive region (error, warning) above its polite one (success,
 * info), each oldest first, so a newer error sits above an older success
 * (3.35, 053-n2). The toasts of a stack are 8 px (`--spacing-2`) apart
 * (3.33.1), within a live region and across the two; an empty region and the
 * last toast add no space, and the stack keeps its 16 px padding. A `top-*`
 * stack lies over the page on purpose (a toast stays visible wherever the
 * page is scrolled), so in the shell it can cover a title right under the
 * header (at 360 px a toast at y 72 over an h1 at y 80): prefer `bottom-*`
 * there.
 *
 * CSS hooks (set them on `lc-toast-outlet` or any ancestor, e.g. `:root`;
 * each wins over the shell's value; write lengths, `0px` rather than `0`):
 * - `--lc-toast-outlet-offset-top` — the space kept free above the `top-*`
 *   stacks. Default `0px`; with `lc-app-shell`: its header's bottom edge, or
 *   `env(safe-area-inset-top, 0px)` without a header.
 * - `--lc-toast-outlet-offset-bottom` — the space kept free below the
 *   `bottom-*` stacks. Default `0px`; with `lc-app-shell`: the shown bottom
 *   bar's top edge, measured from the viewport's bottom, or
 *   `env(safe-area-inset-bottom, 0px)` when no bar shows.
 */
@Component({
  selector: 'lc-toast-outlet',
  standalone: true,
  imports: [ToastComponent],
  templateUrl: './toast-outlet.component.html',
  styleUrls: ['./toast-outlet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // The shell's measured offsets (AS-34), private; `null` without a shell,
    // so the host gets no style attribute. The public hooks win in the CSS.
    '[style.--_lc-toast-outlet-frame-top]': 'insets.top()',
    '[style.--_lc-toast-outlet-frame-bottom]': 'insets.bottom()',
  },
})
export class ToastOutletComponent {
  protected readonly positions = POSITIONS;
  protected readonly liveLevels: readonly ToastLive[] = ['assertive', 'polite'];

  private readonly toastService = inject(ToastService);
  protected readonly insets = inject(OverlayInsetsService);

  /** Accessible name of every toast's close button (forwarded to lc-toast). */
  readonly closeAriaLabel = input('Close notification');

  /** Toasts keyed by `${position}:${politeness}` in the order they were shown. */
  private readonly groups = computed(() => {
    const groups = new Map<string, Toast[]>();
    for (const toast of this.toastService.toasts()) {
      const key = `${toast.position}:${ToastOutletComponent.liveFor(toast)}`;
      const group = groups.get(key);
      if (group) {
        group.push(toast);
      } else {
        groups.set(key, [toast]);
      }
    }
    return groups;
  });

  /**
   * 3.33 (request 052, 045-n2): per `bottom-*` stack, the live level of its
   * newest toast. That region gets `lc-toast-outlet__region--latest` and is
   * laid out at the edge, so the newest toast sits nearest the edge (and, in
   * a scrolling stack, in view at rest). DOM and announcement order stay.
   */
  protected readonly latestLive = computed(() => {
    const latest = new Map<ToastPosition, ToastLive>();
    for (const toast of this.toastService.toasts()) {
      if (toast.position.startsWith('bottom-')) {
        latest.set(toast.position, ToastOutletComponent.liveFor(toast));
      }
    }
    return latest;
  });

  protected toastsFor(position: ToastPosition, live: ToastLive): readonly Toast[] {
    return this.groups().get(`${position}:${live}`) ?? [];
  }

  protected onClosed(id: string): void {
    this.toastService.close(id);
  }

  /** Errors and warnings interrupt (assertive), everything else waits its turn. */
  private static liveFor(toast: Toast): ToastLive {
    return toast.variant === 'error' || toast.variant === 'warning' ? 'assertive' : 'polite';
  }
}
