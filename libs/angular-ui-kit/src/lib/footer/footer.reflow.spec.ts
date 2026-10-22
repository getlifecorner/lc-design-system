import { resolve } from 'node:path';
import { compile } from 'sass';

/**
 * lc-footer sections at 320 px and 200 % text (3.11.1, G-36, WCAG 1.4.10):
 * the column minimum can't exceed the container, and a word wider than its
 * column breaks inside the word. The layout is CSS (measured in the story
 * `layout-footer--sections-large-text`); jsdom applies no component CSS, so
 * this pins the compiled rules.
 */

/** The compiled stylesheet, with a leading line feed so every rule starts on one. */
const css = '\n' + compile(resolve(__dirname, 'footer.component.scss')).css;

/** The declarations of the first rule whose selector list is exactly `selector`. */
function rule(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  expect(start).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf('}', start));
}

describe('lc-footer sections reflow (3.11.1, G-36)', () => {
  const sections = rule('.footer__sections');

  it('AC-8: the column minimum is min(10rem, 100%), so it never exceeds the container', () => {
    expect(sections).toContain('grid-template-columns: repeat(auto-fit, minmax(min(10rem, 100%), 1fr));');
  });

  it('AC-9: where 10rem fits, the columns are as before (10rem minimum, equal shares, same gap)', () => {
    expect(sections).toContain('display: grid;');
    expect(sections).toContain('gap: var(--lc-density-gap-xl, 2rem);');
    expect(sections).toContain('margin-bottom: var(--lc-density-padding-xl, 2rem);');
  });

  it('AC-8: a word wider than its column breaks inside the word, in the sections only', () => {
    expect(sections).toContain('overflow-wrap: anywhere;');
    // Not on the footer or its bottom row: it would lower their min-content (3.11
    // pitfall). (The bottom row's `--lc-btn-overflow-wrap` hook is 3.11's, for its links.)
    expect(css.match(/\soverflow-wrap: anywhere;/g)).toHaveLength(1);
    expect(rule('.footer')).not.toContain('overflow-wrap');
  });
});
