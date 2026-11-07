import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { ComboboxComponent, type ComboboxOption } from './combobox.component';

/**
 * 3.36 (request 056, 055-n4, AC-32): `announceError` as on `lc-textarea`.
 * `false` drops only `role="alert"` from the error, so a focus moved to the
 * field after a 422 under an error summary reads the error once.
 */
const OPTIONS: ComboboxOption[] = [
  { value: '4711', label: '4711 Verwaltung' },
  { value: '4712', label: '4712 Vertrieb' },
];

describe('ComboboxComponent — announceError (3.36, request 056)', () => {
  let fixture: ComponentFixture<ComboboxComponent>;
  const root = () => fixture.nativeElement as HTMLElement;
  const error = () => root().querySelector('.lc-combobox__error') as HTMLElement | null;
  const input = () => root().querySelector('input') as HTMLInputElement;

  const render = (inputs: Record<string, unknown>) => {
    TestBed.configureTestingModule({ imports: [ComboboxComponent] });
    fixture = TestBed.createComponent(ComboboxComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentRef.setInput('label', 'Kostenstelle');
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
  };

  afterEach(() => fixture?.destroy());

  it('defaults to true: the error is role="alert", with the same attributes in the same order as 3.35', () => {
    render({ error: 'Wählen Sie eine Kostenstelle aus.' });
    expect(fixture.componentInstance.announceError()).toBe(true);
    const el = error() as HTMLElement;
    expect(el.getAttributeNames()).toEqual(['role', 'class', 'id']);
    expect(el.getAttribute('role')).toBe('alert');
    expect(el.id).toBe(`${fixture.componentInstance.inputId}-error`);
    expect(el.textContent).toBe('Wählen Sie eine Kostenstelle aus.');
  });

  it('false: no role, but the text, the id, aria-describedby and aria-invalid stay', () => {
    render({ error: 'Wählen Sie eine Kostenstelle aus.', announceError: false });
    const el = error() as HTMLElement;
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.textContent).toBe('Wählen Sie eine Kostenstelle aus.');
    expect(input().getAttribute('aria-describedby')).toBe(el.id);
    expect(input().getAttribute('aria-invalid')).toBe('true');
  });

  it('switching back to true restores the alert role; no error renders no message either way', () => {
    render({ error: 'Pflichtfeld', announceError: false });
    fixture.componentRef.setInput('announceError', true);
    fixture.detectChanges();
    expect(error()?.getAttribute('role')).toBe('alert');
    fixture.componentRef.setInput('error', undefined);
    fixture.detectChanges();
    expect(error()).toBeNull();
    expect(input().hasAttribute('aria-describedby')).toBe(false);
  });
});
