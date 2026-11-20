import { compile } from 'sass';
import { join } from 'path';

/**
 * Request 071 (3.50, finance-intelligence app-shell-2026-11-20 row 1, AC-20):
 * a page in lc-app-shell prints as content only. `lc-header` hides itself in
 * `@media print` (as lc-sidenav and lc-bottom-nav already did); the shell
 * drops the screen height, the bottom bar's clearance and the sky image. The
 * hooks still win (an app's own print values keep working), and every rule is
 * inside `@media print`, so nothing changes on screen.
 */
describe('print rules of lc-app-shell and lc-header (3.50)', () => {
  const styles = join(__dirname, '../../styles');
  const shell = compile(join(__dirname, 'app-shell.component.scss'), { loadPaths: [styles] }).css;
  const header = compile(join(__dirname, '../header/header.component.scss'), { loadPaths: [styles] }).css;
  const printBlocks = (css: string): string[] => {
    const blocks: string[] = [];
    let at = css.indexOf('@media print');
    while (at > -1) {
      blocks.push(css.slice(at, css.indexOf('\n}', at) + 2).replace(/\s+/g, ' '));
      at = css.indexOf('@media print', at + 1);
    }
    return blocks;
  };

  it('lc-header: one print block that hides the host element', () => {
    expect(printBlocks(header)).toEqual(['@media print { .lc-header-host { display: none; } }']);
  });

  it('lc-app-shell: one print block with no clearance, no sky image, no screen height and no nav column, hooks first', () => {
    const fullHeight = '.lc-app-shell--nav-full-height:not(:has(> .lc-app-shell__nav:empty))';
    expect(printBlocks(shell)).toEqual([
      '@media print { .lc-app-shell { --_clearance: var(--lc-app-shell-bottom-clearance, 0px); min-height: 0; background-image: var(--lc-app-shell-bg-image, none); }' +
        ` .lc-app-shell, ${fullHeight} { grid-template-columns: minmax(0, 1fr); grid-template-areas: "header" "body" "end"; }` +
        ` .lc-app-shell > .lc-app-shell__nav, ${fullHeight} > .lc-app-shell__nav { display: none; }` +
        ` .lc-app-shell > .lc-app-shell__footer, ${fullHeight} > .lc-app-shell__footer { padding-left: env(safe-area-inset-left, 0px); } }`,
    ]);
  });

  // Review 071 F-2: the print rules beat the docked and full-height screen
  // rules from 1024 px: same selectors (same weight), later in the file.
  it('print one column from 1024 px: the screen rules it overrides exist and come before the print block', () => {
    const at = shell.indexOf('@media print');
    const screen = shell.slice(0, at);
    const docked = screen.indexOf('@media (min-width: 1024px)');
    expect(docked).toBeGreaterThan(-1);
    // the screen rules that would keep a nav column in print
    expect(screen.slice(docked)).toMatch(/\.lc-app-shell \{\s*grid-template-columns: var\(--_nav-width\) minmax\(0, 1fr\);/);
    expect(screen.slice(docked)).toMatch(/\.lc-app-shell--nav-full-height:not\(:has\(> \.lc-app-shell__nav:empty\)\) \{\s*grid-template-areas: "nav header" "nav body" "end end";/);
    expect(screen.slice(docked)).toMatch(/\.lc-app-shell--nav-full-height:not\(:has\(> \.lc-app-shell__nav:empty\)\) > \.lc-app-shell__nav \{[^}]*display: grid;/);
    expect(screen.slice(docked)).toMatch(/\.lc-app-shell--nav-full-height:not\(:has\(> \.lc-app-shell__nav:empty\)\) > \.lc-app-shell__footer \{[^}]*padding-left: var\(--_nav-width\);/);
    expect(at).toBeGreaterThan(docked);
  });

  it('the bottom padding below 1024 px still reads the private clearance (0 in print)', () => {
    expect(shell).toMatch(
      /@media \(max-width: 1023\.98px\) \{\s*\.lc-app-shell:not\(\.lc-app-shell--horizon\):has\(> \.lc-app-shell__bottom-nav:not\(:empty\)\) \{\s*padding-bottom: var\(--_clearance\);/,
    );
  });

  it('screen rules keep their values (clearance, sky image, screen height)', () => {
    const screen = shell.slice(0, shell.indexOf('@media print'));
    expect(screen).toContain('background-image: var(--lc-app-shell-bg-image, var(--app-background-image, none));');
    expect(screen).toContain('min-height: 100dvh;');
    expect(screen).toMatch(/--_clearance: var\(\s*--lc-app-shell-bottom-clearance,\s*max\(calc\(112px \+ env\(safe-area-inset-bottom, 0px\)\)/);
  });
});
