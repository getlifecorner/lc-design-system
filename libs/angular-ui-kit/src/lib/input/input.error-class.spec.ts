import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { InputComponent } from './input.component';

/**
 * 3.13 (request 017, life-os waitlist, G-WL3): the field container's error
 * state and the error message had one class, `input-error`, so the message
 * rule (`flex: 1`, font size, colour, margin) also hit the container. In the
 * column-flex wrapper `flex: 1 1 0%` replaced the height: lg grew from 44 to
 * 49 px on a refusal. The container's state is now `input-invalid`; the
 * message keeps `p.input-error`.
 */
describe('InputComponent 3.13: error-state class (G-WL3)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InputComponent] }).compileComponents();
  });

  function render(inputs: Record<string, unknown> = {}): ComponentFixture<InputComponent> {
    const f = TestBed.createComponent(InputComponent);
    for (const [name, value] of Object.entries(inputs)) f.componentRef.setInput(name, value);
    f.detectChanges();
    return f;
  }

  const container = (f: ComponentFixture<InputComponent>) =>
    (f.nativeElement as HTMLElement).querySelector('.input-container') as HTMLElement;
  const message = (f: ComponentFixture<InputComponent>) =>
    (f.nativeElement as HTMLElement).querySelector('p.input-error') as HTMLElement | null;
  const field = (f: ComponentFixture<InputComponent>) =>
    (f.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;

  describe('AC-1: two class names', () => {
    it('with an error the container has input-invalid and not input-error', () => {
      const f = render({ label: 'E-Mail-Adresse', error: 'Bitte gib eine gültige E-Mail-Adresse ein' });
      expect(container(f).classList.contains('input-invalid')).toBe(true);
      expect(container(f).classList.contains('input-error')).toBe(false);
    });

    it('the message is p.input-error and does not have input-invalid', () => {
      const f = render({ error: 'Bitte gib eine gültige E-Mail-Adresse ein' });
      const p = message(f);
      expect(p).not.toBeNull();
      expect(p?.classList.contains('input-invalid')).toBe(false);
      expect(p?.closest('.input-container')).toBeNull();
      expect((f.nativeElement as HTMLElement).querySelectorAll('.input-error')).toHaveLength(1);
      expect((f.nativeElement as HTMLElement).querySelectorAll('.input-invalid')).toHaveLength(1);
    });

    it('without an error the container has neither class and there is no message', () => {
      const f = render({ label: 'E-Mail-Adresse', helperText: 'Für die Antwort' });
      expect(container(f).classList.contains('input-invalid')).toBe(false);
      expect(container(f).classList.contains('input-error')).toBe(false);
      expect(message(f)).toBeNull();
    });

    it('input-invalid is present exactly when aria-invalid="true" is, also after the error clears', () => {
      const f = render({ error: 'Pflichtfeld' });
      expect(field(f).getAttribute('aria-invalid')).toBe('true');
      expect(container(f).classList.contains('input-invalid')).toBe(true);

      f.componentRef.setInput('error', undefined);
      f.detectChanges();
      expect(field(f).hasAttribute('aria-invalid')).toBe(false);
      expect(container(f).classList.contains('input-invalid')).toBe(false);
    });

    it.each(['xs', 'sm', 'md', 'lg'])('keeps the size class beside the state on %s', (size) => {
      const f = render({ size, error: 'Pflichtfeld' });
      expect([...container(f).classList].sort()).toEqual(['input-container', `input-${size}`, 'input-invalid'].sort());
    });
  });

  describe('unchanged default rendering', () => {
    it('an idle default field has exactly the classes of 3.12', () => {
      const f = render();
      expect([...container(f).classList].sort()).toEqual(['input-container', 'input-md']);
      expect(field(f).hasAttribute('aria-invalid')).toBe(false);
      expect((f.nativeElement as HTMLElement).querySelector('.input-footer')).toBeNull();
    });

    it('the message keeps its id, role and text', () => {
      const f = render({ controlId: 'waitlist-email', error: 'Bitte gib eine gültige E-Mail-Adresse ein' });
      const p = message(f);
      expect(p?.id).toBe('waitlist-email-error');
      expect(p?.getAttribute('role')).toBe('alert');
      expect(p?.textContent?.trim()).toBe('Bitte gib eine gültige E-Mail-Adresse ein');
      expect(field(f).getAttribute('aria-describedby')).toBe('waitlist-email-error');
    });
  });

  describe('AC-1, AC-3: stylesheet', () => {
    const css = '\n' + compile(resolve(__dirname, 'input.component.scss')).css;

    /** Every selector of the compiled stylesheet. */
    const selectors = [...css.matchAll(/\n([^{}\n@][^{}\n]*)\{/g)].flatMap(([, list]) =>
      list.split(',').map((s) => s.trim()),
    );

    function rule(selector: string): string {
      const start = css.indexOf(`\n${selector} {`);
      expect(start).toBeGreaterThan(-1);
      return css.slice(start, css.indexOf('}', start));
    }

    it('input-error appears only in the message rule', () => {
      expect(selectors.filter((s) => s.includes('input-error'))).toEqual(['.input-error']);
    });

    it('the message rule keeps flex, font size, colour and margin', () => {
      const body = rule('.input-error');
      expect(body).toMatch(/flex:\s*1;/);
      expect(body).toMatch(/font-size:\s*var\(--font-size-xs\);/);
      expect(body).toMatch(/color:\s*var\(--color-error-600\);/);
      expect(body).toMatch(/margin:\s*0;/);
    });

    it('the container state keeps the error border and focus outline, and nothing that sizes the box', () => {
      expect(rule('.input-container.input-invalid')).toMatch(/border-color:\s*var\(--color-error-600\);/);
      const focus = rule('.input-container.input-invalid:focus-within');
      expect(focus).toMatch(/outline-color:\s*var\(--color-error-600\);/);
      expect(focus).toMatch(/border-color:\s*var\(--color-error-600\);/);

      const stateRules = [...css.matchAll(/\n([^{}\n]*input-invalid[^{}\n]*)\{([^}]*)\}/g)];
      expect(stateRules).toHaveLength(2);
      for (const [, , body] of stateRules) {
        expect(body).not.toMatch(/\b(flex|height|min-height|font-size|margin|padding)\s*:/);
      }
    });
  });
});
