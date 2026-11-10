import { createHash } from 'crypto';
import { join } from 'path';
import { compile } from 'sass';

/**
 * 3.26 (request 041, finance-intelligence sources page, Pixel 7 / iPhone 15):
 * in the rows layout a row that is too narrow is shared, so a short value
 * ("10") no longer breaks inside next to a long term ("Sekundäre Kostenart
 * (Umlage)"); with leaders the dots sit on the first line. Geometry is measured
 * in the browser (build.md); this spec pins the rules and that every other rule
 * compiles exactly as in 3.25.2.
 */
describe('DescriptionListComponent shared row width (3.26, request 041)', () => {
  const css = compile(join(__dirname, 'description-list.component.scss')).css;

  const SHARE =
    '.lc-dl--rows .lc-dl__term, .lc-dl--rows .lc-dl__value {\n  flex: 1000000 1 0%;\n  max-width: max-content;\n}\n';
  const TERM = '.lc-dl--rows .lc-dl__term {\n  min-width: 0;\n  overflow-wrap: break-word;\n}\n';
  const LEADER =
    '@supports (margin-block-start: 1lh) {\n  .lc-dl--leaders .lc-dl__leader {\n' +
    '    align-self: flex-start;\n    margin-block-start: calc(0.5lh - 0.5px);\n  }\n}\n';

  const count = (needle: string) => css.split(needle).length - 1;
  /** The first top-level block of a selector (the base rule), as the older specs read it. */
  const firstBlock = (selector: string) => {
    const start = css.indexOf(`\n${selector} {`);
    expect(start).toBeGreaterThanOrEqual(0);
    return css.slice(start, css.indexOf('}', start));
  };

  it('AC-7/8: term and value of a rows layout grow from 0 to their max-content with equal weight', () => {
    expect(count(SHARE)).toBe(1);
    // The weight outweighs the leader's flex-grow 1 (below ~1e5 the leader takes sub-pixels from the value).
    expect(firstBlock('.lc-dl__leader')).toMatch(/flex: 1 1 auto;/);
  });

  it('AC-7: the term may shrink and wraps at spaces, with no hyphenation', () => {
    expect(count(TERM)).toBe(1);
    expect(css.indexOf(TERM)).toBeGreaterThan(css.indexOf(SHARE));
    // 3.39 (request 059, D-8) appends `hyphens: auto` for long compounds in
    // its narrow-row rules at the file end (description-list.narrow-row.spec.ts);
    // nothing before them hyphenates.
    const narrow = css.indexOf('\n.lc-dl--rows > .lc-dl__row {');
    expect(narrow).toBeGreaterThan(css.indexOf(TERM));
    expect(css.slice(0, narrow)).not.toMatch(/hyphens/);
  });

  it('AC-9: the value keeps its 3.3 wrap of long unbroken strings', () => {
    const value = firstBlock('.lc-dl__value');
    expect(value).toMatch(/flex: 0 1 auto;/);
    expect(value).toMatch(/min-width: 0;/);
    expect(value).toMatch(/overflow-wrap: anywhere;/);
  });

  it('applies only to the rows layout, after the base rules the stacked layout uses', () => {
    for (const block of [SHARE, TERM]) {
      const selectors = block.slice(0, block.indexOf('{')).split(',').map((s) => s.trim());
      expect(selectors.every((s) => s.startsWith('.lc-dl--rows .lc-dl__'))).toBe(true);
    }
    expect(css.indexOf(SHARE)).toBeGreaterThan(css.indexOf('\n.lc-dl__term {'));
    expect(css.indexOf(SHARE)).toBeGreaterThan(css.indexOf('\n.lc-dl__value {'));
    expect(firstBlock('.lc-dl__term')).toMatch(/flex-shrink: 0;/);
  });

  it('puts the leader on the first line where lh is supported, centred otherwise', () => {
    expect(count(LEADER)).toBe(1);
    expect(firstBlock('.lc-dl__leader')).toMatch(/align-self: center;/);
    expect(firstBlock('.lc-dl--leaders .lc-dl__leader')).toMatch(/transform: translateY\(-0\.15em\);/);
    expect(css.indexOf(LEADER)).toBeGreaterThan(css.indexOf('\n.lc-dl--leaders .lc-dl__leader {'));
  });

  // 3.27 (request 042, F-18): the link ring and its forced-colours rule are the
  // only other additions; the rest still compiles exactly as in 3.25.2.
  const LINK_RING = '.lc-dl__link:focus-visible {\n  outline: 2px solid var(--color-primary-500);\n  outline-offset: 2px;\n}\n';
  const LINK_FORCED = '\n@media (forced-colors: active) {\n  .lc-dl__link:focus-visible {\n    outline-color: Highlight;\n  }\n}';

  it('AC-10/11: every other rule compiles exactly as in 3.25.2', () => {
    expect([count(LINK_RING), count(LINK_FORCED)]).toEqual([1, 1]);
    // 3.36 (request 056) appended the badge and total rules at the end of the
    // file; they are cut off whole first (description-list.badge-total.spec.ts
    // pins them), so the pinned length and hash below stay those of 3.25.2.
    const at = css.search(/\s*\nlc-badge\.lc-dl__badge \{/);
    expect(at).toBeGreaterThan(css.indexOf(LINK_FORCED));
    const appended = css.slice(at);
    const selectors = [...appended.matchAll(/\n([^\s@}][^{\n]*) \{/g)].map((m) => m[1]);
    // 3.37 (request 057) appended `.lc-dl__sep` after them (pinned in
    // description-list.whitespace.spec.ts), and 3.39 (request 059, D-8) the
    // narrow-row rules (description-list.narrow-row.spec.ts); the rules before
    // stay pinned here.
    expect(
      selectors.every((s) => /lc-dl__badge|lc-dl__row--total|lc-dl__sr-only|lc-dl__sep|^\.lc-dl--rows > \.lc-dl__row/.test(s)),
    ).toBe(true);
    const rest = css.slice(0, at).replace(SHARE, '').replace(TERM, '').replace(LEADER, '').replace(LINK_RING, '').replace(LINK_FORCED, '');
    expect(rest.length).toBe(3081);
    expect(createHash('sha1').update(rest).digest('hex')).toBe('10ed437796904c83d6889fdb044524cf8981feb3');
  });
});
