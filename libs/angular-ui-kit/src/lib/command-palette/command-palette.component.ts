import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  PLATFORM_ID,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ButtonComponent } from '@lifecorner/angular-ui-kit/button';
import { IconComponent, ɵprovideKitIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_ARROW_PATH, ICON_EXCLAMATION_CIRCLE } from '@lifecorner/angular-ui-kit/icons';
import { ModalComponent } from '@lifecorner/angular-ui-kit/modal';
import { SearchInputComponent } from '@lifecorner/angular-ui-kit/search-input';
import { SpinnerComponent } from '@lifecorner/angular-ui-kit/spinner';
import { BadgeComponent, type BadgeVariant } from '@lifecorner/angular-ui-kit/badge';

/** One result of `lc-command-palette` (3.45, usm-x row 34). */
export interface CommandPaletteItem<T = unknown> {
  /** Unique in its group; the keyboard cursor is tracked by it. */
  id: string;
  /** The option's name. */
  label: string;
  /** A second line under the label (wraps). */
  description?: string;
  /** Name of a registered icon (20 px) before the label. */
  icon?: string;
  /**
   * Quiet trailing text, e.g. the area („Stammdaten“): whole up to a third of
   * the row, then ellipsised (full text in `title`); part of the option's name.
   */
  hint?: string;
  /** Display text of a key combination, shown in a `<kbd>` („⌘K“). Display only. */
  shortcut?: string;
  /** Shown but not selectable; the arrow keys skip it. */
  disabled?: boolean;
  /** Why the item is disabled; replaces the hint (wraps instead of ellipsising) and is part of the name. */
  disabledReason?: string;
  /** Keeps the palette open after the item is selected. */
  keepOpen?: boolean;
  /**
   * 3.48 (usm-x row 48): a count at the line's end („56/60“), an `lc-badge`
   * xs after the hint and before the shortcut. It never shrinks or wraps (the
   * hint ellipsises first) and is part of the option's name.
   */
  badge?: string;
  /**
   * 3.48: variant of `badge`.
   * @default 'default'
   */
  badgeVariant?: BadgeVariant;
  /** Anything the app needs back in `itemSelect`. */
  data?: T;
}

/** A group of results with its heading (3.45). */
export interface CommandPaletteGroup<T = unknown> {
  /** Unique among the groups. */
  id: string;
  /** Visible heading; names the group for screen readers. */
  heading: string;
  /** The results, in display order. */
  items: readonly CommandPaletteItem<T>[];
  /** The app is still loading this group: a busy row and `aria-busy`. */
  loading?: boolean;
  /** Loading failed: `true` shows `labels.error`, a string shows itself, with a „Try again“ option (`groupRetry`). */
  error?: boolean | string;
  /** Text shown when the group has no items (otherwise an empty group is hidden). */
  emptyText?: string;
}

/** Payload of `itemSelect`. */
export interface CommandPaletteSelectEvent<T = unknown> {
  item: CommandPaletteItem<T>;
  group: CommandPaletteGroup<T>;
}

/**
 * Built-in texts of `lc-command-palette`. `{query}` in `noResults` is the
 * trimmed query, `{count}` in `results` the number of options.
 */
export interface CommandPaletteLabels {
  /** Accessible name of the dialog. */
  dialogLabel: string;
  /** Accessible name of the search field. */
  searchLabel: string;
  placeholder: string;
  /** Shown when no group has anything to show and the query is not empty. */
  noResults: string;
  /** Shown when nothing is to show and the query is empty (`''`: nothing). */
  empty: string;
  /** Busy row of a loading group and status text. */
  loading: string;
  /** Message of a group with `error: true`. */
  error: string;
  /** The option that emits `groupRetry`. */
  retry: string;
  /** Status text with `{count}` results. */
  results: string;
  /** Status text with one result. */
  oneResult: string;
  /** Accessible name of the field's clear button. */
  clear: string;
  /** The Cancel button below 640 px. */
  cancel: string;
}

/** English texts (the default). */
const LABELS_EN: Readonly<CommandPaletteLabels> = {
  dialogLabel: 'Command palette',
  searchLabel: 'Search commands and pages',
  placeholder: 'Search or jump to…',
  noResults: 'No results for “{query}”',
  empty: '',
  loading: 'Searching…',
  error: 'Couldn’t load these results.',
  retry: 'Try again',
  results: '{count} results',
  oneResult: '1 result',
  clear: 'Clear search',
  cancel: 'Cancel',
};

/** German texts for `labels`. */
export const COMMAND_PALETTE_LABELS_DE: Readonly<CommandPaletteLabels> = {
  dialogLabel: 'Befehlspalette',
  searchLabel: 'Befehle und Seiten durchsuchen',
  placeholder: 'Suchen …',
  noResults: 'Keine Treffer für „{query}“',
  empty: '',
  loading: 'Wird gesucht …',
  error: 'Diese Ergebnisse konnten nicht geladen werden.',
  retry: 'Erneut versuchen',
  results: '{count} Treffer',
  oneResult: '1 Treffer',
  clear: 'Suche leeren',
  cancel: 'Abbrechen',
};

/** One navigable row: an item, or the retry option of a failed group. */
interface PaletteOption {
  readonly key: string;
  readonly id: string;
  readonly group: CommandPaletteGroup;
  readonly item: CommandPaletteItem | null;
  readonly disabled: boolean;
}

/** A visible group with its options, as the template renders it. */
interface PaletteGroupView {
  readonly group: CommandPaletteGroup;
  readonly headingId: string;
  readonly options: readonly PaletteOption[];
  readonly retry: PaletteOption | null;
  readonly errorText: string;
  readonly errorId: string;
}

/** A piece of a label, marked when it matches the query. */
interface LabelPart {
  readonly text: string;
  readonly mark: boolean;
}

/** A parsed `shortcut`. */
interface ParsedShortcut {
  readonly key: string;
  /** ⌘ on Apple systems, Ctrl elsewhere. */
  readonly mod: boolean;
  readonly ctrl: boolean;
  readonly meta: boolean;
  readonly alt: boolean;
  readonly shift: boolean;
}

/** PageUp/PageDown step. */
const PAGE_STEP = 10;

let nextId = 0;

/**
 * Command palette (3.45, usm-x row 34): a search field over grouped results in
 * a top-anchored dialog. It shows what the app passes and fetches nothing:
 * filter local groups on `queryChange`, start a server search on the debounced
 * `searchChange`, and pass a group with `loading`, `error` or `emptyText`
 * while it is on its way.
 *
 * Layout: below 640 px a sheet from the top edge (full width, a Cancel
 * button); from 640 px a centred panel `--lc-command-palette-width` wide
 * (default `40rem`, never wider than the viewport − 32 px) at `lc-modal`'s top
 * offset, at most `--lc-command-palette-max-height` high (default `32rem`);
 * the results scroll inside.
 *
 * Accessibility: an APG combobox with a grouped listbox. Focus stays in the
 * field; ArrowUp/Down move over the options of every group (skipping disabled
 * ones, wrapping), Home/End go to the first/last, PageUp/Down 10 at a time,
 * Enter selects, Escape clears the query first and then closes. An option's
 * name is all its visible text (label, description, hint or reason,
 * shortcut). The listbox scrolls; the cursor is kept by key while results
 * arrive, and its option stays in place; the pointer only highlights. One polite
 * status reads „Searching…“ or the number of results after `debounceMs`.
 * Focus returns to the element that had it (or `returnFocusTo`) on close.
 *
 * Closed, it renders nothing (also in prerendered HTML).
 *
 * @example
 * ```html
 * <lc-command-palette
 *   [(open)]="paletteOpen"
 *   shortcut="mod+k"
 *   [groups]="groups()"
 *   [(query)]="query"
 *   (searchChange)="search($event)"
 *   (itemSelect)="run($event.item)"
 * />
 * ```
 */
@Component({
  selector: 'lc-command-palette',
  standalone: true,
  imports: [ModalComponent, SearchInputComponent, ButtonComponent, IconComponent, SpinnerComponent, BadgeComponent],
  viewProviders: [ɵprovideKitIcons([ICON_ARROW_PATH, ICON_EXCLAMATION_CIRCLE])],
  templateUrl: './command-palette.component.html',
  styleUrls: ['./command-palette.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'lc-command-palette' },
})
export class CommandPaletteComponent implements OnDestroy {
  /**
   * Whether the palette is open (two-way). Closing (Escape on an empty field,
   * the backdrop, Cancel, a selection) sets it to `false`.
   * @default false
   */
  readonly open = model<boolean>(false);

  /**
   * Result groups in display order. A group with no items that is not loading
   * and has no `error` is hidden unless it has `emptyText`. Put async groups
   * after sync ones, so arriving results grow below the cursor.
   * @default []
   */
  readonly groups = input<readonly CommandPaletteGroup[]>([]);

  /**
   * The field's text (two-way); `queryChange` emits on every keystroke, for
   * local filtering.
   * @default ''
   */
  readonly query = model<string>('');

  /**
   * Delay in ms of `searchChange` and of the status announcement. 0: none.
   * @default 300
   */
  readonly debounceMs = input<number>(300);

  /**
   * Global key that toggles the palette, e.g. `'mod+k'`: `mod` is ⌘ on Apple
   * systems and Ctrl elsewhere; also `ctrl`, `meta`, `alt`, `shift` and one
   * key, joined by `+`. A shortcut without ctrl, meta or alt is ignored while
   * an editable field has the focus. `null`: the app opens the palette.
   * @default null
   */
  readonly shortcut = input<string | null>(null);

  /**
   * Built-in texts, merged over the English defaults;
   * `COMMAND_PALETTE_LABELS_DE` has the German ones.
   * @default English (see `CommandPaletteLabels`)
   */
  readonly labels = input<Partial<CommandPaletteLabels>>({});

  /**
   * Marks the trimmed query in the labels (`<mark>`, case-insensitive).
   * @default true
   */
  readonly highlightMatches = input<boolean>(true);

  /**
   * Element that gets the focus after the palette closed, as `lc-modal`'s
   * input: set it to the trigger (WebKit doesn't focus a tapped button).
   * `null`: the element that had the focus at open.
   * @default null
   */
  readonly returnFocusTo = input<HTMLElement | null>(null);

  /**
   * 3.48 (usm-x row 47): id of the item under the keyboard cursor (two-way).
   * Setting it moves the cursor to the first enabled option with that item id
   * (visual order), sets `aria-activedescendant` and scrolls it into view; an
   * unknown or disabled id falls back to the first enabled option and writes
   * its id back. The palette writes it on every cursor move (arrows, a new
   * query, arriving groups), `null` on a retry option or none. After a
   * `keepOpen` item, set it in the same change as the groups that hold the
   * line that took the chosen one's place.
   * @default null
   */
  readonly activeId = model<string | null>(null);

  /** The query after `debounceMs` (for a server search). */
  readonly searchChange = output<string>();

  /** An option was chosen (Enter or click). The palette closes unless the item has `keepOpen`. */
  readonly itemSelect = output<CommandPaletteSelectEvent>();

  /** „Try again“ of a group with `error` was chosen. */
  readonly groupRetry = output<CommandPaletteGroup>();

  protected readonly baseId = `lc-command-palette-${++nextId}`;
  protected readonly listboxId = `${this.baseId}-listbox`;

  /** The texts in use. */
  protected readonly l = computed<CommandPaletteLabels>(() => ({ ...LABELS_EN, ...this.labels() }));

  /** The groups that show, with their options and ids. */
  protected readonly views = computed<readonly PaletteGroupView[]>(() =>
    this.groups()
      .map((group, gi) => {
        const prefix = `${this.baseId}-g${gi}`;
        const options = group.items.map<PaletteOption>((item, ii) => ({
          key: `${group.id}\u0000${item.id}`,
          id: `${prefix}-o${ii}`,
          group,
          item,
          disabled: !!item.disabled,
        }));
        const errorText = group.error ? (typeof group.error === 'string' ? group.error : this.l().error) : '';
        const retry: PaletteOption | null = group.error
          ? { key: `${group.id}\u0000\u0000retry`, id: `${prefix}-retry`, group, item: null, disabled: false }
          : null;
        return { group, headingId: `${prefix}-heading`, options, retry, errorText, errorId: `${prefix}-error` };
      })
      .filter((v) => v.options.length || v.group.loading || v.retry || v.group.emptyText),
  );

  /** Every option in visual order (the retry option after its group's message). */
  private readonly options = computed(() =>
    this.views().flatMap((v) => (v.retry ? [...v.options, v.retry] : v.options)),
  );

  /** Number of item options (status text, `aria-expanded`). */
  protected readonly resultCount = computed(() => this.views().reduce((n, v) => n + v.options.length, 0));

  /** Key of the option under the keyboard cursor. */
  private readonly activeKey = signal<string | null>(null);

  /** The active option, if it is still there. */
  protected readonly active = computed(() => {
    const key = this.activeKey();
    return this.options().find((o) => o.key === key && !o.disabled) ?? null;
  });

  /** Text of the global empty row ('' renders none). */
  protected readonly emptyText = computed(() => {
    if (this.views().length) return '';
    const q = this.query().trim();
    return q ? this.l().noResults.replace('{query}', q) : this.l().empty;
  });

  /** What the status would say now. */
  private readonly statusNow = computed(() => {
    if (!this.open()) return '';
    if (this.views().some((v) => v.group.loading)) return this.l().loading;
    const n = this.resultCount();
    if (n === 1) return this.l().oneResult;
    if (n > 1) return this.l().results.replace('{count}', String(n));
    return this.emptyText();
  });

  /** The status text, after `debounceMs`. */
  protected readonly status = signal('');

  /** `aria-expanded` of the field: some option to choose. */
  protected readonly expanded = computed(() => this.options().length > 0);

  private readonly searchRef = viewChild(SearchInputComponent, { read: ElementRef });
  private readonly listboxRef = viewChild<ElementRef<HTMLElement>>('listbox');
  private readonly injector = inject(Injector);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private statusTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly onDocumentKeydown = (event: KeyboardEvent): void => this.handleShortcut(event);
  /** 3.48: the `activeId` the palette wrote last (`undefined`: none yet), so its own writes don't move the cursor. */
  private writtenId: string | null | undefined;

  constructor() {
    // 3.48 (usm-x row 47): the app set `activeId`: the cursor moves to that
    // item (first enabled option with the id), else to the first enabled one.
    // Created before the cursor effect below, so an id set together with new
    // groups wins over the "cursor's option is gone" fallback.
    effect(() => {
      const id = this.activeId();
      untracked(() => {
        if (id == null || id === this.writtenId) return;
        const options = this.options();
        const target = options.find((o) => !o.disabled && o.item?.id === id) ?? options.find((o) => !o.disabled) ?? null;
        this.setActive(target);
        // The fallback's id goes back also when the cursor was already there
        this.writtenId = target?.item?.id ?? null;
        if (this.writtenId !== id) this.activeId.set(this.writtenId);
      });
    });

    // A new query puts the cursor on the first enabled option and the list at
    // its top. Then arriving groups keep it on its option (by key); when that
    // one is gone, the first enabled one takes it. The listbox (the scroll
    // container) scrolls by the active option's offset change, so it stays
    // under the user. Option ids follow the position, so the offset before
    // the update is read under the option's old id (the DOM is still old).
    let lastQuery: string | null = null;
    let lastOptions: readonly PaletteOption[] = [];
    effect(() => {
      const options = this.options();
      const query = this.query();
      untracked(() => {
        const key = this.activeKey();
        const newQuery = query !== lastQuery;
        const previous = lastOptions;
        lastQuery = query;
        lastOptions = options;
        if (newQuery || !key || !options.some((o) => o.key === key && !o.disabled)) {
          this.activeKey.set(options.find((o) => !o.disabled)?.key ?? null);
          if (newQuery) {
            afterNextRender(
              () => {
                const list = this.listboxRef()?.nativeElement;
                if (list) list.scrollTop = 0;
              },
              { injector: this.injector },
            );
          }
          return;
        }
        const before = this.offsetOf(previous.find((o) => o.key === key)?.id);
        const id = options.find((o) => o.key === key)?.id;
        afterNextRender(
          () => {
            const after = this.offsetOf(id);
            const list = this.listboxRef()?.nativeElement;
            if (list && before !== null && after !== null && after !== before) list.scrollTop += after - before;
          },
          { injector: this.injector },
        );
      });
    });

    // Opening focuses the field and selects its text.
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        this.activeKey.set(this.firstEnabled()?.key ?? null);
        afterNextRender(
          () => {
            const field = this.field();
            field?.focus();
            field?.select();
          },
          { injector: this.injector },
        );
      });
    });

    // The status speaks after `debounceMs`.
    effect(() => {
      const text = this.statusNow();
      untracked(() => {
        clearTimeout(this.statusTimer);
        const ms = this.debounceMs();
        if (!text || ms <= 0) {
          this.status.set(text);
          return;
        }
        this.statusTimer = setTimeout(() => this.status.set(text), ms);
      });
    });

    // The global shortcut, added in code (no listener in prerendered HTML).
    afterNextRender(() => document.addEventListener('keydown', this.onDocumentKeydown));

    // 3.48 (usm-x row 47): while open, every cursor move is written to `activeId`.
    effect(() => {
      const open = this.open();
      const id = this.active()?.item?.id ?? null;
      if (!open) return;
      untracked(() => {
        this.writtenId = id;
        this.activeId.set(id);
      });
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.statusTimer);
    if (this.isBrowser) document.removeEventListener('keydown', this.onDocumentKeydown);
  }

  /** Close the palette (focus returns as for `lc-modal`). */
  close(): void {
    this.open.set(false);
  }

  protected isActive(option: PaletteOption): boolean {
    return this.active()?.key === option.key;
  }

  /** The label split into marked and plain parts. */
  protected parts(label: string): readonly LabelPart[] {
    const q = this.query().trim();
    if (!q || !this.highlightMatches()) return [{ text: label, mark: false }];
    const lower = label.toLocaleLowerCase();
    const needle = q.toLocaleLowerCase();
    const out: LabelPart[] = [];
    let from = 0;
    for (let at = lower.indexOf(needle); at !== -1; at = lower.indexOf(needle, from)) {
      if (at > from) out.push({ text: label.slice(from, at), mark: false });
      out.push({ text: label.slice(at, at + needle.length), mark: true });
      from = at + needle.length;
    }
    if (from < label.length) out.push({ text: label.slice(from), mark: false });
    return out;
  }

  /**
   * ids of an item option's name: every visible part in DOM order (label,
   * description, hint or reason, shortcut), so the name holds the visible
   * text (WCAG 2.5.3).
   */
  protected labelledBy(option: PaletteOption): string {
    const item = option.item;
    const ids = [`${option.id}-label`];
    if (item?.description) ids.push(`${option.id}-desc`);
    if (item && this.hintOf(item)) ids.push(`${option.id}-hint`);
    if (item?.badge) ids.push(`${option.id}-badge`);
    if (item?.shortcut) ids.push(`${option.id}-kbd`);
    return ids.join(' ');
  }

  /** The trailing text: the disabled reason wins over the hint. */
  protected hintOf(item: CommandPaletteItem): string {
    return (item.disabled && item.disabledReason) || item.hint || '';
  }

  /** The trailing text is a disabled reason (it wraps instead of ellipsising). */
  protected isReason(item: CommandPaletteItem): boolean {
    return !!(item.disabled && item.disabledReason);
  }

  protected onModalOpenChange(open: boolean): void {
    if (!open) this.close();
  }

  protected onQueryChange(value: string): void {
    this.query.set(value);
  }

  protected onSearch(value: string): void {
    this.searchChange.emit(value);
  }

  /** Keys of the field, handled before the document sees them. */
  protected onFieldKeydown(event: KeyboardEvent): void {
    const options = this.options();
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        if (event.altKey) return;
        event.preventDefault();
        this.move(event.key === 'ArrowDown' ? 1 : -1);
        break;
      case 'Home':
      case 'End': {
        if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey || !options.length) return;
        event.preventDefault();
        const list = event.key === 'Home' ? options : [...options].reverse();
        this.setActive(list.find((o) => !o.disabled) ?? null);
        break;
      }
      case 'PageDown':
      case 'PageUp':
        if (!options.length) return;
        event.preventDefault();
        this.page(event.key === 'PageDown' ? 1 : -1);
        break;
      case 'Enter': {
        if (event.isComposing) return;
        const option = this.active();
        if (!option) return;
        event.preventDefault();
        event.stopPropagation();
        this.choose(option);
        break;
      }
    }
  }

  protected onOptionClick(option: PaletteOption): void {
    if (option.disabled) return;
    this.activeKey.set(option.key);
    this.choose(option);
  }

  private choose(option: PaletteOption): void {
    if (!option.item) {
      this.groupRetry.emit(option.group);
      return;
    }
    this.itemSelect.emit({ item: option.item, group: option.group });
    if (!option.item.keepOpen) this.close();
  }

  private move(direction: 1 | -1): void {
    const options = this.options();
    if (!options.length) return;
    const current = options.findIndex((o) => o.key === this.active()?.key);
    for (let step = 1; step <= options.length; step++) {
      const start = current === -1 ? (direction === 1 ? -1 : 0) : current;
      const index = (start + direction * step + options.length) % options.length;
      if (!options[index].disabled) {
        this.setActive(options[index]);
        return;
      }
    }
  }

  private page(direction: 1 | -1): void {
    const options = this.options();
    const current = Math.max(0, options.findIndex((o) => o.key === this.active()?.key));
    let index = Math.min(options.length - 1, Math.max(0, current + direction * PAGE_STEP));
    // Clamped: walk back towards the cursor past disabled options.
    while (options[index]?.disabled && index !== current) index -= direction;
    if (!options[index]?.disabled) this.setActive(options[index]);
  }

  private setActive(option: PaletteOption | null): void {
    this.activeKey.set(option?.key ?? null);
    if (!option) return;
    afterNextRender(() => this.reveal(option), { injector: this.injector });
  }

  /**
   * Scrolls the listbox so the active option shows: the first enabled option
   * of a group brings its heading along (of the first group: the list's top),
   * the last enabled option scrolls to the end, so trailing loading, error
   * and empty rows show too; any other option scrolls in at the nearest edge.
   */
  private reveal(option: PaletteOption): void {
    const list = this.listboxRef()?.nativeElement;
    const el = list?.querySelector<HTMLElement>(`#${option.id}`);
    if (!list || !el) return;
    const enabled = this.options().filter((o) => !o.disabled);
    if (enabled[0]?.key === option.key) {
      list.scrollTop = 0;
      return;
    }
    if (enabled[enabled.length - 1]?.key === option.key) {
      list.scrollTop = list.scrollHeight;
      return;
    }
    const view = this.views().find((v) => v.group === option.group);
    const groupOptions = view ? (view.retry ? [...view.options, view.retry] : view.options) : [];
    const heading =
      groupOptions.find((o) => !o.disabled)?.key === option.key && view
        ? list.querySelector<HTMLElement>(`#${view.headingId}`)
        : null;
    const box = list.getBoundingClientRect();
    const top = (heading ?? el).getBoundingClientRect().top - box.top;
    const bottom = el.getBoundingClientRect().bottom - box.top;
    if (top < 0) list.scrollTop += top;
    else if (bottom > list.clientHeight) list.scrollTop += bottom - list.clientHeight;
  }

  private firstEnabled(): PaletteOption | undefined {
    return this.options().find((o) => !o.disabled);
  }

  /** The offset of option `id` from the top of the listbox (the scroll container), or null. */
  private offsetOf(id: string | undefined): number | null {
    const list = this.listboxRef()?.nativeElement;
    if (!id || !list) return null;
    const el = list.querySelector<HTMLElement>(`#${id}`);
    return el ? el.getBoundingClientRect().top - list.getBoundingClientRect().top : null;
  }

  private field(): HTMLInputElement | null {
    return this.searchRef()?.nativeElement.querySelector('input') ?? null;
  }

  private handleShortcut(event: KeyboardEvent): void {
    const parsed = parseShortcut(this.shortcut());
    if (!parsed || event.defaultPrevented || event.repeat) return;
    if (!matchesShortcut(event, parsed, isApple())) return;
    if (!parsed.ctrl && !parsed.meta && !parsed.alt && !parsed.mod && isEditable(event.target)) return;
    event.preventDefault();
    this.open.update((open) => !open);
  }
}

/** `'mod+k'` → its parts; `null` when empty. */
function parseShortcut(value: string | null): ParsedShortcut | null {
  if (!value) return null;
  const parts = value
    .toLowerCase()
    .split('+')
    .map((p) => p.trim())
    .filter(Boolean);
  const key = parts.pop();
  if (!key) return null;
  return {
    key,
    mod: parts.includes('mod'),
    ctrl: parts.includes('ctrl'),
    meta: parts.includes('meta') || parts.includes('cmd'),
    alt: parts.includes('alt') || parts.includes('option'),
    shift: parts.includes('shift'),
  };
}

function matchesShortcut(event: KeyboardEvent, s: ParsedShortcut, apple: boolean): boolean {
  const ctrl = s.ctrl || (s.mod && !apple);
  const meta = s.meta || (s.mod && apple);
  return (
    event.key?.toLowerCase() === s.key &&
    event.ctrlKey === ctrl &&
    event.metaKey === meta &&
    event.altKey === s.alt &&
    event.shiftKey === s.shift
  );
}

function isApple(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}
