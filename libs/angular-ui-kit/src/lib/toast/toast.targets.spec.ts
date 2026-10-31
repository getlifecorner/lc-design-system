import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { ToastComponent } from './toast.component';
import type { Toast } from './toast.service';

/**
 * 3.19 (request 024, 021 review, "Service Call" story): the toast close button
 * (28 × 28) and the action (94 × 29) become 44 px tap targets. Negative
 * margins keep the toast, the message and the icon where they were.
 */
describe('ToastComponent tap targets (3.19, request 024)', () => {
  const css = compile(resolve(__dirname, 'toast.component.scss')).css;
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2] }));
  const rule = (selector: string) => {
    const found = rules.filter((r) => r.selector === selector);
    expect(found).toHaveLength(1);
    return found[0].body;
  };

  it('AC-6: the close button is a 44 × 44 box whose margin keeps the 20 px icon slot', () => {
    const close = rule('.lc-toast__close');
    expect(close).toMatch(/\swidth: var\(--size-min-touch-width, 2\.75rem\);/);
    expect(close).toMatch(/\sheight: var\(--size-min-touch-height, 2\.75rem\);/);
    expect(close).toMatch(/padding: 0;/);
    expect(close).toMatch(/margin: calc\(\(20px - var\(--size-min-touch-height, 2\.75rem\)\) \/ 2\);/);
  });

  it('AC-6: the action is at least 44 × 44, centred on its old one-line box', () => {
    const action = rule('.lc-toast__action');
    expect(action).toMatch(/display: inline-flex;/);
    expect(action).toMatch(/align-items: center;/);
    expect(action).toMatch(/min-width: var\(--size-min-touch-width, 2\.75rem\);/);
    expect(action).toMatch(/min-height: var\(--size-min-touch-height, 2\.75rem\);/);
    expect(action).toMatch(
      /margin-block: min\(0px, (calc\()?\(1lh \+ 2 \* var\(--spacing-1\) - var\(--size-min-touch-height, 2\.75rem\)\) \/ 2\)?\);/,
    );
    expect(action).toMatch(/padding: var\(--spacing-1\) var\(--spacing-2\);/);
  });

  it('AC-9: both rings sit inside their boxes (offset -2px), in the text colour', () => {
    for (const control of ['.lc-toast__action', '.lc-toast__close']) {
      const ring = rule(`${control}:focus-visible`);
      expect(ring).toMatch(/outline: 2px solid currentColor;/);
      expect(ring).toMatch(/outline-offset: -2px;/);
    }
  });

  it('AC-6: a long word breaks inside the message', () => {
    expect(rule('.lc-toast__message')).toMatch(/overflow-wrap: break-word;/);
  });

  it('AC-9: keeps the DOM, the order and the names of 3.18', async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    }).compileComponents();
    const fixture = TestBed.createComponent(ToastComponent);
    const toast: Toast = {
      id: '1',
      message: 'Benachrichtigungseinstellungen gespeichert.',
      variant: 'info',
      position: 'top-right',
      duration: 5000,
      showCloseButton: true,
      action: { label: 'Rückgängig', onClick: () => undefined },
    };
    fixture.componentRef.setInput('toast', toast);
    fixture.componentRef.setInput('closeAriaLabel', 'Benachrichtigung schließen');
    fixture.detectChanges();
    const container = (fixture.nativeElement as HTMLElement).querySelector('.lc-toast__container') as HTMLElement;
    expect([...container.children].map((c) => [c.tagName, c.className, c.getAttribute('aria-label'), c.textContent?.trim()])).toEqual([
      ['DIV', 'lc-toast__icon', null, ''],
      ['DIV', 'lc-toast__message', null, 'Benachrichtigungseinstellungen gespeichert.'],
      ['BUTTON', 'lc-toast__action', null, 'Rückgängig'],
      ['BUTTON', 'lc-toast__close', 'Benachrichtigung schließen', ''],
    ]);
  });
});
