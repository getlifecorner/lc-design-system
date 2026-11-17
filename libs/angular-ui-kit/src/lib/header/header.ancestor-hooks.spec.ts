import { compile } from 'sass';
import { join } from 'path';

/**
 * Request 064 (3.44, usm-x row 4, AC-1): the documented `--lc-header-*` hooks
 * are read, never declared on the header (only `variant="transparent"`
 * declares two on itself), so a value on any ancestor or on the host wins
 * over the variant defaults; the bar paints `background` (a gradient works);
 * the sticky layer sits below `lc-modal` (backdrop 999, dialog 1000).
 */
describe('lc-header hooks from an ancestor and its layer (3.44)', () => {
  const css = '\n' + compile(join(__dirname, 'header.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
  const modal = compile(join(__dirname, '../modal/modal.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
  const rule = (selector: string): string => {
    const start = css.indexOf(`\n${selector} {`);
    expect([selector, start > -1]).toEqual([selector, true]);
    return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
  };
  const HOOKS = ['bg', 'fg', 'fg-secondary', 'border', 'hover-bg', 'trigger-border', 'trigger-fg'];

  it('declares the public hooks only in the transparent variant (on itself, as before)', () => {
    const declared = [...css.matchAll(/\n([^\n{}]+)\{[^}]*?(--lc-header-(?:bg|fg|fg-secondary|border|hover-bg|trigger-border|trigger-fg)):/g)].map(
      (m) => m[1].trim(),
    );
    expect([...new Set(declared)]).toEqual(['.lc-header.lc-header--transparent']);
  });

  it.each([
    ['.lc-header', ['var(--color-surface)', 'var(--color-text-primary)', 'var(--color-text-secondary)', 'var(--color-border)', 'var(--color-surface-hover)', 'var(--color-border)', 'var(--color-text-secondary)']],
    ['.lc-header--dark', ['#070e15', '#f1f6f8', '#c4d2d9', 'rgba(255, 255, 255, 0.08)', 'rgba(132, 199, 212, 0.06)', 'rgba(255, 255, 255, 0.08)', '#c4d2d9']],
    ['.lc-header--light', ['#ffffff', '#111827', '#4b5563', '#e5e7eb', '#f3f4f6', '#e5e7eb', '#374151']],
  ])('%s reads each hook first, with the 3.43 value as its fallback', (selector, defaults) => {
    const body = rule(selector);
    HOOKS.forEach((hook, i) => expect(body).toContain(`--_lc-header-${hook}: var(--lc-header-${hook}, ${defaults[i]});`));
  });

  it('paints the bar with `background` (a gradient works) and the private values everywhere else', () => {
    const bar = rule('.lc-header');
    expect(bar).toContain('background: var(--_lc-header-bg);');
    expect(bar).not.toContain('background-color:');
    expect(bar).toContain('border-bottom: 1px solid var(--_lc-header-border);');
    expect(css).not.toMatch(/var\(--lc-header-(?:bg|fg|fg-secondary|border|hover-bg|trigger-border|trigger-fg)\)/);
  });

  it('sits below lc-modal: z-index from --lc-header-z (default 900) < backdrop 999 < dialog 1000', () => {
    expect(rule('.lc-header')).toContain('z-index: var(--lc-header-z, 900);');
    const z = (selector: string) => Number(modal.slice(modal.indexOf(`${selector} {`)).match(/z-index:\s*(\d+)/)?.[1]);
    expect(z('.lc-modal-backdrop')).toBe(999);
    expect(z('.lc-modal')).toBe(1000);
    expect(900).toBeLessThan(z('.lc-modal-backdrop'));
  });
});
