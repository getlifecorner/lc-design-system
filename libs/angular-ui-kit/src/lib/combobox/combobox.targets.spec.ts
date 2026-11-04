import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { ComboboxComponent, type ComboboxOption, type ComboboxSize } from './combobox.component';

/**
 * 3.30 (request 047, regeln rows 5 and 6): the combobox clear button's box,
 * hit area and tab stop, the 44 px lg input and the frame that focuses the
 * input (design 047 §2–§6, AC-3, AC-4, AC-8, AC-11).
 */
const MONTHS: ComboboxOption[] = ['Juli', 'August'].map((name, i) => ({ value: `2026-0${7 + i}`, label: `${name} 2026` }));

@Component({
  standalone: true,
  imports: [ComboboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-combobox
      label="Gilt ab"
      clearAriaLabel="Auswahl löschen"
      [options]="options"
      [size]="size()"
      [multiple]="multiple()"
      [disabled]="disabled()"
      [(selectedValue)]="month"
    />
  `,
})
class Host {
  readonly options = MONTHS;
  readonly size = signal<ComboboxSize>('md');
  readonly multiple = signal(false);
  readonly disabled = signal(false);
  readonly month = signal<string | null>('2026-07');
}

describe('lc-combobox 3.30 (request 047)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const root = () => fixture.nativeElement as HTMLElement;
  const input = () => root().querySelector('input') as HTMLInputElement;
  const frame = () => root().querySelector('.lc-combobox__input-wrapper') as HTMLElement;
  const clearButton = () => root().querySelector<HTMLButtonElement>('.lc-combobox__clear');

  const create = (patch: Partial<{ size: ComboboxSize; multiple: boolean; disabled: boolean; month: string | null }> = {}) => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    if (patch.size) host.size.set(patch.size);
    if (patch.multiple) host.multiple.set(true);
    if (patch.disabled) host.disabled.set(true);
    if (patch.month !== undefined) host.month.set(patch.month);
    fixture.detectChanges();
  };
  /** A pointer press and click on `target`, as the browser sends them; returns the mousedown. */
  const press = (target: Element) => {
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    target.dispatchEvent(down);
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    return down;
  };

  afterEach(() => {
    fixture?.destroy();
    (document.activeElement as HTMLElement | null)?.blur();
  });

  describe('frame (AC-4)', () => {
    it.each<ComboboxSize>(['xs', 'sm', 'md', 'lg'])('%s: a press on the frame keeps focus (mousedown prevented), the click focuses the input', (size) => {
      create({ size });
      expect(document.activeElement).not.toBe(input());
      const down = press(frame());
      expect(down.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(input());
    });

    it('does not focus a disabled input', () => {
      create({ size: 'lg', disabled: true });
      press(frame());
      expect(document.activeElement).not.toBe(input());
    });

    it('leaves a press on the input itself to the browser', () => {
      create({ size: 'lg' });
      const down = press(input());
      expect(down.defaultPrevented).toBe(false);
    });

    it('leaves the chip remove buttons alone (multiple mode)', () => {
      create({ multiple: true, month: null });
      const combobox = fixture.debugElement.children[0].componentInstance as ComboboxComponent;
      combobox.writeValue([MONTHS[0]]);
      fixture.detectChanges();
      const remove = root().querySelector('lc-chip button') as HTMLButtonElement;
      expect(remove).toBeTruthy();
      const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      remove.dispatchEvent(down);
      expect(down.defaultPrevented).toBe(false);
    });
  });

  describe('clear button (AC-3, AC-8)', () => {
    it('is a native button in the tab order after the input, named by clearAriaLabel', () => {
      create();
      const clear = clearButton() as HTMLButtonElement;
      expect(clear.type).toBe('button');
      expect(clear.hasAttribute('tabindex')).toBe(false);
      expect(clear.tabIndex).toBe(0);
      expect(clear.getAttribute('aria-label')).toBe('Auswahl löschen');
      expect(input().compareDocumentPosition(clear) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('clears and moves focus to the input; a pointer press keeps focus in the input', () => {
      create({ size: 'lg' });
      input().focus();
      const clear = clearButton() as HTMLButtonElement;
      const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      clear.dispatchEvent(down);
      expect(down.defaultPrevented).toBe(true);
      clear.focus();
      clear.click();
      fixture.detectChanges();
      expect(host.month()).toBeNull();
      expect(input().value).toBe('');
      expect(clearButton()).toBeNull();
      expect(document.activeElement).toBe(input());
    });

    it('is disabled, so not focusable, in a disabled combobox', () => {
      create({ disabled: true });
      expect((clearButton() as HTMLButtonElement).disabled).toBe(true);
    });
  });
});

describe('lc-combobox 3.30 styles (request 047)', () => {
  const css = compile(resolve(__dirname, 'combobox.component.scss')).css;
  const rule = (selector: string) => {
    const at = css.indexOf(`\n${selector} {`);
    expect([selector, at > -1]).toEqual([selector, true]);
    return css.slice(at, css.indexOf('}', at));
  };

  it('AC-3: the clear button is a 24 px box with a 20 px footprint and content-box fill', () => {
    const clear = rule('.lc-combobox__clear');
    expect(clear).toContain('position: relative');
    expect(clear).toMatch(/width: 1\.5rem;\n\s*height: 1\.5rem;\n\s*margin: -0\.125rem;\n\s*padding: 0\.125rem;/);
    // After the `background` shorthand, which would reset the clip.
    expect(clear).toMatch(/background: transparent;\n\s*background-clip: content-box;/);
    expect(clear).toContain('border-radius: calc(var(--border-radius-sm) + 0.125rem)');
    expect(rule('.lc-combobox__clear:hover:not(:disabled)')).toContain('background-color: var(--color-surface-hover)');
  });

  it('AC-3: a 2 px primary-500 ring round the 24 px box, Highlight in forced colours', () => {
    expect(rule('.lc-combobox__clear:focus-visible')).toMatch(/outline: 2px solid var\(--color-primary-500\);\n\s*outline-offset: 0;/);
    const forced = css.slice(css.indexOf('@media (forced-colors: active)'));
    expect(forced).toMatch(/\.lc-combobox__clear:focus-visible \{\n\s*outline-color: Highlight;/);
  });

  it('AC-3: lg moves the clear 12 px from the input and gives it a 44 × 44 hit area to the inner border edge', () => {
    expect(rule('.lc-combobox--lg .lc-combobox__clear')).toContain('margin-inline-start: 0.625rem');
    expect(rule('.lc-combobox--lg .lc-combobox__clear::before')).toMatch(
      /content: "";\n\s*position: absolute;\n\s*inset: -0\.625rem -0\.375rem -0\.625rem -0\.875rem;/,
    );
    expect(css).not.toMatch(/lc-combobox--(xs|sm|md) \.lc-combobox__clear/);
  });

  it('AC-4, AC-11: the lg input is 44 px high inside the 4 px wrapper padding; xs to md keep their heights', () => {
    expect(rule('.lc-combobox--lg .lc-combobox__input')).toMatch(/height: 2\.75rem;\n\s*margin-block: -0\.25rem;/);
    expect(rule('.lc-combobox--xs .lc-combobox__input')).toMatch(/height: 1\.5rem;\n\}?$/);
    expect(rule('.lc-combobox--sm .lc-combobox__input')).toMatch(/height: 1\.75rem;\n\}?$/);
    expect(rule('.lc-combobox--md .lc-combobox__input')).toMatch(/height: 2rem;\n\}?$/);
    expect(rule('.lc-combobox__input-wrapper')).toContain('padding: 0.25rem 0.5rem');
  });
});
