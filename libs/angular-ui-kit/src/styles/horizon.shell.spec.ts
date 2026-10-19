import { compile } from 'sass';
import { resolve } from 'path';

/**
 * The horizon in 3.9 (request 006): the slimmer land defaults (LK-12, AC-1,
 * AC-3, AC-8) and lc-app-shell's figure slot `[shell-horizon-figure]` (AS-29,
 * AC-6, AC-7), read from the compiled CSS. The 3.8 figure rules are pinned by
 * horizon.figure.spec.ts.
 */
const css = '\n' + compile(resolve(__dirname, '_horizon.scss')).css;

/** The declarations of the top-level rule whose selector is exactly `selector` (compiled rules start a line). */
function rule(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  expect(start).toBeGreaterThan(-1);
  return css.slice(start + selector.length + 3, css.indexOf('}', start)).trim();
}

/** The declarations of `selector` inside `@media (forced-colors: active)`. */
function forcedColors(selector: string): string {
  const match = new RegExp(`@media \\(forced-colors: active\\) \\{\\s*${selector.replace(/[.*+?^${}()|[\]\\>]/g, '\\$&')} \\{([^}]*)\\}`).exec(css);
  expect(match).not.toBeNull();
  return (match?.[1] ?? '').trim();
}

describe('.lc-horizon land defaults (LK-12)', () => {
  it('AC-1: 112 px on the phone, 72 · 80 · 96 · 128 px from 1024 · 1280 · 1440 · 1920', () => {
    const lands = [...css.matchAll(/--_lc-horizon-land: var\(--lc-horizon-land, (\d+)px\)/g)].map((m) => Number(m[1]));
    expect(lands).toEqual([112, 72, 80, 96, 128]);
  });

  it('AC-3, AC-8: --lc-horizon-land wins at every width (every step is only its fallback)', () => {
    const steps = [...css.matchAll(/--_lc-horizon-land:\s*([^;]+);/g)].map((m) => m[1]);
    expect(steps).toHaveLength(5);
    for (const step of steps) expect(step).toMatch(/^var\(--lc-horizon-land, \d+px\)$/);
  });
});

describe('[shell-horizon-figure] (AS-29)', () => {
  it('places the shell figure with exactly the rules of .lc-horizon__figure', () => {
    expect(rule('.lc-horizon > :where([shell-horizon-figure])')).toBe(rule('.lc-horizon__figure'));
    expect(rule('.lc-horizon > :where([shell-horizon-figure]) > :is(img, svg)')).toBe(rule('.lc-horizon__figure > :is(img, svg)'));
  });

  it('raises the minimum above the line with a figure child, as .lc-horizon__figure does', () => {
    expect(rule('.lc-horizon:has(> [shell-horizon-figure])')).toBe(rule('.lc-horizon:has(> .lc-horizon__figure)'));
  });

  it('AC-7: sizes and places the figure, never a pointer target, hidden in forced colours', () => {
    const figure = rule('.lc-horizon > :where([shell-horizon-figure])');
    expect(figure).toMatch(/position:\s*absolute/);
    expect(figure).toMatch(/--lc-character-size:\s*var\(--_lc-horizon-fig\)/);
    expect(figure).toMatch(/pointer-events:\s*none/);
    expect(forcedColors('.lc-horizon > :where([shell-horizon-figure])')).toBe(forcedColors('.lc-horizon__figure'));
  });

  it('keeps the specificity of .lc-horizon__figure: :where() adds none to the attribute', () => {
    // (0,1,0) like `.lc-horizon__figure`, (0,2,0) for the :has() rule: every
    // selector that names the attribute, in order (the third is in forced colours).
    expect(css.match(/^[^{}\n]*shell-horizon-figure[^{}\n]*(?= \{)/gm)).toEqual([
      '.lc-horizon:has(> [shell-horizon-figure])',
      '.lc-horizon > :where([shell-horizon-figure])',
      '  .lc-horizon > :where([shell-horizon-figure])',
      '.lc-horizon > :where([shell-horizon-figure]) > :is(img, svg)',
    ]);
  });
});
