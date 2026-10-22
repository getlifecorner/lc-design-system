import { ChangeDetectionStrategy, Component, InjectionToken, computed, inject, input } from '@angular/core';
import { LC_LOGO_BASE_PATH } from '@lifecorner/angular-ui-kit/logo';
import type { CharacterPose } from '@lifecorner/angular-ui-kit/character-svg';

// A type-only re-export: no runtime edge to the SVG strings (3.8, G-4).
export type { CharacterPose } from '@lifecorner/angular-ui-kit/character-svg';

/** Edge of the figure's square box in px. `--lc-character-size` overrides it. */
export type CharacterSize = 48 | 64 | 80 | 96 | 128;

/**
 * Which drawing to show.
 * - `auto`: the root theme picks the light or the dark drawing.
 * - `dark`: the on-dark drawing in both themes, for a fixed dark surface.
 */
export type CharacterColorMode = 'auto' | 'dark';

/**
 * How the browser loads the drawings (3.11.2, G-39).
 * - `eager`: no attribute, the browser default; keep it above the fold.
 * - `lazy`: `loading="lazy"` on every drawing, for a figure below the fold.
 */
export type CharacterLoading = 'eager' | 'lazy';

/**
 * The URL folder that holds the pose files (`<pose>-light.svg`,
 * `<pose>-dark.svg`, copied from the package's `assets/character/`). Follows
 * `LC_LOGO_BASE_PATH` (default `/assets` → `/assets/character`) unless you
 * provide it yourself.
 *
 * @example
 * ```ts
 * providers: [{ provide: LC_CHARACTER_BASE_PATH, useValue: '/static/edu' }]
 * ```
 */
export const LC_CHARACTER_BASE_PATH = new InjectionToken<string>('LC_CHARACTER_BASE_PATH', {
  providedIn: 'root',
  factory: () => `${inject(LC_LOGO_BASE_PATH).replace(/\/$/, '')}/character`,
});

/** `size="96"` from a template is the number 96. */
function toCharacterSize(value: CharacterSize | `${CharacterSize}`): CharacterSize {
  return Number(value) as CharacterSize;
}

/**
 * Edu, the LifeCorner character, in one of his poses (3.8, gap G-4).
 *
 * Renders the pose files as `<img>` (no inline SVG, no Trusted Types policy),
 * in a square box that is sized by CSS before any JavaScript runs, so the
 * figure prerenders and never shifts the layout. Decorative by default
 * (`aria-hidden="true"`); `ariaLabel` makes it an image with that name. The
 * figure is still: nothing animates.
 *
 * Without Angular, use the files (`@lifecorner/angular-ui-kit/assets/character/<pose>-<light|dark>.svg`)
 * or the strings of `@lifecorner/angular-ui-kit/character-svg`.
 *
 * @example Decorative, follows the app theme
 * ```html
 * <lc-character pose="comforts" size="96" />
 * ```
 *
 * @example On a fixed dark surface, with a name
 * ```html
 * <lc-character pose="hello" colorMode="dark" ariaLabel="Edu winkt" />
 * ```
 */
@Component({
  selector: 'lc-character',
  standalone: true,
  imports: [],
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-hidden]': "ariaLabel() ? null : 'true'",
    '[attr.role]': "ariaLabel() ? 'img' : null",
    '[attr.aria-label]': 'ariaLabel() || null',
  },
})
export class CharacterComponent {
  /**
   * Which pose to draw: hello, shows-the-way, happy, welcomes-member, resting,
   * in-his-corner, comforts, all-done, calm, connects, discovered, thinking,
   * connection-paused, see-you. `calm` is the neutral Edu.
   * @default 'calm'
   */
  readonly pose = input<CharacterPose>('calm');

  /**
   * Edge of the square box in px: 48, 64, 80, 96 or 128 (`size="96"` works
   * too). `--lc-character-size` overrides it; set that hook per breakpoint in
   * CSS.
   * @default 64
   */
  readonly size = input<CharacterSize, CharacterSize | `${CharacterSize}`>(64, { transform: toCharacterSize });

  /**
   * Which drawing to show.
   * - `auto`: both drawings are in the DOM and the root theme shows one
   *   (light, dark, and system with the OS setting), without JavaScript.
   * - `dark`: only the on-dark drawing, in both themes, for a fixed dark
   *   surface such as the hero band.
   * @default 'auto'
   */
  readonly colorMode = input<CharacterColorMode>('auto');

  /**
   * Empty: decorative (`aria-hidden="true"`). Set: `role="img"` with this
   * name. This is your own translated text; the kit ships none.
   * @default ''
   */
  readonly ariaLabel = input<string>('');

  /**
   * How the browser loads the drawings. `lazy`: for a figure below the fold
   * (such as the horizon); writes `loading="lazy"` on every drawing, and in
   * `auto` only the drawing of the current theme is fetched. `eager` writes no
   * attribute (the browser default). Keep `eager` above the fold.
   * @default 'eager'
   */
  readonly loading = input<CharacterLoading>('eager');

  private readonly basePath = inject(LC_CHARACTER_BASE_PATH);

  protected readonly lightSrc = computed(() => `${this.basePath.replace(/\/$/, '')}/${this.pose()}-light.svg`);
  protected readonly darkSrc = computed(() => `${this.basePath.replace(/\/$/, '')}/${this.pose()}-dark.svg`);
  protected readonly hostClass = computed(() => `lc-character lc-character--${this.size()}`);
}
