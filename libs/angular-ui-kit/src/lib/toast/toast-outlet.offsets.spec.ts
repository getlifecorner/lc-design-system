import { TestBed } from '@angular/core/testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'sass';
import { OverlayInsetsService } from '@lifecorner/angular-ui-kit/internal/overlay';
import { ToastOutletComponent } from './toast-outlet.component';

/**
 * 3.28 (request 045, AS-34): the outlet's offsets. jsdom resolves no `var()`,
 * so the cascade (hook → the shell's value → 0px) is pinned in the compiled
 * CSS; the host binding of the shell's values is tested on the element.
 */
describe('ToastOutletComponent — offsets (3.28, AS-34)', () => {
  const css = compile(resolve(__dirname, 'toast-outlet.component.scss')).css;
  const source = readFileSync(resolve(__dirname, 'toast-outlet.component.ts'), 'utf-8');

  /** The declarations of the first rule whose selector list is exactly `selector`. */
  const rule = (selector: string) => {
    const at = new RegExp(`(?:^|\\n)${selector.replace(/[.[\]()-]/g, '\\$&').replace(/,\s*/g, ',\\s*')} \\{([^}]*)\\}`).exec(css);
    if (!at) throw new Error(`${selector} not found`);
    return at[1];
  };

  function render() {
    TestBed.configureTestingModule({ imports: [ToastOutletComponent] });
    const fixture = TestBed.createComponent(ToastOutletComponent);
    fixture.detectChanges();
    return { fixture, host: fixture.nativeElement as HTMLElement, insets: TestBed.inject(OverlayInsetsService) };
  }

  it('AC-1: without lc-app-shell the host has no style attribute (stacks at 0px, as before)', () => {
    const { host, insets } = render();
    expect(insets.top()).toBeNull();
    expect(insets.bottom()).toBeNull();
    expect(host.hasAttribute('style')).toBe(false);
    expect(host.querySelectorAll('.lc-toast-outlet__stack')).toHaveLength(6);
  });

  it('binds the shell\'s values as private custom properties on the host, and drops them again', () => {
    const { fixture, host, insets } = render();
    insets.top.set('56px');
    insets.bottom.set('env(safe-area-inset-bottom, 0px)');
    fixture.detectChanges();
    expect(host.style.getPropertyValue('--_lc-toast-outlet-frame-top')).toBe('56px');
    expect(host.style.getPropertyValue('--_lc-toast-outlet-frame-bottom')).toBe('env(safe-area-inset-bottom, 0px)');
    // The public hooks are never written by the kit.
    expect(host.style.getPropertyValue('--lc-toast-outlet-offset-top')).toBe('');

    insets.top.set(null);
    insets.bottom.set(null);
    fixture.detectChanges();
    expect(host.style.getPropertyValue('--_lc-toast-outlet-frame-top')).toBe('');
    expect(host.style.getPropertyValue('--_lc-toast-outlet-frame-bottom')).toBe('');
  });

  it('AC-1, AC-4: each offset is the hook, else the shell\'s value, else 0px', () => {
    const stack = rule('.lc-toast-outlet__stack');
    expect(stack).toMatch(/--_lc-toast-outlet-top: var\(--lc-toast-outlet-offset-top, var\(--_lc-toast-outlet-frame-top, 0px\)\);/);
    expect(stack).toMatch(/--_lc-toast-outlet-bottom: var\(--lc-toast-outlet-offset-bottom, var\(--_lc-toast-outlet-frame-bottom, 0px\)\);/);
    expect(rule('.lc-toast-outlet__stack--top-left, .lc-toast-outlet__stack--top-center, .lc-toast-outlet__stack--top-right')).toMatch(
      /^\s*top: var\(--_lc-toast-outlet-top\);\s*$/,
    );
    expect(rule('.lc-toast-outlet__stack--bottom-left, .lc-toast-outlet__stack--bottom-center, .lc-toast-outlet__stack--bottom-right')).toMatch(
      /^\s*bottom: var\(--_lc-toast-outlet-bottom\);\s*flex-direction: column-reverse;\s*$/,
    );
  });

  it('AC-4: registers both private offsets as lengths with 0px, so a bare `0` hook still works', () => {
    for (const name of ['--_lc-toast-outlet-top', '--_lc-toast-outlet-bottom']) {
      expect(css).toContain(`@property ${name} {\n  syntax: "<length-percentage>";\n  inherits: false;\n  initial-value: 0px;\n}`);
    }
  });

  it('AC-4: declares the public hooks nowhere, so an ancestor (or :root) can set them', () => {
    expect(css).not.toMatch(/--lc-toast-outlet-offset-(top|bottom)\s*:/);
  });

  it('AC-5: a stack is at most as high as the space between the offsets and scrolls', () => {
    const stack = rule('.lc-toast-outlet__stack');
    expect(stack).toMatch(
      /max-height: calc\(100vh - var\(--_lc-toast-outlet-top\) - var\(--_lc-toast-outlet-bottom\)\);\s*max-height: calc\(100dvh - var\(--_lc-toast-outlet-top\) - var\(--_lc-toast-outlet-bottom\)\);/,
    );
    expect(stack).toMatch(/overflow-y: auto;/);
    expect(stack).toMatch(/overscroll-behavior: contain;/);
    // Unchanged: fixed, above modal and drawer, transparent to the pointer.
    expect(stack).toMatch(/position: fixed;\s*z-index: 1200;/);
    expect(stack).toMatch(/pointer-events: none;/);
  });

  it('AC-19: documents both hooks with their defaults and the shell\'s values', () => {
    expect(source).toMatch(/`--lc-toast-outlet-offset-top` — [^]*?Default `0px`; with `lc-app-shell`: its header's bottom edge/);
    expect(source).toMatch(/`--lc-toast-outlet-offset-bottom` — [^]*?Default `0px`; with `lc-app-shell`: the shown bottom\s+\*\s+bar's top edge/);
  });
});
