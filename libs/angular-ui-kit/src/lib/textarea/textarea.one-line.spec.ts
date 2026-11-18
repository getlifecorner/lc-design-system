import { resolve } from 'path';
import { compile } from 'sass';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextareaComponent } from './textarea.component';

/**
 * Request 063 (usm-x row 6, design §2/§3/§9): one-line mode (`rows` 1, or
 * `minRows` 1 with `autoResize`) and a footer row only when it has content.
 */
describe('TextareaComponent one-line mode and footer (3.43, request 063)', () => {
  let fixture: ComponentFixture<TextareaComponent>;
  const el = (): HTMLElement => fixture.nativeElement;
  const field = () => el().querySelector('textarea') as HTMLTextAreaElement;
  const footer = () => el().querySelector('.lc-textarea-footer');

  const render = (inputs: Record<string, unknown> = {}) => {
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TextareaComponent] }).compileComponents();
    fixture = TestBed.createComponent(TextareaComponent);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('AC-14: the footer row only with content', () => {
    it('has no footer without helper, counter or visible error', () => {
      render({ label: 'Nachricht' });
      expect(footer()).toBeNull();
      expect(el().querySelector('.lc-textarea-wrapper')?.children).toHaveLength(2);
      expect(field().hasAttribute('aria-describedby')).toBe(false);
    });

    it('error without a message shows no footer, but keeps aria-invalid', () => {
      render({ error: true });
      expect(footer()).toBeNull();
      expect(field().getAttribute('aria-invalid')).toBe('true');
    });

    it('renders it for a helper text, linked as before', () => {
      render({ helperText: 'Höchstens 500 Zeichen' });
      expect(footer()?.querySelector('.lc-textarea-helper-text')?.id).toBe(field().getAttribute('aria-describedby'));
    });

    it('renders it for a visible error, announced as before', () => {
      render({ helperText: 'Hilfe', error: true, errorMessage: 'Bitte eine Nachricht eingeben.' });
      const error = footer()?.querySelector('.lc-textarea-error-message') as HTMLElement;
      expect(error.getAttribute('role')).toBe('alert');
      expect(field().getAttribute('aria-describedby')).toBe(error.id);
      expect(footer()?.querySelector('.lc-textarea-helper-text')).toBeNull();
    });

    it('renders it for the character counter', () => {
      render({ showCharacterCount: true, maxLength: 200 });
      expect(footer()?.querySelector('.lc-textarea-character-count')?.textContent?.trim()).toBe('0 / 200');
    });
  });

  describe('AC-13: one-line mode', () => {
    it('default: no one-line class, rows="3" (unchanged)', () => {
      render();
      // `[class]` lists the classes sorted in jsdom.
      expect(field().getAttribute('class')).toBe('lc-textarea lc-textarea--md lc-textarea--outline');
      expect(field().getAttribute('rows')).toBe('3');
    });

    it('rows 1: one-line class and rows="1"', () => {
      render({ rows: 1 });
      expect(field().classList.contains('lc-textarea--one-line')).toBe(true);
      expect(field().getAttribute('rows')).toBe('1');
    });

    it('rows 1 or minRows 1 with autoResize keep rows="1" for the prerendered field', () => {
      render({ rows: 1, autoResize: true });
      expect(field().getAttribute('rows')).toBe('1');
      render({ rows: 3, minRows: 1 });
      expect(field().getAttribute('rows')).toBe('1');
      expect(field().getAttribute('class')).toBe(
        'lc-textarea lc-textarea--auto-resize lc-textarea--md lc-textarea--one-line lc-textarea--outline',
      );
    });

    it('other combinations keep the floor and the 3.42 rows attribute', () => {
      render({ rows: 2 });
      expect(field().classList.contains('lc-textarea--one-line')).toBe(false);
      render({ rows: 3, autoResize: true, minRows: 2 });
      expect(field().classList.contains('lc-textarea--one-line')).toBe(false);
      expect(field().hasAttribute('rows')).toBe(false);
      render({ autoResize: false, minRows: 1 });
      expect(field().classList.contains('lc-textarea--one-line')).toBe(false);
      expect(field().getAttribute('rows')).toBe('3');
    });

    it('SCSS: the one-line class drops the min-height after the size rules and is a block (no line gap below)', () => {
      const css = compile(resolve(__dirname, 'textarea.component.scss')).css;
      const oneLine = css.indexOf('.lc-textarea--one-line {');
      expect(oneLine).toBeGreaterThan(css.indexOf('.lc-textarea--lg {'));
      // 3.48 (request 068, usm-x row 61): the floor reads `--lc-textarea-min-height` over the same 0.
      expect(css.slice(oneLine).replace(/\s+/g, ' ')).toMatch(/^\.lc-textarea--one-line \{ min-height: var\(--lc-textarea-min-height, 0\); display: block; \}/);
    });

    it('SCSS: the base field and the one-line class set display (3.45: multi-line fields are blocks too)', () => {
      const css = compile(resolve(__dirname, 'textarea.component.scss')).css;
      const fieldRules = css.match(/\n\.lc-textarea(?:--[a-z-]+)?(?::[a-z-]+)? \{[^}]*\}/g) ?? [];
      const withDisplay = fieldRules.filter((r) => /display:/.test(r)).map((r) => r.trim().split(' {')[0]);
      // 3.45 (request 065, backlog 063-n2, AC-41): the base rule is a block, so
      // multi-line hosts lose their 6 px line gap (the 3.43 AC-15 kept it).
      expect(withDisplay).toEqual(['.lc-textarea', '.lc-textarea--one-line']);
      expect(css).toMatch(/\n\.lc-textarea \{\s*display: block;/);
    });
  });

  describe('auto-resize height (md: line 24, padding 12, border 1)', () => {
    let scrollHeight = 48;
    const measure = (inputs: Record<string, unknown>, scroll: number) => {
      scrollHeight = scroll;
      render({ autoResize: true, ...inputs });
      Object.defineProperty(field(), 'scrollHeight', { configurable: true, get: () => scrollHeight });
      // A value change re-runs the measurement after the render.
      fixture.componentRef.setInput('value', `x${scroll}`);
      fixture.detectChanges();
      return { height: field().style.height, overflowY: field().style.overflowY };
    };

    beforeEach(() => {
      jest.spyOn(window, 'getComputedStyle').mockReturnValue({
        lineHeight: '24px',
        paddingTop: '12px',
        paddingBottom: '12px',
        borderTopWidth: '1px',
        borderBottomWidth: '1px',
      } as CSSStyleDeclaration);
    });

    it('one line is 24 + 24 + 2 = 50 px', () => {
      expect(measure({ rows: 1, maxRows: 5 }, 48)).toEqual({ height: '50px', overflowY: '' });
      expect(measure({ rows: 3, minRows: 1, maxRows: 5 }, 48)).toEqual({ height: '50px', overflowY: '' });
    });

    it('grows with the text and scrolls at maxRows (146 px)', () => {
      expect(measure({ rows: 1, maxRows: 5 }, 96)).toEqual({ height: '98px', overflowY: '' });
      expect(measure({ rows: 1, maxRows: 5 }, 192)).toEqual({ height: '146px', overflowY: 'auto' });
      expect(measure({ rows: 1, maxRows: 5 }, 120)).toEqual({ height: '122px', overflowY: '' });
    });

    it('the minRows floor keeps its 3.42 height (minRows 3: 96 px)', () => {
      expect(measure({ minRows: 3, maxRows: 6 }, 94)).toEqual({ height: '96px', overflowY: '' });
      expect(measure({ minRows: 2, maxRows: 10 }, 94)).toEqual({ height: '96px', overflowY: '' });
    });
  });
});
