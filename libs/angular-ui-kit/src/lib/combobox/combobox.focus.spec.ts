import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { ComboboxComponent, type ComboboxOption } from './combobox.component';

/**
 * 3.35 (request 055, monatsstand-prove row 1, AC-2, AC-3, AC-6): `focus()`
 * moves the focus into the field's `<input>`, e.g. when "Monat einfrieren"
 * opens. Like a user's focus it opens the list only with `openOnFocus`.
 */
const MONTHS: ComboboxOption[] = [
  { value: '2026-10', label: 'Oktober 2026', description: 'Noch nicht eingefroren' },
  { value: '2026-09', label: 'September 2026', description: 'Entwurf vorhanden' },
  { value: '2026-08', label: 'August 2026', description: 'Fassung 1 freigegeben' },
];

@Component({
  standalone: true,
  imports: [ComboboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="outside">Monat einfrieren</button>
    <lc-combobox label="Monat" [options]="options()" [openOnFocus]="openOnFocus()" [disabled]="disabled()" />
  `,
})
class Host {
  readonly options = signal<ComboboxOption[]>(MONTHS);
  readonly openOnFocus = signal(true);
  readonly disabled = signal(false);
  readonly month = viewChild.required(ComboboxComponent);
}

describe('ComboboxComponent — focus() (3.35, request 055)', () => {
  let fixture: ComponentFixture<Host>;
  const root = () => fixture.nativeElement as HTMLElement;
  const input = () => root().querySelector('input') as HTMLInputElement;
  const outside = () => root().querySelector('.outside') as HTMLButtonElement;
  const listboxes = () => document.querySelectorAll('[role=listbox]');

  const create = (patch: Partial<{ openOnFocus: boolean; disabled: boolean; options: ComboboxOption[] }> = {}) => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    const host = fixture.componentInstance;
    if (patch.openOnFocus !== undefined) host.openOnFocus.set(patch.openOnFocus);
    if (patch.disabled) host.disabled.set(true);
    if (patch.options) host.options.set(patch.options);
    fixture.detectChanges();
  };
  const focusField = (options?: FocusOptions) => {
    fixture.componentInstance.month().focus(options);
    fixture.detectChanges();
  };

  afterEach(() => {
    jest.restoreAllMocks();
    fixture?.destroy();
    (document.activeElement as HTMLElement | null)?.blur();
  });

  it('AC-2: viewChild(ComboboxComponent).focus() focuses the inner input', () => {
    create();
    expect(document.activeElement).toBe(document.body);
    focusField();
    expect(document.activeElement).toBe(input());
  });

  it('AC-2: openOnFocus=true opens the list, as a user focus does', () => {
    create({ openOnFocus: true });
    focusField();
    expect(input().getAttribute('aria-expanded')).toBe('true');
    expect(listboxes()).toHaveLength(1);
    expect(input().getAttribute('aria-controls')).toBe(listboxes()[0].id);
  });

  it('AC-2: openOnFocus=false keeps the list closed', () => {
    create({ openOnFocus: false });
    focusField();
    expect(document.activeElement).toBe(input());
    expect(input().getAttribute('aria-expanded')).toBe('false');
    expect(input().hasAttribute('aria-controls')).toBe(false);
    expect(listboxes()).toHaveLength(0);
  });

  it('AC-2: openOnFocus=true with nothing to show stays closed', () => {
    create({ openOnFocus: true, options: [] });
    focusField();
    expect(document.activeElement).toBe(input());
    expect(input().getAttribute('aria-expanded')).toBe('false');
    expect(listboxes()).toHaveLength(0);
  });

  it('AC-2: passes the options to the native focus()', () => {
    create({ openOnFocus: false });
    const spy = jest.spyOn(input(), 'focus');
    focusField({ preventScroll: true });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('AC-2: before the view exists it does nothing and does not throw', () => {
    // An instance without a view: its `viewChild` has no element yet.
    TestBed.configureTestingModule({
      providers: [{ provide: ElementRef, useValue: new ElementRef(document.createElement('lc-combobox')) }],
    });
    const bare = TestBed.runInInjectionContext(() => new ComboboxComponent());
    expect(() => bare.focus()).not.toThrow();
    expect(document.activeElement).toBe(document.body);
  });

  it('AC-3: disabled, the focus stays where it is and the list stays closed', () => {
    create({ disabled: true });
    outside().focus();
    expect(() => focusField()).not.toThrow();
    expect(input().disabled).toBe(true);
    expect(document.activeElement).toBe(outside());
    expect(listboxes()).toHaveLength(0);
  });

  it('AC-6: the requester\'s transition query `lc-combobox input` finds the same element', () => {
    create({ openOnFocus: false });
    focusField();
    expect(root().querySelectorAll('lc-combobox input')).toHaveLength(1);
    expect(root().querySelector('lc-combobox input')).toBe(document.activeElement);
  });
});
