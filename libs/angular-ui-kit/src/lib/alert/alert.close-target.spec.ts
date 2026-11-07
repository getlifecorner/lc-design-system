import { TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { AlertComponent } from './alert.component';

/**
 * 3.34 (request 054, monatsstand bug, AC-14/AC-15): the × keeps its 28 px box
 * (icon 20 px + 4 px padding, −4 px margin), hover fill and ring, and its
 * glyph takes the variant's text colour (D-5, review r1 F-1); a transparent
 * `::before`, centred on it, makes the target 44 × 44 px. jsdom has no
 * layout: the rules are pinned in the compiled CSS, the geometry (hit scan,
 * heights, hash-identical shots) is measured in the stories.
 */
describe('AlertComponent — 44 px close target (3.34, request 054)', () => {
  const css = compile(resolve(__dirname, 'alert.component.scss')).css;

  /** The declarations of the first top-level rule whose selector is exactly `selector`. */
  const rule = (selector: string) => {
    const at = new RegExp(`(?:^|\\n)${selector.replace(/[.:()]/g, '\\$&')} \\{([^}]*)\\}`).exec(css);
    if (!at) throw new Error(`${selector} not found`);
    return at[1];
  };

  const BEFORE = '\n.lc-alert__close::before {\n  content: "";\n  position: absolute;\n  inset: min(0px, (100% - 44px) / 2);\n}\n';
  const POSITION = '\n  position: relative;';
  /** D-5 (review r1): the glyph in the variant's text colour, not the UA `buttontext` black. */
  const COLOR = '\n  border: none;\n  color: inherit;';

  it('F-1 (D-5): the glyph takes the variant text colour, after the border reset', () => {
    expect(css).toContain(COLOR);
    expect(rule('.lc-alert__close')).toContain('color: inherit;');
    for (const variant of ['success', 'error', 'warning', 'info']) {
      expect(rule(`.lc-alert--${variant}`)).toMatch(/color: var\(--color-text-primary\);/);
      expect(css).not.toMatch(new RegExp(`\\.lc-alert--${variant} \\.lc-alert__close[^{]*\\{[^}]*(?:^|[;\\s])color:`));
    }
  });

  it('AC-14: a 44 × 44 px hit area centred on the box, in CSS px (also at 200 % text)', () => {
    expect(css).toContain(BEFORE);
    expect(rule('.lc-alert__close::before')).not.toMatch(/background|border|outline|box-shadow|color/);
    expect(rule('.lc-alert__close')).toContain(POSITION.trim());
    expect(css).not.toMatch(/\.lc-alert__close::before[^{]*\{[^}]*--size-min-touch/);
  });

  it('AC-15: the box, padding, margin, radius, hover fill and ring of the × are unchanged', () => {
    const close = rule('.lc-alert__close');
    expect(close).toMatch(/padding: var\(--spacing-1\);/);
    expect(close).toMatch(/margin: calc\(var\(--spacing-1\) \* -1\);/);
    expect(close).toMatch(/border-radius: var\(--border-radius-sm\);/);
    expect(close).toMatch(/background: transparent;/);
    expect(rule('.lc-alert__close:hover')).toMatch(/background-color: var\(--color-surface-hover\);/);
    expect(rule('.lc-alert__close:focus-visible')).toMatch(/outline: 2px solid var\(--color-primary-500\);\s*outline-offset: 2px;/);
  });

  // 3.36 (request 056, 055-n2): this used to pin length and sha1 of the whole
  // compiled file, so any unrelated alert SCSS edit failed it. The × rules
  // are pinned one by one instead: the 28 px box (20 px glyph + 4 px padding,
  // −4 px margin), its paint, the `position` and `color: inherit` additions of
  // 3.34 and the `::before` hit area (AC-14 above).
  it('AC-15: the × rule keeps exactly its 3.34 declarations (28 px box, paint, position)', () => {
    expect(rule('.lc-alert__close').trim().split(/;\s*/).filter(Boolean)).toEqual([
      'flex-shrink: 0',
      'background: transparent',
      'border: none',
      'color: inherit',
      'cursor: pointer',
      'padding: var(--spacing-1)',
      'margin: calc(var(--spacing-1) * -1)',
      'border-radius: var(--border-radius-sm)',
      'transition: background-color 0.15s ease-in-out',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'position: relative',
    ]);
    expect(rule('.lc-alert__close:hover').trim()).toBe('background-color: var(--color-surface-hover);');
    expect(rule('.lc-alert__close:focus-visible').trim().split(/;\s*/).filter(Boolean)).toEqual([
      'outline: 2px solid var(--color-primary-500)',
      'outline-offset: 2px',
    ]);
    // No other top-level rule sizes or positions the ×.
    const others = css.match(/(?:^|\n)\.lc-alert__close[^{\n]*\{/g) ?? [];
    expect(others.map((s) => s.trim())).toEqual([
      '.lc-alert__close {',
      '.lc-alert__close::before {',
      '.lc-alert__close:hover {',
      '.lc-alert__close:focus-visible {',
    ]);
  });

  it('AC-15: the glyph is the 20 px (`sm`) x-mark, so the box stays 28 × 28 px', () => {
    TestBed.configureTestingModule({ imports: [AlertComponent] });
    const fixture = TestBed.createComponent(AlertComponent);
    fixture.componentRef.setInput('dismissible', true);
    fixture.detectChanges();
    const icon = (fixture.nativeElement as HTMLElement).querySelector('.lc-alert__close lc-icon') as HTMLElement;
    expect(icon.getAttribute('name')).toBe('x-mark');
    expect(icon.getAttribute('size')).toBe('sm');
    fixture.destroy();
  });

  it('AC-15 (055-n2): an unrelated rule added to the alert CSS does not change these assertions', () => {
    const mutated = `${css}\n.lc-alert__zz-unrelated {\n  color: red;\n}\n`;
    const ruleIn = (text: string, selector: string) =>
      new RegExp(`(?:^|\\n)${selector.replace(/[.:()]/g, '\\$&')} \\{([^}]*)\\}`).exec(text)?.[1];
    for (const selector of ['.lc-alert__close', '.lc-alert__close:hover', '.lc-alert__close:focus-visible', '.lc-alert__close::before']) {
      expect(ruleIn(mutated, selector)).toBe(rule(selector));
    }
    expect(mutated).toContain(BEFORE);
    expect(mutated).toContain(COLOR);
  });

  it('the narrow-layout block still follows the × rule (its margin wins by source order)', () => {
    expect(css.indexOf('@container lc-alert (width < 16rem)')).toBeGreaterThan(css.indexOf('\n.lc-alert__close {'));
  });

  it('adds no markup: the × is the same button', () => {
    TestBed.configureTestingModule({ imports: [AlertComponent] });
    const fixture = TestBed.createComponent(AlertComponent);
    fixture.componentRef.setInput('dismissible', true);
    fixture.componentRef.setInput('closeAriaLabel', 'Hinweis schließen');
    fixture.detectChanges();
    const close = (fixture.nativeElement as HTMLElement).querySelector('.lc-alert__close') as HTMLButtonElement;
    expect(close.tagName).toBe('BUTTON');
    expect(close.getAttribute('aria-label')).toBe('Hinweis schließen');
    expect(close.children).toHaveLength(1);
    fixture.destroy();
  });
});
