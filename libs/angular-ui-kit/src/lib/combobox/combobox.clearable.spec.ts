import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { ComboboxComponent, type ComboboxOption, type ComboboxSize } from './combobox.component';

/**
 * 3.52 (request 073, finance-intelligence massnahmen-prove row 5, AC-1, AC-3,
 * AC-5, design D-1): `clearable` (default true) leaves out the clear button of
 * a selected single value, for required single choices such as a status. It
 * mirrors `lc-select.clearable` (3.39). jsdom has no layout: the input's end
 * (frame end − 9 px at sm/md/lg) is measured in the story *Required single
 * choice (DE)* (build.md).
 */
const STATUS: ComboboxOption[] = [
  { value: 'open', label: 'Offen' },
  { value: 'partial', label: 'Teilweise umgesetzt (Restaufwand in Klärung)' },
  { value: 'deferred', label: 'Zurückgestellt bis zur Budgetfreigabe' },
];

@Component({
  standalone: true,
  imports: [ComboboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (attr()) {
      <lc-combobox label="Status" clearable="false" [options]="options" [(selectedValue)]="status" />
    } @else if (unset()) {
      <lc-combobox label="Status" [options]="options" [size]="size()" [(selectedValue)]="status" />
    } @else {
      <lc-combobox
        label="Status"
        clearAriaLabel="Auswahl löschen"
        [options]="options"
        [size]="size()"
        [clearable]="clearable()"
        [multiple]="multiple()"
        [loading]="loading()"
        [disabled]="disabled()"
        [(selectedValue)]="status"
      />
    }
    <button type="button" class="next">Speichern</button>
  `,
})
class Host {
  readonly options = STATUS;
  readonly attr = signal(false);
  readonly unset = signal(false);
  readonly clearable = signal(true);
  readonly multiple = signal(false);
  readonly loading = signal(false);
  readonly disabled = signal(false);
  readonly size = signal<ComboboxSize>('md');
  readonly status = signal<string | null>('partial');
}

describe('lc-combobox — clearable (3.52, request 073)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const root = () => fixture.nativeElement as HTMLElement;
  const input = () => root().querySelector('input') as HTMLInputElement;
  const clearButton = () => root().querySelector<HTMLButtonElement>('.lc-combobox__clear');
  const combobox = () => fixture.debugElement.query((d) => d.componentInstance instanceof ComboboxComponent).componentInstance as ComboboxComponent;
  /** Elements a Tab press stops at inside the host, in order (class or tag). */
  const tabStops = () =>
    Array.from(root().querySelectorAll<HTMLElement>('input, button, [tabindex]'))
      .filter((e) => e.tabIndex >= 0 && !(e as HTMLButtonElement).disabled)
      .map((e) => e.className || e.tagName.toLowerCase());
  const key = (k: string) => {
    input().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };
  const type = (text: string) => {
    input().value = text;
    input().dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  };
  const optionLabels = () => Array.from(document.querySelectorAll('.lc-combobox__option-label')).map((o) => o.textContent);

  const create = (set: (h: Host) => void = () => undefined) => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    set(host);
    fixture.detectChanges();
  };

  afterEach(() => {
    fixture?.destroy();
    (document.activeElement as HTMLElement | null)?.blur();
  });

  describe('AC-1, AC-2: the input', () => {
    it('defaults to true: a single value shows the clear button with the attributes of 3.51', () => {
      create((h) => h.unset.set(true));
      expect(combobox().clearable()).toBe(true);
      const button = clearButton() as HTMLButtonElement;
      expect(button).not.toBeNull();
      expect([...button.attributes].map((a) => `${a.name}=${a.value}`).filter((a) => !a.startsWith('_ng'))).toEqual([
        'type=button',
        'class=lc-combobox__clear',
        'aria-label=Clear',
      ]);
      const frame = root().querySelector('.lc-combobox__input-wrapper') as HTMLElement;
      expect([...frame.children].map((c) => c.tagName.toLowerCase())).toEqual(['input', 'button']);
    });

    it.each<ComboboxSize>(['sm', 'md', 'lg'])('%s: false renders no clear button; the label stays in the input', (size) => {
      create((h) => {
        h.size.set(size);
        h.clearable.set(false);
      });
      expect(clearButton()).toBeNull();
      const frame = root().querySelector('.lc-combobox__input-wrapper') as HTMLElement;
      expect([...frame.children].map((c) => c.tagName.toLowerCase())).toEqual(['input']);
      expect(input().value).toBe('Teilweise umgesetzt (Restaufwand in Klärung)');
    });

    it('takes the attribute form clearable="false" (booleanAttribute)', () => {
      create((h) => h.attr.set(true));
      expect(combobox().clearable()).toBe(false);
      expect(clearButton()).toBeNull();
    });

    it('switching back to true shows the button again', () => {
      create((h) => h.clearable.set(false));
      expect(clearButton()).toBeNull();
      host.clearable.set(true);
      fixture.detectChanges();
      expect(clearButton()).not.toBeNull();
    });

    it('false: typing still filters and choosing another option replaces the value', () => {
      create((h) => h.clearable.set(false));
      input().focus();
      type('Zur');
      expect(optionLabels()).toEqual(['Zurückgestellt bis zur Budgetfreigabe']);
      key('ArrowDown');
      key('Enter');
      expect(host.status()).toBe('deferred');
      expect(input().value).toBe('Zurückgestellt bis zur Budgetfreigabe');
      expect(clearButton()).toBeNull();
    });
  });

  describe('AC-3: other states with clearable=false', () => {
    it('multiple: the chips keep their remove button', () => {
      create((h) => {
        h.clearable.set(false);
        h.multiple.set(true);
      });
      combobox().writeValue([STATUS[0], STATUS[1]]);
      fixture.detectChanges();
      const chips = root().querySelectorAll('lc-chip');
      expect(chips).toHaveLength(2);
      for (const chip of Array.from(chips)) expect(chip.querySelector('button')).not.toBeNull();
      expect(clearButton()).toBeNull();
    });

    it('loading: the spinner shows as before', () => {
      create((h) => {
        h.clearable.set(false);
        h.loading.set(true);
      });
      expect(root().querySelector('lc-spinner.lc-combobox__spinner')).not.toBeNull();
      expect(clearButton()).toBeNull();
    });

    it('writeValue(null), a selectedValue write of null and clear() still empty the field', () => {
      create((h) => h.clearable.set(false));
      combobox().writeValue(null);
      fixture.detectChanges();
      expect(input().value).toBe('');

      host.status.set('open');
      fixture.detectChanges();
      expect(input().value).toBe('Offen');
      host.status.set(null);
      fixture.detectChanges();
      expect(input().value).toBe('');

      host.status.set('open');
      fixture.detectChanges();
      combobox().clear();
      fixture.detectChanges();
      expect(input().value).toBe('');
      expect(host.status()).toBeNull();
    });

    it('disabled: the input is disabled as before', () => {
      create((h) => {
        h.clearable.set(false);
        h.disabled.set(true);
      });
      expect(input().disabled).toBe(true);
      expect(clearButton()).toBeNull();
    });
  });

  describe('AC-5: keyboard', () => {
    it('false: Tab goes from the input to the next control (one stop fewer)', () => {
      create();
      expect(tabStops()).toEqual(['lc-combobox__input', 'lc-combobox__clear', 'next']);
      host.clearable.set(false);
      fixture.detectChanges();
      expect(tabStops()).toEqual(['lc-combobox__input', 'next']);
    });

    it.each([true, false])('clearable=%s: Escape closes the list and keeps the value; Enter chooses as before', (clearable) => {
      create((h) => h.clearable.set(clearable));
      input().focus();
      fixture.detectChanges();
      expect(input().getAttribute('aria-expanded')).toBe('true');
      key('Escape');
      expect(input().getAttribute('aria-expanded')).toBe('false');
      expect(host.status()).toBe('partial');
      type('Off');
      key('ArrowDown');
      key('Enter');
      expect(host.status()).toBe('open');
    });
  });
});
