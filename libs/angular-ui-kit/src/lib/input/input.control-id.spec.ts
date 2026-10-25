import { ComponentFixture, TestBed } from '@angular/core/testing';
import { readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { compile } from 'sass';
import { InputComponent } from './input.component';
import { computedName } from '../../testing/axe-jsdom';

/**
 * 3.12 (request 016, life-os contact form): `controlId` and generated ids
 * without a random part (G-CF4), the decorative `*` with one 4 px gap
 * (G-CF3, G-CF6), and `announceError` (G-CF7).
 */
describe('InputComponent 3.12: controlId, asterisk, announceError (G-CF4, G-CF6, G-CF7)', () => {
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InputComponent] }).compileComponents();
  });

  function render(inputs: Record<string, unknown> = {}): ComponentFixture<InputComponent> {
    const f = TestBed.createComponent(InputComponent);
    for (const [name, value] of Object.entries(inputs)) f.componentRef.setInput(name, value);
    f.detectChanges();
    return f;
  }

  const root = () => fixture.nativeElement as HTMLElement;
  const field = () => root().querySelector('input') as HTMLInputElement;
  const label = () => root().querySelector('label') as HTMLLabelElement;
  const error = () => root().querySelector('p.input-error') as HTMLElement | null;
  const indicator = () => root().querySelector('.required-indicator') as HTMLElement | null;

  describe('AC-1: controlId', () => {
    it('is the id of the input, the label, the error and aria-describedby', () => {
      fixture = render({ label: 'E-Mail-Adresse', controlId: 'contact-email', error: 'Geben Sie eine E-Mail-Adresse ein' });
      expect(field().id).toBe('contact-email');
      expect(label().getAttribute('for')).toBe('contact-email');
      expect(label().id).toBe('contact-email-label');
      expect(error()?.id).toBe('contact-email-error');
      expect(field().getAttribute('aria-describedby')).toBe('contact-email-error');
      expect(fixture.componentInstance.inputId).toBe('contact-email');
    });

    it('is the stem of the helper id', () => {
      fixture = render({ label: 'E-Mail-Adresse', controlId: 'contact-email', helperText: 'Für die Antwort' });
      expect(root().querySelector('p.input-helper')?.id).toBe('contact-email-helper');
      expect(field().getAttribute('aria-describedby')).toBe('contact-email-helper');
    });

    it('follows a change, and unset or empty falls back to the generated id', () => {
      fixture = render({ label: 'Name' });
      const generated = field().id;
      fixture.componentRef.setInput('controlId', 'contact-name');
      fixture.detectChanges();
      expect(field().id).toBe('contact-name');
      expect(label().getAttribute('for')).toBe('contact-name');
      fixture.componentRef.setInput('controlId', '');
      fixture.detectChanges();
      expect(field().id).toBe(generated);
      fixture.componentRef.setInput('controlId', undefined);
      fixture.detectChanges();
      expect(field().id).toBe(generated);
    });

    it('also names the read-only value that wraps (aria-labelledby)', () => {
      fixture = render({ label: 'E-Mail', controlId: 'account-email', readonly: true, readonlyWrap: true });
      expect(root().querySelector('[role="textbox"]')?.getAttribute('aria-labelledby')).toBe('account-email-label');
      expect(field().id).toBe('account-email');
    });
  });

  describe('AC-2: generated ids have no random part', () => {
    it('counts up in creation order: lc-input-<n>, lc-input-<n+1>', () => {
      const first = render({ label: 'A' });
      const second = render({ label: 'B' });
      const a = (first.nativeElement as HTMLElement).querySelector('input')?.id ?? '';
      const b = (second.nativeElement as HTMLElement).querySelector('input')?.id ?? '';
      expect(a).toMatch(/^lc-input-\d+$/);
      expect(b).toBe(`lc-input-${Number(a.slice('lc-input-'.length)) + 1}`);
    });

    it('takes a number also with controlId, so later generated ids do not shift', () => {
      const a = render().componentInstance.inputId;
      render({ controlId: 'contact-email' });
      const c = render().componentInstance.inputId;
      expect(Number(c.slice('lc-input-'.length))).toBe(Number(a.slice('lc-input-'.length)) + 2);
    });

    it('lib/input has no Math.random', () => {
      const sources = readdirSync(__dirname).filter((f) => /\.(ts|html)$/.test(f) && !f.endsWith('.spec.ts'));
      for (const file of sources) {
        expect(readFileSync(join(__dirname, file), 'utf-8')).not.toContain('Math.random');
      }
    });
  });

  describe('AC-4: inputId', () => {
    it('stays a readable string with the control id', () => {
      fixture = render({ label: 'Name' });
      const id: string = fixture.componentInstance.inputId;
      expect(typeof id).toBe('string');
      expect(id).toBe(field().id);
    });
  });

  describe('AC-5, AC-6: the * is decorative', () => {
    beforeEach(() => {
      fixture = render({ label: 'Company Name', required: true, requiredAriaLabel: 'Pflichtfeld' });
    });

    it('is aria-hidden, unnamed, and requiredAriaLabel is in no attribute', () => {
      expect(indicator()?.textContent).toBe('*');
      expect(indicator()?.getAttribute('aria-hidden')).toBe('true');
      expect(indicator()?.hasAttribute('aria-label')).toBe(false);
      expect(root().innerHTML).not.toContain('Pflichtfeld');
    });

    it('leaves "required" to the control, once', () => {
      expect(field().required).toBe(true);
      expect(field().getAttribute('aria-required')).toBe('true');
      // was "Company Name required" (the * named "required" inside the label)
      expect(computedName(root(), field())).toBe('Company Name');
    });

    it('AC-7: follows the label text without whitespace, so it cannot wrap onto a line alone', () => {
      expect(label().innerHTML).toMatch(/Company Name<span[^>]*class="required-indicator"/);
    });
  });

  describe('AC-8: announceError', () => {
    it('keeps role="alert" by default', () => {
      fixture = render({ label: 'E-Mail', error: 'Ungültig' });
      expect(error()?.getAttribute('role')).toBe('alert');
    });

    it('false drops only the role: id, aria-describedby and aria-invalid stay', () => {
      fixture = render({ label: 'E-Mail', controlId: 'contact-email', error: 'Ungültig', announceError: false });
      expect(error()?.hasAttribute('role')).toBe(false);
      expect(error()?.id).toBe('contact-email-error');
      expect(error()?.textContent?.trim()).toBe('Ungültig');
      expect(field().getAttribute('aria-describedby')).toBe('contact-email-error');
      expect(field().getAttribute('aria-invalid')).toBe('true');
      expect(root().querySelectorAll('[role="alert"]')).toHaveLength(0);
    });
  });

  describe('AC-14: default rendering', () => {
    it('without the new inputs: generated ids, linked label, error with role="alert"', () => {
      fixture = render({ label: 'Email Address', required: true, error: 'Please enter a valid email address' });
      const id = field().id;
      expect(id).toMatch(/^lc-input-\d+$/);
      expect(label().id).toBe(`${id}-label`);
      expect(label().getAttribute('for')).toBe(id);
      expect(error()?.id).toBe(`${id}-error`);
      expect(error()?.getAttribute('role')).toBe('alert');
      expect(field().getAttribute('aria-describedby')).toBe(`${id}-error`);
      expect(field().getAttribute('aria-invalid')).toBe('true');
      expect(label().textContent?.trim()).toBe('Email Address*');
      expect(root().querySelectorAll('[role="alert"]')).toHaveLength(1);
    });
  });

  describe('AC-7: stylesheet', () => {
    const css = compile(resolve(__dirname, 'input.component.scss'), {
      loadPaths: [resolve(__dirname, '../../styles')],
    }).css;

    it('spaces the * by --spacing-1 (4 px) on the inline-start side, as lc-textarea', () => {
      const rule = css.match(/\.input-label \.required-indicator\s*\{([^}]*)\}/)?.[1] ?? '';
      expect(rule).toMatch(/margin-inline-start:\s*var\(--spacing-1\)/);
      expect(rule).not.toMatch(/margin-left/);
    });
  });
});
