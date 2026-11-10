import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The device drawn around the media (3.39). Only `'phone'` today; more may follow. */
export type DeviceFrameDevice = 'phone';

/** Width step of `lc-device-frame` (3.39): `sm` 200 px, `md` 248 px, `lg` 320 px. */
export type DeviceFrameSize = 'sm' | 'md' | 'lg';

/**
 * A phone bezel around projected media (3.39, request 059, G-SS1): app
 * screenshots on a website, a `<video>` of a flow, any element.
 *
 * Features:
 * - The host is the frame: black glass (`$color-neutral-900` in both themes)
 *   inside a 1 px rim in `--color-field-border`, which keeps the frame's edge
 *   at 3:1 or more against every page and surface in light and dark.
 * - The media fills the screen's width and keeps its own ratio (no crop, no
 *   stretch); the screen's concentric radius clips it. Give an `<img>` its
 *   `width`/`height` (or use `lc-picture`) and the box is reserved before it
 *   loads, also in prerendered HTML.
 * - `size` steps the width (never wider than the container); bezel and radius
 *   grow with it. `notch` draws a decorative camera pill in a deeper top bezel,
 *   never over the media.
 * - Not interactive: no role, no Tab stop, no name. Screen readers read only
 *   the projected media (the image's `alt`).
 * - CSS hooks (set them on the host or any ancestor):
 *   `--lc-device-frame-width` (200px / 248px / 320px),
 *   `--lc-device-frame-bezel` (6 / 8 / 10 px, including the rim; a bare `0` works),
 *   `--lc-device-frame-radius` (24 / 32 / 42 px; the screen gets the radius
 *   less the bezel), `--lc-device-frame-bezel-color` (#111827),
 *   `--lc-device-frame-rim-color` (`--color-field-border`; keep it at 3:1 to
 *   the page), `--lc-device-frame-notch-color` (#374151),
 *   `--lc-device-frame-shadow` (`--elevation-2`; `none` turns it off) and
 *   `--lc-device-frame-screen-bg` (`--color-surface`, shows until the media
 *   has loaded).
 *
 * @example
 * ```html
 * <lc-device-frame notch>
 *   <lc-picture src="/shots/home-light.png" darkSrc="/shots/home-dark.png"
 *     alt="Startseite am Abend: Begrüßung und die Mitglieder" width="360" height="780" />
 * </lc-device-frame>
 * ```
 */
@Component({
  selector: 'lc-device-frame',
  standalone: true,
  templateUrl: './device-frame.component.html',
  styleUrls: ['./device-frame.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'lc-device-frame',
    '[class.lc-device-frame--phone]': "device() === 'phone'",
    '[class.lc-device-frame--sm]': "size() === 'sm'",
    '[class.lc-device-frame--md]': "size() === 'md'",
    '[class.lc-device-frame--lg]': "size() === 'lg'",
    '[class.lc-device-frame--notch]': 'notch()',
  },
})
export class DeviceFrameComponent {
  /**
   * The device drawn around the media. Only `'phone'` today; more may follow.
   * @default 'phone'
   */
  readonly device = input<DeviceFrameDevice>('phone');

  /**
   * Width step: `sm` 200 px, `md` 248 px, `lg` 320 px (never wider than the
   * container). Bezel (6 / 8 / 10 px) and corner radius (24 / 32 / 42 px)
   * grow with it.
   * @default 'md'
   */
  readonly size = input<DeviceFrameSize>('md');

  /**
   * Draws a decorative camera pill in a deeper top bezel (three times the
   * bezel). It never covers the media and is hidden from assistive technology.
   * @default false
   */
  readonly notch = input(false, { transform: booleanAttribute });
}
