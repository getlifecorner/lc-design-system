import { resolve } from 'path';
import { compile } from 'sass';

/**
 * 3.33 (request 052, F-30, AC-10): the selection checkbox sits on the row's
 * middle. jsdom has no layout: the rule is pinned in the compiled CSS, the
 * offsets (|Δ| ≤ 0.5 px, row heights unchanged) are measured in the stories.
 */
describe('lc-table — checkbox on the row middle (3.33, F-30)', () => {
  const css = compile(resolve(__dirname, 'table.component.scss')).css;
  const at = css.indexOf('\n.lc-table__checkbox {');
  const body = css.slice(at, css.indexOf('}', at));

  it('is a block centred in a content box as tall as its old line box', () => {
    expect(at).toBeGreaterThan(-1);
    expect(body).toMatch(/display: block;\s*margin: 2\.5px auto;\s*margin: max\(2\.5px, \(?(calc\()?\(1lh - 16px\) \/ 2\)?\)? auto;/);
  });

  it('keeps its 16 px box, its cursor and its ring', () => {
    expect(body).toMatch(/width: 16px;\s*height: 16px;/);
    expect(css).toMatch(/\.lc-table__checkbox:focus-visible \{\s*outline: 2px solid var\(--color-primary-500\);\s*outline-offset: 2px;/);
  });

  it('leaves the select cell (44 px column, padding) unchanged', () => {
    const cell = css.slice(css.indexOf('\n.lc-table__select-cell {'), css.indexOf('}', css.indexOf('\n.lc-table__select-cell {')));
    expect(cell).toContain('padding: var(--spacing-2) calc((var(--size-min-touch-height, 2.75rem) - 1rem) / 2) !important;');
  });
});
