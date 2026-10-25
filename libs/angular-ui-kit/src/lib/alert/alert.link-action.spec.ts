import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { join } from 'path';
import { compile } from 'sass';
import { AlertActionsLayout, AlertComponent, AlertVariant } from './alert.component';

/**
 * 3.12 (request 016, G-CF8): a text link in the action slot, the one way
 * forward on the life-os contact form's 503 / 429 pages. The slot is the 3.2
 * one; the link gets a 44 × 44 px box, link colour, an underline and the focus
 * ring, and drops below the text in a narrow inline alert. Sizes and contrast
 * are measured in the browser (build.md); this pins DOM order, roles and the
 * compiled rules.
 */
@Component({
  imports: [AlertComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-alert [variant]="variant()" [actionsLayout]="layout()" title="Senden gerade nicht möglich" [dismissible]="true">
      Wir können Ihre Nachricht gerade nicht senden.
      <a slot="action" href="mailto:kontakt@beispiel.example">Schreiben Sie uns an kontakt@beispiel.example</a>
    </lc-alert>
  `,
})
class LinkHostComponent {
  readonly variant = signal<AlertVariant>('error');
  readonly layout = signal<AlertActionsLayout>('inline');
}

describe('AlertComponent 3.12: a text link in the action slot (G-CF8)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkHostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    }).compileComponents();
  });

  function render(variant: AlertVariant = 'error', layout: AlertActionsLayout = 'inline'): HTMLElement {
    const fixture = TestBed.createComponent(LinkHostComponent);
    fixture.componentInstance.variant.set(variant);
    fixture.componentInstance.layout.set(layout);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('lc-alert');
  }

  describe('AC-11: DOM order and roles', () => {
    it('puts the link in the action slot, after the body and before the close button', () => {
      const alert = render();
      const link = alert.querySelector('a[href^="mailto:"]') as HTMLAnchorElement;
      expect(link.parentElement?.classList).toContain('lc-alert__action');
      const order = Array.from(alert.querySelectorAll('.lc-alert__body, .lc-alert__action > a, .lc-alert__close')).map(
        (el) => el.className || el.tagName,
      );
      expect(order).toEqual(['lc-alert__body', 'A', 'lc-alert__close']);
      // a native link: focusable and activated with Enter, no tabindex or role added
      expect(link.hasAttribute('tabindex')).toBe(false);
      expect(link.hasAttribute('role')).toBe(false);
      expect(link.textContent?.trim()).toBe('Schreiben Sie uns an kontakt@beispiel.example');
    });

    it('keeps the alert role per variant: alert for error and warning, status otherwise', () => {
      expect(render('error').getAttribute('role')).toBe('alert');
      expect(render('warning').getAttribute('role')).toBe('alert');
      expect(render('info').getAttribute('role')).toBe('status');
      expect(render('success').getAttribute('role')).toBe('status');
    });

    it('is one alert: the link adds no live region', () => {
      const alert = render('error');
      expect(alert.querySelectorAll('[role="alert"], [role="status"], [aria-live]')).toHaveLength(0);
    });

    it('stacked: the link stays in the action row', () => {
      const alert = render('error', 'stacked');
      expect(alert.classList).toContain('lc-alert--actions-stacked');
      expect(alert.querySelector('.lc-alert__action > a')).toBeTruthy();
    });
  });

  describe('stylesheet (AC-9, AC-10, AC-12)', () => {
    const css = compile(join(__dirname, 'alert.component.scss'), {
      loadPaths: [join(__dirname, '../../styles')],
    }).css;

    const ruleFor = (selector: string): string => {
      const at = css.indexOf(`${selector} {`);
      return at < 0 ? '' : css.slice(at, css.indexOf('}', at));
    };

    const LINK = '.lc-alert__action > a:where(:not(.btn))';

    it('gives a plain link a 44 × 44 px box, link colour and an underline; lcButton links are excluded', () => {
      const rule = ruleFor(LINK);
      expect(rule).toMatch(/display:\s*flex/);
      expect(rule).toMatch(/width:\s*fit-content/);
      expect(rule).toMatch(/max-width:\s*100%/);
      expect(rule).toMatch(/min-width:\s*var\(--size-min-touch-width\)/);
      expect(rule).toMatch(/min-height:\s*var\(--size-min-touch-height\)/);
      expect(rule).toMatch(/color:\s*var\(--color-link\)/);
      expect(rule).toMatch(/text-decoration-line:\s*underline/);
      expect(rule).toMatch(/text-decoration-thickness:\s*max\(1px, 0\.0625em\)/);
      expect(rule).toMatch(/overflow-wrap:\s*anywhere/);
      expect(rule).not.toMatch(/padding/);
    });

    it('hover: link-hover colour and a thicker underline, no transition', () => {
      const hover = ruleFor(`${LINK}:hover`);
      expect(hover).toMatch(/color:\s*var\(--color-link-hover\)/);
      expect(hover).toMatch(/text-decoration-thickness:\s*max\(2px, 0\.125em\)/);
      expect(ruleFor(LINK)).not.toMatch(/transition/);
    });

    it('focus-visible: the 2 px ring', () => {
      expect(ruleFor(`${LINK}:focus-visible`)).toMatch(/outline:\s*2px solid var\(--color-primary-500\)/);
    });

    it('forced colours: nothing is overridden', () => {
      expect(css).not.toMatch(/forced-color-adjust/);
    });

    it('inline: up to half the row, and below the text under 576 px of alert width', () => {
      expect(css).toMatch(/\.lc-alert:has\(> \.lc-alert__container > \.lc-alert__action > a:where\(:not\(\.btn\)\)\)\s*\{\s*container:\s*lc-alert\s*\/\s*inline-size/);
      expect(ruleFor('.lc-alert:not(.lc-alert--actions-stacked) .lc-alert__action:has(> a:where(:not(.btn)))')).toMatch(
        /flex-shrink:\s*1;\s*min-width:\s*0;\s*max-width:\s*50%/,
      );
      const at = css.indexOf('@container lc-alert (width < 36rem)');
      expect(at).toBeGreaterThan(-1);
      const narrow = css.slice(at);
      expect(narrow).toMatch(/:has\(> \.lc-alert__action > a:where\(:not\(\.btn\)\)\)\s*\{\s*flex-wrap:\s*wrap/);
      expect(narrow).toMatch(/> \.lc-alert__action\s*\{\s*order:\s*1;\s*flex:\s*1 1 100%;\s*max-width:\s*none;/);
      expect(narrow).toMatch(/padding-inline-start:\s*calc\(24px \+ var\(--spacing-3\)\)/);
    });

    it('stacked: the actions line up with the text at any text size (24 px icon, not 1.5rem)', () => {
      expect(css).toMatch(
        /\.lc-alert--actions-stacked\.lc-alert--with-icon \.lc-alert__action\s*\{\s*padding-inline-start:\s*calc\(24px \+ var\(--spacing-3, 0\.75rem\)\)/,
      );
    });
  });
});
