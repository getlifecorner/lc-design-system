import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { ToastOutletComponent } from './toast-outlet.component';
import { ToastService, type ToastPosition, type ToastVariant } from './toast.service';

/**
 * 3.33.1 (request 053, 052-s2, design D-1/D-2): toasts in a stack are 8 px
 * (`--spacing-2`) apart, within a live region and across the two. Every
 * outlet toast keeps `margin-top: var(--spacing-2)`, and the stack's top
 * padding gives those 8 px back, so the first toast stays 16 px from the top.
 * jsdom has no layout: the rules are pinned in the compiled CSS, the DOM they
 * rely on (toasts are direct children of a region) on the element, and the
 * geometry is measured in the *Stack Spacing* story.
 */
describe('ToastOutletComponent — stack gap (3.33.1, 052-s2)', () => {
  const css = compile(resolve(__dirname, 'toast-outlet.component.scss')).css;
  const toastCss = compile(resolve(__dirname, 'toast.component.scss')).css;

  /** The declarations of the rule whose selector list is exactly `selector`. */
  const rule = (selector: string) => {
    const at = new RegExp(`(?:^|\\n)${selector.replace(/[.[\]()>-]/g, '\\$&')} \\{([^}]*)\\}`).exec(css);
    if (!at) throw new Error(`${selector} not found`);
    return at[1];
  };

  /**
   * Every rule of the outlet's stacks, regions and their toasts, as
   * [selector list, declarations]. 3.35 (request 055, 053-n1): the checks
   * below look at these rules only (they replaced a length + sha1 pin of the
   * whole file), so an unrelated rule added later doesn't fail them.
   */
  const outletRules = () =>
    [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
      .map((m) => [m[1].replace(/\s+/g, ' ').trim(), m[2]] as const)
      .filter(([selector]) => /\.lc-toast-outlet__(stack|region)/.test(selector));
  /** The declaration names of the rules matching `pattern`, in source order. */
  const declarations = (pattern: RegExp) =>
    outletRules().flatMap(([selector, body]) =>
      [...body.matchAll(/(?:^|[\s;])([a-z-]+)\s*:/g)].map((m) => m[1]).filter((name) => pattern.test(name)).map((name) => `${selector} → ${name}`),
    );

  const GAP_RULE = '\n.lc-toast-outlet__region > lc-toast {\n  margin-top: var(--spacing-2);\n}\n';

  describe('CSS (compiled)', () => {
    it('AC-1, AC-2: every outlet toast keeps exactly var(--spacing-2) above it, no literal', () => {
      expect(rule('.lc-toast-outlet__region > lc-toast').trim()).toBe('margin-top: var(--spacing-2);');
      expect(css).toContain(GAP_RULE);
    });

    it('D-2: the stack keeps its 16 px padding and gives the 8 px back at the top only', () => {
      expect(rule('.lc-toast-outlet__stack')).toMatch(
        /\spadding: var\(--spacing-4\);\s*padding-top: calc\(var\(--spacing-4\) - var\(--spacing-2\)\);/,
      );
      expect(declarations(/^padding/)).toEqual(['.lc-toast-outlet__stack → padding', '.lc-toast-outlet__stack → padding-top']);
    });

    it('AC-3: no gap, :empty, :has() or other margin, so an empty region and the last toast add nothing', () => {
      expect(outletRules().length).toBeGreaterThan(5);
      expect(declarations(/^(gap|row-gap|column-gap)$/)).toEqual([]);
      expect(outletRules().filter(([selector]) => /:empty|:has\(|:last-child|:first-child/.test(selector))).toEqual([]);
      expect(declarations(/^margin/)).toEqual(['.lc-toast-outlet__region > lc-toast → margin-top']);
    });

    it('AC-7: the standalone toast keeps its bottom margin, and only outside the outlet (no 16 px)', () => {
      const margins = [...toastCss.matchAll(/([^{}]+)\{([^{}]*margin-(?:top|bottom)[^{}]*)\}/g)].map((m) => m[1].trim());
      expect(margins).toEqual(['lc-toast:not(lc-toast-outlet lc-toast)']);
      expect(toastCss).toMatch(/lc-toast:not\(lc-toast-outlet lc-toast\) \{[^}]*margin-bottom: var\(--spacing-2\);/);
    });
  });

  describe('DOM (the template is unchanged)', () => {
    let fixture: ComponentFixture<ToastOutletComponent>;
    let service: ToastService;
    const el = () => fixture.nativeElement as HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ToastOutletComponent],
        providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
      }).compileComponents();
      service = TestBed.inject(ToastService);
      fixture = TestBed.createComponent(ToastOutletComponent);
      fixture.detectChanges();
    });

    afterEach(() => {
      service.closeAll();
      fixture.destroy();
    });

    const show = (variant: ToastVariant, position: ToastPosition) => service.show({ message: variant, variant, position, duration: 0 });

    it('default: six stacks of two live regions, no toast, no style set by code (AC-10, AC-11)', () => {
      const stacks = [...el().querySelectorAll<HTMLElement>('.lc-toast-outlet__stack')];
      expect(stacks).toHaveLength(6);
      for (const s of stacks) {
        expect([...s.children].map((r) => [r.className, r.getAttribute('aria-live'), r.getAttribute('aria-atomic')])).toEqual([
          ['lc-toast-outlet__region', 'assertive', 'false'],
          ['lc-toast-outlet__region', 'polite', 'false'],
        ]);
      }
      expect(el().querySelectorAll('lc-toast')).toHaveLength(0);
      expect(el().querySelectorAll('[style]')).toHaveLength(0);
    });

    it.each(['top-right', 'bottom-center'] as const)(
      'AC-1, AC-2: in %s every toast is a direct child of its region, so the gap rule reaches it',
      (position) => {
        show('warning', position);
        show('error', position);
        show('success', position);
        fixture.detectChanges();
        const toasts = [...el().querySelectorAll<HTMLElement>(`.lc-toast-outlet__stack--${position} lc-toast`)];
        expect(toasts).toHaveLength(3);
        for (const t of toasts) {
          expect(t.matches('.lc-toast-outlet__region > lc-toast')).toBe(true);
          expect(t.hasAttribute('style')).toBe(false);
        }
        expect(toasts.map((t) => t.parentElement?.getAttribute('aria-live'))).toEqual(['assertive', 'assertive', 'polite']);
      },
    );
  });
});
