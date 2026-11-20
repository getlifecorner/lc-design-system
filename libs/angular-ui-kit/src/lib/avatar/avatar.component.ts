import { Component, ChangeDetectionStrategy, input, computed, linkedSignal } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

/**
 * How the browser loads the image (3.11.2, G-40). The same union as
 * `CharacterLoading`, kept separate because entries don't import each other.
 * - `eager`: no attribute, the browser default.
 * - `lazy`: `loading="lazy"`, for an avatar below the fold.
 */
export type AvatarLoading = 'eager' | 'lazy';

/** The box of each size in px at 100 % text, written as the `<img>` `width`/`height` (G-40). */
const AVATAR_PX: Readonly<Record<AvatarSize, number>> = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };

/**
 * Background of the initials. `default` is the neutral kit avatar; `member-1`
 * … `member-6` are the member colours (`--color-member-1` … `-6`: teal, rust,
 * violet, sage, berry, slate) with white initials, each at least 4.5:1.
 * Assign them per person in a stable order (e.g. join order) and always show
 * the name or initials beside the colour — colour is never the only cue.
 */
export type AvatarColor =
  | 'default'
  | 'member-1'
  | 'member-2'
  | 'member-3'
  | 'member-4'
  | 'member-5'
  | 'member-6';

/**
 * What `lc-avatar` shows with no image and no name (3.15).
 * - `initials`: "?"
 * - `person`: a person symbol on a neutral disc (`--color-neutral-300`, glyph
 *   `--color-neutral-700`; `color` is ignored while it shows)
 */
export type AvatarFallback = 'initials' | 'person';

/** 3.48 (usm-x row 65): a round avatar (a person) or a rounded square (a thing). */
export type AvatarShape = 'circle' | 'square';

/** The six member colours in their order (`AvatarColor` without `default`). */
export const AVATAR_MEMBER_COLORS: readonly AvatarColor[] = [
  'member-1',
  'member-2',
  'member-3',
  'member-4',
  'member-5',
  'member-6',
];

/**
 * The kit's initials rule (3.45, usm-x row 37), used by `lc-avatar`,
 * `lc-avatar-group` and `lc-header`: the first letter of the first and of the
 * last whitespace-separated word, upper case (`'Lena Maria Brandt'` → `'LB'`);
 * one word → its first letter (`'Admin'` → `'A'`); empty or only spaces →
 * `'?'`. Use it wherever the app shows initials next to the kit's, so they
 * match.
 */
export function avatarInitials(name: string | undefined): string {
  if (!name || name.trim() === '') {
    return '?';
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0]?.[0]?.toUpperCase() ?? '?';
  }

  // First and last name initials
  const firstInitial = parts[0]?.[0];
  const lastInitial = parts[parts.length - 1]?.[0];

  if (firstInitial && lastInitial) {
    return (firstInitial + lastInitial).toUpperCase();
  }
  return '?';
}

/**
 * Kit-internal name of {@link avatarInitials} (AS-33).
 * @deprecated Since 3.45: use `avatarInitials`.
 */
export const ɵavatarInitials = avatarInitials;

/**
 * Avatar component for circular user representation.
 *
 * Features:
 * - Image display with fallback to initials
 * - Auto-generated initials from user name
 * - Status indicator (online, offline, busy, away)
 * - Multiple size variants (xs, sm, md, lg, xl)
 * - Member colours (`color`: `member-1` … `member-6`) with white initials
 * - `ring`: a gap in the page colour around the avatar, for stacks and for
 *   avatars on images or tints
 * - Accessible with alt text support
 * - `fallback="person"`: a person symbol on a neutral disc instead of "?"
 *   when there is no name (3.15)
 *
 * @example
 * ```html
 * <lc-avatar src="https://example.com/avatar.jpg" alt="John Doe" />
 * <lc-avatar name="John Doe" status="online" size="lg" />
 * <lc-avatar name="Tom Ek" color="member-2" [ring]="true" />
 * ```
 */
@Component({
  selector: 'lc-avatar',
  standalone: true,
  imports: [],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  /** Image source URL */
  src = input<string>();

  /** Alt text for the image */
  alt = input<string>();

  /** Full name for generating initials */
  name = input<string>();

  /**
   * Size of the avatar: xs 24, sm 32, md 40, lg 48, xl 64 px (1.5 … 4 rem).
   * The `<img>` carries the size's px as `width`/`height`; CSS sizes the box,
   * so at 200 % text the box grows and the attributes only give the 1:1 ratio.
   * @default 'md'
   */
  size = input<AvatarSize>('md');

  /**
   * How the browser loads the image. `lazy`: for an avatar below the fold;
   * writes `loading="lazy"`. `eager` writes no attribute. The initials still
   * replace an image that fails.
   * @default 'eager'
   */
  loading = input<AvatarLoading>('eager');

  /** Status indicator */
  status = input<AvatarStatus>();

  /**
   * Background of the initials: `default` (neutral) or a member colour
   * `member-1` … `member-6` with white initials (LK-7). For an app's own
   * identity colours (3.45) set `--lc-avatar-bg` and `--lc-avatar-color` on
   * the avatar or an ancestor; they replace the disc and initials colour of
   * any `color` (not of the `person` fallback). Defaults: neutral
   * `--color-surface-hover` / `--color-text-secondary`, member
   * `--color-member-N` / `--color-on-member`. Pick a pair at 4.5:1 or more.
   * @default 'default'
   */
  color = input<AvatarColor>('default');

  /**
   * Draw a ring in the page colour around the avatar (3 px; 2 px for `xs` and
   * `sm`), so stacked or overlapping avatars stay apart. The ring colour is
   * `--lc-avatar-ring-color` (default `--color-background`); set it to the
   * surface the avatar sits on.
   */
  ring = input<boolean>(false);

  /**
   * Hide the avatar from assistive technology (no `img` role, no label), for
   * avatars inside a control that has its own accessible name — e.g. a menu
   * button labelled "Menu for Tom Ek".
   */
  decorative = input<boolean>(false);

  /**
   * What shows with no image and no name: `'initials'` shows "?"; `'person'`
   * shows a person symbol on a neutral disc (`color` is ignored while it
   * shows). With a `name`, both show the initials. The accessible name stays
   * `alt`, then `name`, then "Avatar".
   * @default 'initials'
   */
  fallback = input<AvatarFallback>('initials');

  /**
   * 3.48 (usm-x row 65): `'square'` draws a rounded square (radius
   * `--lc-avatar-square-radius`, default `25%`: 6/8/10/12/16 px at xs…xl),
   * for a thing (a ticket, a CI) beside round person avatars; the image, the
   * ring and the person glyph's box follow it. Colours are unchanged.
   * @default 'circle'
   */
  shape = input<AvatarShape>('circle');

  /**
   * 3.50 (usm-x row 81): letters shown instead of the name's initials, e.g.
   * `'IN'` for an incident or `'CRM'` on a square avatar; at most 3
   * characters (more are cut), 3 at 0.75 em so they fit every size. The
   * accessible name stays `alt`, then `name`, then "Avatar". `''`: the
   * initials of `name` as before.
   * @default ''
   */
  letters = input<string>('');

  /**
   * Computed initials from name
   */
  initials = computed(() => avatarInitials(this.name()));

  /** `letters` (trimmed, at most 3 characters), else the name's initials. */
  protected readonly shownLetters = computed(() => {
    const letters = this.letters()?.trim() ?? '';
    return letters ? Array.from(letters).slice(0, 3).join('') : this.initials();
  });

  /** Three letters take a smaller size (0.75 em) to fit the disc. */
  protected readonly threeLetters = computed(() => Array.from(this.shownLetters()).length === 3);

  /** The person symbol: `fallback="person"`, no image (or a broken one), no name and no `letters`. */
  protected readonly showPerson = computed(
    () => this.fallback() === 'person' && !this.showImage() && !this.name()?.trim() && !this.letters()?.trim(),
  );

  /**
   * Computed CSS classes for the avatar
   */
  avatarClasses = computed(() => {
    const classes = ['lc-avatar'];

    classes.push(`lc-avatar--${this.size()}`);

    if (this.status()) {
      classes.push('lc-avatar--with-status');
    }

    if (this.showPerson()) {
      classes.push('lc-avatar--person');
    } else if (this.color() !== 'default') {
      classes.push('lc-avatar--member', `lc-avatar--${this.color()}`);
    }

    if (this.ring()) {
      classes.push('lc-avatar--ring');
    }

    if (this.shape() === 'square') {
      classes.push('lc-avatar--square');
    }

    return classes.join(' ');
  });

  /**
   * Get aria-label for accessibility
   */
  ariaLabel = computed(() => {
    return this.alt() || this.name() || 'Avatar';
  });

  /** The size's px, written as the `<img>` `width` and `height` (G-40). */
  protected readonly imagePx = computed(() => AVATAR_PX[this.size()]);

  /**
   * Check if image should be displayed
   */
  showImage = computed(() => {
    return this.src() && !this.imageError();
  });

  /**
   * Track if image failed to load. Resets whenever `src` changes so a new
   * image gets a fresh attempt instead of staying stuck on the initials.
   */
  protected imageError = linkedSignal<string | undefined, boolean>({
    source: this.src,
    computation: () => false,
  });

  /**
   * Handle image load error
   */
  onImageError(): void {
    this.imageError.set(true);
  }
}
