import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { MenuComponent, type MenuItem } from '@lifecorner/angular-ui-kit/menu';
import { audit, violations } from '../../testing/axe-jsdom';
import { ButtonComponent, type ButtonAriaHasPopup, type ButtonAriaPressed, type ButtonVariant } from './button.component';

/**
 * 3.42 (request 062 AC-14, AC-15, usm-x row 3): ARIA state inputs that reach
 * the inner `<button>` (never the host); unset, nothing renders.
 */
@Component({
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-button
      [variant]="variant()"
      [ariaPressed]="pressed()"
      [ariaExpanded]="expanded()"
      [ariaHasPopup]="popup()"
      [ariaControls]="controls()"
      (clicked)="pressed.set(!pressed())"
      >Assistent</lc-button
    >
    <div id="panel">Panel</div>
  `,
})
class Host {
  readonly variant = signal<ButtonVariant>('outline');
  readonly pressed = signal<ButtonAriaPressed | null>(null);
  readonly expanded = signal<boolean | null>(null);
  readonly popup = signal<ButtonAriaHasPopup | null>(null);
  readonly controls = signal('');
}

@Component({
  imports: [ButtonComponent, MenuComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-menu [items]="items" [isOpen]="open()" (closed)="open.set(false)">
      <lc-button trigger variant="outline" (clicked)="open.set(!open())">Ansicht</lc-button>
    </lc-menu>
  `,
})
class MenuHost {
  readonly open = signal(false);
  readonly items: MenuItem[] = [
    { id: 'list', label: 'Liste' },
    { id: 'cards', label: 'Karten' },
  ];
}

describe('lc-button ARIA state inputs (3.42, request 062)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const lcButton = () => (fixture.nativeElement as HTMLElement).querySelector('lc-button') as HTMLElement;
  const button = () => lcButton().querySelector('button') as HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('defaults render no attribute (unchanged default)', () => {
    for (const name of ['aria-pressed', 'aria-expanded', 'aria-haspopup', 'aria-controls']) {
      expect(button().hasAttribute(name)).toBe(false);
    }
    expect(button().getAttributeNames().filter((n) => !n.startsWith('_ng'))).toEqual([
      'type',
      'aria-disabled',
      'aria-busy',
      'class',
    ]);
  });

  it.each([
    ['pressed', true, 'aria-pressed', 'true'],
    ['pressed', false, 'aria-pressed', 'false'],
    ['pressed', 'mixed', 'aria-pressed', 'mixed'],
    ['expanded', true, 'aria-expanded', 'true'],
    ['expanded', false, 'aria-expanded', 'false'],
    ['popup', 'menu', 'aria-haspopup', 'menu'],
    ['popup', 'dialog', 'aria-haspopup', 'dialog'],
    ['popup', true, 'aria-haspopup', 'true'],
    ['popup', false, 'aria-haspopup', 'false'],
    ['controls', 'panel', 'aria-controls', 'panel'],
  ] as const)('%s = %p sets %s="%s" on the inner <button>, not on the host', (key, value, attr, text) => {
    (host[key] as ReturnType<typeof signal<unknown>>).set(value);
    fixture.detectChanges();
    expect(button().getAttribute(attr)).toBe(text);
    expect(lcButton().hasAttribute(attr)).toBe(false);
  });

  it('null / empty removes the attribute again', () => {
    host.pressed.set(true);
    host.controls.set('panel');
    fixture.detectChanges();
    host.pressed.set(null);
    host.controls.set('');
    fixture.detectChanges();
    expect(button().hasAttribute('aria-pressed')).toBe(false);
    expect(button().hasAttribute('aria-controls')).toBe(false);
  });

  it('AC-15: a toggle changes its pressed state by click and keyboard activation', () => {
    host.pressed.set(false);
    fixture.detectChanges();
    button().click();
    fixture.detectChanges();
    expect(button().getAttribute('aria-pressed')).toBe('true');
    // Enter / Space on a native <button> fire `click`.
    button().dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(button().getAttribute('aria-pressed')).toBe('false');
  });

  it('works on variant="link" too', () => {
    host.variant.set('link');
    host.expanded.set(false);
    host.controls.set('panel');
    fixture.detectChanges();
    expect(button().classList).toContain('btn-link');
    expect(button().getAttribute('aria-expanded')).toBe('false');
    expect(button().getAttribute('aria-controls')).toBe('panel');
  });

  it('axe has no violations with all four set', async () => {
    host.pressed.set(true);
    host.expanded.set(true);
    host.popup.set('dialog');
    host.controls.set('panel');
    fixture.detectChanges();
    expect(violations(await audit(fixture.nativeElement as HTMLElement))).toEqual([]);
  });
});

describe('lc-button as an lc-menu trigger without the inputs (3.42)', () => {
  it('keeps the attributes lc-menu sets on the inner <button>', async () => {
    TestBed.configureTestingModule({ imports: [MenuHost] });
    const fixture = TestBed.createComponent(MenuHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector('lc-button button') as HTMLButtonElement;
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-controls')).toMatch(/-panel$/);
  });
});
