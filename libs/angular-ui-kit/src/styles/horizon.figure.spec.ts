import { compile } from 'sass';
import { resolve } from 'path';

/**
 * The horizon's figure slot (3.8, G-4, AC-15 and AC-16 of request 005), read
 * from the compiled CSS. The block without a figure is pinned by
 * horizon.spec.ts, which this request leaves unchanged.
 */
const css = '\n' + compile(resolve(__dirname, '_horizon.scss')).css;

/** The declarations of the top-level rule whose selector is exactly `selector` (compiled rules start a line). */
function rule(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  expect(start).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf('}', start));
}

describe('.lc-horizon__figure (G-4)', () => {
  it('takes the figure size and gap from custom properties: 64 px and 16 px on the phone', () => {
    const base = rule('.lc-horizon');
    expect(base).toMatch(/--_lc-horizon-fig:\s*var\(--lc-horizon-figure-size, 64px\)/);
    expect(base).toMatch(/--_lc-horizon-fig-gap:\s*var\(--lc-horizon-figure-gap, 16px\)/);
  });

  it.each([
    [1024, '96px', '24px'],
    [1920, '128px', null],
  ])('steps up from %s px: size %s, gap %s', (width, size, gap) => {
    const start = css.indexOf(`@media (min-width: ${width}px) {\n  .lc-horizon {`);
    expect(start).toBeGreaterThan(-1);
    const step = css.slice(start, css.indexOf('}', start));
    expect(step).toContain(`--_lc-horizon-fig: var(--lc-horizon-figure-size, ${size})`);
    if (gap) expect(step).toContain(`--_lc-horizon-fig-gap: var(--lc-horizon-figure-gap, ${gap})`);
    else expect(step).not.toContain('--_lc-horizon-fig-gap');
  });

  it.each([1280, 1440])('keeps 96 px and 24 px at %s px (no figure step there)', (width) => {
    const start = css.indexOf(`@media (min-width: ${width}px) {\n  .lc-horizon {`);
    expect(css.slice(start, css.indexOf('}', start))).not.toContain('--_lc-horizon-fig');
  });

  it('raises the minimum above the line to max(sun + 22 px, figure + 8 px) only with a figure child', () => {
    expect(rule('.lc-horizon:has(> .lc-horizon__figure)')).toMatch(
      /min-height:\s*calc\(var\(--_lc-horizon-land\) \+ max\(var\(--_lc-horizon-r\) \+ 22px, var\(--_lc-horizon-fig\) \+ 8px\)\)/,
    );
    // The block without the figure keeps land + sun + 22 px (horizon.spec.ts).
    expect(rule('.lc-horizon')).toMatch(/min-height:\s*calc\(var\(--_lc-horizon-land\) \+ var\(--_lc-horizon-r\) \+ 22px\)/);
  });

  it('places the figure left of the sun with the gap, its feet on the line, sized by the slot', () => {
    const figure = rule('.lc-horizon__figure');
    expect(figure).toMatch(/position:\s*absolute/);
    expect(figure).toMatch(/right:\s*calc\(100% - var\(--_lc-horizon-x\) \+ var\(--_lc-horizon-r\) \+ var\(--_lc-horizon-fig-gap\)\)/);
    expect(figure).toMatch(/bottom:\s*calc\(var\(--_lc-horizon-land\) - var\(--_lc-horizon-fig\) \* 0\.125\)/);
    expect(figure).toMatch(/width:\s*var\(--_lc-horizon-fig\)/);
    expect(figure).toMatch(/height:\s*var\(--_lc-horizon-fig\)/);
    expect(figure).toMatch(/--lc-character-size:\s*var\(--_lc-horizon-fig\)/);
  });

  it('AC-16: the figure is never a pointer target', () => {
    expect(rule('.lc-horizon__figure')).toMatch(/pointer-events:\s*none/);
  });

  it('drops the figure in forced colours, keeping its box', () => {
    expect(css).toMatch(/@media \(forced-colors: active\) \{\s*\.lc-horizon__figure \{\s*visibility: hidden;/);
  });

  it('fills the slot with a <picture>’s image or an inline <svg>', () => {
    const child = rule('.lc-horizon__figure > :is(img, svg)');
    expect(child).toMatch(/display:\s*block/);
    expect(child).toMatch(/width:\s*100%/);
    expect(child).toMatch(/height:\s*100%/);
  });

  it('adds no motion and no raw colour', () => {
    const figureCss = css.slice(css.indexOf('.lc-horizon:has('));
    expect(figureCss).not.toMatch(/animation|transition|#[0-9a-f]{3,6}\b/i);
  });
});
