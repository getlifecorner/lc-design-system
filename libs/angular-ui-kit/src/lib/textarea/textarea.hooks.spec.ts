import { resolve } from 'path';
import { compile } from 'sass';

/**
 * Request 068 (3.48, usm-x row 61, design §2, §5, §9): `--line-height-base`
 * is defined by both themes (1.5, the value textarea and list inherited from
 * `body` before), and lc-textarea reads `--lc-textarea-padding` and
 * `--lc-textarea-min-height` over its size values.
 */
describe('lc-textarea hooks and --line-height-base (3.48)', () => {
  const styles = resolve(__dirname, '../../styles');
  const rootTokens = (file: string, selector: string): string => {
    const css = compile(resolve(styles, file)).css;
    const start = css.indexOf(selector);
    return css.slice(start, css.indexOf('}', start));
  };

  it.each([
    ['_theme-light.scss', ':root,'],
    ['_theme-dark.scss', ':root.dark,'],
  ])('%s defines --line-height-base as --line-height-normal (1.5)', (file, selector) => {
    const body = rootTokens(file, selector);
    expect(body).toMatch(/--line-height-base: var\(--line-height-normal\);/);
    expect(body).toMatch(/--line-height-normal: var\(--typography-line-height-normal\);/);
    expect(body).toMatch(/--typography-line-height-normal: 1\.5;/);
  });

  it('each size reads the padding and min-height hooks over its own values', () => {
    const css = compile(resolve(__dirname, 'textarea.component.scss')).css.replace(/\s+/g, ' ');
    const sizes: [string, string, string][] = [
      ['xs', 'var(--spacing-2) var(--spacing-3)', '4rem'],
      ['sm', 'var(--spacing-2-5) var(--spacing-3-5)', '5rem'],
      ['md', 'var(--spacing-3) var(--spacing-4)', '6rem'],
      ['lg', 'var(--spacing-3-5) var(--spacing-5)', '7rem'],
    ];
    for (const [size, padding, minHeight] of sizes) {
      expect(css).toContain(
        `.lc-textarea--${size} { padding: var(--lc-textarea-padding, ${padding}); font-size: var(--font-size-${size === 'md' ? 'base' : size}); min-height: var(--lc-textarea-min-height, ${minHeight}); }`,
      );
    }
    expect(css).toContain('line-height: var(--line-height-base);');
    expect(css).not.toMatch(/--lc-textarea-(padding|min-height):/);
  });
});
