import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ComboboxComponent, type ComboboxOption, type ComboboxValue } from './combobox.component';

/**
 * 3.29 (request 046, regeln row 2): `lc-combobox` `[(selectedValue)]`, the
 * two-way `value` of the chosen option (design 046 D-2, AC-8 … AC-12).
 */
const MONTHS: ComboboxOption[] = ['Juli', 'August', 'September'].map((name, i) => ({
  value: `2026-0${7 + i}`,
  label: `${name} 2026`,
}));

/** The list is rendered in the CDK overlay container (document.body). */
const option = (label: string): HTMLElement | undefined =>
  [...document.querySelectorAll<HTMLElement>('.cdk-overlay-container .lc-combobox__option')].find(
    (o) => o.textContent?.trim() === label,
  );

@Component({
  standalone: true,
  imports: [ComboboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-combobox
      label="Gilt ab"
      [options]="options()"
      [multiple]="multiple()"
      [(selectedValue)]="month"
      (valueChange)="values.push($event)"
      (selectedValueChange)="months.push($event)"
    />
  `,
})
class TwoWayHost {
  readonly options = signal<ComboboxOption[]>(MONTHS);
  readonly multiple = signal(false);
  readonly month = signal<string | null>('2026-07');
  readonly values: ComboboxValue[] = [];
  readonly months: (string | null)[] = [];
}

@Component({
  standalone: true,
  imports: [ComboboxComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<lc-combobox label="Gilt ab" [options]="options()" [formControl]="control" />`,
})
class FormHost {
  readonly options = signal<ComboboxOption[]>(MONTHS);
  readonly control = new FormControl<ComboboxValue>(null);
}

describe('lc-combobox selectedValue (3.29, regeln row 2)', () => {
  let fixture: ComponentFixture<TwoWayHost>;
  let host: TwoWayHost;
  const input = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const detect = () => {
    fixture.detectChanges();
    fixture.detectChanges();
  };
  /** Types `text` (the list filters by it and opens), then clicks the option `label`. */
  const pick = (text: string, label: string) => {
    input().value = text;
    input().dispatchEvent(new Event('input'));
    detect();
    option(label)?.click();
    detect();
  };

  const create = (patch: { month?: string | null; options?: ComboboxOption[]; multiple?: boolean } = {}) => {
    TestBed.configureTestingModule({ imports: [TwoWayHost] });
    fixture = TestBed.createComponent(TwoWayHost);
    host = fixture.componentInstance;
    if ('month' in patch) host.month.set(patch.month ?? null);
    if (patch.options) host.options.set(patch.options);
    if (patch.multiple) host.multiple.set(true);
    fixture.detectChanges();
  };

  afterEach(() => fixture?.destroy());

  it("shows the matching option's label on the first render, without an event (AC-8)", () => {
    create();
    expect(input().value).toBe('Juli 2026');
    expect(host.values).toEqual([]);
    expect(host.months).toEqual([]);
  });

  it('fills the label in when the options arrive later, silently (AC-8)', () => {
    create({ options: [] });
    expect(input().value).toBe('');
    host.options.set(MONTHS);
    detect();
    expect(input().value).toBe('Juli 2026');
    expect(host.values).toEqual([]);
    expect(host.months).toEqual([]);
  });

  it('shows an empty field for an unknown value (AC-8)', () => {
    create({ month: '2030-01' });
    expect(input().value).toBe('');
    expect(host.month()).toBe('2030-01');
  });

  it('selects and clears on page writes, including back to null, without emitting (AC-9)', () => {
    create();
    host.month.set('2026-09');
    detect();
    expect(input().value).toBe('September 2026');
    host.month.set(null);
    detect();
    expect(input().value).toBe('');
    expect(fixture.nativeElement.querySelector('.lc-combobox__clear')).toBeNull();
    host.month.set('2026-08');
    detect();
    expect(input().value).toBe('August 2026');
    expect(host.values).toEqual([]);
    expect(host.months).toEqual([]);
  });

  it('emits a user choice through selectedValueChange and the unchanged valueChange; [(…)] writes back (AC-9, AC-10)', () => {
    create();
    pick('Aug', 'August 2026');
    expect(host.values).toEqual([MONTHS[1]]);
    expect(host.months).toEqual(['2026-08']);
    expect(host.month()).toBe('2026-08');
    expect(input().value).toBe('August 2026');
  });

  it('emits null for a clear by the user, next to valueChange(null) (AC-9, AC-10)', () => {
    create();
    (fixture.nativeElement.querySelector('.lc-combobox__clear') as HTMLButtonElement).click();
    detect();
    expect(host.values).toEqual([null]);
    expect(host.months).toEqual([null]);
    expect(host.month()).toBeNull();
    expect(input().value).toBe('');
  });

  it('keeps a user choice when the options are replaced (AC-9)', () => {
    create();
    pick('Sep', 'September 2026');
    host.options.set([...MONTHS]);
    detect();
    expect(input().value).toBe('September 2026');
    expect(host.months).toEqual(['2026-09']);
  });

  it('is ignored with multiple, with a dev warning (D-2)', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    create({ multiple: true });
    expect(fixture.nativeElement.querySelectorAll('lc-chip')).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith('[lc-combobox] selectedValue is ignored with multiple');
    warn.mockRestore();
  });
});

describe('lc-combobox without selectedValue: unchanged (3.29, AC-10, AC-11)', () => {
  it('starts empty and leaves the forms binding alone, also when the options change', () => {
    TestBed.configureTestingModule({ imports: [FormHost] });
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('');

    fixture.componentInstance.control.setValue(MONTHS[2]);
    fixture.detectChanges();
    expect(input.value).toBe('September 2026');

    fixture.componentInstance.options.set([...MONTHS]);
    fixture.detectChanges();
    expect(input.value).toBe('September 2026');
    expect(fixture.componentInstance.control.value).toBe(MONTHS[2]);

    fixture.componentInstance.control.setValue(null);
    fixture.componentInstance.options.set(MONTHS.slice(0, 2));
    fixture.detectChanges();
    expect(input.value).toBe('');
    expect(fixture.componentInstance.control.value).toBeNull();
  });

  it('defaults selectedValue to null', () => {
    TestBed.configureTestingModule({ imports: [ComboboxComponent] });
    const fixture = TestBed.createComponent(ComboboxComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedValue()).toBeNull();
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).value).toBe('');
  });
});
