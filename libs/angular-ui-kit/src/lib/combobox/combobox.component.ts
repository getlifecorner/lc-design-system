import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  afterRenderEffect,
  effect,
  forwardRef,
  ElementRef,
  viewChild,
  HostListener,
  inject,
  isDevMode,
  model,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OverlayModule, type ConnectedPosition } from '@angular/cdk/overlay';
import { Observable, Subject, catchError, debounce, defer, of, switchMap, timer } from 'rxjs';
import { IconComponent, ɵprovideKitIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_PLUS, ICON_X_MARK } from '@lifecorner/angular-ui-kit/icons';
import { SpinnerComponent } from '@lifecorner/angular-ui-kit/spinner';
import { ChipComponent } from '@lifecorner/angular-ui-kit/chip';
import { openPanelLang } from '@lifecorner/angular-ui-kit/internal/a11y';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  group?: string;
  disabled?: boolean;
}

export type ComboboxValue = ComboboxOption | ComboboxOption[] | null;

export type ComboboxSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Combobox / async autocomplete component.
 *
 * Supports free-text input with sync/async option suggestions,
 * single/multiple selection, create new entries, and keyboard navigation.
 * The suggestion list is rendered in a CDK overlay so it is never clipped
 * by `overflow: hidden` ancestors (cards, modals, table cells). The dropdown
 * takes the `lang` of the host's closest `[lang]` (3.30.2).
 *
 * The selection is two-way bindable by an option's `value` string
 * (`[(selectedValue)]`, single mode), next to the `valueChange` output with
 * the option object and the forms binding.
 *
 * `focus()` (3.35) moves the focus into the field's `<input>` when a form
 * opens or after a rejected save (WCAG 2.4.3); it opens the list as a user's
 * focus does (`openOnFocus`).
 *
 * @example
 * ```html
 * <lc-combobox
 *   label="Assign to user"
 *   [loadOptions]="searchUsers"
 *   [(selectedValue)]="assigneeId"
 *   allowCreate
 * />
 * ```
 */
@Component({
  selector: 'lc-combobox',
  standalone: true,
  imports: [OverlayModule, IconComponent, SpinnerComponent, ChipComponent],
  viewProviders: [ɵprovideKitIcons([ICON_X_MARK, ICON_PLUS])],
  templateUrl: './combobox.component.html',
  styleUrls: ['./combobox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComboboxComponent),
      multi: true,
    },
  ],
})
export class ComboboxComponent implements ControlValueAccessor {
  private static nextId = 0;

  /** Per-instance ids so label/listbox/options can be linked via ARIA */
  readonly inputId = `lc-combobox-${++ComboboxComponent.nextId}`;
  readonly listboxId = `${this.inputId}-listbox`;
  protected readonly createOptionId = `${this.listboxId}-create`;

  private readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('inputEl');
  private readonly dropdownEl = viewChild<ElementRef<HTMLElement>>('dropdownEl');
  private readonly inputWrapper = viewChild<ElementRef<HTMLElement>>('inputWrapper');

  private readonly elRef = inject(ElementRef);
  private readonly querySubject = new Subject<string>();

  /** Sync options */
  readonly options = input<ComboboxOption[]>([]);

  /** Async option loader */
  readonly loadOptions = input<((query: string) => Observable<ComboboxOption[]>)>();

  /** Debounce for async queries */
  readonly debounceMs = input<number>(250);

  /** Minimum characters before triggering search */
  readonly minChars = input<number>(1);

  /** Placeholder text */
  readonly placeholder = input<string>('Search…');

  /** Label */
  readonly label = input<string>();

  /** Helper text */
  readonly helperText = input<string>();

  /** Error message */
  readonly error = input<string>();

  /** Disabled state */
  readonly disabled = input<boolean>(false);

  /** Allow multiple selections */
  readonly multiple = input<boolean>(false);

  /** Allow creating new entries */
  readonly allowCreate = input<boolean>(false);

  /** Show loading spinner (controlled) */
  readonly loading = input<boolean>(false);

  /** Empty state message */
  readonly emptyMessage = input<string>('No results');

  /** Accessible name of the clear button. */
  readonly clearAriaLabel = input('Clear');

  /** Label before the query in the "create" option (`allowCreate`): `Create "query"`. */
  readonly createOptionLabel = input('Create');

  /** Size */
  readonly size = input<ComboboxSize>('md');

  /**
   * Whether the list opens when the field gets focus (3.32, request 051).
   * With `false`, focus alone (`focus()` from the page, Tab) leaves the list
   * closed and `aria-expanded="false"`; a click or tap on the field, typing or
   * ArrowDown opens it. Use it in forms that move focus into the field
   * themselves, on open or to the first invalid field after a rejected save.
   * Escape and choosing an option work as before.
   * @default true
   */
  readonly openOnFocus = input<boolean>(true);

  /**
   * The `value` of the selected option, two-way (3.29, regeln row 2):
   * `[(selectedValue)]="month"`. Shows the matching option's label (from
   * `options`, or the current selection); an unknown value shows an empty
   * field and is filled in when `options` with it arrive. Page writes
   * (including back to `null`) select or clear silently: no
   * `selectedValueChange`, no `valueChange`, no forms `onChange`. Every user
   * choice or clear emits `selectedValueChange`, next to the unchanged
   * `valueChange` (the option object). Single mode only: ignored with
   * `multiple` (a dev warning). Use it or a forms binding, not both.
   * @default null
   */
  readonly selectedValue = model<string | null>(null);

  /** Value change event */
  readonly valueChange = output<ComboboxValue>();

  /** Query change event */
  readonly queryChange = output<string>();

  /** Option selected event */
  readonly optionSelected = output<ComboboxOption>();

  /** Created event (allowCreate) */
  readonly created = output<string>();

  /** Internal state */
  protected query = signal('');
  protected isOpen = signal(false);
  protected highlightedIndex = signal(-1);
  protected asyncOptions = signal<ComboboxOption[]>([]);
  protected isLoading = signal(false);

  /** Disabled via `setDisabledState` (reactive forms) */
  private readonly formDisabled = signal(false);

  /** Effective disabled state: `disabled` input OR form control disabled */
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  /**
   * `lang` of the open dropdown (3.30.2, WCAG 3.1.2): the overlay renders under
   * `<body>`, so it takes the host's closest `[lang]`, else none. Read at every
   * opening and, since 3.33, again when a `lang` changes while the list is
   * open; `null` while closed, so the server never reads the DOM.
   */
  protected readonly panelLang = openPanelLang(this.isOpen);

  /**
   * The field's width in px while the list is open (3.33, request 052,
   * 049-n2), read at every opening: the list's floor (`min-width`), so it is
   * at least as wide as the field and wider content still grows it. `null`
   * while closed.
   */
  protected readonly fieldWidth = computed(() =>
    this.isOpen() ? (this.inputWrapper()?.nativeElement.getBoundingClientRect().width ?? null) : null,
  );

  /**
   * Below the field, else above it, start- then end-aligned (the CDK's
   * defaults), 4 px from the field on either side (3.33, 047-n1: the gap was
   * a margin inside the pane, so it was 0 above). The list is never pushed,
   * so the offset can't move it off the field.
   */
  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 4 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -4 },
  ];

  /** Selected values */
  protected selectedSingle = signal<ComboboxOption | null>(null);
  protected selectedMultiple = signal<ComboboxOption[]>([]);

  /** The last `selectedValue` the component applied or emitted: a different one is a page write. */
  private seenSelectedValue: string | null = null;

  /** A page-written `selectedValue` no option matched yet: selected silently once `options` hold it. */
  private pendingSelectedValue: string | null = null;

  /** Resolved visible options */
  protected visibleOptions = computed(() => {
    const q = this.query().toLowerCase();
    const loader = this.loadOptions();

    let opts: ComboboxOption[];
    if (loader) {
      opts = this.asyncOptions();
    } else {
      opts = this.options();
      if (q.length >= this.minChars()) {
        opts = opts.filter(
          (o) =>
            o.label.toLowerCase().includes(q) ||
            o.value.toLowerCase().includes(q) ||
            (o.description && o.description.toLowerCase().includes(q))
        );
      }
    }

    // Remove already selected in multiple mode
    if (this.multiple()) {
      const selected = new Set(this.selectedMultiple().map((s) => s.value));
      opts = opts.filter((o) => !selected.has(o.value));
    }

    return opts;
  });

  /** Grouped options */
  protected groupedOptions = computed(() => {
    const opts = this.visibleOptions();
    const groups = new Map<string, ComboboxOption[]>();

    for (const opt of opts) {
      const group = opt.group || '';
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(opt);
    }

    return Array.from(groups.entries()).map(([label, items]) => ({
      label,
      items,
    }));
  });

  /** Flat list for keyboard nav */
  protected flatOptions = computed(() => {
    return this.groupedOptions().flatMap((g) => g.items);
  });

  /** Whether to show "Create" option */
  protected showCreateOption = computed(() => {
    if (!this.allowCreate()) return false;
    const q = this.query().trim();
    if (!q) return false;
    const exact = this.visibleOptions().some(
      (o) => o.label.toLowerCase() === q.toLowerCase()
    );
    return !exact;
  });

  /** id of the highlighted option — announced via aria-activedescendant */
  protected readonly activeDescendantId = computed(() => {
    if (!this.isOpen()) return null;
    const i = this.highlightedIndex();
    if (i < 0) return null;
    if (i === this.flatOptions().length) {
      return this.showCreateOption() ? this.createOptionId : null;
    }
    return i < this.flatOptions().length ? this.optionId(i) : null;
  });

  /** ids referenced by aria-describedby (helper / error) */
  protected readonly describedBy = computed(() => {
    if (this.error()) return `${this.inputId}-error`;
    if (this.helperText()) return `${this.inputId}-helper`;
    return null;
  });

  /** Container classes */
  protected containerClasses = computed(() => {
    const classes = [`lc-combobox`, `lc-combobox--${this.size()}`];
    if (this.isDisabled()) classes.push('lc-combobox--disabled');
    if (this.error()) classes.push('lc-combobox--error');
    if (this.isOpen()) classes.push('lc-combobox--open');
    return classes.join(' ');
  });

  protected optionId(index: number): string {
    return `${this.listboxId}-opt-${index}`;
  }

  // ControlValueAccessor
  private onChange: (value: ComboboxValue) => void = () => { /* set by registerOnChange */ };
  private onTouched: () => void = () => { /* set by registerOnTouched */ };

  constructor() {
    // Async loading pipe. `debounce` (not `debounceTime`) reads the signal per
    // emission, so `debounceMs` is honoured after inputs are populated.
    this.querySubject
      .pipe(
        debounce(() => timer(this.debounceMs())),
        switchMap((q) => {
          const loader = this.loadOptions();
          if (!loader || q.length < this.minChars()) {
            return of([] as ComboboxOption[]);
          }
          this.isLoading.set(true);
          // `defer` turns a synchronously throwing loader into an error
          // notification; `catchError` keeps the pipe alive for the next query.
          return defer(() => loader(q)).pipe(catchError(() => of([] as ComboboxOption[])));
        }),
        takeUntilDestroyed()
      )
      .subscribe((results) => {
        this.asyncOptions.set(results);
        this.isLoading.set(false);
      });

    // Keep the highlighted option visible while navigating with the keyboard
    // (after render, so the option element exists in the overlay pane).
    afterRenderEffect(() => {
      const id = this.activeDescendantId();
      if (!id) return;
      untracked(() => {
        // ids are generated from a counter, so no CSS escaping is needed
        this.dropdownEl()
          ?.nativeElement.querySelector<HTMLElement>(`#${id}`)
          ?.scrollIntoView?.({ block: 'nearest' });
      });
    });

    // `selectedValue` (3.29): a page write selects or clears silently; an
    // unknown value waits for `options` that hold it. The component's own
    // writes (user choice, clear) are already applied, so they are skipped.
    effect(() => {
      const value = this.selectedValue();
      const options = this.options();
      untracked(() => {
        if (value !== this.seenSelectedValue) {
          this.seenSelectedValue = value;
          if (!this.multiple()) {
            this.applySelectedValue(value, options);
          } else if (value !== null && isDevMode()) {
            console.warn('[lc-combobox] selectedValue is ignored with multiple');
          }
        } else if (this.pendingSelectedValue !== null && !this.multiple()) {
          this.applySelectedValue(this.pendingSelectedValue, options);
        }
      });
    });
  }

  /** Shows the option with `value` (or clears for `null`) without emitting anything. */
  private applySelectedValue(value: string | null, options: ComboboxOption[]): void {
    this.pendingSelectedValue = null;
    if (value === null) {
      this.selectedSingle.set(null);
      this.query.set('');
      return;
    }
    if (this.selectedSingle()?.value === value) return;
    const match = options.find((o) => o.value === value) ?? null;
    if (!match) this.pendingSelectedValue = value;
    this.selectedSingle.set(match);
    this.query.set(match ? match.label : '');
  }

  /** Emits a user's single choice or clear through `selectedValueChange` (not in `multiple` mode). */
  private emitSelectedValue(value: string | null): void {
    if (this.multiple()) return;
    this.pendingSelectedValue = null;
    this.seenSelectedValue = value;
    this.selectedValue.set(value);
  }

  writeValue(value: ComboboxValue): void {
    if (this.multiple()) {
      this.selectedMultiple.set(Array.isArray(value) ? value : []);
    } else {
      const single = value && !Array.isArray(value) ? value : null;
      this.pendingSelectedValue = null;
      this.selectedSingle.set(single);
      this.query.set(single ? single.label : '');
    }
  }

  registerOnChange(fn: (value: ComboboxValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    if (isDisabled) this.isOpen.set(false);
  }

  /**
   * Moves the focus into the field's `<input>` (3.35), e.g. when a form opens
   * with this field first, or to the field with the error after a rejected
   * save (422) (WCAG 2.4.3). `options` as for `HTMLElement.focus()`
   * (`{ preventScroll: true }`). Shows the same focus ring as a user's focus.
   * Like a user's focus it opens the list when `openOnFocus` is `true` and
   * there is something to show; with `false` the list stays closed
   * (`aria-expanded="false"`). A disabled field takes no focus (it stays where
   * it is). Call it once the field has rendered, e.g.
   * `afterNextRender(() => this.month().focus(), { injector })` with
   * `month = viewChild.required(ComboboxComponent)` and the page component's
   * `injector = inject(Injector)`. In an `lc-modal` that opens with the field,
   * that call runs after the dialog moved the focus to its first control.
   * Does nothing before the component has rendered.
   * @param options Passed to the native `focus()`.
   */
  focus(options?: FocusOptions): void {
    this.inputEl()?.nativeElement.focus(options);
  }

  /**
   * Clear the current selection and query. Emits `null` (single) or `[]`
   * (multiple) exactly once, like a user-initiated deselect.
   */
  clear(): void {
    this.query.set('');
    this.highlightedIndex.set(-1);
    this.isOpen.set(false);
    const value: ComboboxValue = this.multiple() ? [] : null;
    if (this.multiple()) {
      this.selectedMultiple.set([]);
    } else {
      this.selectedSingle.set(null);
    }
    this.onChange(value);
    this.valueChange.emit(value);
    this.emitSelectedValue(null);
  }

  protected onClearClick(): void {
    if (this.isDisabled()) return;
    this.clear();
    this.inputEl()?.nativeElement.focus();
  }

  /** Whether a pointer event on the frame hit the input or a button in it (chip ×, clear). */
  private hitsFrameControl(event: MouseEvent): boolean {
    const target = event.target as Element | null;
    if (!target || target === this.inputEl()?.nativeElement) return true;
    const button = target.closest('button');
    return !!button && (event.currentTarget as Element).contains(button);
  }

  /**
   * 3.30 (request 047, regeln row 6): a press on the frame beside the input
   * and its buttons keeps focus where it is (no blur, so the list stays open).
   */
  protected onFrameMousedown(event: MouseEvent): void {
    if (!this.hitsFrameControl(event)) event.preventDefault();
  }

  /**
   * A click on the frame beside the input and its buttons focuses the input.
   * With `openOnFocus` off (3.32, request 051), a click or tap on the input or
   * the frame also opens the list, which focus alone no longer does.
   */
  protected onFrameClick(event: MouseEvent): void {
    if (this.isDisabled()) return;
    const onInput = event.target === this.inputEl()?.nativeElement;
    if (!onInput) {
      if (this.hitsFrameControl(event)) return;
      this.inputEl()?.nativeElement.focus();
    }
    if (!this.openOnFocus()) this.openIfAny();
  }

  protected onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.queryChange.emit(value);
    this.highlightedIndex.set(-1);

    if (this.loadOptions()) {
      this.querySubject.next(value);
    }

    if (value.length >= this.minChars()) {
      this.isOpen.set(true);
    }
  }

  protected onInputFocus(): void {
    if (this.openOnFocus()) this.openIfAny();
  }

  /** Opens the list when there is something to show: a long enough query, or options. */
  private openIfAny(): void {
    if (this.query().length >= this.minChars() || this.options().length > 0) {
      this.isOpen.set(true);
    }
  }

  protected onInputBlur(): void {
    this.onTouched();
    // Delay to allow click on dropdown
    setTimeout(() => this.isOpen.set(false), 200);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const flat = this.flatOptions();
    const total = flat.length + (this.showCreateOption() ? 1 : 0);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.isOpen.set(true);
        if (total > 0) this.highlightedIndex.update((i) => (i + 1) % total);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (total > 0) this.highlightedIndex.update((i) => (i - 1 + total) % total);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex() >= 0) {
          if (this.highlightedIndex() === flat.length && this.showCreateOption()) {
            this.onCreateNew();
          } else {
            const opt = flat[this.highlightedIndex()];
            if (opt && !opt.disabled) {
              this.selectOption(opt);
            }
          }
        } else if (this.showCreateOption()) {
          this.onCreateNew();
        }
        break;
      case 'Escape':
        if (this.isOpen()) {
          this.isOpen.set(false);
          this.highlightedIndex.set(-1);
          // Escape consumed by the list — an enclosing modal must not close too.
          event.stopPropagation();
        }
        break;
      case 'Tab':
        if (this.highlightedIndex() >= 0 && this.isOpen()) {
          const opt = flat[this.highlightedIndex()];
          if (opt && !opt.disabled) {
            this.selectOption(opt);
          }
        }
        this.isOpen.set(false);
        break;
      case 'Backspace':
        if (this.multiple() && !this.query() && this.selectedMultiple().length > 0) {
          this.removeSelected(this.selectedMultiple()[this.selectedMultiple().length - 1]);
        }
        break;
    }
  }

  protected selectOption(option: ComboboxOption): void {
    if (this.multiple()) {
      this.selectedMultiple.update((sel) => [...sel, option]);
      this.query.set('');
      const value = this.selectedMultiple();
      this.onChange(value);
      this.valueChange.emit(value);
    } else {
      this.selectedSingle.set(option);
      this.query.set(option.label);
      this.onChange(option);
      this.valueChange.emit(option);
      this.emitSelectedValue(option.value);
    }
    this.optionSelected.emit(option);
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
  }

  protected removeSelected(option: ComboboxOption): void {
    if (this.isDisabled()) return;
    this.selectedMultiple.update((sel) =>
      sel.filter((s) => s.value !== option.value)
    );
    const value = this.selectedMultiple();
    this.onChange(value);
    this.valueChange.emit(value);
    this.inputEl()?.nativeElement.focus();
  }

  protected onCreateNew(): void {
    const q = this.query().trim();
    if (!q) return;
    const newOption: ComboboxOption = { value: q, label: q };
    this.created.emit(q);
    this.selectOption(newOption);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    // The dropdown lives in the CDK overlay container, outside the host element.
    if (
      !this.elRef.nativeElement.contains(target) &&
      !this.dropdownEl()?.nativeElement.contains(target)
    ) {
      this.isOpen.set(false);
    }
  }
}
