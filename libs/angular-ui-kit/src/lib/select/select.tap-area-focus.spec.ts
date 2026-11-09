import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { SelectComponent, type SelectOption, type SelectValue } from './select.component';

/**
 * 3.37 (request 057, finance-intelligence services rows 1 and 2, design D-1 and
 * D-2): the lg clear button takes taps on 44 × 44 px, and a choice or `Escape`
 * hands the focus back to the trigger also when a tap left it on `<body>`.
 * jsdom has no layout: the rects are measured in the story *Clear Tap Area*.
 */
@Component({
  standalone: true,
  imports: [SelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-select
      ariaLabel="Quelle"
      placeholder="Quelle wählen"
      [size]="size()"
      [multiple]="multiple()"
      [searchable]="searchable()"
      [clearAriaLabel]="clearLabel()"
      [options]="options"
      (selectionChange)="onChange($event)"
      (closed)="events.push('closed')"
    />
    <button type="button" id="elsewhere">Elsewhere</button>
  `,
})
class Host {
  readonly size = signal<'xs' | 'sm' | 'md' | 'lg'>('lg');
  readonly multiple = signal(false);
  readonly searchable = signal(false);
  readonly clearLabel = signal('Clear selection');
  readonly options: SelectOption[] = [
    { value: 'ist', label: 'SAP-Ist' },
    { value: 'plan', label: 'SAP-Plan' },
    { value: 'usm', label: 'USM' },
  ];
  readonly events: string[] = [];
  focusOnChange: HTMLElement | null = null;
  onChange(value: SelectValue): void {
    this.events.push(`change:${JSON.stringify(value)}`);
    this.focusOnChange?.focus();
  }
}

const panel = (): HTMLElement | null => document.querySelector('.cdk-overlay-container .lc-select__dropdown');
const options = (): HTMLElement[] => Array.from(panel()?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);

describe('lc-select — lg clear tap area and focus return (3.37, request 057)', () => {
  let fixture: ComponentFixture<Host>;
  const el = () => fixture.nativeElement as HTMLElement;
  const trigger = () => el().querySelector('[role="combobox"]') as HTMLElement;
  const select = () => fixture.debugElement.children[0].componentInstance as SelectComponent;
  /** A tap on an option: the press moves the focus to `<body>` (no `tabindex`), then the click. */
  const tap = (option: HTMLElement) => {
    (document.activeElement as HTMLElement | null)?.blur();
    option.click();
    fixture.detectChanges();
  };
  const open = () => {
    trigger().click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  describe('AC-5: a tap on an option returns the focus to the trigger', () => {
    it('single select: closes, and the trigger has the focus although the press left it on <body>', () => {
      open();
      expect(panel()).not.toBeNull();
      tap(options()[1]);
      expect(select().isOpen()).toBe(false);
      expect(panel()).toBeNull();
      expect(select().value()).toBe('plan');
      expect(document.activeElement).toBe(trigger());
    });

    it('never takes the focus from an element a selectionChange handler focused', () => {
      const elsewhere = el().querySelector<HTMLElement>('#elsewhere') as HTMLElement;
      fixture.componentInstance.focusOnChange = elsewhere;
      open();
      tap(options()[0]);
      expect(select().isOpen()).toBe(false);
      expect(document.activeElement).toBe(elsewhere);
    });
  });

  describe('AC-6: Escape and keyboard choice', () => {
    it('Escape with the focus on <body> closes and returns the focus to the trigger', () => {
      open();
      trigger().blur();
      expect(document.activeElement).toBe(document.body);
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
      fixture.detectChanges();
      expect(select().isOpen()).toBe(false);
      expect(document.activeElement).toBe(trigger());
      expect(fixture.componentInstance.events).toEqual(['closed']);
    });

    it('Escape with a modifier on <body> does nothing, as the overlay does', () => {
      open();
      trigger().blur();
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, shiftKey: true, bubbles: true }));
      fixture.detectChanges();
      expect(select().isOpen()).toBe(true);
      expect(document.activeElement).toBe(document.body);
    });

    it('Escape on the trigger closes, keeps the focus there and stops the key', () => {
      trigger().focus();
      open();
      const bodyKeys = jest.fn();
      document.body.addEventListener('keydown', bodyKeys);
      trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
      document.body.removeEventListener('keydown', bodyKeys);
      fixture.detectChanges();
      expect(select().isOpen()).toBe(false);
      expect(document.activeElement).toBe(trigger());
      expect(bodyKeys).not.toHaveBeenCalled();
    });

    it('keyboard choice from the trigger keeps the focus on the trigger', () => {
      trigger().focus();
      const key = (k: string) => trigger().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
      key('ArrowDown');
      fixture.detectChanges();
      key('ArrowDown');
      key('Enter');
      fixture.detectChanges();
      expect(select().value()).toBe('ist');
      expect(document.activeElement).toBe(trigger());
    });

    it('keyboard choice from the search field hands the focus to the trigger, as before', () => {
      fixture.componentInstance.searchable.set(true);
      fixture.detectChanges();
      open();
      const search = panel()?.querySelector<HTMLInputElement>('.lc-select__search-input') as HTMLInputElement;
      search.focus();
      search.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      fixture.detectChanges();
      expect(select().value()).toBe('ist');
      expect(document.activeElement).toBe(trigger());
    });
  });

  describe('AC-7: backdrop and multi-select keep today’s behaviour', () => {
    it('a click on the backdrop closes without forcing the focus to the trigger', () => {
      open();
      trigger().blur();
      const backdrop = document.querySelector<HTMLElement>('.cdk-overlay-backdrop') as HTMLElement;
      expect(backdrop).not.toBeNull();
      backdrop.click();
      fixture.detectChanges();
      expect(select().isOpen()).toBe(false);
      expect(document.activeElement).toBe(document.body);
    });

    it('multi-select: a tap keeps the panel open and leaves the focus where it is', () => {
      fixture.componentInstance.multiple.set(true);
      fixture.detectChanges();
      open();
      tap(options()[0]);
      expect(select().isOpen()).toBe(true);
      expect(select().value()).toEqual(['ist']);
      expect(document.activeElement).toBe(document.body);
    });
  });

  describe('AC-8: events and the press', () => {
    it('selectionChange, then closed, once each', () => {
      open();
      tap(options()[2]);
      expect(fixture.componentInstance.events).toEqual(['change:"usm"', 'closed']);
    });

    it('no press handler: mousedown and pointerdown on an option keep their default', () => {
      open();
      const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      options()[0].dispatchEvent(down);
      expect(down.defaultPrevented).toBe(false);
      const pointer = new Event('pointerdown', { bubbles: true, cancelable: true });
      options()[0].dispatchEvent(pointer);
      expect(pointer.defaultPrevented).toBe(false);
    });
  });

  describe('AC-1 / AC-4: the lg clear button', () => {
    const clearButton = () => el().querySelector<HTMLButtonElement>('.lc-select__clear');

    it('a click on the button clears the value back to the default and keeps the panel closed', () => {
      open();
      tap(options()[0]);
      expect(clearButton()).not.toBeNull();
      clearButton()?.click();
      fixture.detectChanges();
      expect(select().value()).toBeNull();
      expect(select().isOpen()).toBe(false);
      expect(clearButton()).toBeNull();
      expect(trigger().textContent?.trim()).toBe('Quelle wählen');
    });

    it('is named by clearAriaLabel: EN default, DE as set', () => {
      open();
      tap(options()[0]);
      expect(clearButton()?.getAttribute('aria-label')).toBe('Clear selection');
      fixture.componentInstance.clearLabel.set('Auswahl löschen');
      fixture.detectChanges();
      expect(clearButton()?.getAttribute('aria-label')).toBe('Auswahl löschen');
    });

    it('the clear button stays a native button: Enter and Space clear without opening the list', () => {
      open();
      tap(options()[0]);
      const button = clearButton() as HTMLButtonElement;
      expect(button.type).toBe('button');
      button.focus();
      button.click(); // what a native button does on Enter / Space
      fixture.detectChanges();
      expect(select().value()).toBeNull();
      expect(select().isOpen()).toBe(false);
    });
  });

  describe('AC-1 / AC-2 / AC-3: the rules', () => {
    const css = compile(resolve(__dirname, 'select.component.scss')).css;
    const rule = (selector: string) => {
      const at = css.indexOf(`\n${selector} {`);
      expect(at).toBeGreaterThan(-1);
      return css.slice(at, css.indexOf('}', at));
    };

    it('lg with a clear button: the 76 px right padding; without one the 48 px of before', () => {
      expect(rule('.lc-select.lc-select--lg')).toMatch(/padding-right: var\(--spacing-12\);/);
      expect(rule('.lc-select.lc-select--lg:has(.lc-select__clear)')).toMatch(
        /padding-right: calc\(var\(--spacing-3\) \+ 1\.25rem \+ var\(--spacing-1\) \+ max\(-0\.125rem, \(44px - 1\.5rem\) \/ 2 - 0\.25rem\) \+ 1\.5rem \+ max\(0px, \(44px - 1\.5rem\) \/ 2\)\);/,
      );
    });

    it('lg clear: 6 px right margin and an unpainted 44 px ::before centred on the 24 px box', () => {
      expect(rule('.lc-select--lg .lc-select__clear')).toMatch(
        /^\s*\.lc-select--lg \.lc-select__clear \{\s*margin-right: max\(-0\.125rem, \(44px - 1\.5rem\) \/ 2 - 0\.25rem\);\s*$/,
      );
      const before = rule('.lc-select--lg .lc-select__clear::before');
      expect(before).toMatch(/content: "";\s*position: absolute;\s*inset: min\(0px, \(100% - 44px\) \/ 2\);\s*$/);
      expect(before).not.toMatch(/background|border|outline|box-shadow/);
    });

    it('the 24 px box, its margin and the xs/sm/md paddings are as in 3.36', () => {
      expect(rule('.lc-select__clear')).toMatch(/width: 1\.5rem;\s*height: 1\.5rem;\s*margin: -0\.125rem;\s*padding: 0\.125rem;/);
      expect(rule('.lc-select.lc-select--xs')).toMatch(/padding-right: var\(--spacing-8\);/);
      expect(rule('.lc-select.lc-select--sm')).toMatch(/padding-right: var\(--spacing-9\);/);
      expect(rule('.lc-select.lc-select--md')).toMatch(/padding-right: var\(--spacing-10\);/);
      expect(css.match(/:has\(\.lc-select__clear\)/g)?.length).toBe(1);
      expect(css.match(/\.lc-select__clear::before/g)?.length).toBe(1);
    });
  });
});
