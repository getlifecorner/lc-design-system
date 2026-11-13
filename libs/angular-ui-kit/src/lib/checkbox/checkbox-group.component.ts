import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CheckboxComponent, CheckboxSize } from './checkbox.component';
import { CHECKBOX_GROUP, CheckboxGroupContext } from './checkbox-group.token';

let nextUniqueId = 0;

export type CheckboxGroupOrientation = 'vertical' | 'horizontal';

/**
 * A group of `lc-checkbox`es for a multiple choice: a native `<fieldset>` named
 * by its `<legend>`, with group help text and one group error, both linked by
 * `aria-describedby`. The group passes its `size`, `disabled` and invalid state
 * to every checkbox inside and holds the `value`s of the checked ones
 * (`[(value)]` or a form control on the group).
 *
 * Always set `legend` (hide it with `legendHidden`): it is the group's name.
 * `required` marks the group, not the checkboxes (a required checkbox must be
 * checked); validate the value (e.g. `Validators.required`) and set `error`.
 *
 * @example
 * ```html
 * <lc-checkbox-group legend="Rollen" helpText="Mehrere Rollen sind möglich." [required]="true"
 *                    requiredAriaLabel="Pflichtfeld" [error]="rolesError" [(value)]="roles">
 *   <lc-checkbox value="administration" label="Administration" />
 *   <lc-checkbox value="controlling" label="Controlling" />
 *   <lc-checkbox value="cfo" label="CFO" />
 * </lc-checkbox-group>
 * ```
 */
@Component({
  selector: 'lc-checkbox-group',
  templateUrl: './checkbox-group.component.html',
  styleUrl: './checkbox-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: CHECKBOX_GROUP, useExisting: forwardRef(() => CheckboxGroupComponent) },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CheckboxGroupComponent), multi: true },
  ],
})
export class CheckboxGroupComponent implements CheckboxGroupContext, ControlValueAccessor {
  /**
   * The group's question, rendered as the `<legend>` (its accessible name).
   * @default ''
   */
  readonly legend = input<string>('');

  /**
   * Hide the legend visually; screen readers still read it.
   * @default false
   */
  readonly legendHidden = input<boolean>(false);

  /**
   * Help for the whole group, below the legend; describes the group.
   * @default ''
   */
  readonly helpText = input<string>('');

  /**
   * One error for the whole group, below the checkboxes: shown and announced
   * once, describes the group and marks every checkbox invalid.
   * @default ''
   */
  readonly error = input<string>('');

  /**
   * The group needs an answer: `*` after the legend, and the group's name ends
   * in `requiredAriaLabel`. The checkboxes stay optional (a required checkbox
   * must be checked); validate the value (e.g. `Validators.required`) and set `error`.
   * @default false
   */
  readonly required = input<boolean>(false);

  /**
   * Show the `*` marker (and its spoken label) after the legend of a required group.
   * @default true
   */
  readonly requiredIndicator = input<boolean>(true);

  /**
   * Spoken label of the `*` marker.
   * @default 'required'
   */
  readonly requiredAriaLabel = input<string>('required');

  /**
   * Disables the fieldset and every checkbox in it.
   * @default false
   */
  readonly disabled = input<boolean>(false);

  /**
   * `vertical` stacks the checkboxes; `horizontal` puts them in a row that wraps.
   * @default 'vertical'
   */
  readonly orientation = input<CheckboxGroupOrientation>('vertical');

  /**
   * Size of every checkbox in the group; a `size` bound on a checkbox wins.
   * `lg` rows are 44 px touch targets.
   * @default 'md'
   */
  readonly size = input<CheckboxSize>('md');

  /**
   * The `value`s of the checked checkboxes, in the order of the checkboxes
   * (two-way bindable, or a form control on the group). Checkboxes without a
   * `value` are not part of it. Emits `valueChange` on every toggle and every form write.
   * @default []
   */
  readonly value = model<string[]>([]);

  readonly groupId = `lc-checkbox-group-${nextUniqueId++}`;
  readonly helpId = `${this.groupId}-help`;
  readonly errorId = `${this.groupId}-error`;

  private readonly checkboxes = contentChildren(CheckboxComponent, { descendants: true });
  private readonly formDisabled = signal(false);
  private onChange: (value: string[]) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  readonly groupSize = computed(() => this.size());
  readonly groupDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly groupInvalid = computed(() => !!this.error());
  readonly selectedValues = computed<readonly string[]>(() => this.value());

  protected readonly describedBy = computed(() => {
    const ids: string[] = [];
    if (this.helpText()) ids.push(this.helpId);
    if (this.error()) ids.push(this.errorId);
    return ids.length ? ids.join(' ') : null;
  });

  /**
   * The next value after a checkbox changed: the checked values of the
   * checkboxes in their order, then written values that match no checkbox
   * (kept, never dropped), without duplicates. A checkbox the group can't see
   * as content (inside another component's template) toggles its value at the end.
   */
  toggle(value: string, checked: boolean): void {
    if (this.groupDisabled() || !value) return;
    const current = this.value();
    const own = this.checkboxes()
      .map((box) => box.value())
      .filter((v) => v !== '');
    const known = new Set(own);
    const isOn = (v: string) => (v === value ? checked : current.includes(v));
    const rest = current.filter((v) => !known.has(v) && v !== value);
    if (checked && !known.has(value)) rest.push(value);
    const next = [...new Set([...own.filter(isOn), ...rest])];
    this.value.set(next);
    this.onChange(next);
  }

  touch(): void {
    this.onTouched();
  }

  writeValue(value: string[] | null | undefined): void {
    this.value.set(Array.isArray(value) ? [...value] : []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }
}
