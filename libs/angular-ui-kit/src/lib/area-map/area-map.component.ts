import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BadgeComponent, type BadgeVariant } from '@lifecorner/angular-ui-kit/badge';
import { ChipComponent, type ChipVariant } from '@lifecorner/angular-ui-kit/chip';

/** Where a status group of `lc-area-map` sits: over the layer (with lines) or under the divider. */
export type AreaMapPlacement = 'above' | 'below';

/** One area of a status group: a label and an optional icon (a string is a label without icon). */
export interface AreaMapArea {
  /** The chip's text. */
  label: string;
  /** Icon name of the chip (register its `ICON_*` constant like any other). */
  icon?: string;
}

/** One status group of `lc-area-map`: a status badge and its areas as chips. */
export interface AreaMapGroup {
  /** The badge text, e.g. "Next" or "Gebaut". */
  status: string;
  /** Badge colour. Default `'default'`. */
  statusVariant?: BadgeVariant;
  /** The areas, in order. */
  areas: readonly (string | AreaMapArea)[];
  /** Default `'above'`: over the layer, with a line from each chip. `'below'`: under the divider, no lines. */
  placement?: AreaMapPlacement;
  /**
   * Chip colour. Default `'emphasis'` above and `'quiet'` below. Above the
   * layer, use an opaque variant (any but `'quiet'`), or the lines show
   * through the chips.
   */
  chipVariant?: ChipVariant;
}

/** Row tracks of the map's grid: at most 11 groups plus the layer. */
const ROWS = 12;

/** Lines into the layer: the first 8 chips of the `above` groups get one. */
const LINES = 8;

interface RenderedArea {
  readonly label: string;
  readonly icon: string | undefined;
  readonly classes: string;
}

interface RenderedGroup {
  readonly status: string;
  readonly statusVariant: BadgeVariant;
  readonly chipVariant: ChipVariant;
  readonly classes: string;
  readonly areas: readonly RenderedArea[];
}

/** `lc-area-map__row-<n>` for the first 12 rows, nothing after that. */
const rowClass = (row: number) => (row <= ROWS ? ` lc-area-map__row-${row}` : '');

/**
 * An area map (3.40, request 060, life-os G-HV2): status groups stacked top
 * to bottom, each a badge and its areas as wrapping, centred chips; thin
 * straight lines from the chips of the `above` groups into one translucent
 * layer bar with a figure, a title and a line; quieter `below` groups under a
 * divider, without lines. Made for the `[hero-media]` slot of `lc-hero`, works
 * on a page too.
 *
 * Features:
 * - No JavaScript for the layout: every class is in the prerendered HTML; the
 *   lines are CSS anchor positioning (Chromium 125+, Safari 26+). Without it
 *   (`@supports not (anchor-name: --a)`), with `lines` off and in forced
 *   colours the lines are hidden and nothing else moves.
 * - Several maps on one page don't share anchors: each host is the lines'
 *   containing block and sets `anchor-scope: all`.
 * - No inline `style`: works under a CSP without `unsafe-inline`.
 * - Semantics: one `<ul role="list">` named by `ariaLabel` (each group a list
 *   item with its badge and a list of areas), then the layer as a named
 *   `role="group"`. The lines are `aria-hidden`; nothing is focusable.
 * - In `lc-hero` the chips and badges take the on-band palette and the layer
 *   a dark glass (white text 6.40:1 or more on all nine bands).
 * - Limits: 11 groups (the grid's 12 row tracks hold them and the layer) and
 *   8 lines; further chips of `above` groups render without a line.
 * - CSS hooks (on the host or any ancestor): `--lc-area-map-line-color`
 *   (`currentColor` at 50 %), `--lc-area-map-layer-bg` (in a hero its glass,
 *   else `--color-surface-secondary`), `--lc-area-map-layer-border`
 *   (`currentColor` at 32 %), `--lc-area-map-divider-color` (`currentColor`
 *   at 20 %).
 *
 * @example
 * ```html
 * <!-- In your stylesheet: .home-hero { --lc-hero-media-width: 34rem; } -->
 * <lc-hero class="home-hero" title="Alles an einem Ort">
 *   <lc-area-map hero-media [groups]="groups" layerTitle="Verbunden, für dich und KI nutzbar"
 *     layerText="Jede Angabe mit Quelle." ariaLabel="Bereiche und ihr Stand">
 *     <lc-character area-map-figure pose="connects" colorMode="dark" size="48" />
 *   </lc-area-map>
 * </lc-hero>
 * ```
 */
@Component({
  selector: 'lc-area-map',
  standalone: true,
  imports: [BadgeComponent, ChipComponent],
  templateUrl: './area-map.component.html',
  styleUrls: ['./area-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'lc-area-map',
  },
})
export class AreaMapComponent {
  /**
   * Status groups in visual order. `above` groups sit over the layer and
   * their chips get lines; `below` groups sit under the divider. Rendered
   * above-first, each part in input order. At most 11 groups and 8 lined
   * chips; further chips render without a line.
   */
  readonly groups = input.required<readonly AreaMapGroup[]>();

  /** Title of the layer bar (bold, balanced). */
  readonly layerTitle = input.required<string>();

  /**
   * Line under the title; nothing is rendered when empty.
   * @default ''
   */
  readonly layerText = input<string>('');

  /**
   * Accessible name of the area list.
   * @default 'Areas and their status'
   */
  readonly ariaLabel = input<string>('Areas and their status');

  /**
   * Accessible name of the layer group; `null` uses `layerTitle`.
   * @default null
   */
  readonly layerAriaLabel = input<string | null>(null);

  /**
   * Draws the lines from the chips into the layer. `false` renders no line
   * spans: the layout browsers without anchor positioning show.
   * @default true
   */
  readonly lines = input(true, { transform: booleanAttribute });

  /** Groups with their row, anchor and divider classes; the layer's row; the line numbers. */
  protected readonly view = computed(() => {
    const groups = this.groups();
    const above = groups.filter((group) => (group.placement ?? 'above') === 'above');
    const below = groups.filter((group) => group.placement === 'below');
    let row = 0;
    let anchors = 0;
    const rendered: RenderedGroup[] = [];
    for (const group of above) {
      rendered.push({
        status: group.status,
        statusVariant: group.statusVariant ?? 'default',
        chipVariant: group.chipVariant ?? 'emphasis',
        classes: `lc-area-map__group${rowClass(++row)}`,
        areas: group.areas.map((area) => {
          const anchor = anchors < LINES ? ++anchors : 0;
          return { ...toArea(area), classes: `lc-area-map__area${anchor ? ` lc-area-map__area--anchor-${anchor}` : ''}` };
        }),
      });
    }
    const layer = `lc-area-map__layer${rowClass(++row)}`;
    below.forEach((group, i) =>
      rendered.push({
        status: group.status,
        statusVariant: group.statusVariant ?? 'default',
        chipVariant: group.chipVariant ?? 'quiet',
        classes: `lc-area-map__group lc-area-map__group--below${i === 0 ? ' lc-area-map__group--divided' : ''}${rowClass(++row)}`,
        areas: group.areas.map((area) => ({ ...toArea(area), classes: 'lc-area-map__area' })),
      }),
    );
    const links = Array.from({ length: anchors }, (_, i) => `lc-area-map__link lc-area-map__link--${i + 1}`);
    return { groups: rendered, layer, links };
  });
}

function toArea(area: string | AreaMapArea): { label: string; icon: string | undefined } {
  return typeof area === 'string' ? { label: area, icon: undefined } : { label: area.label, icon: area.icon };
}
