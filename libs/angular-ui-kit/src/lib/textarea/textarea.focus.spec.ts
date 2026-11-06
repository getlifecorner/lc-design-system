import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { TextareaComponent } from './textarea.component';

/**
 * 3.35 (request 055, monatsstand-prove row 1, AC-1, AC-3, AC-6): `focus()`
 * moves the focus into the native `<textarea>`, e.g. when "Freigeben" opens
 * or after a rejected save.
 */
@Component({
  standalone: true,
  imports: [TextareaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="outside">Freigeben</button>
    <lc-textarea label="Vermerk" [disabled]="disabled()" [readonly]="readonly()" />
  `,
})
class Host {
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly note = viewChild.required(TextareaComponent);
}

describe('TextareaComponent — focus() (3.35, request 055)', () => {
  let fixture: ComponentFixture<Host>;
  const root = () => fixture.nativeElement as HTMLElement;
  const field = () => root().querySelector('textarea') as HTMLTextAreaElement;
  const outside = () => root().querySelector('.outside') as HTMLButtonElement;

  const create = (patch: Partial<{ disabled: boolean; readonly: boolean }> = {}) => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    if (patch.disabled) fixture.componentInstance.disabled.set(true);
    if (patch.readonly) fixture.componentInstance.readonly.set(true);
    fixture.detectChanges();
  };

  afterEach(() => {
    jest.restoreAllMocks();
    fixture?.destroy();
    (document.activeElement as HTMLElement | null)?.blur();
  });

  it('AC-1: viewChild(TextareaComponent).focus() focuses the native textarea', () => {
    create();
    expect(document.activeElement).toBe(document.body);
    fixture.componentInstance.note().focus();
    expect(document.activeElement).toBe(field());
  });

  it('AC-1: passes the options to the native focus()', () => {
    create();
    const spy = jest.spyOn(field(), 'focus');
    fixture.componentInstance.note().focus({ preventScroll: true });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith({ preventScroll: true });
    fixture.componentInstance.note().focus();
    expect(spy).toHaveBeenLastCalledWith(undefined);
  });

  it('AC-1: before the view exists it does nothing and does not throw', () => {
    // An instance without a view: its `viewChild` has no element yet.
    const bare = TestBed.runInInjectionContext(() => new TextareaComponent());
    expect(() => bare.focus()).not.toThrow();
    expect(document.activeElement).toBe(document.body);
  });

  it('AC-3: disabled, the focus stays where it is', () => {
    create({ disabled: true });
    outside().focus();
    expect(() => fixture.componentInstance.note().focus()).not.toThrow();
    expect(field().disabled).toBe(true);
    expect(document.activeElement).toBe(outside());
  });

  it('AC-3: read-only, the textarea takes the focus (native behaviour)', () => {
    create({ readonly: true });
    outside().focus();
    fixture.componentInstance.note().focus();
    expect(field().readOnly).toBe(true);
    expect(document.activeElement).toBe(field());
  });

  it('AC-6: the requester\'s transition query `lc-textarea textarea` finds the same element', () => {
    create();
    fixture.componentInstance.note().focus();
    expect(root().querySelectorAll('lc-textarea textarea')).toHaveLength(1);
    expect(root().querySelector('lc-textarea textarea')).toBe(document.activeElement);
  });

  it('AC-6: calling it changes no attribute of the field', () => {
    create();
    const before = root().querySelector('lc-textarea')?.outerHTML;
    fixture.componentInstance.note().focus();
    fixture.detectChanges();
    expect(root().querySelector('lc-textarea')?.outerHTML).toBe(before);
  });
});
