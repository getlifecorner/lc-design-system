import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { TextareaComponent } from './textarea.component';
import { computedName } from '../../testing/axe-jsdom';

/**
 * 3.12 (request 016, life-os contact form): `controlId` (G-CF4), the
 * decorative `*` with the same 4 px gap as lc-input (G-CF3, G-CF6), and
 * `announceError` (G-CF7).
 */
describe('TextareaComponent 3.12: controlId, asterisk, announceError (G-CF4, G-CF6, G-CF7)', () => {
  let fixture: ComponentFixture<TextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TextareaComponent] }).compileComponents();
  });

  function render(inputs: Record<string, unknown> = {}): ComponentFixture<TextareaComponent> {
    const f = TestBed.createComponent(TextareaComponent);
    for (const [name, value] of Object.entries(inputs)) f.componentRef.setInput(name, value);
    f.detectChanges();
    return f;
  }

  const root = () => fixture.nativeElement as HTMLElement;
  const textarea = () => root().querySelector('textarea') as HTMLTextAreaElement;
  const label = () => root().querySelector('label') as HTMLLabelElement;
  const error = () => root().querySelector('.lc-textarea-error-message') as HTMLElement | null;

  describe('AC-1: controlId', () => {
    it('is the id of the textarea, the label for, the error and aria-describedby', () => {
      fixture = render({ label: 'Nachricht', controlId: 'contact-message', error: true, errorMessage: 'Zu kurz' });
      expect(textarea().id).toBe('contact-message');
      expect(label().htmlFor).toBe('contact-message');
      expect(error()?.id).toBe('contact-message-error');
      expect(textarea().getAttribute('aria-describedby')).toBe('contact-message-error');
      const { textareaId, errorId, helperId } = fixture.componentInstance;
      expect([textareaId, errorId, helperId]).toEqual(['contact-message', 'contact-message-error', 'contact-message-helper']);
    });

    it('is the stem of the helper id', () => {
      fixture = render({ label: 'Nachricht', controlId: 'contact-message', helperText: 'Mindestens 20 Zeichen' });
      expect(root().querySelector('.lc-textarea-helper-text')?.id).toBe('contact-message-helper');
      expect(textarea().getAttribute('aria-describedby')).toBe('contact-message-helper');
    });

    it('follows a change, and unset or empty falls back to the generated id', () => {
      fixture = render({ label: 'Nachricht' });
      const generated = textarea().id;
      expect(generated).toMatch(/^lc-textarea-\d+$/);
      fixture.componentRef.setInput('controlId', 'contact-message');
      fixture.detectChanges();
      expect(textarea().id).toBe('contact-message');
      expect(label().htmlFor).toBe('contact-message');
      fixture.componentRef.setInput('controlId', '');
      fixture.detectChanges();
      expect(textarea().id).toBe(generated);
    });

    it('generated ids count up in creation order, also past a controlId', () => {
      const a = render().componentInstance.textareaId;
      render({ controlId: 'contact-message' });
      const c = render().componentInstance.textareaId;
      expect(a).toMatch(/^lc-textarea-\d+$/);
      expect(Number(c.slice('lc-textarea-'.length))).toBe(Number(a.slice('lc-textarea-'.length)) + 2);
    });
  });

  describe('AC-5, AC-6: the * is decorative', () => {
    it('requiredAriaLabel has no effect; the name is the label, the state comes from required', () => {
      fixture = render({ label: 'Nachricht', required: true, requiredAriaLabel: 'Pflichtfeld' });
      const star = root().querySelector('.lc-textarea-required-indicator');
      expect(star?.getAttribute('aria-hidden')).toBe('true');
      expect(star?.hasAttribute('aria-label')).toBe(false);
      expect(root().innerHTML).not.toContain('Pflichtfeld');
      expect(textarea().required).toBe(true);
      expect(textarea().getAttribute('aria-required')).toBe('true');
      expect(computedName(root(), textarea())).toBe('Nachricht');
    });

    it('AC-7: follows the label text without whitespace, so it cannot wrap onto a line alone', () => {
      fixture = render({ label: 'Nachricht', required: true });
      expect(label().innerHTML).toMatch(/Nachricht<span[^>]*class="lc-textarea-required-indicator"/);
    });
  });

  describe('AC-8: announceError', () => {
    it('keeps role="alert" by default', () => {
      fixture = render({ label: 'Nachricht', error: true, errorMessage: 'Zu kurz' });
      expect(error()?.getAttribute('role')).toBe('alert');
      expect(root().querySelectorAll('[role="alert"]')).toHaveLength(1);
    });

    it('false drops only the role: id, aria-describedby and aria-invalid stay', () => {
      fixture = render({ label: 'Nachricht', controlId: 'contact-message', error: true, errorMessage: 'Zu kurz', announceError: false });
      expect(error()?.hasAttribute('role')).toBe(false);
      expect(error()?.textContent).toBe('Zu kurz');
      expect(error()?.id).toBe('contact-message-error');
      expect(textarea().getAttribute('aria-describedby')).toBe('contact-message-error');
      expect(textarea().getAttribute('aria-invalid')).toBe('true');
      expect(root().querySelectorAll('[role="alert"]')).toHaveLength(0);
    });
  });

  describe('AC-7: stylesheet', () => {
    const css = compile(resolve(__dirname, 'textarea.component.scss'), {
      loadPaths: [resolve(__dirname, '../../styles')],
    }).css;

    it('spaces the * by --spacing-1 (4 px) on the inline-start side, as lc-input', () => {
      const rule = css.match(/\.lc-textarea-required-indicator\s*\{([^}]*)\}/)?.[1] ?? '';
      expect(rule).toMatch(/margin-inline-start:\s*var\(--spacing-1\)/);
    });
  });
});
