import { resolve } from 'path';
import { compile } from 'sass';

/**
 * 3.42 (request 062 AC-18, usm-x row 15): the lc-chip pattern for the badge.
 * Variants set private colours (`--_lc-badge-*`); the base rule reads the
 * public hooks first, so `--lc-badge-bg / -fg / -border` set on the badge, its
 * host, an ancestor or `:root` win over every variant. The defaults resolve to
 * the old values (screenshots of all badge stories identical, build.md).
 */
const css = '\n' + compile(resolve(__dirname, 'badge.component.scss')).css;

function rule(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  expect([selector, start > -1]).toEqual([selector, true]);
  return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
}

describe('lc-badge colour hooks win from any ancestor (3.42, request 062)', () => {
  it('the base rule reads the public hook, then the variant\'s private value', () => {
    // Sass emits the declarations after the nested size rules as a second `.lc-badge {}` block.
    const base = [...css.matchAll(/\n\.lc-badge \{([^}]*)\}/g)].map((m) => m[1].replace(/\s+/g, ' ')).join(' ');
    expect(base).toContain('background-color: var(--lc-badge-bg, var(--_lc-badge-bg));');
    expect(base).toContain('color: var(--lc-badge-fg, var(--_lc-badge-fg));');
    expect(base).toContain('border: 1px solid var(--lc-badge-border, var(--_lc-badge-border, transparent));');
  });

  it.each([
    ['default', 'var(--color-surface-hover)', 'var(--color-text-secondary)', 'var(--color-border)'],
    ['primary', 'var(--color-primary-subtle)', 'var(--color-on-primary-subtle)', 'var(--color-border-strong)'],
    ['success', 'var(--color-success-subtle)', 'var(--color-on-success-subtle)', 'rgba(142, 164, 117, 0.4)'],
    ['warning', 'var(--color-warning-subtle)', 'var(--color-on-warning-subtle)', 'rgba(225, 160, 64, 0.4)'],
    ['error', 'var(--color-error-subtle)', 'var(--color-on-error-subtle)', 'rgba(157, 14, 14, 0.4)'],
    ['info', 'var(--color-info-subtle)', 'var(--color-on-info-subtle)', 'rgba(59, 101, 136, 0.42)'],
  ])('variant %s sets only the private colours, with the 3.41 values', (variant, bg, fg, border) => {
    expect(rule(`.lc-badge--${variant}`)).toBe(
      `--_lc-badge-bg: ${bg}; --_lc-badge-fg: ${fg}; --_lc-badge-border: ${border};`,
    );
  });

  it('no rule of the badge declares a public hook any more', () => {
    expect(css).not.toMatch(/--lc-badge-(bg|fg|border)\s*:/);
  });
});
