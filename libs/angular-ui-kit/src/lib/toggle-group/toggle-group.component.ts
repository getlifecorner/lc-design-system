import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  input,
  output,
  computed,
  model,
  viewChildren,
} from '@angular/core';
import { NgClass } from '@angular/common';

export type ToggleOptionDot = 'warning' | 'error' | 'success';

export interface ToggleOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
  /**
   * Small status dot rendered to the right of the label (e.g. an unread
   * indicator). `true` uses the default tone (`warning`); pass a tone name
   * to pick a semantic color. Does not change the option's height.
   */
  readonly dot?: boolean | ToggleOptionDot;
}

/**
 * Toggle group component for single-option selection from a set.
 *
 * Features:
 * - Multiple segmented toggle buttons
 * - Active state highlighting
 * - Size variants (sm, md, lg)
 * - Two-way selected value binding
 * - Per-option disabled state
 * - Exposed as a radiogroup: Arrow/Home/End keys move the selection
 * - Dark mode support via CSS custom properties
 *
 * @example
 * ```html
 * <lc-toggle-group
 *   [options]="[{value:'1D',label:'1D'},{value:'1W',label:'1W'}]"
 *   [(selected)]="interval"
 * />
 * ```
 */
@Component({
  selector: 'lc-toggle-group',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toggle-group.component.html',
  styleUrl: './toggle-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleGroupComponent {
  /** Available toggle options */
  options = input.required<readonly ToggleOption[]>();

  /** Currently selected value (two-way binding) */
  selected = model<string>('');

  /** Size variant */
  size = input<'sm' | 'md' | 'lg'>('md');

  /** Accessible name of the group */
  readonly ariaLabel = input<string>();

  /** id(s) of external element(s) labelling the group (wins over `ariaLabel`) */
  readonly ariaLabelledBy = input<string>();

  /**
   * Each option gets a hit area of at least 44 × 44 px (3.50, WCAG 2.5.5):
   * a transparent extension above and below the option (lg 2, md 5.5, sm
   * 9 px at 100 % text; keep that space clear of other controls), and an
   * option narrower than 44 px grows to 44 px with its label centred.
   * Height, padding, type and colours of `sm`/`md`/`lg` stay as they are.
   * @default false
   */
  readonly touchTarget = input<boolean>(false);

  /** Emitted when selection changes */
  selectionChange = output<string>();

  /** Computed size class (plus the touch-target modifier when on) */
  sizeClass = computed(() => `lc-toggle-group--${this.size()}${this.touchTarget() ? ' lc-toggle-group--touch' : ''}`);

  /**
   * Roving tabindex: the selected option is the group's single tab stop; when
   * nothing (or a disabled option) is selected, the first enabled option is.
   */
  readonly focusableValue = computed(() => {
    const options = this.options();
    const selected = options.find((o) => o.value === this.selected() && !o.disabled);
    return (selected ?? options.find((o) => !o.disabled))?.value ?? null;
  });

  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('toggleBtn');

  /** Select an option */
  select(option: ToggleOption): void {
    if (option.disabled) return;
    this.selected.set(option.value);
    this.selectionChange.emit(option.value);
  }

  /** Check if an option is active */
  isActive(option: ToggleOption): boolean {
    return this.selected() === option.value;
  }

  /** tabindex for an option button (roving tabindex) */
  tabIndexFor(option: ToggleOption): number {
    return option.value === this.focusableValue() ? 0 : -1;
  }

  /** Arrow/Home/End keys move focus and selection like a native radio group */
  onKeydown(event: KeyboardEvent, index: number): void {
    const options = this.options();
    let target: number | undefined;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        target = this.nextEnabled(index, 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        target = this.nextEnabled(index, -1);
        break;
      case 'Home':
        target = this.nextEnabled(-1, 1);
        break;
      case 'End':
        target = this.nextEnabled(options.length, -1);
        break;
      default:
        return;
    }

    event.preventDefault();
    if (target === undefined || target === index) return;

    this.select(options[target]);
    this.buttons()[target]?.nativeElement.focus();
  }

  /** Get button classes */
  getButtonClasses(option: ToggleOption): string {
    const classes = ['lc-toggle-group__btn'];

    if (this.isActive(option)) {
      classes.push('lc-toggle-group__btn--active');
    }
    if (option.disabled) {
      classes.push('lc-toggle-group__btn--disabled');
    }

    return classes.join(' ');
  }

  /** Resolve the dot tone for an option (null when no dot is shown) */
  dotTone(option: ToggleOption): ToggleOptionDot | null {
    if (!option.dot) return null;
    return option.dot === true ? 'warning' : option.dot;
  }

  /** Index of the next enabled option in `direction`, wrapping around */
  private nextEnabled(from: number, direction: 1 | -1): number | undefined {
    const options = this.options();
    for (let step = 1; step <= options.length; step++) {
      const i = (from + direction * step + options.length) % options.length;
      if (!options[i].disabled) return i;
    }
    return undefined;
  }
}
