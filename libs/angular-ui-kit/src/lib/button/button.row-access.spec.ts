import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { ButtonComponent } from './button.component';
import type { ButtonShape, ButtonVariant } from './button.component';

@Component({
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-button
      [variant]="variant()"
      [shape]="shape()"
      [inline]="true"
      [flush]="true"
      [iconOnly]="true"
      [fullWidth]="true"
      [accessKey]="accessKey()"
      [ariaKeyShortcuts]="shortcuts()"
      >Speichern</lc-button
    >
    <lc-button>Standard</lc-button>
  `,
})
class HostComponent {
  readonly variant = signal<ButtonVariant>('outline');
  readonly shape = signal<ButtonShape>('pill');
  readonly accessKey = signal('');
  readonly shortcuts = signal('');
}

/** Request 064: row shape (usm-x row 27, AC-22), access keys (row 29, AC-24), outline ground (row 26, AC-21). */
describe('lc-button shape, access keys and outline ground (3.44)', () => {
  function render(init: Partial<{ variant: ButtonVariant; shape: ButtonShape; accessKey: string; shortcuts: string }> = {}) {
    const fixture = TestBed.createComponent(HostComponent);
    const host = fixture.componentInstance;
    if (init.variant) host.variant.set(init.variant);
    if (init.shape) host.shape.set(init.shape);
    if (init.accessKey !== undefined) host.accessKey.set(init.accessKey);
    if (init.shortcuts !== undefined) host.shortcuts.set(init.shortcuts);
    fixture.detectChanges();
    const [button, plain] = [...(fixture.nativeElement as HTMLElement).querySelectorAll('button')];
    return { fixture, host, button, plain };
  }
  const sorted = (e: Element) => [...e.classList].sort().join(' ');

  describe('AC-24: accessKey and ariaKeyShortcuts', () => {
    it('renders neither attribute by default', () => {
      const { button, plain } = render();
      for (const b of [button, plain]) {
        expect(b.hasAttribute('accesskey')).toBe(false);
        expect(b.hasAttribute('aria-keyshortcuts')).toBe(false);
      }
    });

    it('forwards both to the inner <button>, not the host', () => {
      const { button } = render({ accessKey: 's', shortcuts: 'Alt+Shift+S' });
      expect(button.getAttribute('accesskey')).toBe('s');
      expect(button.getAttribute('aria-keyshortcuts')).toBe('Alt+Shift+S');
      const host = button.closest('lc-button') as HTMLElement;
      expect(host.hasAttribute('accesskey')).toBe(false);
      expect(host.hasAttribute('aria-keyshortcuts')).toBe(false);
    });
  });

  describe('AC-22: shape="row"', () => {
    it('defaults to pill: the class list is unchanged', () => {
      const { button, plain } = render();
      expect(sorted(button)).toBe('btn btn-flush btn-full-width btn-icon-only btn-inline btn-md btn-outline');
      expect(sorted(plain)).toBe('btn btn-md btn-primary');
    });

    it.each<ButtonVariant>(['primary', 'outline', 'ghost', 'link'])(
      'row on %s adds btn-row and drops inline, flush, iconOnly and fullWidth',
      (variant) => {
        const { button } = render({ variant, shape: 'row' });
        expect(sorted(button)).toBe(`btn btn-${variant} btn-md btn-row`.split(' ').sort().join(' '));
      },
    );

    const css = '\n' + compile(resolve(__dirname, 'button.component.scss'), { loadPaths: [resolve(__dirname, '../../styles')] }).css;
    const rule = (selector: string): string => {
      const start = css.indexOf(`\n${selector} {`);
      expect([selector, start > -1]).toEqual([selector, true]);
      return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
    };

    it('is a bare, full-width, start-aligned row body with the small radius and the hooks', () => {
      expect(rule('.btn.btn-row')).toBe(
        [
          'display: flex;',
          'width: 100%;',
          'min-height: var(--lc-button-row-min-height, 44px);',
          'padding: var(--lc-button-row-padding, var(--spacing-2) var(--spacing-3));',
          'justify-content: flex-start;',
          'text-align: start;',
          'font: inherit;',
          'color: inherit;',
          'background-color: transparent;',
          'border-width: 0;',
          'border-radius: var(--border-radius-sm);',
        ].join(' '),
      );
    });

    it('draws the focus ring inset (2 px at -2 px)', () => {
      expect(rule('.btn.btn-row:focus-visible')).toBe('outline-offset: -2px;');
      expect(rule('.btn:focus-visible')).toMatch(/outline: 2px solid var\(--color-primary-500\)/);
    });

    it('suppresses every variant hover/active fill at (0,4,0), after them', () => {
      const at = css.indexOf('\n.btn.btn-row:is(:hover, :active):not(:disabled, .btn-loading) {');
      expect(rule('.btn.btn-row:is(:hover, :active):not(:disabled, .btn-loading)')).toBe(
        'color: inherit; background-color: transparent; text-decoration: none; filter: none;',
      );
      for (const earlier of [
        '.btn-outline.btn-tone-primary:hover:not(:disabled, .btn-loading)',
        '.btn-outline.btn-tone-primary:active:not(:disabled, .btn-loading)',
        '.btn-link.btn-flush:not(.btn-icon-only, .btn-inline)',
      ]) {
        expect([earlier, css.indexOf(`\n${earlier} {`) < at]).toEqual([earlier, true]);
      }
    });
  });

  describe('AC-21: outline ground', () => {
    const css = compile(resolve(__dirname, 'button.component.scss'), { loadPaths: [resolve(__dirname, '../../styles')] }).css;

    it('has no literal colour in the outline rule: the hook over --color-primary-wash', () => {
      const start = css.indexOf('\n.btn-outline {');
      const outline = css.slice(start, css.indexOf('}', start));
      expect(outline).toContain('background-color: var(--lc-button-outline-bg, var(--color-primary-wash));');
      expect(outline).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
    });
  });
});
