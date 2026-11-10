import { ChangeDetectionStrategy, Component, computed, effect, input, isDevMode } from '@angular/core';

/** The theme a `PictureSource` serves (3.39). */
export type PictureTheme = 'light' | 'dark';

/** The `<img>` `loading` of `lc-picture` (3.39). */
export type PictureLoading = 'lazy' | 'eager';

/** The `<img>` `decoding` of `lc-picture` (3.39). */
export type PictureDecoding = 'async' | 'sync' | 'auto';

/** The `<img>` `fetchpriority` of `lc-picture` (3.39); `auto` writes no attribute. */
export type PictureFetchPriority = 'auto' | 'high' | 'low';

/**
 * One `<source>` of `lc-picture` (3.39). A source without `theme` serves both
 * themes. Every source must have the ratio of `width` × `height`.
 */
export interface PictureSource {
  /** Candidates, e.g. `'/shots/home-280.avif 280w, /shots/home-560.avif 560w'`. */
  srcset: string;
  /** MIME type, e.g. `'image/avif'` or `'image/webp'`; the browser skips types it can't decode. */
  type?: string;
  /** Source sizes for `w` descriptors; defaults to the picture's `sizes`. */
  sizes?: string;
  /** Media query, e.g. `'(min-width: 1024px)'`. */
  media?: string;
  /** Only for this theme (`light` or `dark`); the picture then follows the app theme. */
  theme?: PictureTheme;
}

/** One `<picture>` of the template: its sources and its fallback `<img>`. */
interface PictureView {
  readonly modifier: '' | 'light' | 'dark';
  readonly sources: readonly PictureSource[];
  readonly img: { readonly src: string; readonly srcset: string };
}

/**
 * `width="360"` from a template is the number 360. A finite value > 0 is
 * rounded to whole px; anything else becomes `undefined` (no attribute and a
 * dev warning).
 */
function toIntrinsicPx(value: number | string): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const px = Number(value);
  return Number.isFinite(px) && px > 0 ? Math.round(px) : undefined;
}

/**
 * A responsive image (3.39, request 059, G-SS2): a native `<picture>` with
 * AVIF/WebP `<source>`s, light and dark variants, `srcset`/`sizes`, and the
 * required `width`/`height` that reserve the box before the image loads.
 *
 * Features:
 * - `sources` become `<source>` elements in their order, before the fallback
 *   `<img>` (`src`, `srcset`, `sizes`). Every `srcset` is written before the
 *   `<img>`'s `src`, so the browser fetches the source it picks, not the
 *   fallback first.
 * - Light and dark: with `darkSrc`/`darkSrcset` or a source with
 *   `theme: 'dark'`, two `<picture>`s are rendered and the root theme shows
 *   one (the selectors of `lc-logo`): it follows `ThemeService`, `system` and
 *   the no-flash script in prerendered HTML with no JavaScript. With the
 *   default `loading="lazy"` only the visible one is fetched.
 * - `alt` is required; `alt=""` marks the image decorative. Say what the
 *   image shows, not "screenshot of". There is no `<figure>`: wrap it in your
 *   own `<figure>` with a `<figcaption>` that doesn't repeat the `alt`.
 * - No border, radius or shadow of its own. The image is at most as wide as
 *   its container and keeps its ratio (`height: auto`).
 * - CSS hooks (read at the `<img>`): `--lc-picture-radius` (0px), e.g.
 *   `calc(var(--border-radius-xl) - 1px)` in an outlined `xl` card, and
 *   `--lc-picture-min-width` (0px; `100%` fills a container wider than
 *   `width`, as `lc-device-frame` does).
 *
 * @example
 * ```html
 * <lc-picture
 *   src="/shots/home-light.png" darkSrc="/shots/home-dark.png"
 *   [sources]="[{ type: 'image/avif', srcset: '/shots/home-light.avif', theme: 'light' },
 *               { type: 'image/avif', srcset: '/shots/home-dark.avif', theme: 'dark' }]"
 *   alt="Startseite am Abend: Begrüßung und die Mitglieder" width="360" height="780" />
 * ```
 */
@Component({
  selector: 'lc-picture',
  standalone: true,
  templateUrl: './picture.component.html',
  styleUrls: ['./picture.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PictureComponent {
  /**
   * Required. Fallback image URL, used when no source matches (and by
   * browsers without `<picture>`).
   */
  readonly src = input.required<string>();

  /**
   * Required. Text alternative; `''` marks the image decorative. Say what the
   * image shows, not "screenshot of".
   */
  readonly alt = input.required<string>();

  /**
   * Required. Intrinsic width in CSS px at 1x (e.g. 360 for a 720 × 1560 file
   * at 2x). With `height` it reserves the box before the image loads. A value
   * that isn't a positive number writes no attribute and warns in dev mode.
   */
  readonly width = input.required<number | undefined, number | string>({ transform: toIntrinsicPx });

  /**
   * Required. Intrinsic height in CSS px at 1x (e.g. 780 for a 720 × 1560
   * file at 2x). Every source must have the ratio of `width` × `height`.
   */
  readonly height = input.required<number | undefined, number | string>({ transform: toIntrinsicPx });

  /**
   * `<source>` elements, in this order before the `<img>` (AVIF first, then
   * WebP). A source with `theme` serves only that theme.
   * @default []
   */
  readonly sources = input<readonly PictureSource[]>([]);

  /**
   * `srcset` of the `<img>` (light, or both themes without a dark variant).
   * Empty writes no attribute.
   * @default ''
   */
  readonly srcset = input('');

  /**
   * `sizes` of the `<img>`, and the default `sizes` of every source. Set it
   * with `w` descriptors. Empty writes no attribute.
   * @default ''
   */
  readonly sizes = input('');

  /**
   * Dark-theme fallback URL. With it (or `darkSrcset`, or a source with
   * `theme: 'dark'`) the picture follows the app theme.
   * @default ''
   */
  readonly darkSrc = input('');

  /**
   * `srcset` of the dark `<img>`. Without `darkSrc`, the dark `<img>` uses
   * `srcset`.
   * @default ''
   */
  readonly darkSrcset = input('');

  /**
   * `eager` for an image above the fold. With theme variants, `lazy` fetches
   * only the visible one; `eager` fetches both.
   * @default 'lazy'
   */
  readonly loading = input<PictureLoading>('lazy');

  /**
   * Decoding hint, written as is.
   * @default 'async'
   */
  readonly decoding = input<PictureDecoding>('async');

  /**
   * Fetch priority: `high` for the page's largest image (LCP). `auto` writes
   * no attribute.
   * @default 'auto'
   */
  readonly fetchpriority = input<PictureFetchPriority>('auto');

  /** Whether a dark variant is set, so two pictures follow the app theme. */
  protected readonly themed = computed(
    () => !!this.darkSrc() || !!this.darkSrcset() || this.sources().some((s) => s.theme === 'dark'),
  );

  /** The `<picture>`s: one with all sources, or the light and the dark one. */
  protected readonly pictures = computed<readonly PictureView[]>(() => {
    const sources = this.sources() ?? [];
    if (!this.themed()) {
      return [{ modifier: '', sources, img: { src: this.src(), srcset: this.srcset() } }];
    }
    const darkSrc = this.darkSrc();
    return [
      { modifier: 'light', sources: sources.filter((s) => s.theme !== 'dark'), img: { src: this.src(), srcset: this.srcset() } },
      {
        modifier: 'dark',
        sources: sources.filter((s) => s.theme !== 'light'),
        img: { src: darkSrc || this.src(), srcset: this.darkSrcset() || (darkSrc ? '' : this.srcset()) },
      },
    ];
  });

  constructor() {
    effect(() => {
      if (isDevMode() && (this.width() === undefined || this.height() === undefined)) {
        console.warn("lc-picture: width and height must be positive numbers; the box can't be reserved.");
      }
    });
  }
}
