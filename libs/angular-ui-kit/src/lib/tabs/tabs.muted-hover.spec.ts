import { compile } from 'sass';
import { join } from 'path';

/**
 * Request 071 (3.50, usm-x row 85, AC-17): a muted tab keeps its tertiary ink
 * on hover (the hover fill stays); selected and focus styles are unchanged.
 * The contrast (tertiary on the hover fill over the page: 5.30 light, 6.64
 * dark, floored) is pinned in theme-contrast.spec.ts (`mutedOnHoverPage`).
 */
describe('lc-tabs muted tab on hover (3.50)', () => {
  const css = '\n' + compile(join(__dirname, 'tabs.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
  const HOVER = '\n.lc-tabs__tab:hover:not(.lc-tabs__tab--disabled) {';
  const MUTED_HOVER = '\n.lc-tabs__tab--muted:not(.lc-tabs__tab--selected):hover {';
  const body = (start: number) => css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');

  it('the generic hover rule keeps the primary ink and the hover fill', () => {
    expect(body(css.indexOf(HOVER))).toBe('color: var(--color-text-primary); background-color: var(--color-surface-hover);');
  });

  it('a muted, unselected tab keeps the tertiary ink on hover: same weight (0,3,0), written after the generic rule', () => {
    const at = css.indexOf(MUTED_HOVER);
    expect(at).toBeGreaterThan(css.indexOf(HOVER));
    expect(body(at)).toBe('color: var(--color-text-tertiary);');
    // no other rule sets a hover ink after it
    expect(css.slice(at + MUTED_HOVER.length).match(/:hover[^{]*\{[^}]*\bcolor:/g)).toBeNull();
  });

  it('the rule never touches a selected tab, the fill or the weight', () => {
    expect(MUTED_HOVER).toContain(':not(.lc-tabs__tab--selected)');
    expect(body(css.indexOf(MUTED_HOVER))).not.toMatch(/background|font-weight/);
  });
});
