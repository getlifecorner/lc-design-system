import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/** The device drawn around the media: `'phone'` (3.39) or `'laptop'` (3.40). */
export type DeviceFrameDevice = 'phone' | 'laptop';

/**
 * Width step of `lc-device-frame`: phone `sm` 200 px, `md` 248 px, `lg`
 * 320 px (3.39); laptop `sm` 320 px, `md` 480 px, `lg` 640 px (3.40).
 */
export type DeviceFrameSize = 'sm' | 'md' | 'lg';

/**
 * A phone bezel (3.39, request 059, G-SS1) or a laptop (3.40, request 060,
 * G-SS1 extended) around projected media: app screenshots on a website, a
 * `<video>` of a flow, any element.
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
 * - `device="laptop"` (3.40): a lid with the same rim, bezel and screen over
 *   a wider base with a hinge notch, drawn by the host's `::before`/`::after`
 *   (no extra DOM). Widths 320 / 480 / 640 px, lid radius 10 / 12 / 18 px.
 *   More hooks: `--lc-device-frame-base-color` (#374151, both themes),
 *   `--lc-device-frame-overhang` (the base's overhang per side: 12 / 16 /
 *   24 px) and `--lc-device-frame-base-height` (8 / 12 / 16 px); both lengths
 *   take a bare `0`. `notch` is phone only and ignored on a laptop.
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
    '[class.lc-device-frame--laptop]': "device() === 'laptop'",
    '[class.lc-device-frame--sm]': "size() === 'sm'",
    '[class.lc-device-frame--md]': "size() === 'md'",
    '[class.lc-device-frame--lg]': "size() === 'lg'",
    '[class.lc-device-frame--notch]': "notch() && device() === 'phone'",
  },
})
export class DeviceFrameComponent {
  /**
   * The device drawn around the media. `'phone'`: a bezel with rounded
   * corners. `'laptop'` (3.40): a lid with bezel over a wider base with a hinge
   * notch; the media fills the screen the same way.
   * @default 'phone'
   */
  readonly device = input<DeviceFrameDevice>('phone');

  /**
   * Width step (never wider than the container). Phone: `sm` 200 px, `md`
   * 248 px, `lg` 320 px; bezel (6 / 8 / 10 px) and corner radius (24 / 32 /
   * 42 px) grow with it. Laptop: `sm` 320 px, `md` 480 px, `lg` 640 px, the
   * same bezels, lid radius 10 / 12 / 18 px.
   * @default 'md'
   */
  readonly size = input<DeviceFrameSize>('md');

  /**
   * Draws a decorative camera pill in a deeper top bezel (three times the
   * bezel). It never covers the media and is hidden from assistive technology.
   * Phone only: ignored on `device="laptop"`.
   * @default false
   */
  readonly notch = input(false, { transform: booleanAttribute });
}
