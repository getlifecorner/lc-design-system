import { resolve } from 'path';
import { compile } from 'sass';

/**
 * 3.19.1 (request 025, 024 review finding 3): both drawer close buttons (in
 * the header and the floating one) were 32 × 32. They are 44 × 44 tap targets
 * now, as in lc-modal (3.18) and lc-toast (3.19). The negative margin keeps
 * the old 32 px slot, so the header height (65 px) and the icon position stay.
 * A long heading wraps and hyphenates instead of running under the button.
 */
describe('DrawerComponent close target and heading (3.19.1, request 025)', () => {
  const css = compile(resolve(__dirname, 'drawer.component.scss')).css;
  const body = (selector: string) => {
    const at = css.search(new RegExp(`(^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\{`));
    expect(at).toBeGreaterThan(-1);
    return css.slice(at, css.indexOf('}', at));
  };

  it('AC-5: the close button is 44 × 44 in its old 32 px slot and never shrinks', () => {
    const close = body('.lc-drawer__close');
    expect(close).toMatch(/\swidth: var\(--size-min-touch-width, 2\.75rem\);/);
    expect(close).toMatch(/\sheight: var\(--size-min-touch-height, 2\.75rem\);/);
    expect(close).toMatch(/margin: calc\(\(2rem - var\(--size-min-touch-height, 2\.75rem\)\) \/ 2\);/);
    expect(close).toMatch(/flex-shrink: 0;/);
    expect(close).toMatch(/padding: 0;/);
    expect(close).not.toMatch(/\swidth: 2rem;|\sheight: 2rem;/);
  });

  it('AC-5: the floating button keeps its offsets (the margin moves the box, not the icon)', () => {
    const floating = body('.lc-drawer__close--floating');
    expect(floating).toMatch(/position: absolute;/);
    expect(floating).toMatch(/top: 0\.75rem;/);
    expect(floating).toMatch(/right: 0\.75rem;/);
  });

  it('AC-6: the focus ring is unchanged', () => {
    const ring = body('.lc-drawer__close:focus-visible');
    expect(ring).toMatch(/outline: 2px solid var\(--color-primary-500, #208497\);/);
    expect(ring).toMatch(/outline-offset: 2px;/);
  });

  it('AC-5: the heading keeps 12 px to the button and wraps a long word with a hyphen', () => {
    const header = body('.lc-drawer__header');
    expect(header).toMatch(/gap: var\(--spacing-3\);/);
    expect(header).toMatch(/padding: 1rem 1\.25rem;/);
    const heading = body('.lc-drawer__heading');
    expect(heading).toMatch(/min-width: 0;/);
    expect(heading).toMatch(/overflow-wrap: break-word;/);
    expect(heading).toMatch(/hyphens: auto;/);
    expect(heading).toMatch(/hyphenate-limit-chars: 12 4 3;/);
  });
});
