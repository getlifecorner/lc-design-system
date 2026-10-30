import { compile } from 'sass';
import { resolve } from 'path';

/**
 * Request 020, row 7 (AC-14, AC-15): the public colour hooks reach the rail
 * from `lc-sidenav`, `lc-sidenav-placeholder` or any ancestor. The kit no
 * longer declares them on `:host` (a declaration on the element beat every
 * inherited value), so each read falls back to the theme's private variable.
 */
describe('lc-sidenav / lc-sidenav-placeholder — colour hooks on an ancestor (020)', () => {
  const HOOKS = ['bg', 'fg', 'fg-active', 'border', 'hover-bg', 'section-fg', 'active-bg', 'active-fg', 'active-icon', 'badge-ring'];
  const sheets = {
    sidenav: compile(resolve(__dirname, 'sidenav.component.scss')).css,
    placeholder: compile(resolve(__dirname, '../sidenav-placeholder/sidenav-placeholder.component.scss')).css,
  };
  const hook = `--lc-sidenav-(${HOOKS.join('|')})`;

  /** Every plain or nested rule as `selector → body` (bodies hold no braces in compiled CSS). */
  const rules = (css: string) =>
    [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
      selector: selector.trim().replace(/\s+/g, ' '),
      body,
    }));

  describe.each(Object.entries(sheets))('%s', (_name, css) => {
    it('declares none of the 10 colour hooks on a host rule (auto or theme)', () => {
      const hosts = rules(css).filter((r) => r.selector.includes(':host'));
      expect(hosts.length).toBeGreaterThanOrEqual(3);
      for (const r of hosts) {
        expect(r.body).not.toMatch(new RegExp(`(^|[;\\s])${hook}\\s*:`));
      }
    });

    it('sets a colour hook only for the transparent docked rail, on the inner element', () => {
      const setters = rules(css).filter((r) => new RegExp(`(^|[;\\s])${hook}\\s*:`).test(r.body));
      expect(setters.map((r) => r.selector)).toEqual(['.lc-sidenav--transparent.lc-sidenav--docked']);
    });

    it('reads every hook with the theme fallback: var(--lc-sidenav-X, var(--_lc-sidenav-t-X))', () => {
      const reads = [...css.matchAll(new RegExp(`var\\(${hook}([,)])\\s*([^;]*)`, 'g'))];
      expect(reads.length).toBeGreaterThan(0);
      for (const [text, name, next, rest] of reads) {
        expect({ text, next }).toEqual({ text, next: ',' });
        const fallback = name === 'badge-ring' ? 'var(--lc-sidenav-bg, var(--_lc-sidenav-t-bg))' : `var(--_lc-sidenav-t-${name}`;
        expect(rest.trim().startsWith(fallback)).toBe(true);
      }
    });
  });

  it('keeps the auto defaults of 3.14 as private host variables', () => {
    const host = rules(sheets.sidenav).find((r) => r.selector === ':host')?.body ?? '';
    const defaults: Record<string, string> = {
      bg: 'var(--color-sidebar, var(--color-surface))',
      fg: 'var(--color-text-secondary)',
      'fg-active': 'var(--color-text-primary)',
      border: 'var(--color-border)',
      'hover-bg': 'var(--color-surface-hover)',
      'section-fg': 'var(--color-text-tertiary)',
      'active-bg': 'var(--color-surface-selected)',
      'active-fg': 'var(--color-on-surface-selected, var(--color-link))',
      'active-icon': 'var(--color-on-surface-selected, var(--color-link))',
    };
    for (const [name, value] of Object.entries(defaults)) {
      expect(host).toContain(`--_lc-sidenav-t-${name}: ${value};`);
    }
    // The geometry stays on the host.
    expect(host).toContain('--lc-sidenav-rail-width: 56px;');
    // The placeholder's host holds the same three it paints with.
    const placeholderHost = rules(sheets.placeholder).find((r) => r.selector === ':host')?.body ?? '';
    for (const name of ['bg', 'fg', 'border']) {
      expect(placeholderHost).toContain(`--_lc-sidenav-t-${name}: ${defaults[name]};`);
    }
  });

  it('keeps the transparent rail transparent and its badge ring on the page colour', () => {
    const transparent = rules(sheets.sidenav).find((r) => r.selector === '.lc-sidenav--transparent.lc-sidenav--docked')?.body ?? '';
    expect(transparent).toContain('--lc-sidenav-bg: transparent;');
    expect(transparent).toContain('--lc-sidenav-badge-ring: var(--color-background);');
  });
});
