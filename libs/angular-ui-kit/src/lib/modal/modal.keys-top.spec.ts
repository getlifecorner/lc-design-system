import { ComponentFixture, TestBed } from '@angular/core/testing';
import { compile } from 'sass';
import { join } from 'path';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ModalComponent } from './modal.component';

/** Request 064 (usm-x row 22): handled keys are marked handled (AC-17), `placement="top"` (AC-18). */
describe('lc-modal keys and top placement (3.44)', () => {
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(ModalComponent);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  const key = (target: EventTarget, k: string): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  };
  const close = (): HTMLButtonElement => document.querySelector('.lc-modal__close') as HTMLButtonElement;

  describe('AC-17: preventDefault on handled keys', () => {
    it('marks Escape handled (defaultPrevented) and closes', () => {
      const closed = jest.fn();
      fixture.componentInstance.modalClosed.subscribe(closed);
      const event = key(document.body, 'Escape');
      expect(event.defaultPrevented).toBe(true);
      expect(closed).toHaveBeenCalledTimes(1);
    });

    it('marks Escape handled also with closeOnEscape=false, and stays open', () => {
      fixture.componentRef.setInput('closeOnEscape', false);
      fixture.detectChanges();
      const event = key(document.body, 'Escape');
      expect(event.defaultPrevented).toBe(true);
      fixture.detectChanges();
      expect(document.querySelector('.lc-modal')).not.toBeNull();
    });

    it('leaves other keys and a closed modal alone', () => {
      expect(key(document.body, 'Enter').defaultPrevented).toBe(false);
      fixture.componentRef.setInput('open', false);
      fixture.detectChanges();
      expect(key(document.body, 'Escape').defaultPrevented).toBe(false);
    });

    it.each(['Enter', ' '])('contains %p on the × : defaultPrevented, no page listener, closes once', (k) => {
      const page = jest.fn();
      document.addEventListener('keydown', page);
      const closed = jest.fn();
      fixture.componentInstance.modalClosed.subscribe(closed);
      try {
        // defaultPrevented on keydown also cancels the button's synthetic click.
        const event = key(close(), k);
        expect(event.defaultPrevented).toBe(true);
        expect(page).not.toHaveBeenCalled();
        expect(closed).toHaveBeenCalledTimes(1);
      } finally {
        document.removeEventListener('keydown', page);
      }
    });

    it('lets Tab on the × through (focus trap)', () => {
      expect(key(close(), 'Tab').defaultPrevented).toBe(false);
    });
  });

  describe('AC-18: placement="top"', () => {
    it('sets the top modifier', () => {
      fixture.componentRef.setInput('placement', 'top');
      fixture.detectChanges();
      expect((document.querySelector('.lc-modal') as HTMLElement).classList).toContain('lc-modal--placement-top');
    });

    const css = compile(join(__dirname, 'modal.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
    const rule = (selector: string): string => {
      const start = css.indexOf(`${selector} {`);
      expect(start).toBeGreaterThan(-1);
      return css.slice(start + selector.length + 2, css.indexOf('}', start)).trim();
    };

    it('anchors the top at the hook (default 10dvh), never above safe area + 16 px; grows downward to 16 px above the edge', () => {
      const top = rule('.lc-modal--placement-top:not(.lc-modal--full)');
      expect(top).toContain(
        '--_lc-modal-top: max(calc(env(safe-area-inset-top, 0px) + var(--spacing-4, 1rem)), var(--lc-modal-top-offset, 10dvh));',
      );
      expect(top).toContain('top: var(--_lc-modal-top);');
      expect(top).toContain('transform: translateX(-50%);');
      expect(top).toContain('max-height: calc(100dvh - var(--_lc-modal-top) - var(--spacing-4, 1rem));');
    });

    it('drops the entrance animation under reduced motion', () => {
      const at = css.indexOf('@media (prefers-reduced-motion: reduce)');
      expect(css.slice(at)).toMatch(/\.lc-modal\.lc-modal--placement-top \{\s*animation: none;/);
    });

    it('keeps the sheet the first placement rule (3.3 pin) and the centred default unchanged', () => {
      expect(css.indexOf('.lc-modal--placement-sheet')).toBeLessThan(css.indexOf('.lc-modal--placement-top'));
      expect(rule('.lc-modal')).toMatch(/top: 50%;\s*left: 50%;\s*transform: translate\(-50%, -50%\);/);
    });
  });
});
