import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ComboboxComponent, type ComboboxOption } from './combobox.component';

/**
 * 3.32 (request 051, stammdaten-2026-11-05 row 3): `openOnFocus` (default
 * `true`). With `false`, focus alone (`focus()` from the page, Tab) leaves the
 * list closed; a click or tap on the field, typing or ArrowDown opens it.
 * Design 051 §1 D, D-5, §2, §4, §9; AC-9 … AC-11.
 */
const COST_CENTRES: ComboboxOption[] = [
  { value: '4711', label: '4711 Administration' },
  { value: '4712', label: '4712 Sales' },
  { value: '4713', label: '4713 Production' },
];

@Component({
  standalone: true,
  imports: [ComboboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (unset()) {
      <lc-combobox label="Cost centre" [options]="options" error="Select a cost centre from the list." />
    } @else {
      <lc-combobox
        label="Cost centre"
        [options]="options"
        [multiple]="multiple()"
        [disabled]="disabled()"
        [openOnFocus]="openOnFocus()"
        error="Select a cost centre from the list."
      />
    }
  `,
})
class Host {
  readonly options = COST_CENTRES;
  readonly unset = signal(false);
  readonly openOnFocus = signal(false);
  readonly multiple = signal(false);
  readonly disabled = signal(false);
}

describe('lc-combobox 3.32 openOnFocus (request 051)', () => {
  let fixture: ComponentFixture<Host>;
  const root = () => fixture.nativeElement as HTMLElement;
  const input = () => root().querySelector('input') as HTMLInputElement;
  const frame = () => root().querySelector('.lc-combobox__input-wrapper') as HTMLElement;
  const listboxes = () => document.querySelectorAll('[role=listbox]');
  const expanded = () => input().getAttribute('aria-expanded');

  const create = (patch: Partial<{ unset: boolean; openOnFocus: boolean; multiple: boolean; disabled: boolean }> = {}) => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    const host = fixture.componentInstance;
    if (patch.unset) host.unset.set(true);
    if (patch.openOnFocus) host.openOnFocus.set(true);
    if (patch.multiple) host.multiple.set(true);
    if (patch.disabled) host.disabled.set(true);
    fixture.detectChanges();
  };
  const update = () => fixture.detectChanges();
  /** A pointer press and click on `target`, as the browser sends them (focus moves on mousedown unless prevented). */
  const press = (target: HTMLElement) => {
    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    target.dispatchEvent(down);
    if (!down.defaultPrevented && target === input()) target.focus();
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    update();
  };
  const key = (k: string) => {
    input().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    update();
  };
  const expectClosed = () => {
    expect(expanded()).toBe('false');
    expect(input().hasAttribute('aria-controls')).toBe(false);
    expect(listboxes()).toHaveLength(0);
  };
  const expectOpen = () => {
    expect(expanded()).toBe('true');
    expect(input().getAttribute('aria-controls')).toBe(listboxes()[0]?.id);
    expect(listboxes()).toHaveLength(1);
  };

  afterEach(() => {
    jest.useRealTimers();
    fixture?.destroy();
    (document.activeElement as HTMLElement | null)?.blur();
  });

  describe('AC-9: the default', () => {
    it('is true', () => {
      create({ unset: true });
      const combobox = fixture.debugElement.query(By.directive(ComboboxComponent)).componentInstance as ComboboxComponent;
      expect(combobox.openOnFocus()).toBe(true);
    });

    it('opens on focus, as before', () => {
      create({ unset: true });
      expectClosed();
      input().focus();
      update();
      expectOpen();
    });

    it('a click on the focused field with a closed list (after Escape) still opens nothing, as before', () => {
      create({ unset: true });
      input().focus();
      update();
      key('Escape');
      expectClosed();
      press(input());
      expectClosed();
    });

    it('openOnFocus=true renders like the unset default', () => {
      create({ unset: true });
      const other = TestBed.createComponent(Host);
      other.componentInstance.openOnFocus.set(true);
      other.detectChanges();
      // The combobox only: the host's @if/@else anchors sit on different sides
      const markup = (el: HTMLElement) => (el.querySelector('lc-combobox') as HTMLElement).outerHTML.replace(/lc-combobox-\d+/g, 'ID');
      expect(markup(other.nativeElement)).toBe(markup(root()));
      expect(markup(root())).toContain('aria-expanded="false"');
      other.destroy();
    });

    it('openOnFocus=true opens on focus', () => {
      create({ openOnFocus: true });
      input().focus();
      update();
      expectOpen();
    });
  });

  describe('AC-10: openOnFocus=false, focus alone', () => {
    it('renders closed, as the default does', () => {
      create();
      expectClosed();
    });

    it('focus() opens no listbox: aria-expanded stays "false", no aria-controls', () => {
      create();
      input().focus();
      update();
      expect(document.activeElement).toBe(input());
      expectClosed();
    });

    it('a second focus after blur stays closed', () => {
      jest.useFakeTimers();
      create();
      press(input());
      expectOpen();
      input().blur();
      jest.advanceTimersByTime(200);
      update();
      expectClosed();
      input().focus();
      update();
      expectClosed();
    });

    it('in multiple mode too', () => {
      create({ multiple: true });
      input().focus();
      update();
      expectClosed();
    });
  });

  describe('AC-11: openOnFocus=false, what opens it', () => {
    it('a click or tap on the input that is not focused yet', () => {
      create();
      press(input());
      expect(document.activeElement).toBe(input());
      expectOpen();
    });

    it('a click on the already focused input', () => {
      create();
      input().focus();
      update();
      expectClosed();
      press(input());
      expectOpen();
    });

    it('a click on the frame beside the input: focuses the input and opens', () => {
      create();
      press(frame());
      expect(document.activeElement).toBe(input());
      expectOpen();
    });

    it('a second click keeps it open (no toggle)', () => {
      create();
      press(input());
      press(input());
      expectOpen();
    });

    it('typing', () => {
      create();
      input().focus();
      input().value = '47';
      input().dispatchEvent(new Event('input', { bubbles: true }));
      update();
      expectOpen();
    });

    it('ArrowDown, with the first option highlighted', () => {
      create();
      input().focus();
      update();
      key('ArrowDown');
      expectOpen();
      expect(input().getAttribute('aria-activedescendant')).toBe(`${listboxes()[0].id}-opt-0`);
    });

    it('in multiple mode: a click opens it', () => {
      create({ multiple: true });
      press(input());
      expectOpen();
    });

    it('nothing opens it while disabled', () => {
      create({ disabled: true });
      press(frame());
      press(input());
      expectClosed();
    });
  });

  describe('AC-11: Escape and choosing work as before', () => {
    it('Escape closes it, focus stays in the input', () => {
      create();
      press(input());
      key('Escape');
      expectClosed();
      expect(document.activeElement).toBe(input());
    });

    it('choosing an option closes it and shows the label', () => {
      create();
      press(input());
      (document.querySelector('[role=option]') as HTMLElement).click();
      update();
      expectClosed();
      expect(input().value).toBe('4711 Administration');
    });

    it('Enter on the highlighted option chooses it', () => {
      create();
      input().focus();
      key('ArrowDown');
      key('ArrowDown');
      key('Enter');
      expectClosed();
      expect(input().value).toBe('4712 Sales');
    });

    it('the clear button clears and returns focus to the input, the list stays closed', () => {
      create();
      press(input());
      (document.querySelector('[role=option]') as HTMLElement).click();
      update();
      const clear = root().querySelector('.lc-combobox__clear') as HTMLButtonElement;
      clear.focus();
      press(clear);
      expect(input().value).toBe('');
      expect(document.activeElement).toBe(input());
      expectClosed();
    });

    it('a chip × removes the choice and returns focus to the input, the list stays closed', () => {
      create({ multiple: true });
      press(input());
      (document.querySelector('[role=option]') as HTMLElement).click();
      update();
      const remove = root().querySelector('.lc-chip__delete') as HTMLButtonElement;
      expect(remove).toBeTruthy();
      remove.focus();
      press(remove);
      expect(root().querySelector('lc-chip')).toBeNull();
      expect(document.activeElement).toBe(input());
      expectClosed();
    });
  });
});
