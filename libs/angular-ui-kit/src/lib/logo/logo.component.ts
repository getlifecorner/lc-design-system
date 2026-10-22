import {
  Component,
  InjectionToken,
  input,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';

/**
 * Injection token for the base path used to resolve the built-in
 * LifeCorner logo assets. Defaults to `'/assets'` so consuming apps
 * that copy the package's `assets/` folder to their public root keep
 * working out of the box.
 *
 * Override this token at the application root if your app serves
 * static files from a different prefix (e.g. `/static`, `/ui-kit`).
 *
 * @example
 * ```ts
 * providers: [
 *   { provide: LC_LOGO_BASE_PATH, useValue: '/static/lc' },
 * ]
 * ```
 */
export const LC_LOGO_BASE_PATH = new InjectionToken<string>('LC_LOGO_BASE_PATH', {
  providedIn: 'root',
  factory: () => '/assets',
});

/** Sizes at or below 32 px, which use the small emblem (heavier arms, filled points). */
const SMALL_EMBLEM_SIZES: ReadonlySet<string> = new Set(['xs', 'sm']);

/** The CSS height of each size in px, which is also the built-in emblem's square (3.11.2, G-38). */
const EMBLEM_PX: Readonly<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>> = { xs: 24, sm: 32, md: 48, lg: 64, xl: 96 };

/** The built-in lockup files' own size (viewBox and `width`/`height` of both SVGs). */
const LOCKUP_SIZE = { width: 485, height: 100 } as const;

/** The `width`/`height` pair written on one `<img>`; `null` writes no size attributes. */
type IntrinsicSize = { readonly width: number; readonly height: number } | null;

/**
 * `srcWidth="160"` from a template is the number 160. A finite value > 0 is
 * rounded to whole px; `''`, `0`, negative values, `NaN`, `null` and
 * `undefined` become `undefined` (no attribute).
 */
function toIntrinsicSize(value: number | string | null | undefined): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const px = Number(value);
  return Number.isFinite(px) && px > 0 ? Math.round(px) : undefined;
}

/** A pair only when both values are defined. */
function pair(width: number | undefined, height: number | undefined): IntrinsicSize {
  return width !== undefined && height !== undefined ? { width, height } : null;
}

/**
 * Logo component for displaying a brand identity.
 *
 * Defaults to the LifeCorner logo (Edu, the emblem, and the LifeCorner
 * lockup) but accepts custom `src` / `emblemSrc` (and optional `darkSrc` /
 * `darkEmblemSrc`) so consuming apps can drop in their own brand assets
 * without forking the component.
 *
 * Features:
 * - Full lockup and emblem-only variants; the emblem switches to its small
 *   drawing at `xs` and `sm` (32 px and below)
 * - Multiple size options (xs, sm, md, lg, xl)
 * - Light and dark sources that follow the APP theme exactly as the theme
 *   stylesheets do: dark under `:root.dark`, under a root without a theme
 *   class (dark-first default), and under `:root.system` when the OS is dark;
 *   light under `:root.light` and under `:root.system` when the OS is light.
 *   `colorMode="light|dark"` pins one source.
 * - The built-in logo ships its own dark drawings; nothing is inverted or
 *   recoloured by CSS. A custom logo without a dark partner stays as it is.
 * - The logo is flat and fixed: never animated, posed or distorted.
 * - Every built-in `<img>` carries its file's intrinsic `width`/`height`
 *   (3.11.2, G-38), so the browser reserves the box before the file loads;
 *   for your own files set `srcWidth`/`srcHeight` and
 *   `emblemSrcWidth`/`emblemSrcHeight`.
 *
 * @example Default LifeCorner logo
 * ```html
 * <lc-logo variant="full" size="md"></lc-logo>
 * ```
 *
 * @example Custom brand logo
 * ```html
 * <lc-logo
 *   src="/assets/acme-logo.svg"
 *   emblemSrc="/assets/acme-emblem.svg"
 *   darkSrc="/assets/acme-logo-dark.svg"
 *   alt="Acme Inc.">
 * </lc-logo>
 * ```
 */
@Component({
  selector: 'lc-logo',
  standalone: true,
  imports: [],
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {
  /**
   * Logo variant to display
   * - 'full': the lockup (emblem and name)
   * - 'emblem': just the emblem
   */
  readonly variant = input<'full' | 'emblem'>('full');

  /**
   * Size of the logo
   * - 'xs': 24px height (small emblem)
   * - 'sm': 32px height (small emblem)
   * - 'md': 48px height (default)
   * - 'lg': 64px height
   * - 'xl': 96px height
   *
   * With the built-in files the `<img>` carries the file's intrinsic size as
   * `width`/`height`: the lockup 485 × 100 at every size, the emblem the
   * size's px squared (24 … 96). CSS still sets the rendered height.
   * @default 'md'
   */
  readonly size = input<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');

  /**
   * Alt text for accessibility. Defaults to the name of the built-in logo;
   * set it to your brand name when you pass your own sources.
   */
  readonly alt = input('LifeCorner');

  /**
   * Makes the logo appear clickable
   */
  readonly clickable = input(false);

  /**
   * Which source to show.
   * - 'auto': follows the app theme (light source on light, dark source on dark)
   * - 'light': always the light source (for light backgrounds)
   * - 'dark': always the dark source (for dark backgrounds); falls back to the
   *   light source when a custom logo has no dark partner
   */
  readonly colorMode = input<'auto' | 'light' | 'dark'>('auto');

  /**
   * Custom URL for the full logo. When set, overrides the built-in
   * LifeCorner lockup.
   */
  readonly src = input<string>('');

  /**
   * Custom URL for the emblem-only logo. When set, overrides the built-in
   * LifeCorner emblem at every size.
   */
  readonly emblemSrc = input<string>('');

  /**
   * Optional dark-theme URL for the full logo. When provided, the logo swaps
   * with the app theme (see `colorMode`). Without it a custom `src` is shown
   * on dark too; the built-in lockup brings its own dark drawing.
   */
  readonly darkSrc = input<string>('');

  /**
   * Optional dark-theme URL for the emblem-only logo.
   */
  readonly darkEmblemSrc = input<string>('');

  /**
   * Intrinsic width in px of your `src` file (and `darkSrc`), written as the
   * `<img>` `width`. Set it together with `srcHeight` so the browser reserves
   * the logo's box before the file loads; `size` still sets the rendered
   * height. Without both, no size attributes are written.
   * @default undefined
   */
  readonly srcWidth = input<number | undefined, number | string | null | undefined>(undefined, {
    transform: toIntrinsicSize,
  });

  /**
   * Intrinsic height in px of your `src` file (and `darkSrc`). See `srcWidth`.
   * @default undefined
   */
  readonly srcHeight = input<number | undefined, number | string | null | undefined>(undefined, {
    transform: toIntrinsicSize,
  });

  /**
   * Intrinsic width in px of your `emblemSrc` file (and `darkEmblemSrc`),
   * written as the `<img>` `width`; set it together with `emblemSrcHeight`.
   * @default undefined
   */
  readonly emblemSrcWidth = input<number | undefined, number | string | null | undefined>(undefined, {
    transform: toIntrinsicSize,
  });

  /**
   * Intrinsic height in px of your `emblemSrc` file (and `darkEmblemSrc`).
   * See `emblemSrcWidth`.
   * @default undefined
   */
  readonly emblemSrcHeight = input<number | undefined, number | string | null | undefined>(undefined, {
    transform: toIntrinsicSize,
  });

  /** Whether the consumer supplied at least one custom source. */
  readonly hasCustomSrc = computed(
    () => !!this.src() || !!this.emblemSrc() || !!this.darkSrc() || !!this.darkEmblemSrc(),
  );

  private readonly basePath = inject(LC_LOGO_BASE_PATH);

  /** The built-in LifeCorner pair for the current variant and size. */
  private readonly builtIn = computed(() => {
    const base = this.basePath.replace(/\/$/, '');
    if (this.variant() === 'emblem') {
      const small = SMALL_EMBLEM_SIZES.has(this.size()) ? '-small' : '';
      return {
        light: `${base}/lifecorner-emblem${small}.svg`,
        dark: `${base}/lifecorner-emblem${small}-on-dark.svg`,
      };
    }
    return {
      light: `${base}/lifecorner-logo.svg`,
      dark: `${base}/lifecorner-logo-on-dark.svg`,
    };
  });

  /** Custom light source for the current variant, or empty string. */
  private readonly customSrc = computed(() =>
    this.variant() === 'emblem' ? this.emblemSrc() : this.src(),
  );

  readonly logoSrc = computed(() => this.customSrc() || this.builtIn().light);

  /**
   * Dark-theme source for the current variant: the custom dark source, else
   * the built-in dark drawing — unless a custom light logo is set without a
   * dark partner (the kit never recolours a brand), then empty string.
   */
  readonly logoDarkSrc = computed(() => {
    const customDark = this.variant() === 'emblem' ? this.darkEmblemSrc() : this.darkSrc();
    if (customDark) {
      return customDark;
    }
    return this.customSrc() ? '' : this.builtIn().dark;
  });

  /**
   * Which sources are in the DOM. Without a dark source there is only the one
   * image. With one, an explicit `colorMode` renders that side alone; `auto`
   * renders BOTH and lets the stylesheet show the one matching the root theme
   * class — that way the swap follows the app theme (also when it is toggled
   * without `ThemeService`, e.g. Storybook), needs no JS, and is right on the
   * first paint.
   */
  readonly showLightSrc = computed(() => !this.logoDarkSrc() || this.colorMode() !== 'dark');
  readonly showDarkSrc = computed(() => !!this.logoDarkSrc() && this.colorMode() !== 'light');

  /** The built-in file's own size: the lockup 485 × 100, the emblem the size's px squared. */
  private readonly builtInSize = computed<IntrinsicSize>(() => {
    if (this.variant() === 'emblem') {
      const px = EMBLEM_PX[this.size()];
      return { width: px, height: px };
    }
    return LOCKUP_SIZE;
  });

  /** The consumer's pair for the current variant (a dark file shares its light partner's pair). */
  private readonly customSize = computed<IntrinsicSize>(() =>
    this.variant() === 'emblem'
      ? pair(this.emblemSrcWidth(), this.emblemSrcHeight())
      : pair(this.srcWidth(), this.srcHeight()),
  );

  /** `width`/`height` of the light `<img>`: follows the file it shows (G-38). */
  protected readonly lightSize = computed<IntrinsicSize>(() =>
    this.customSrc() ? this.customSize() : this.builtInSize(),
  );

  /** `width`/`height` of the dark `<img>`: follows the file it shows (G-38). */
  protected readonly darkSize = computed<IntrinsicSize>(() => {
    const customDark = this.variant() === 'emblem' ? this.darkEmblemSrc() : this.darkSrc();
    return customDark ? this.customSize() : this.builtInSize();
  });

  readonly logoClasses = computed(() => {
    const classes = [`size-${this.size()}`];
    if (this.clickable()) {
      classes.push('clickable');
    }
    return classes.join(' ');
  });
}
