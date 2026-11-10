import { join } from 'path';
import { compile } from 'sass';

/**
 * 3.39 (request 059, finance-intelligence services page, folds 057-n3, AC-18,
 * design D-8): a rows-layout row moves its value onto its own line,
 * right-aligned, when term and value can't each keep min(100%, 6em) beside
 * each other, so „214.300,00 €“ in the 156 px card column no longer breaks
 * inside. Geometry is measured in the browser (build.md); this spec pins the
 * rules, their scope and that they come after everything they override.
 */
describe('DescriptionListComponent narrow rows (3.39, request 059)', () => {
  const css = compile(join(__dirname, 'description-list.component.scss')).css;
  const start = css.indexOf('\n.lc-dl--rows > .lc-dl__row {');
  const block = css.slice(start);
  const rules = [...block.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selectors: m[1].split(',').map((s) => s.trim()),
    body: m[2].trim().replace(/\s+/g, ' '),
  }));

  it('appends four rules at the file end, after the 3.37 separator', () => {
    expect(start).toBeGreaterThan(css.indexOf('\n.lc-dl__sep {'));
    expect(rules.map((r) => r.selectors)).toEqual([
      ['.lc-dl--rows > .lc-dl__row'],
      ['.lc-dl--rows > .lc-dl__row > .lc-dl__term', '.lc-dl--rows > .lc-dl__row > .lc-dl__value'],
      ['.lc-dl--rows > .lc-dl__row > .lc-dl__term'],
      ['.lc-dl--rows > .lc-dl__row > .lc-dl__value'],
    ]);
  });

  it('the row wraps with no gap between its lines; the column gap stays', () => {
    expect(rules[0].body).toBe('flex-wrap: wrap; row-gap: 0;');
  });

  it('only the basis of the 3.26 share changes: min(100%, 6em)', () => {
    expect(rules[1].body).toBe('flex-basis: min(100%, 6em);');
    // The 3.26 grow, shrink and max-content clamp stay as they were.
    expect(css).toContain('.lc-dl--rows .lc-dl__term, .lc-dl--rows .lc-dl__value {\n  flex: 1000000 1 0%;\n  max-width: max-content;\n}');
  });

  it('terms hyphenate compounds of 12+ letters, 4 before and 3 after the break', () => {
    expect(rules[2].body).toBe('hyphens: auto; hyphenate-limit-chars: 12 4 3;');
  });

  it('a value on its own line sits at the right edge', () => {
    expect(rules[3].body).toBe('margin-inline-start: auto;');
  });

  it('applies to the rows layout only, at 0,3,0 over the 0,2,0 share and the 0,1,0 dd margin reset', () => {
    for (const { selectors } of rules) for (const s of selectors) expect(s.startsWith('.lc-dl--rows > .lc-dl__row')).toBe(true);
    expect(block).not.toMatch(/stacked/);
  });
});
