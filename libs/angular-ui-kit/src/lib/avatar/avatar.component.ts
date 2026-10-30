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
 * The initials `lc-avatar` shows for `name`: first and last word's first
 * letter, upper case; one word: its first letter; empty: `?`. Kit-internal
 * (used by `lc-header`, so the account button's name holds exactly the text
 * the avatar shows, AS-33); no semver guarantee.
 */
export function ɵavatarInitials(name: string | undefined): string {
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
   * `member-1` … `member-6` with white initials (LK-7).
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
   * Computed initials from name
   */
  initials = computed(() => ɵavatarInitials(this.name()));

  /** The person symbol: `fallback="person"`, no image (or a broken one) and no name. */
  protected readonly showPerson = computed(
    () => this.fallback() === 'person' && !this.showImage() && !this.name()?.trim(),
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
