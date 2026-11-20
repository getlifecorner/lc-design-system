import { resolve } from 'path';
import { compile } from 'sass';

/**
 * Request 072 (3.51, backlog 071-n6, AC-14, AC-15): the table head in RTL.
 * lc-table's rules are appended after `.lc-table__sr-only` (the byte pin in
 * sortable-head.component.spec.ts hashes only the CSS before it), each the LTR
 * rule it mirrors plus `:where(:dir(rtl))` (no weight), so it wins by order
 * and an app's `cellClass` / `cellStyle` still win as in LTR. In LTR every
 * computed value stays as 3.50 (`left`). The sortable head reads a private
 * value that `:host(:dir(rtl))` sets to `right`. Computed values (jsdom has
 * no `:dir()`) are measured on the story *RTL Head* at 360 and 1280 px.
 */
describe('table head in RTL (3.51, 071-n6)', () => {
  const tableCss = '\n' + compile(resolve(__dirname, 'table.component.scss')).css;
  const headCss = '\n' + compile(resolve(__dirname, 'sortable-head.component.scss')).css;
  const rule = (css: string, selector: string) => {
    const start = css.indexOf(`\n${selector} {`);
    expect([selector, start > -1]).toEqual([selector, true]);
    return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
  };
  const RTL = ':where(:dir(rtl))';

  describe('lc-table', () => {
    const tail = tableCss.slice(tableCss.search(/\n\.lc-table__sr-only \{/));

    it('head cells align right; the sortable reserve and arrow move left (sm, md, lg)', () => {
      expect(rule(tail, `.lc-table thead tr th${RTL}`)).toBe('text-align: right;');
      expect(rule(tail, `.lc-table thead tr th.sortable${RTL}`)).toBe(
        'padding-right: var(--lc-density-padding-md, var(--spacing-4)); padding-left: var(--spacing-8);',
      );
      expect(rule(tail, `.lc-table thead tr th.sortable${RTL} .sort-indicator`)).toBe('right: auto; left: var(--spacing-3);');
      expect(rule(tail, `.lc-table--sm thead tr th.sortable${RTL}`)).toBe('padding-right: var(--lc-density-padding-sm, var(--spacing-3));');
      expect(rule(tail, `.lc-table--lg thead tr th.sortable${RTL}`)).toBe('padding-right: var(--spacing-5);');
    });

    it('actions: start goes right, end goes left (head and body cells)', () => {
      expect(rule(tail, `.lc-table thead tr th.lc-table__actions-cell--start${RTL},\n.lc-table tbody tr td.lc-table__actions-cell--start${RTL}`)).toBe('text-align: right;');
      expect(rule(tail, `.lc-table thead tr th.lc-table__actions-cell--end${RTL},\n.lc-table tbody tr td.lc-table__actions-cell--end${RTL}`)).toBe('text-align: left;');
    });

    it('every RTL rule is an LTR rule of the sheet plus :where(:dir(rtl)), after it (same weight, wins by order)', () => {
      const selectors = [...tail.matchAll(/\n([^{}\n@][^{}]*?) \{/g)].map((m) => m[1]).filter((s) => s.includes(RTL));
      expect(selectors).toHaveLength(7);
      for (const list of selectors) {
        for (const selector of list.split(/,\s*/)) {
          const ltr = selector.replace(RTL, '');
          const at = tableCss.indexOf(ltr);
          expect([ltr, at > -1 && at < tableCss.indexOf(selector)]).toEqual([ltr, true]);
        }
      }
    });

    it('AC-15: the LTR head rules are unchanged (left; the end cells were logical already)', () => {
      expect(rule(tableCss, '.lc-table thead tr th')).toMatch(/text-align: left;/);
      expect(rule(tableCss, '.lc-table thead tr th.sortable')).toMatch(/padding-right: var\(--spacing-8\);/);
      expect(rule(tableCss, '.lc-table thead tr th.lc-table__cell--end,\n.lc-table tbody tr td.lc-table__cell--end')).toMatch(/text-align: end;/);
      // the RTL rules sit after the byte-pinned part
      expect(tableCss.indexOf(RTL)).toBeGreaterThan(tableCss.search(/\n\.lc-table__sr-only \{/));
    });
  });

  describe('th[lcSortableHead]', () => {
    it('LTR keeps left (the mixin, then the private value with left as its fallback, same weight)', () => {
      const host = rule(headCss, ':host');
      expect(host).toContain('text-align: left; font-weight');
      expect(host).toContain('text-align: var(--_lc-sortable-head-align, left);');
      expect(host.indexOf('text-align: var(')).toBeGreaterThan(host.indexOf('text-align: left;'));
    });

    it('RTL: :host(:dir(rtl)) sets the private value to right; the end head keeps text-align: end', () => {
      expect(rule(headCss, ':host(:dir(rtl))')).toBe('--_lc-sortable-head-align: right;');
      expect(rule(headCss, ':host(.lc-sortable-head--end)')).toContain('text-align: end;');
    });
  });
});
