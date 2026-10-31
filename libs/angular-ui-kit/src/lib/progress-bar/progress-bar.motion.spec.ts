import { resolve } from 'path';
import { compile } from 'sass';

/**
 * 3.17 (request 021, finance-intelligence sources page, gap row 3): an
 * indeterminate bar under `prefers-reduced-motion` and `forced-colors`.
 * jsdom applies no stylesheets, so the rules are read from the compiled CSS.
 */
const css = '\n' + compile(resolve(__dirname, 'progress-bar.component.scss')).css;

/** The body of the first `@media (<query>) { … }` block. */
function media(query: string): string {
  const at = css.indexOf(`\n@media ${query} {`);
  expect(at).toBeGreaterThan(-1);
  return css.slice(at, css.indexOf('\n}', at));
}

/** The declarations of the rule `selector` inside `block`. */
function rule(block: string, selector: string): string {
  const at = block.indexOf(`  ${selector} {`);
  expect(at).toBeGreaterThan(-1);
  return block.slice(at, block.indexOf('}', at));
}

describe('lc-progress-bar under reduced motion and forced colours (3.17)', () => {
  const reduced = media('(prefers-reduced-motion: reduce)');
  const forced = media('(forced-colors: active)');

  it('AC-9: the linear indeterminate fill stops and spans the track in 6 px stripes', () => {
    const fill = rule(reduced, '.progress-bar--indeterminate .progress-bar__fill');
    expect(fill).toMatch(/width: 100% !important;/);
    expect(fill).toMatch(/animation: none;/);
    expect(fill).toMatch(/transform: none;/);
    const stripes = 'repeating-linear-gradient(45deg, #000 0 0.375rem, transparent 0.375rem 0.75rem)';
    expect(fill).toContain(`-webkit-mask-image: ${stripes};`);
    expect(fill).toContain(`\n    mask-image: ${stripes};`);
  });

  it('AC-9: the rule follows the animated one with the same selector (both widths are !important)', () => {
    const base = css.indexOf('\n.progress-bar--indeterminate .progress-bar__fill {');
    expect(base).toBeGreaterThan(-1);
    expect(css.slice(base, css.indexOf('}', base))).toMatch(/width: 40% !important;/);
    expect(css.indexOf('\n@media (prefers-reduced-motion: reduce) {')).toBeGreaterThan(base);
  });

  it('AC-9: the circle stops as a ring of 12 butt dashes of 2π·40/24', () => {
    const ring = rule(reduced, '.progress-bar-circular__fill--indeterminate');
    expect(ring).toMatch(/animation: none;/);
    expect(ring).toMatch(/stroke-dasharray: 10\.472 10\.472;/);
    expect(ring).toMatch(/stroke-dashoffset: 0;/);
    expect(ring).toMatch(/stroke-linecap: butt;/);
    expect(((2 * Math.PI * 40) / 24).toFixed(3)).toBe('10.472');
    // After the round caps of every fill.
    expect(css.indexOf('\n@media (prefers-reduced-motion: reduce) {')).toBeGreaterThan(css.indexOf('stroke-linecap: round;'));
  });

  it('AC-10: forced colours draw the fills in Highlight, the track outline in CanvasText, the circle track in GrayText', () => {
    expect(rule(forced, '.progress-bar .progress-bar__fill')).toMatch(/forced-color-adjust: none;\s*background-color: Highlight;/);
    expect(rule(forced, '.progress-bar__track')).toMatch(/outline: 1px solid CanvasText;/);
    expect(rule(forced, '.progress-bar-circular .progress-bar-circular__fill')).toMatch(/forced-color-adjust: none;\s*stroke: Highlight;/);
    expect(rule(forced, '.progress-bar-circular__track')).toMatch(/stroke: GrayText;/);
    expect(rule(forced, '.progress-bar__label,\n  .progress-bar-circular__label')).toMatch(/color: CanvasText;/);
  });

  it('AC-14: under reduced motion only indeterminate fills change; no outline or border changes the layout', () => {
    const selectors = [...reduced.matchAll(/\n {2}([^{}\n]+) \{/g)].map(([, s]) => s);
    expect(selectors).toEqual(['.progress-bar--indeterminate .progress-bar__fill', '.progress-bar-circular__fill--indeterminate']);
    expect(forced).not.toMatch(/\bborder\b|\bpadding\b|\bheight\b|\bwidth\b/);
  });
});
