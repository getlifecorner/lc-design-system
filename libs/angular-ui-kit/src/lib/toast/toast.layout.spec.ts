import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { ToastComponent } from './toast.component';
import { ToastOutletComponent } from './toast-outlet.component';
import { ToastService, type Toast } from './toast.service';

/**
 * 3.19.1 (request 025, 024 review findings 1 and 2):
 * - The toast's `:host` rule never applied (the component is
 *   `ViewEncapsulation.None`), so a standalone toast was inline and as wide as
 *   its parent. The rule now targets the element, outlet toasts excluded: the
 *   outlet sizes its stack (content-wide, touching) and keeps doing so.
 * - A long German compound in the message is hyphenated at a syllable; the
 *   limit keeps short English words unhyphenated.
 */
describe('ToastComponent layout (3.19.1, request 025)', () => {
  const css = compile(resolve(__dirname, 'toast.component.scss')).css;
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2] }));
  const rule = (selector: string) => {
    const found = rules.filter((r) => r.selector === selector);
    expect(found).toHaveLength(1);
    return found[0].body;
  };
  const STANDALONE = 'lc-toast:not(lc-toast-outlet lc-toast)';

  it('AC-3: a standalone toast is a block of at most 400 px with an 8 px bottom margin', () => {
    const host = rule(STANDALONE);
    expect(host).toMatch(/display: block;/);
    expect(host).toMatch(/\swidth: 100%;/);
    expect(host).toMatch(/max-width: 400px;/);
    expect(host).toMatch(/margin-bottom: var\(--spacing-2\);/);
    // The dead rule is gone (it would mislead the next reader).
    expect(css).not.toMatch(/:host/);
  });

  it('AC-1: the message breaks long words with a hyphen, short words stay whole', () => {
    const message = rule('.lc-toast__message');
    expect(message).toMatch(/overflow-wrap: break-word;/);
    expect(message).toMatch(/hyphens: auto;/);
    expect(message).toMatch(/hyphenate-limit-chars: 12 4 3;/);
  });

  describe('which toasts the rule reaches', () => {
    const toast: Toast = {
      id: '1',
      message: 'Gespeichert.',
      variant: 'success',
      position: 'top-right',
      duration: 0,
      showCloseButton: true,
    };

    // TestBed renders a root component into a <div>: host the elements in a template.
    @Component({
      standalone: true,
      imports: [ToastComponent],
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `<div><lc-toast [toast]="toast" /></div>`,
    })
    class StandaloneHost {
      readonly toast = toast;
    }

    @Component({
      standalone: true,
      imports: [ToastOutletComponent],
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `<lc-toast-outlet />`,
    })
    class OutletHost {}

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [StandaloneHost, OutletHost],
        providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
      }).compileComponents();
    });

    it('AC-3: a toast placed directly matches; its host classes are unchanged', () => {
      const fixture = TestBed.createComponent(StandaloneHost);
      fixture.detectChanges();
      const host = (fixture.nativeElement as HTMLElement).querySelector('lc-toast') as HTMLElement;
      expect(host.matches(STANDALONE)).toBe(true);
      expect(host.className.split(' ').sort()).toEqual(['lc-toast', 'lc-toast--success']);
    });

    it('AC-4: a toast in lc-toast-outlet does not match (the outlet keeps its sizes)', () => {
      const fixture = TestBed.createComponent(OutletHost);
      const service = TestBed.inject(ToastService);
      fixture.detectChanges();
      service.show({ message: 'Gespeichert.', variant: 'success', duration: 0 });
      fixture.detectChanges();
      const toasts = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('lc-toast-outlet lc-toast'));
      expect(toasts).toHaveLength(1);
      expect(toasts[0].matches(STANDALONE)).toBe(false);
      service.closeAll();
    });
  });
});
