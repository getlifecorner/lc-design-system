import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computedName } from '../../testing/axe-jsdom';
import { ButtonComponent } from './button.component';

/**
 * 3.26 (request 041, finance-intelligence sources page, gap row 7):
 * `ariaDescribedBy` ties a visible reason line to the inner `<button>`, also
 * while it is disabled or loading. Unset or empty, the button renders exactly
 * as in 3.25.2.
 */
@Component({
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div lang="de">
      <lc-button
        variant="primary"
        [disabled]="disabled()"
        [loading]="loading()"
        [ariaDescribedBy]="describedBy()"
        disabledReason="Wählen Sie zuerst eine Datei."
      >Hochladen</lc-button>
      <p id="reason">Wählen Sie zuerst eine Datei.</p>
      <p id="hint">Erlaubt sind CSV und XLSX.</p>
    </div>
  `,
})
class DescribedByHostComponent {
  readonly disabled = signal(false);
  readonly loading = signal(false);
  readonly describedBy = signal('');
}

describe('ButtonComponent ariaDescribedBy (3.26, request 041)', () => {
  let fixture: ComponentFixture<DescribedByHostComponent>;
  let host: DescribedByHostComponent;
  const root = () => fixture.nativeElement as HTMLElement;
  const button = () => root().querySelector('button') as HTMLButtonElement;

  /** The accessible description as `aria-describedby` resolves it: the referenced texts in id order. */
  const description = (el: Element) =>
    (el.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
      .join(' ');

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DescribedByHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(DescribedByHostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(root());
    fixture.detectChanges();
  });

  afterEach(() => root().remove());

  it('AC-1: is an optional string input that defaults to an empty string', () => {
    const single = TestBed.createComponent(ButtonComponent);
    expect(single.componentInstance.ariaDescribedBy()).toBe('');
  });

  it('AC-2: unset or empty, the inner button has no aria-describedby, nor does the host', () => {
    const plain = TestBed.createComponent(ButtonComponent);
    plain.detectChanges();
    expect((plain.nativeElement as HTMLElement).querySelector('button')?.hasAttribute('aria-describedby')).toBe(false);

    expect(host.describedBy()).toBe('');
    expect(button().hasAttribute('aria-describedby')).toBe(false);
    expect(root().querySelector('lc-button')?.hasAttribute('aria-describedby')).toBe(false);

    host.describedBy.set('reason');
    fixture.detectChanges();
    host.describedBy.set('');
    fixture.detectChanges();
    expect(button().hasAttribute('aria-describedby')).toBe(false);
  });

  it.each([
    ['enabled', false, false],
    ['disabled', true, false],
    ['loading', false, true],
    ['disabled and loading', true, true],
  ])('AC-3: sets a single id and an id list on the inner button while %s', (_state, disabled, loading) => {
    host.disabled.set(disabled);
    host.loading.set(loading);
    for (const ids of ['reason', 'reason hint']) {
      host.describedBy.set(ids);
      fixture.detectChanges();
      expect(button().getAttribute('aria-describedby')).toBe(ids);
    }
    expect(root().querySelector('lc-button')?.hasAttribute('aria-describedby')).toBe(false);
  });

  it('AC-3: leaves title, aria-disabled, aria-busy, disabled and classes as without it', () => {
    const snapshot = () => ({
      title: button().getAttribute('title'),
      label: button().getAttribute('aria-label'),
      ariaDisabled: button().getAttribute('aria-disabled'),
      busy: button().getAttribute('aria-busy'),
      disabled: button().disabled,
      classes: button().className,
    });
    for (const [disabled, loading] of [
      [false, false],
      [true, false],
      [false, true],
    ]) {
      host.disabled.set(disabled);
      host.loading.set(loading);
      host.describedBy.set('');
      fixture.detectChanges();
      const without = snapshot();
      host.describedBy.set('reason');
      fixture.detectChanges();
      expect(snapshot()).toEqual(without);
    }
  });

  it('AC-4: the disabled button is described by the reason line and keeps its name', () => {
    host.disabled.set(true);
    host.describedBy.set('reason');
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
    expect(description(button())).toBe('Wählen Sie zuerst eine Datei.');
    expect(computedName(root(), button())).toBe('Hochladen');
  });

  it('AC-4: an id list resolves in id order, also while loading', () => {
    host.loading.set(true);
    host.describedBy.set('hint reason');
    fixture.detectChanges();
    expect(button().getAttribute('aria-busy')).toBe('true');
    expect(description(button())).toBe('Erlaubt sind CSV und XLSX. Wählen Sie zuerst eine Datei.');
    expect(computedName(root(), button())).toBe('Hochladen');
  });

  it('default rendering is unchanged: the 3.25.2 attribute list and classes', () => {
    const plain = TestBed.createComponent(ButtonComponent);
    plain.detectChanges();
    const el = (plain.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
    expect(el.getAttributeNames()).toEqual(['type', 'aria-disabled', 'aria-busy', 'class']);
    expect(el.getAttribute('aria-disabled')).toBe('false');
    expect(el.getAttribute('aria-busy')).toBe('false');
    expect(el.className).toBe('btn btn-primary btn-md');
  });
});
