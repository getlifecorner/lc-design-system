import { InjectionToken, Signal } from '@angular/core';
import type { CheckboxSize } from './checkbox.component';

/**
 * What an `lc-checkbox` inside an `lc-checkbox-group` reads from its group:
 * the size, the group's states and the checked values. Provided by
 * `CheckboxGroupComponent`; a checkbox without a group works on its own as before.
 */
export interface CheckboxGroupContext {
  /** Size of every checkbox that has no `size` bound itself. */
  readonly groupSize: Signal<CheckboxSize>;
  readonly groupDisabled: Signal<boolean>;
  readonly groupInvalid: Signal<boolean>;
  /** The `value`s of the checked checkboxes. */
  readonly selectedValues: Signal<readonly string[]>;
  /** Called by a checkbox with a `value` that the person checks or unchecks. */
  toggle(value: string, checked: boolean): void;
  /** Called when a checkbox loses focus (marks a bound form control touched). */
  touch(): void;
}

export const CHECKBOX_GROUP = new InjectionToken<CheckboxGroupContext>('CHECKBOX_GROUP');
