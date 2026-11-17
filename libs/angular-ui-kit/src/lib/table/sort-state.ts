/**
 * Sort helpers shared by `lc-table`'s head and `th[lcSortableHead]` (3.45).
 * Internal to the `table` entry: not re-exported by its `index.ts`.
 */

/** The next direction of a column on click, Enter or Space: `asc`, unless it is `asc` already. */
export function nextSortDirection(current: 'asc' | 'desc' | null | undefined): 'asc' | 'desc' {
  return current === 'asc' ? 'desc' : 'asc';
}

/** `aria-sort` of a header cell in a direction; `null` (no attribute) when unsorted. */
export function ariaSortOf(direction: 'asc' | 'desc' | null | undefined): 'ascending' | 'descending' | null {
  if (direction === 'asc') return 'ascending';
  if (direction === 'desc') return 'descending';
  return null;
}
