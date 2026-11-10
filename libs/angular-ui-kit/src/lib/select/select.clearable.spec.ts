import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { SelectComponent, type SelectOption } from './select.component';

/**
 * 3.39 (request 059, finance-intelligence services-prove row 1, AC-19, AC-20,
 * design D-5): `clearable` (default true) leaves out the clear button for
 * selects that always have a value, and xs/sm/md reserve the button's room
 * only while it is in the DOM (folds 057-n1). jsdom has no layout: the text
 * and × boxes are measured in the story *Without Clear Button* (build.md).
 */
@Component({
  standalone: true,
  imports: [SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (attr()) {
      <lc-select ariaLabel="Sortierung" size="sm" clearable="false" [options]="options" />
    } @else if (unset()) {
      <lc-select ariaLabel="Sortierung" [size]="size()" [options]="options" />
    } @else {
      <lc-select ariaLabel="Sortierung" [size]="size()" [clearable]="clearable()" [options]="options" />
    }
  `,
})
class Host {
  readonly attr = signal(false);
  readonly unset = signal(false);
  readonly clearable = signal(true);
  readonly size = signal<'xs' | 'sm' | 'md' | 'lg'>('md');
  readonly options: SelectOption[] = [
    { value: 'cost', label: 'Sortierung: Kosten' },
    { value: 'name', label: 'Sortierung: Name' },
  ];
}

describe('lc-select — clearable (3.39, request 059)', () => {
  let fixture: ComponentFixture<Host>;
  const el = () => fixture.nativeElement as HTMLElement;
  const trigger = () => el().querySelector('[role="combobox"]') as HTMLElement;
  const clearButton = () => el().querySelector<HTMLButtonElement>('.lc-select__clear');
  const select = () => fixture.debugElement.query((d) => d.componentInstance instanceof SelectComponent).componentInstance as SelectComponent;
  /** Elements a Tab press stops at inside the host, in order. */
  const tabStops = () =>
    Array.from(el().querySelectorAll<HTMLElement>('button, [tabindex]')).filter((e) => e.tabIndex >= 0 && !(e as HTMLButtonElement).disabled);
  /** Renders with the value „cost“ written as a form would (writeValue). */
  const render = (set: (h: Host) => void = () => undefined) => {
    set(fixture.componentInstance);
    fixture.detectChanges();
    select().writeValue('cost');
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
  });

  afterEach(() => fixture?.destroy());

  describe('AC-19: the input', () => {
    it('defaults to true: a value shows the clear button, as in 3.38', () => {
      render((h) => h.unset.set(true));
      expect(select().clearable()).toBe(true);
      expect(clearButton()).not.toBeNull();
      const icons = el().querySelector('.lc-select__icons') as HTMLElement;
      expect([...icons.children].map((c) => `${c.tagName.toLowerCase()}.${c.classList[0]}`)).toEqual(['button.lc-select__clear', 'svg.lc-select__chevron']);
      expect([...(clearButton() as HTMLButtonElement).attributes].map((a) => `${a.name}=${a.value}`).filter((a) => !a.startsWith('_ng'))).toEqual([
        'type=button',
        'class=lc-select__clear',
        'aria-label=Clear selection',
      ]);
    });

    it.each(['xs', 'sm', 'md', 'lg'] as const)('%s: false renders no clear button; the value text stays', (size) => {
      render((h) => {
        h.size.set(size);
        h.clearable.set(false);
      });
      expect(clearButton()).toBeNull();
      expect(el().querySelectorAll('.lc-select__icons > *')).toHaveLength(1);
      expect(el().querySelector('.lc-select__value')?.textContent?.trim()).toBe('Sortierung: Kosten');
    });

    it('takes the attribute form clearable="false" (booleanAttribute)', () => {
      render((h) => h.attr.set(true));
      expect(select().clearable()).toBe(false);
      expect(clearButton()).toBeNull();
    });

    it('switching back to true shows the button again', () => {
      render((h) => h.clearable.set(false));
      expect(clearButton()).toBeNull();
      render((h) => h.clearable.set(true));
      expect(clearButton()).not.toBeNull();
    });
  });

  describe('AC-20: keyboard and name', () => {
    it('false: one tab stop fewer (the combobox only)', () => {
      render();
      expect(tabStops().map((e) => e.getAttribute('role') ?? e.className)).toEqual(['combobox', 'lc-select__clear']);
      render((h) => h.clearable.set(false));
      expect(tabStops().map((e) => e.getAttribute('role') ?? e.className)).toEqual(['combobox']);
    });

    it.each([true, false])('clearable=%s: the combobox name and Escape behave the same', (clearable) => {
      render((h) => h.clearable.set(clearable));
      expect(trigger().getAttribute('aria-label')).toBe('Sortierung');
      trigger().click();
      fixture.detectChanges();
      expect(select().isOpen()).toBe(true);
      trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(select().isOpen()).toBe(false);
      expect(select().value()).toBe('cost');
    });

    it('false: Backspace and Delete on the trigger keep the value (no key clears, as before)', () => {
      render((h) => h.clearable.set(false));
      for (const key of ['Backspace', 'Delete']) trigger().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(select().value()).toBe('cost');
    });
  });

  describe('AC-19 / 057-n1: the room for the button at xs/sm/md', () => {
    const css = compile(resolve(__dirname, 'select.component.scss')).css;
    const ROOM = 'padding-right: calc(var(--spacing-3) + 1.25rem + var(--spacing-1) + 1.5rem - 0.125rem + var(--spacing-1));';

    it('62 px only while the button is in the DOM, one rule for the three sizes', () => {
      expect(css).toContain(
        '.lc-select.lc-select--xs:has(.lc-select__clear), .lc-select.lc-select--sm:has(.lc-select__clear), .lc-select.lc-select--md:has(.lc-select__clear) {\n  ' +
          ROOM +
          '\n}',
      );
      expect(css.split(ROOM)).toHaveLength(2);
    });

    it('comes after the base size rules, so 0,3,0 overrides their padding-right', () => {
      const at = css.indexOf('.lc-select.lc-select--xs:has(.lc-select__clear)');
      for (const size of ['xs', 'sm', 'md', 'lg']) expect(at).toBeGreaterThan(css.indexOf(`\n.lc-select.lc-select--${size} {`));
    });
  });
});
