/**
 * The row states `lc-sidenav` items (`NavigationItem`) and `lc-list` items
 * (`ListItem`) share (3.44, usm-x rows 14 and 20). One behaviour contract:
 *
 * - `busy`: a spinner in the row's leading slot, `aria-busy="true"` and
 *   `aria-disabled="true"`; click, Enter and Space are ignored (no output, no
 *   navigation) and the focus stays on the same element. The component's
 *   `busyLabel` is read after the row's text. The page announces the outcome.
 * - `disabled`: the row stays in place, dimmed, with `aria-disabled="true"`,
 *   and can't be activated. It is out of the tab order unless it has a
 *   `disabledReason`, which is its tooltip while disabled (on hover and on
 *   focus, `aria-describedby` while shown).
 * - `tooltip`: the kit tooltip on hover and on keyboard focus of the row;
 *   Escape hides it.
 */
export interface ItemRowState {
  /**
   * The row's action is running: spinner, `aria-busy`, activation ignored,
   * focus kept.
   */
  busy?: boolean;

  /** The row stays in place but can't be activated (`aria-disabled`). */
  disabled?: boolean;

  /**
   * Why the row is disabled: its tooltip while disabled, and it keeps the row
   * in the tab order so the reason is reachable by keyboard.
   */
  disabledReason?: string;

  /** The row's tooltip (hover and keyboard focus). */
  tooltip?: string;
}
