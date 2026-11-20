import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { audit, violations } from '../../testing/axe-jsdom';
import { MenuComponent, type MenuAnchor, type MenuItem } from './menu.component';
import { MenuControlDirective } from './menu-control.directive';

/**
 * Request 071 (3.50, usm-x row 77, AC-6, AC-7): `inline` puts the menu in the
 * page: the panel always renders, without trigger slot, overlay, frame or
 * closing; `role="menu"`, the roving tabindex and the arrows stay. Control
 * rows (`MenuItem.control` + `ng-template[lcMenuControl]`) sit between menu
 * parts, outside `role="menu"`, one Tab stop per part.
 */
const PANEL: MenuItem[] = [
  { id: 'hell', label: 'Hell', type: 'radio', radioGroup: 'theme', checked: true, swatch: '#ffffff' },
  { id: 'dunkel', label: 'Dunkel', type: 'radio', radioGroup: 'theme', swatch: '#111827' },
  { id: 'density', label: 'Dichte', control: 'density' },
  { id: 'sounds', label: 'Töne', control: 'sounds' },
  { id: 'account', label: 'Konto', children: [{ id: 'profil', label: 'Profil', current: true }, { id: 'logout', label: 'Abmelden' }] },
];

@Component({
  standalone: true,
  imports: [MenuComponent, MenuControlDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <button type="button" class="before">Vorher</button>
    <lc-menu
      [items]="items()"
      [inline]="inline()"
      [isOpen]="isOpen()"
      [anchor]="anchor()"
      ariaLabel="Darstellung"
      minWidth="300px"
      maxHeight="120px"
      (itemClick)="clicked.push($event.id)"
      (itemToggle)="toggled.push($event.item.id)"
      (closed)="closes = closes + 1"
    >
      <button trigger type="button" class="trigger">Konto</button>
      <div header class="identity">Lena Brandt</div>
      <ng-template lcMenuControl="density" let-labelId="labelId" let-entry>
        <div role="radiogroup" class="density" [attr.aria-labelledby]="labelId" [attr.data-entry]="entry.id">
          <button type="button" role="radio" aria-checked="true" class="kompakt">Kompakt</button>
        </div>
      </ng-template>
      <ng-template lcMenuControl="sounds" let-labelId="labelId">
        <button type="button" role="switch" aria-checked="false" class="sounds" [attr.aria-labelledby]="labelId"><span aria-hidden="true">Aus</span></button>
      </ng-template>
    </lc-menu>
    <button type="button" class="after">Nachher</button>
  `,
})
class HostComponent {
  readonly items = signal<MenuItem[]>(PANEL);
  readonly inline = signal(true);
  readonly isOpen = signal(false);
  readonly anchor = signal<MenuAnchor | null>(null);
  readonly clicked: string[] = [];
  readonly toggled: string[] = [];
  closes = 0;
}

describe('lc-menu inline and control rows (3.50)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const panel = () => el().querySelector('.lc-menu__dropdown') as HTMLElement | null;
  const menus = () => Array.from(el().querySelectorAll<HTMLElement>('[role="menu"]'));
  const item = (label: string) =>
    Array.from(el().querySelectorAll<HTMLElement>('.lc-menu__item')).find((i) => i.querySelector('.lc-menu__item-label')?.textContent === label) as HTMLElement;
  const keydown = (key: string, target: Element = document.activeElement ?? document.body) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(el());
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    el().remove();
    (document.body as HTMLElement).focus();
  });

  describe('AC-6: inline mode', () => {
    it('renders the panel without isOpen, with no trigger slot and no overlay; the host is a block', () => {
      expect(panel()).not.toBeNull();
      expect(el().querySelector('.lc-menu__trigger')).toBeNull();
      expect(el().querySelector('.trigger')).toBeNull();
      expect(document.querySelector('.cdk-overlay-container .lc-menu__dropdown')).toBeNull();
      expect(el().querySelector('lc-menu')?.classList.contains('lc-menu-host--inline')).toBe(true);
      // review F-1: inline, the indicator slot is a class of each part, not of the panel
      expect([...(panel() as HTMLElement).classList].sort()).toEqual(['lc-menu__dropdown', 'lc-menu__dropdown--inline']);
    });

    it('ignores position, minWidth, maxWidth, maxHeight and anchor', () => {
      host.anchor.set({ x: 10, y: 10 });
      fixture.detectChanges();
      expect(document.querySelector('.cdk-overlay-container .lc-menu__dropdown')).toBeNull();
      expect(panel()?.getAttribute('style')).toBeNull();
      expect(panel()?.classList.contains('lc-menu__dropdown--scroll')).toBe(false);
      expect(panel()?.classList.contains('lc-menu__dropdown--overlay')).toBe(false);
    });

    it('takes no focus on render; Escape, Tab, outside clicks and scrolls never emit closed', () => {
      expect(panel()?.contains(document.activeElement)).toBe(false);
      item('Hell').focus();
      keydown('Escape');
      keydown('Tab');
      (el().querySelector('.after') as HTMLElement).click();
      document.dispatchEvent(new Event('scroll'));
      fixture.detectChanges();
      expect(host.closes).toBe(0);
      expect(panel()).not.toBeNull();
    });

    it('Escape is left to the page (not consumed); Tab is not prevented', () => {
      item('Hell').focus();
      expect(keydown('Escape').defaultPrevented).toBe(false);
      expect(keydown('Tab').defaultPrevented).toBe(false);
    });

    it('an item that would close (closeOnSelect) does not emit closed either', () => {
      host.items.set([{ id: 'x', label: 'Weiter', closeOnSelect: true }]);
      fixture.detectChanges();
      item('Weiter').click();
      expect(host.clicked).toEqual(['x']);
      expect(host.closes).toBe(0);
    });

    it('without control rows: one role="menu" with the arrows over all items, wrapping', () => {
      host.items.set([{ id: 'a', label: 'Eins' }, { id: 'b', label: 'Zwei', disabled: true }, { id: 'c', label: 'Drei' }]);
      fixture.detectChanges();
      expect(menus()).toHaveLength(1);
      expect(menus()[0].getAttribute('aria-label')).toBe('Darstellung');
      expect(['Eins', 'Drei'].map((l) => item(l).getAttribute('tabindex'))).toEqual(['0', '-1']);
      item('Eins').focus();
      keydown('ArrowDown');
      expect(document.activeElement).toBe(item('Drei'));
      expect(['Eins', 'Drei'].map((l) => item(l).getAttribute('tabindex'))).toEqual(['-1', '0']);
      keydown('ArrowDown');
      expect(document.activeElement).toBe(item('Eins'));
      keydown('End');
      expect(document.activeElement).toBe(item('Drei'));
      keydown('Home');
      expect(document.activeElement).toBe(item('Eins'));
    });

    it('popup mode (inline false) is unchanged: no panel until open, the trigger slot is back', () => {
      host.inline.set(false);
      fixture.detectChanges();
      expect(panel()).toBeNull();
      expect(el().querySelector('.lc-menu__trigger .trigger')).not.toBeNull();
      expect(el().querySelector('lc-menu')?.classList.contains('lc-menu-host--inline')).toBe(false);
    });
  });

  describe('AC-7: control rows', () => {
    it('split the menu into role="menu" parts; the rows sit outside every menu', () => {
      const [first, second] = menus();
      expect(menus()).toHaveLength(2);
      expect(first.id).toMatch(/^lc-menu-\d+-panel$/);
      expect(first.getAttribute('aria-label')).toBe('Darstellung');
      expect(second.hasAttribute('id')).toBe(false);
      expect(second.hasAttribute('aria-label')).toBe(false);
      // the second part starts with a section: it is named by that heading
      const heading = second.querySelector('.lc-menu__section-heading') as HTMLElement;
      expect(second.getAttribute('aria-labelledby')).toBe(heading.id);
      const rows = Array.from(el().querySelectorAll<HTMLElement>('.lc-menu__control'));
      expect(rows).toHaveLength(2);
      for (const row of rows) expect(row.closest('[role="menu"]')).toBeNull();
      const order = Array.from(panel()?.children ?? []).map((c) => c.className.split(' ')[0]);
      expect(order).toEqual(['identity', 'lc-menu__items', 'lc-menu__control', 'lc-menu__control', 'lc-menu__items']);
    });

    it('a row shows the label and the named template with the entry and the label id', () => {
      const [density, sounds] = Array.from(el().querySelectorAll<HTMLElement>('.lc-menu__control'));
      const label = density.querySelector('.lc-menu__control-label') as HTMLElement;
      expect(label.textContent).toBe('Dichte');
      expect(density.querySelector('.density')?.getAttribute('aria-labelledby')).toBe(label.id);
      expect(density.querySelector('.density')?.getAttribute('data-entry')).toBe('density');
      expect(sounds.querySelector('.sounds')?.getAttribute('aria-labelledby')).toBe(sounds.querySelector('.lc-menu__control-label')?.id);
      expect(label.id).not.toBe(sounds.querySelector('.lc-menu__control-label')?.id);
    });

    it('an empty label lets the template fill the row', () => {
      host.items.set([{ id: 'a', label: 'Eins' }, { id: 'density', label: '', control: 'density' }]);
      fixture.detectChanges();
      const row = el().querySelector('.lc-menu__control') as HTMLElement;
      expect(row.querySelector('.lc-menu__control-label')).toBeNull();
      expect(row.querySelector('.density')).not.toBeNull();
    });

    it('control entries are not menu items (not in the arrow order)', () => {
      const labels = Array.from(el().querySelectorAll('.lc-menu__item .lc-menu__item-label')).map((l) => l.textContent);
      expect(labels).toEqual(['Hell', 'Dunkel', 'Profil', 'Abmelden']);
    });

    it('one Tab stop per part: part 1 → the row controls → part 2; the arrows stay inside a part', () => {
      const stops = Array.from(el().querySelectorAll<HTMLElement>('button, [tabindex]')).filter((b) => b.getAttribute('tabindex') !== '-1');
      expect(stops.map((s) => s.className.split(' ')[0] || s.textContent)).toEqual(['before', 'lc-menu__item', 'kompakt', 'sounds', 'lc-menu__item', 'after']);
      expect(stops[1]).toBe(item('Hell'));
      expect(stops[4]).toBe(item('Profil'));
      item('Hell').focus();
      keydown('ArrowDown');
      expect(document.activeElement).toBe(item('Dunkel'));
      keydown('ArrowDown');
      expect(document.activeElement).toBe(item('Hell'));
      keydown('End');
      expect(document.activeElement).toBe(item('Dunkel'));
      // part 2 keeps its own stop
      expect(item('Profil').getAttribute('tabindex')).toBe('0');
      item('Profil').focus();
      keydown('ArrowUp');
      expect(document.activeElement).toBe(item('Abmelden'));
      expect(item('Dunkel').getAttribute('tabindex')).toBe('0');
      expect(item('Abmelden').getAttribute('tabindex')).toBe('0');
    });

    it('a radio item toggles and keeps the focus; it becomes its part’s stop', () => {
      item('Dunkel').click();
      fixture.detectChanges();
      expect(host.toggled).toEqual(['dunkel']);
      expect(item('Dunkel').getAttribute('tabindex')).toBe('0');
      expect(item('Hell').getAttribute('tabindex')).toBe('-1');
    });

    it('in a popup, control is ignored: the entry is a plain item and there is one menu', async () => {
      host.inline.set(false);
      host.isOpen.set(true);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(menus()).toHaveLength(1);
      expect(el().querySelector('.lc-menu__control')).toBeNull();
      expect(item('Dichte')).toBeTruthy();
    });

    it('axe: no violations (header, two parts, two control rows)', async () => {
      expect(violations(await audit(el()))).toEqual([]);
    });
  });

  describe('review F-1: the indicator slot per role="menu" part (design §3 Inline parts)', () => {
    const css = '\n' + compile(resolve(__dirname, 'menu.component.scss')).css;
    /** Every compiled selector of a rule that reserves the slot (`1.25rem` in its start padding). */
    const slotSelectors: string[] = [];
    const ruleRe = /\n([^{}@]+)\{([^}]*)\}/g;
    for (let m = ruleRe.exec(css); m; m = ruleRe.exec(css)) {
      if (/padding-inline-start:[^;]*1\.25rem/.test(m[2])) slotSelectors.push(...m[1].split(',').map((s) => s.trim()));
    }
    const reserves = (target: Element) => slotSelectors.some((s) => target.matches(s));
    const partClasses = () => menus().map((p) => p.classList.contains('lc-menu__items--has-toggles'));

    it('only the part with a toggle item carries the class; the panel does not', () => {
      expect(partClasses()).toEqual([true, false]);
      expect(panel()?.classList.contains('lc-menu__dropdown--has-toggles')).toBe(false);
    });

    it('„Profil“ and „Abmelden“ start at the item padding; a plain item beside the radios keeps the slot', () => {
      expect(['Profil', 'Abmelden'].map((l) => reserves(item(l)))).toEqual([false, false]);
      host.items.set([...PANEL.slice(0, 2), { id: 'mehr', label: 'Mehr' }, ...PANEL.slice(2)]);
      fixture.detectChanges();
      expect(['Mehr', 'Profil', 'Abmelden'].map((l) => reserves(item(l)))).toEqual([true, false, false]);
    });

    it('inline without control rows: the one part carries the class', () => {
      host.items.set([PANEL[0], { id: 'mehr', label: 'Mehr' }]);
      fixture.detectChanges();
      expect(partClasses()).toEqual([true]);
      expect(reserves(item('Mehr'))).toBe(true);
    });

    it('a popup keeps the panel class and no part class (unchanged)', async () => {
      host.inline.set(false);
      host.isOpen.set(true);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(panel()?.classList.contains('lc-menu__dropdown--has-toggles')).toBe(true);
      expect(menus()[0].getAttribute('class')).toBe('lc-menu__items');
      expect(reserves(item('Profil'))).toBe(true);
    });

    it('the part selector joins every slot rule at the panel selector’s weight (md, sm, lg; nested)', () => {
      const plain = '.lc-menu__item:not(.lc-menu__item--toggle)';
      const nested = `.lc-menu__section--nested ${plain}`;
      const pairs = [
        [`.lc-menu__dropdown--has-toggles ${plain}`, `.lc-menu__items--has-toggles ${plain}`],
        [`.lc-menu__dropdown--has-toggles.lc-menu__dropdown--sm ${plain}`, `.lc-menu__dropdown--sm .lc-menu__items--has-toggles ${plain}`],
        [`.lc-menu__dropdown--has-toggles.lc-menu__dropdown--lg ${plain}`, `.lc-menu__dropdown--lg .lc-menu__items--has-toggles ${plain}`],
        [`.lc-menu__dropdown--has-toggles ${nested}`, `.lc-menu__items--has-toggles ${nested}`],
        [`.lc-menu__dropdown--has-toggles.lc-menu__dropdown--sm ${nested}`, `.lc-menu__dropdown--sm .lc-menu__items--has-toggles ${nested}`],
        [`.lc-menu__dropdown--has-toggles.lc-menu__dropdown--lg ${nested}`, `.lc-menu__dropdown--lg .lc-menu__items--has-toggles ${nested}`],
      ];
      for (const [panelSelector, partSelector] of pairs) expect(css).toContain(`\n${panelSelector},\n${partSelector} {`);
      expect(slotSelectors).toHaveLength(12);
    });
  });

  describe('SCSS', () => {
    const css = '\n' + compile(resolve(__dirname, 'menu.component.scss')).css;
    const rule = (selector: string) => {
      const start = css.indexOf(`\n${selector} {`);
      expect([selector, start > -1]).toEqual([selector, true]);
      return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
    };

    it('inline: host and wrapper are blocks; the panel is static, full width, frameless, no animation', () => {
      expect(rule(':host(.lc-menu-host--inline)')).toBe('display: block;');
      expect(rule(':host(.lc-menu-host--inline) .lc-menu')).toBe('display: block;');
      expect(rule('.lc-menu__dropdown.lc-menu__dropdown--inline')).toBe(
        'position: static; z-index: auto; box-sizing: border-box; width: 100%; padding: 0; border: 0; border-radius: 0; background: transparent; box-shadow: none; animation: none;',
      );
    });

    it('control row: flex, wrap, centre, gap 12 / row-gap 8, min-height 44, item padding; label 16/500 primary', () => {
      expect(rule('.lc-menu__control')).toBe(
        'display: flex; flex-wrap: wrap; align-items: center; column-gap: var(--spacing-3); row-gap: var(--spacing-2); box-sizing: border-box; min-height: 2.75rem; padding: var(--lc-density-padding-sm, var(--spacing-3)) var(--lc-density-padding-md, var(--spacing-4));',
      );
      expect(rule('.lc-menu__control-label')).toBe(
        'flex: 1 1 auto; color: var(--color-text-primary); font-size: var(--font-size-base); font-weight: var(--font-weight-medium); line-height: var(--line-height-tight);',
      );
      expect(rule('.lc-menu__dropdown--sm .lc-menu__control')).toBe('padding: var(--lc-density-padding-xs, var(--spacing-2)) var(--lc-density-padding-sm, var(--spacing-3));');
      expect(rule('.lc-menu__dropdown--lg .lc-menu__control')).toBe('padding: var(--lc-density-padding-md, var(--spacing-4)) var(--spacing-5);');
    });
  });
});
