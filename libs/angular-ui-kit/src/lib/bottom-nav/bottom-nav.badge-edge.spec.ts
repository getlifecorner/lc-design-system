import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'sass';

/**
 * 3.33 (request 052, 050-n6, AC-27, D-2): on the last entry a badge that
 * would pass the entry's edge ends there; one that fits stays put. jsdom has
 * no layout: the rules are pinned here, the badge edges (docked 367 / bar
 * 375, floating 366 / 374) are measured in the story.
 */
describe('lc-bottom-nav — badge on the last entry stays inside (3.33, 050-n6)', () => {
  const css = compile(resolve(__dirname, 'bottom-nav.component.scss')).css;
  /** Bodies of rules whose selector contains `fragment` (emulation is applied later, so plain selectors). */
  const rule = (selector: string) => {
    const at = css.indexOf(`\n${selector} {`);
    expect([selector, at > -1]).toEqual([selector, true]);
    return css.slice(at, css.indexOf('}', at));
  };

  it('the badge keeps its place on every other entry', () => {
    expect(rule('.lc-bottom-nav__badge')).toMatch(/position: absolute;\s*top: -4px;\s*left: calc\(50% \+ 6px\);\s*display: flex;\s*pointer-events: none;/);
  });

  it('the last entry is the containing block (its pill no longer is)', () => {
    expect(rule('.lc-bottom-nav__entry:last-child')).toMatch(/position: relative;/);
    expect(rule('.lc-bottom-nav__entry:last-child .lc-bottom-nav__pill')).toMatch(/position: static;/);
  });

  it('its badge box spans from the pill centre + 6 px to the entry end, overflowing towards the start (safe), with a fallback', () => {
    expect(rule('.lc-bottom-nav__entry:last-child .lc-bottom-nav__badge')).toMatch(
      /top: 2px;\s*right: 0;\s*direction: rtl;\s*justify-content: flex-end;\s*justify-content: safe flex-end;/,
    );
    expect(rule('.lc-bottom-nav__entry:last-child .lc-bottom-nav__badge > lc-badge')).toMatch(/direction: ltr;/);
  });

  it('documents the three-character limit in the JSDoc', () => {
    const src = readFileSync(resolve(__dirname, 'bottom-nav.component.ts'), 'utf-8');
    expect(src).toMatch(/values up to three characters \(`'99\+'`\) fit/);
    expect(src).not.toMatch(/keep it to two characters/);
  });
});
