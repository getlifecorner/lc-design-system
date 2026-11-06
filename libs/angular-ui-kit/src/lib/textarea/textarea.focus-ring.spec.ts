import { resolve } from 'path';
import { compile } from 'sass';

/**
 * 3.33 (request 052): the textarea's error ink (043-n7, AC-12) and focus ring
 * (044-n1, AC-14) match lc-input, lc-select and lc-datepicker. Contrast is in
 * design 052 §5 (error 8.39:1 light; ring 4.37:1 light, 9.95:1 dark).
 */
describe('lc-textarea — error ink and focus ring (3.33, request 052)', () => {
  const css = compile(resolve(__dirname, 'textarea.component.scss')).css;
  /** The body of the rule whose selector is exactly `selector` (first match after a newline). */
  const rule = (selector: string) => {
    const at = css.indexOf(`\n${selector} {`);
    expect([selector, at > -1]).toEqual([selector, true]);
    return css.slice(at, css.indexOf('}', at));
  };
  const RING = /border-color: var\(--color-primary-500\);[^}]*outline: 2px solid var\(--color-primary-500\);\s*outline-offset: 0;\s*box-shadow: none;/;

  it('AC-12: the error message uses --color-error-600 (was --color-text-error)', () => {
    expect(rule('.lc-textarea-error-message')).toMatch(/color: var\(--color-error-600\);/);
  });

  it.each(['.lc-textarea:focus', '.lc-textarea--outline:focus', '.lc-textarea--filled:focus'])(
    'AC-14: %s draws the 2 px primary ring, no halo',
    (selector) => {
      expect(rule(selector)).toMatch(RING);
    },
  );

  it('AC-14: no 20 % halo is left', () => {
    expect(css).not.toMatch(/color-mix\(in srgb, var\(--color-primary-500\) 20%/);
  });

  it('AC-14: the filled field keeps its surface fill on focus', () => {
    expect(rule('.lc-textarea--filled:focus')).toMatch(/background-color: var\(--color-surface\);/);
  });

  it('keeps the error focus ring in the error colour', () => {
    expect(rule('.lc-textarea--error:focus')).toMatch(
      /border-color: var\(--color-error-600\);\s*outline: 2px solid var\(--color-error-600\);\s*outline-offset: 0;\s*box-shadow: none;/,
    );
  });

  it('AC-14: every focus ring is Highlight in forced colours', () => {
    expect(css).toMatch(/@media \(forced-colors: active\) \{\s*\.lc-textarea:focus,\s*\.lc-textarea--error:focus \{\s*outline-color: Highlight;\s*\}/);
  });
});
