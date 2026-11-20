import {
  Component,
  input,
  model,
  contentChildren,
  viewChild,
  viewChildren,
  computed,
  effect,
  untracked,
  signal,
  afterRenderEffect,
  inject,
  DestroyRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  TemplateRef,
  ElementRef,
} from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { RouterLink, type Params, type QueryParamsHandling } from '@angular/router';
import { BadgeComponent, BadgeVariant } from '@lifecorner/angular-ui-kit/badge';
import { IconComponent } from '@lifecorner/angular-ui-kit/icon';
import { TooltipDirective } from '@lifecorner/angular-ui-kit/tooltip';

let nextUniqueId = 0;

/** Width of the overflow fade, and the room a focused tab keeps from it (3.45). */
const TAB_FADE_PX = 24;

export type TabOrientation = 'horizontal' | 'vertical';

/**
 * What `lc-tabs` renders (3.44). `panels`: tabs and their panels (as
 * before). `links`: a tab list of links for content shown elsewhere (a
 * router outlet); the kit renders no panels.
 */
export type TabsMode = 'panels' | 'links';

/**
 * Individual tab component
 */
@Component({
  selector: 'lc-tab',
  standalone: true,
  imports: [],
  template: `
    <ng-template>
      <ng-content></ng-content>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
  /**
   * Tab label displayed in tab button
   */
  readonly label = input('');

  /**
   * Whether the tab is disabled
   * @default false
   */
  readonly disabled = input(false);

  /**
   * Optional icon name (an `lc-icon` name), drawn 16 px before the label only
   * when the parent `lc-tabs` has `showIcons` (3.45, backlog 064-n3); without
   * it the icon is not rendered (as before), so existing layouts don't move.
   * @default undefined
   */
  readonly icon = input<string | undefined>();

  /**
   * Optional badge content shown after the label (e.g. a count or "New").
   * `0` is rendered; `undefined`, `null`, and `''` hide the badge.
   */
  readonly badge = input<string | number | undefined | null>();

  /**
   * Badge color variant
   * @default 'default'
   */
  readonly badgeVariant = input<BadgeVariant>('default');

  /**
   * `mode="links"` (3.44, usm-x row 11): the tab's router link (`RouterLink`
   * commands), e.g. `route="."` with `[queryParams]="{ tab: 'kosten' }"` and
   * `queryParamsHandling="merge"`, so a reload or a shared link lands on the
   * same tab. Needs the app's router. Wins over `href`. Ignored in `panels`.
   * @default null
   */
  readonly route = input<string | readonly unknown[] | null>(null);

  /**
   * Query parameters of `route` (`RouterLink`'s `queryParams`).
   * @default null
   */
  readonly queryParams = input<Params | null>(null);

  /**
   * How `route` treats the current query (`RouterLink`'s
   * `queryParamsHandling`: `'merge'`, `'preserve'` or `''`).
   * @default null
   */
  readonly queryParamsHandling = input<QueryParamsHandling | null>(null);

  /**
   * `mode="links"` without the router (3.44): a plain link. `route` wins.
   * @default ''
   */
  readonly href = input('');

  /**
   * `mode="links"` (3.44): the app's current tab, `aria-selected="true"` and
   * the selected look. Clicks don't change it: the app sets it from its URL
   * (`?tab=`). If several tabs have it, the first wins.
   * @default false
   */
  readonly current = input(false);

  /**
   * Id of the tab element (3.44), so an app panel can point at it with
   * `aria-labelledby`. In `panels` mode the kit's own panel follows it.
   * Empty: the generated `lc-tab-N`.
   * @default ''
   */
  readonly tabId = input('');

  /**
   * 3.48 (usm-x row 50): a kit tooltip on hover and keyboard focus of the tab
   * (`aria-describedby` while it shows). Not a native `title`, which never
   * shows on focus.
   * @default ''
   */
  readonly tooltip = input('');

  /**
   * 3.48 (usm-x row 50): why a `disabled` tab can't be opened ("Wird im Rich
   * Client bearbeitet"). It is the tab's tooltip, and the tab stays reachable
   * by the arrow keys (`aria-disabled`, never selected or followed). Without
   * it a disabled tab is skipped as before.
   * @default ''
   */
  readonly disabledReason = input('');

  /**
   * 3.48 (usm-x row 50): quiet ink (tertiary, weight 400; 5.84:1 light, 7.31:1
   * dark on the page) for a tab that names a place edited elsewhere. It is
   * still selectable; the selected look wins. Since 3.50 hover keeps the
   * muted ink (5.30:1 light, 6.65:1 dark on the hover fill); focus is as before.
   * @default false
   */
  readonly muted = input(false);

  /**
   * 3.48 (usm-x row 69): a quiet second text after the label, before the badge
   * (12 px, tertiary ink), e.g. label "Ticket", hint "12 Status", badge
   * "3 Treffer". Part of the tab's accessible name.
   * @default ''
   */
  readonly hint = input('');

  /** 3.48: the arrow keys reach the tab: enabled, or disabled with a reason. */
  readonly reachable = computed(() => !this.disabled() || !!this.disabledReason());

  /** 3.48: the tab's tooltip: the reason while disabled, else `tooltip`. */
  readonly tooltipText = computed(() => (this.disabled() ? this.disabledReason() : this.tooltip()));

  /**
   * Whether the badge should be rendered
   */
  readonly hasBadge = computed(() => {
    const badge = this.badge();
    return badge !== undefined && badge !== null && badge !== '';
  });

  /**
   * Unique ID for accessibility
   */
  readonly id = `lc-tab-${nextUniqueId++}`;

  /**
   * Unique ID for the panel
   */
  readonly panelId = `lc-tabpanel-${this.id}`;

  /** Id of the tab element: `tabId`, or the generated id (3.44). */
  readonly elementId = computed(() => this.tabId() || this.id);

  /**
   * Template reference for tab content
   */
  readonly template = viewChild.required(TemplateRef);
}

/**
 * Tabs component for organizing content into switchable views.
 *
 * Features:
 * - Dynamic tab registration via content projection (tabs added or removed
 *   after init are picked up automatically)
 * - Active tab tracking with two-way binding (`[(selectedIndex)]`)
 * - Accessible with ARIA tablist/tab/tabpanel roles
 * - Keyboard navigation between tabs (arrow keys, Home, End) moves both the
 *   selection and DOM focus
 * - Lazy content rendering per tab
 * - Optional badge per tab (counts or status labels)
 * - 3.44: a horizontal tab list scrolls on its own when the tabs don't fit
 *   (WCAG 1.4.10), the selected tab is scrolled into view, and the focus ring
 *   is drawn inside the tab
 * - 3.44 (usm-x row 11): `mode="links"`, a tab list of links (`route` +
 *   `queryParams`, or `href`) for content rendered elsewhere, such as a router
 *   outlet; the app marks the `current` tab and wraps its outlet in
 *   `<div role="tabpanel" [id]="panelId" [attr.aria-labelledby]="currentTabId">`
 *
 * @example
 * ```html
 * <lc-tabs [(selectedIndex)]="active">
 *   <lc-tab label="Account">Account settings</lc-tab>
 *   <lc-tab label="Inbox" [badge]="12" badgeVariant="primary">Messages</lc-tab>
 *   <lc-tab label="Security">Security settings</lc-tab>
 * </lc-tabs>
 * ```
 */
@Component({
  selector: 'lc-tabs',
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, BadgeComponent, RouterLink, IconComponent, TooltipDirective],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'lc-tabs',
  },
})
export class TabsComponent {
  /**
   * Orientation of tabs
   * @default 'horizontal'
   */
  readonly orientation = input<TabOrientation>('horizontal');

  /**
   * Currently selected tab index. Two-way bindable via `[(selectedIndex)]`;
   * `selectedIndexChange` emits only when the selection actually changes
   * (never during initialisation).
   * @default 0
   */
  readonly selectedIndex = model(0);

  /**
   * Legacy one-way input for the selected index.
   * @deprecated Bind `[selectedIndex]` / `[(selectedIndex)]` instead.
   */
  readonly selectedIndexInput = input<number | undefined>(undefined);

  /**
   * What the tabs render (3.44, usm-x row 11). `'links'`: a tab list of links
   * for content shown elsewhere (a router outlet), with `role="tablist"` and
   * `role="tab"` links; each `lc-tab` takes `route` (+ `queryParams`,
   * `queryParamsHandling`) or `href`. The kit renders no panels, the `lc-tab`
   * with `current` is the current tab (`aria-selected`), clicks only
   * navigate, and `selectedIndex` is ignored. Arrow keys, Home and End move
   * the focus (manual activation: a route load has latency); Enter or Space
   * follows the link. Wrap the outlet in `<div role="tabpanel" [id]="panelId">`
   * labelled by the current tab's `tabId`.
   * @default 'panels'
   */
  readonly mode = input<TabsMode>('panels');

  /**
   * `mode="links"` (3.44): the `aria-controls` of every tab, the id of the
   * element that shows the tab content. Empty renders no attribute.
   * @default ''
   */
  readonly panelId = input('');

  /**
   * Renders each `lc-tab` `icon` (16 px, decorative) before its label (3.45,
   * backlog 064-n3); a tab grows by 24 px (icon and gap). Off: icons are not
   * rendered, as before.
   * @default false
   */
  readonly showIcons = input(false);

  /**
   * 3.48 (usm-x row 49): accessible name of the `role="tablist"` ("Facetten"),
   * in both modes. Empty renders no `aria-label`.
   * @default ''
   */
  readonly ariaLabel = input('');

  /**
   * 3.48 (usm-x row 51): `mode="links"`: route tabs navigate with
   * `replaceUrl` (`RouterLink.replaceUrl`), so the browser's Back leaves the
   * tool instead of walking back through its tabs. A Ctrl/Cmd/Shift or middle
   * click stays the browser's. `href` tabs ignore it.
   * @default false
   */
  readonly replaceUrl = input(false);

  /**
   * Projected tab components (signal query — updates when tabs are added or
   * removed after init).
   */
  readonly tabs = contentChildren(TabComponent);

  /**
   * Tab list for template access
   */
  readonly tabList = computed(() => this.tabs());

  /**
   * Rendered tab buttons — used to move DOM focus on keyboard navigation.
   */
  private readonly tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  /** The `role="tablist"` element of either mode (3.44: scrolls the selected tab into view). */
  private readonly listElement = viewChild<ElementRef<HTMLElement>>('tabListEl');

  /** `mode="links"` (3.44): index of the current tab, the first with `current`; -1 if none. */
  protected readonly currentIndex = computed(() => this.tabs().findIndex((tab) => tab.current()));

  /** `mode="links"`: index of the focused link while the focus is in the list, else `null`. */
  private readonly focusedLink = signal<number | null>(null);

  /** `mode="links"`: the tab stop: the current tab if enabled, else the first enabled one. */
  private readonly linkStop = computed(() => {
    const tabs = this.tabs();
    const current = this.currentIndex();
    if (current >= 0 && !tabs[current]?.disabled()) return current;
    return tabs.findIndex((tab) => !tab.disabled());
  });

  /**
   * CSS classes for tab list
   */
  readonly tabListClasses = computed(() => ({
    'lc-tabs__list': true,
    'lc-tabs--horizontal': this.orientation() === 'horizontal',
    'lc-tabs--vertical': this.orientation() === 'vertical',
    // 3.45 (backlog 064-n6): an overflowing horizontal list fades the side(s) that hide tabs.
    'lc-tabs__list--fade-start': this.fadeStart(),
    'lc-tabs__list--fade-end': this.fadeEnd(),
  }));

  /** 3.45: tabs hidden before the list's start / after its end (horizontal, overflowing). */
  private readonly fadeStart = signal(false);
  private readonly fadeEnd = signal(false);

  constructor() {
    // Mirror the deprecated one-way input into the model. `model.set` is a
    // no-op (no emit) when the value is unchanged, so binding the same index
    // does not fire `selectedIndexChange`.
    effect(() => {
      const legacy = this.selectedIndexInput();
      if (legacy !== undefined) {
        untracked(() => this.selectedIndex.set(legacy));
      }
    });

    // Keep the selection valid when tabs are removed at runtime: falling off
    // the end would leave no panel visible and no tab reachable via Tab.
    effect(() => {
      const count = this.tabs().length;
      if (this.mode() === 'links') return;
      const index = untracked(() => this.selectedIndex());
      if (count > 0 && index >= count) {
        untracked(() => this.selectTab(this.getLastEnabledTab()));
      }
    });

    // 3.44 (WCAG 1.4.10): a horizontal list scrolls; keep the selected (or,
    // in links mode, the current) tab fully in view after the first render and
    // when it changes. Only `scrollLeft`: `scrollIntoView` would scroll the page.
    afterRenderEffect(() => {
      this.mode();
      this.currentIndex();
      this.selectedIndex();
      this.orientation();
      const list = this.listElement()?.nativeElement;
      this.tabs();
      untracked(() => {
        this.scrollSelectedIntoView();
        this.observeSizes(list);
      });
    });
    // Web fonts and container changes resize the tabs after the first render:
    // the observer scrolls the selected tab in again (never on a user scroll).
    inject(DestroyRef).onDestroy(() => {
      this.resizeObserver?.disconnect();
      this.listen(undefined);
    });
  }

  /** Re-scrolls when the list or a tab changes size (3.44). */
  private resizeObserver?: ResizeObserver;

  /** The list that has the scroll and focus listeners (3.45). */
  private listenedList?: HTMLElement;

  private observeSizes(list: HTMLElement | undefined): void {
    this.listen(list);
    this.updateFade();
    if (typeof ResizeObserver === 'undefined') return;
    this.resizeObserver ??= new ResizeObserver(() => {
      this.scrollSelectedIntoView();
      this.updateFade();
    });
    this.resizeObserver.disconnect();
    if (!list || this.orientation() !== 'horizontal') return;
    this.resizeObserver.observe(list);
    list.querySelectorAll('[role="tab"]').forEach((tab) => this.resizeObserver?.observe(tab));
  }

  /**
   * 3.45 (backlog 064-n6): scroll updates the fades; a focused tab scrolls
   * fully in, clear of the fade. In code, not in the template: no listener
   * markup in prerendered HTML.
   */
  private listen(list: HTMLElement | undefined): void {
    if (list === this.listenedList) return;
    this.listenedList?.removeEventListener('scroll', this.onListScroll);
    this.listenedList?.removeEventListener('focusin', this.onListFocusIn);
    this.listenedList = list;
    list?.addEventListener('scroll', this.onListScroll, { passive: true });
    list?.addEventListener('focusin', this.onListFocusIn);
  }

  private readonly onListScroll = (): void => this.updateFade();

  private readonly onListFocusIn = (event: FocusEvent): void => {
    const tab = (event.target as Element | null)?.closest?.('[role="tab"]');
    if (tab instanceof HTMLElement) this.scrollTabIntoView(tab);
  };

  /** Sets the fade classes from the horizontal list's scroll position (3.45). */
  private updateFade(): void {
    const list = this.listenedList;
    let start = false;
    let end = false;
    if (list && this.orientation() === 'horizontal') {
      const max = list.scrollWidth - list.clientWidth;
      // `abs`: in a right-to-left list `scrollLeft` runs from 0 to −max.
      const offset = Math.abs(list.scrollLeft);
      start = max > 1 && offset > 1;
      end = max > 1 && offset < max - 1;
    }
    this.fadeStart.set(start);
    this.fadeEnd.set(end);
  }

  /** Scrolls the horizontal list so the selected (links: current) tab is fully in view; `scrollLeft` only. */
  private scrollSelectedIntoView(): void {
    const index = this.mode() === 'links' ? this.currentIndex() : this.selectedIndex();
    const list = this.listElement()?.nativeElement;
    if (!list || this.orientation() !== 'horizontal' || index < 0) return;
    const tab = list.querySelectorAll<HTMLElement>('[role="tab"]')[index];
    if (tab) this.scrollTabIntoView(tab);
  }

  /**
   * Scrolls `tab` fully into the horizontal list, plus the fade's 24 px when
   * the list overflows (3.45), so no tab ends under a fade; `scrollLeft` only.
   */
  private scrollTabIntoView(tab: HTMLElement): void {
    const list = this.listElement()?.nativeElement;
    if (!list || this.orientation() !== 'horizontal') return;
    const pad = list.scrollWidth - list.clientWidth > 1 ? TAB_FADE_PX : 0;
    const box = list.getBoundingClientRect();
    const rect = tab.getBoundingClientRect();
    if (rect.right > box.right - pad) {
      list.scrollLeft += rect.right - (box.right - pad);
    } else if (rect.left < box.left + pad) {
      list.scrollLeft -= box.left + pad - rect.left;
    }
  }

  /** `mode="links"`: `aria-selected` of the tab at `index`. */
  protected isCurrent(index: number): boolean {
    return this.currentIndex() === index;
  }

  /**
   * `mode="links"`: roving tab stop. The focused link while the focus is in
   * the list, else the current tab (or the first enabled one). Disabled tabs
   * get no tabindex: an `<a>` without `href` is not focusable.
   */
  protected linkTabIndex(index: number): number | null {
    // 3.48: a disabled tab with a reason is in the roving order (tabindex -1)
    if (!this.tabs()[index]?.reachable()) return null;
    return index === (this.focusedLink() ?? this.linkStop()) ? 0 : -1;
  }

  /** The tab links of `mode="links"`, in order (disabled ones included). */
  private linkElements(): HTMLElement[] {
    const list = this.listElement()?.nativeElement;
    return list ? [...list.querySelectorAll<HTMLElement>('[role="tab"]')] : [];
  }

  /** `mode="links"`: remember the focused link (the tab stop follows it). */
  protected onLinkFocusIn(event: FocusEvent): void {
    const index = this.linkElements().indexOf(event.target as HTMLElement);
    if (index >= 0) this.focusedLink.set(index);
  }

  /** `mode="links"`: focus left the list: the tab stop returns to the current tab. */
  protected onLinkFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !this.listElement()?.nativeElement.contains(next)) this.focusedLink.set(null);
  }

  /**
   * `mode="links"`: arrows, Home and End move the focus only (skipping
   * disabled tabs, wrapping); Enter follows the link natively; Space clicks it
   * (no page scroll). The current tab never changes here.
   */
  protected onLinkKeyDown(event: KeyboardEvent): void {
    const links = this.linkElements();
    const from = links.indexOf(event.target as HTMLElement);
    if (from < 0) return;
    const horizontal = this.orientation() === 'horizontal';
    // 3.48: disabled tabs with a reason are reached too (focus only)
    const enabled = (i: number) => !!this.tabs()[i]?.reachable();
    const step = (start: number, direction: 1 | -1): number => {
      for (let n = 1; n <= links.length; n++) {
        const i = (start + direction * n + links.length) % links.length;
        if (enabled(i)) return i;
      }
      return -1;
    };
    let to: number;
    switch (event.key) {
      case horizontal ? 'ArrowRight' : 'ArrowDown':
        to = step(from, 1);
        break;
      case horizontal ? 'ArrowLeft' : 'ArrowUp':
        to = step(from, -1);
        break;
      case 'Home':
        to = step(links.length - 1, 1);
        break;
      case 'End':
        to = step(0, -1);
        break;
      case ' ':
        event.preventDefault();
        (event.target as HTMLElement).click();
        return;
      default:
        return;
    }
    event.preventDefault();
    if (to >= 0) {
      this.focusedLink.set(to);
      links[to]?.focus();
    }
  }

  /**
   * Select a tab by index
   */
  selectTab(index: number): void {
    const tabs = this.tabList();
    const tab = tabs[index];
    if (index >= 0 && index < tabs.length && tab && !tab.disabled()) {
      this.selectedIndex.set(index);
    }
  }

  /**
   * Check if tab is selected
   */
  isSelected(index: number): boolean {
    return this.selectedIndex() === index;
  }

  /**
   * Handle keyboard navigation (automatic activation: focus and selection
   * move together). 3.48 (usm-x row 50): a disabled tab with a
   * `disabledReason` takes the focus (its tooltip shows) but not the
   * selection; the next key moves on from the focused tab.
   */
  handleKeyDown(event: KeyboardEvent): void {
    const tabs = this.tabList();
    const focused = this.tabButtons().findIndex((button) => button.nativeElement === event.target);
    const currentIndex = focused >= 0 ? focused : this.selectedIndex();
    let nextIndex = currentIndex;

    const isHorizontal = this.orientation() === 'horizontal';
    const nextKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';
    const prevKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
    const reachable = (i: number) => !!tabs[i]?.reachable();
    /** The next reachable tab from `start` in `direction` (wrapping); `fallback` if none. */
    const step = (start: number, direction: 1 | -1, fallback: number): number => {
      for (let n = 1; n <= tabs.length; n++) {
        const i = (start + direction * n + tabs.length) % tabs.length;
        if (reachable(i)) return i;
      }
      return fallback;
    };

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        nextIndex = step(currentIndex, 1, currentIndex);
        break;

      case prevKey:
        event.preventDefault();
        nextIndex = step(currentIndex, -1, currentIndex);
        break;

      case 'Home':
        event.preventDefault();
        nextIndex = step(tabs.length - 1, 1, 0);
        break;

      case 'End':
        event.preventDefault();
        nextIndex = step(0, -1, tabs.length - 1);
        break;

      default:
        return;
    }

    if (nextIndex !== currentIndex) {
      this.selectTab(nextIndex);
      this.focusTab(nextIndex);
    }
  }

  /**
   * Get tabindex for tab button
   */
  getTabIndex(index: number): number {
    return this.isSelected(index) ? 0 : -1;
  }

  /**
   * Move DOM focus to the tab button at `index` (roving tabindex).
   */
  private focusTab(index: number): void {
    this.tabButtons()[index]?.nativeElement.focus();
  }

  /**
   * Get last enabled tab index
   */
  private getLastEnabledTab(): number {
    const tabs = this.tabList();
    for (let i = tabs.length - 1; i >= 0; i--) {
      const tab = tabs[i];
      if (tab && !tab.disabled()) {
        return i;
      }
    }
    return tabs.length - 1;
  }
}
