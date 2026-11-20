import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { compile } from 'sass';
import { join } from 'path';
import { ToggleGroupComponent, ToggleOption } from './toggle-group.component';
import { audit, violations } from '../../testing/axe-jsdom';

/**
 * Request 071 (3.50, finance-intelligence vertraege-prove-2026-11-19 row 2,
 * AC-19): `touchTarget` gives each option a hit area of at least 44 × 44 px
 * without changing the look of sm/md/lg; the default renders as before.
 */
@Component({
  imports: [ToggleGroupComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-toggle-group
      [options]="options"
      [(selected)]="selected"
      [size]="size()"
      [touchTarget]="touch()"
      ariaLabel="Status"
    />
    <lc-toggle-group [options]="options" ariaLabel="Plain" />
  `,
})
class HostComponent {
  readonly options: ToggleOption[] = [
    { value: 'all', label: 'Alle' },
    { value: 'active', label: 'Aktiv' },
    { value: 'ended', label: 'Gekündigt' },
  ];
  readonly selected = signal('all');
  readonly size = signal<'sm' | 'md' | 'lg'>('lg');
  readonly touch = signal(true);
}

describe('lc-toggle-group touchTarget (3.50)', () => {
  const css = '\n' + compile(join(__dirname, 'toggle-group.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
  const rule = (selector: string): string => {
    const start = css.indexOf(`\n${selector} {`);
    expect([selector, start > -1]).toEqual([selector, true]);
    return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
  };

  function render() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const [touch, plain] = Array.from(fixture.nativeElement.querySelectorAll('.lc-toggle-group')) as HTMLElement[];
    return { fixture, touch, plain };
  }

  it('default: the group keeps exactly its old classes (no touch modifier)', () => {
    const { plain } = render();
    expect(plain.className).toBe('lc-toggle-group lc-toggle-group--md');
  });

  it.each(['sm', 'md', 'lg'] as const)('on (%s): adds lc-toggle-group--touch beside the size class', (size) => {
    const { fixture, touch } = render();
    fixture.componentInstance.size.set(size);
    fixture.detectChanges();
    // NgClass re-adds the changed classes, so compare the set, not the order.
    expect([...touch.classList].sort()).toEqual(['lc-toggle-group', `lc-toggle-group--${size}`, 'lc-toggle-group--touch'].sort());
  });

  it('switching it off removes the modifier again', () => {
    const { fixture, touch } = render();
    fixture.componentInstance.touch.set(false);
    fixture.detectChanges();
    expect(touch.className).toBe('lc-toggle-group lc-toggle-group--lg');
  });

  it('keeps radiogroup semantics, the roving tabindex and the arrow keys', async () => {
    const { fixture, touch } = render();
    expect(touch.getAttribute('role')).toBe('radiogroup');
    const buttons = Array.from(touch.querySelectorAll('button')) as HTMLButtonElement[];
    expect(buttons.map((b) => [b.getAttribute('role'), b.getAttribute('tabindex')])).toEqual([
      ['radio', '0'],
      ['radio', '-1'],
      ['radio', '-1'],
    ]);
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe('ended');
    expect(document.activeElement).toBe(buttons[2]);
    expect(violations(await audit(fixture.nativeElement))).toEqual([]);
  });

  it('CSS: the group stops clipping, options are positioned and at least 44 px wide, label centred', () => {
    expect(rule('.lc-toggle-group--touch')).toBe('overflow: visible;');
    expect(rule('.lc-toggle-group--touch .lc-toggle-group__btn')).toBe('position: relative; min-inline-size: 44px; justify-content: center;');
  });

  it('CSS: a transparent extension reaches 44 px in height (never shrinks a taller option)', () => {
    expect(rule('.lc-toggle-group--touch .lc-toggle-group__btn::before')).toBe(
      'content: ""; position: absolute; inset-block: min(0px, (100% - 44px) / 2); inset-inline: 0;',
    );
  });

  it('CSS: the outer corners of the first and last option follow the border inner radius', () => {
    expect(rule('.lc-toggle-group--touch .lc-toggle-group__btn:first-child')).toBe(
      'border-start-start-radius: calc(var(--border-radius-md) - 1px); border-end-start-radius: calc(var(--border-radius-md) - 1px);',
    );
    expect(rule('.lc-toggle-group--touch .lc-toggle-group__btn:last-child')).toBe(
      'border-start-end-radius: calc(var(--border-radius-md) - 1px); border-end-end-radius: calc(var(--border-radius-md) - 1px);',
    );
  });

  it('CSS: the sm/md/lg rules keep their values', () => {
    expect(rule('.lc-toggle-group--sm .lc-toggle-group__btn')).toBe('padding: 0.25rem 0.5rem; font-size: var(--typography-font-size-xs, 0.75rem);');
    expect(rule('.lc-toggle-group--md .lc-toggle-group__btn')).toBe('padding: 0.375rem 0.75rem; font-size: var(--typography-font-size-sm, 0.875rem);');
    expect(rule('.lc-toggle-group--lg .lc-toggle-group__btn')).toBe('padding: 0.5rem 1rem; font-size: var(--typography-font-size-base, 1rem);');
  });
});
