import { join } from 'path';
import { compile } from 'sass';

/**
 * Request 068 (3.48, backlog 066-n1, design §3): the rules of a clickable
 * total row are pseudo-element borders, straight from the row's start to its
 * end at the old place, so they no longer bend at the row's rounded corners.
 */
describe('DescriptionListComponent clickable total row (3.48)', () => {
  const css = compile(join(__dirname, 'description-list.component.scss')).css;
  // The last match: `::after` also ends the shared `::before, ::after` list.
  const body = (selector: string) => {
    const at = css.lastIndexOf(`\n${selector} {`);
    expect([selector, at > -1]).toEqual([selector, true]);
    return css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at)).trim().replace(/\s+/g, ' ');
  };

  it('the row keeps the borders’ room as margins (1 px / 3 px; 0 / 3 px with a separator)', () => {
    expect(body('.lc-dl .lc-dl__row--total.lc-dl__row--clickable')).toBe('border-block: 0; margin-block: 1px 3px;');
    expect(
      body('.lc-dl--rows.lc-dl--sep-line .lc-dl__row.lc-dl__row--total.lc-dl__row--clickable,\n.lc-dl--rows.lc-dl--sep-divider .lc-dl__row.lc-dl__row--total.lc-dl__row--clickable'),
    ).toBe('border-block: 0; margin-block: 0 3px;');
  });

  it('a 1 px rule above (−1 px) and a 3 px double rule below (−3 px), across the row, in the field border', () => {
    expect(body('.lc-dl__row--total.lc-dl__row--clickable::before,\n.lc-dl__row--total.lc-dl__row--clickable::after')).toBe(
      'content: ""; position: absolute; inset-inline: 0; box-sizing: border-box; pointer-events: none;',
    );
    expect(body('.lc-dl__row--total.lc-dl__row--clickable::before')).toBe('top: -1px; border-top: 1px solid var(--color-field-border);');
    expect(body('.lc-dl__row--total.lc-dl__row--clickable::after')).toBe(
      'bottom: -3px; height: 3px; border-block: 1px solid var(--color-field-border);',
    );
  });

  it('wins over the total rules (weight and order) and stays before the narrow-row rules', () => {
    const at = css.indexOf('\n.lc-dl .lc-dl__row--total.lc-dl__row--clickable {');
    expect(at).toBeGreaterThan(css.indexOf('\n.lc-dl--rows.lc-dl--sep-line .lc-dl__row.lc-dl__row--total,'));
    expect(at).toBeLessThan(css.indexOf('\n.lc-dl--rows > .lc-dl__row {'));
  });
});
