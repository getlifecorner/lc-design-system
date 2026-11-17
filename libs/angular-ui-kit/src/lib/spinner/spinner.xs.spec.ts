import { TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { audit, violations } from '../../testing/axe-jsdom';
import { SpinnerComponent, type SpinnerSize } from './spinner.component';

/** 3.42 (request 062 AC-19, usm-x row 5): the inline `xs` size. */
const css = '\n' + compile(resolve(__dirname, 'spinner.component.scss')).css;

function rule(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  expect([selector, start > -1]).toEqual([selector, true]);
  return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
}

describe('lc-spinner xs (3.42, request 062)', () => {
  const render = (size?: SpinnerSize, label?: string) => {
    TestBed.configureTestingModule({ imports: [SpinnerComponent] });
    const fixture = TestBed.createComponent(SpinnerComponent);
    if (size) fixture.componentRef.setInput('size', size);
    if (label) fixture.componentRef.setInput('loadingLabel', label);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  it('xs: host class lc-spinner--inline, inner class spinner spinner--xs, still a status with its label', async () => {
    const host = render('xs', 'Wird geladen');
    expect(host.className).toBe('lc-spinner--inline');
    const status = host.querySelector('[role="status"]') as HTMLElement;
    expect(status.className).toBe('spinner spinner--xs');
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.textContent?.trim()).toBe('Wird geladen');
    expect(violations(await audit(host))).toEqual([]);
  });

  it.each([undefined, 'sm', 'md', 'lg'] as const)('%s: no host class (unchanged default)', (size) => {
    const host = render(size);
    expect(host.hasAttribute('class')).toBe(false);
    expect((host.querySelector('[role="status"]') as HTMLElement).className).toBe(`spinner spinner--${size ?? 'md'}`);
  });

  it('styles: 16 px inline-flex, no padding, message beside it; host inline-flex', () => {
    expect(rule('.spinner--xs')).toBe('display: inline-flex; flex-direction: row; padding: 0; gap: var(--spacing-2); vertical-align: middle;');
    expect(rule('.spinner--xs .spinner__circle')).toBe('width: 1rem; height: 1rem;');
    expect(rule('.spinner--xs .spinner__message')).toBe('font-size: inherit;');
    expect(rule(':host(.lc-spinner--inline)')).toBe('display: inline-flex; vertical-align: middle;');
  });

  it('forced colours keep arc and track apart in every size', () => {
    const media = css.slice(css.indexOf('@media (forced-colors: active)'));
    expect(media).toMatch(/\.spinner__circle \{\s*border-color: GrayText;\s*border-top-color: CanvasText;\s*\}/);
  });
});
