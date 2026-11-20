import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { audit, computedName, violations } from '../../testing/axe-jsdom';
import { MenuComponent, type MenuAnchor, type MenuItem } from './menu.component';

/**
 * Request 071 (3.50, usm-x rows 78, 80, 84; backlog 068-n3): `MenuItem`
 * `current`, `busy` (+ `busyLabel`), `badgeVariant`, `attrs`; sections
 * nested to any depth (AC-9); Enter and Space are consumed and activate once
 * (AC-13); `returnFocusTo` (AC-23); the `--lc-menu-max-height` hook (AC-11).
 */
const ITEMS: MenuItem[] = [
  { id: 'profil', label: 'Profil', current: true, attrs: { id: 'menu-profil', 'data-test': 'profil', onclick: 'alert(1)', class: 'x', style: 'color:red', 'aria-label': 'X', 'Data-X': 'y', href: '#' } },
  { id: 'zaehler', label: 'Zähler', busy: true, metadata: { badge: '4' } },
  { id: 'pruefungen', label: 'Prüfungen', badgeVariant: 'warning', metadata: { badge: '12' } },
  { id: 'plain', label: 'Ohne Variante', metadata: { badge: '3' } },
  {
    id: 'stamm',
    label: 'Stammdaten',
    children: [
      { id: 'objekte-h', label: 'Objekte', children: [{ id: 'objekttypen', label: 'Objekttypen' }, { id: 'felder-h', label: 'Felder', children: [{ id: 'feld', label: 'Feldliste' }] }] },
      { id: 'leer', label: 'Leer', children: [] },
      { id: 'zuletzt', label: 'Zuletzt' },
    ],
  },
  { id: 'gesperrt', label: 'Gesperrt', current: true, disabled: true },
];

@Component({
  standalone: true,
  imports: [MenuComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <form (submit)="submits = submits + 1; $event.preventDefault()">
      <input class="field" aria-label="Feld" />
      <button type="button" class="opener">Öffnen</button>
      <lc-menu
        [items]="items()"
        [isOpen]="isOpen()"
        [anchor]="anchor()"
        [returnFocusTo]="returnTo()"
        [busyLabel]="busyLabel()"
        [maxHeight]="maxHeight()"
        [size]="size()"
        (itemClick)="clicked.push($event.id)"
        (closed)="isOpen.set(false); returnTo.set(clearReturnTo ? null : returnTo())"
      />
      <button type="submit" class="submit">Senden</button>
    </form>
    <div class="row" tabindex="-1">Zeile</div>
  `,
})
class HostComponent {
  readonly items = signal<MenuItem[]>(ITEMS);
  readonly isOpen = signal(false);
  readonly anchor = signal<MenuAnchor | null>({ x: 40, y: 40 });
  readonly returnTo = signal<HTMLElement | null>(null);
  readonly busyLabel = signal('Wird geladen');
  readonly maxHeight = signal('');
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly clicked: string[] = [];
  submits = 0;
  clearReturnTo = false;
}

describe('lc-menu items and keys (3.50)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const panel = () => document.querySelector('.lc-menu__dropdown') as HTMLElement | null;
  const item = (label: string) =>
    Array.from(document.querySelectorAll<HTMLElement>('.lc-menu__item')).find((i) => i.querySelector('.lc-menu__item-label')?.textContent === label) as HTMLElement;
  const keydown = (key: string, target: Element = document.activeElement ?? document.body) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };
  const open = async () => {
    host.isOpen.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
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
  });

  afterEach(() => {
    host.isOpen.set(false);
    fixture.detectChanges();
    fixture.destroy();
    el().remove();
    (document.body as HTMLElement).focus();
  });

  describe('AC-8: current and busy', () => {
    it('current: aria-current="true" and the current class; a disabled current item keeps aria-current', async () => {
      await open();
      expect(item('Profil').getAttribute('aria-current')).toBe('true');
      expect(item('Profil').classList.contains('lc-menu__item--current')).toBe(true);
      expect(item('Gesperrt').getAttribute('aria-current')).toBe('true');
      expect(item('Gesperrt').classList.contains('lc-menu__item--disabled')).toBe(true);
      expect(item('Zuletzt').hasAttribute('aria-current')).toBe(false);
    });

    it('busy: aria-busy and aria-disabled, a spinner in the badge’s place, busyLabel after the label', async () => {
      await open();
      const busy = item('Zähler');
      expect(busy.getAttribute('aria-busy')).toBe('true');
      expect(busy.getAttribute('aria-disabled')).toBe('true');
      expect(busy.hasAttribute('disabled')).toBe(false);
      expect(busy.querySelector('.lc-menu__item-spinner lc-spinner')).not.toBeNull();
      expect(busy.querySelector('.lc-menu__item-spinner')?.getAttribute('aria-hidden')).toBe('true');
      expect(busy.querySelector('.lc-menu__item-badge')).toBeNull();
      expect(busy.querySelector('.lc-menu__item-busy-text')?.textContent).toBe(' Wird geladen');
      // the name: label, then the busy text (the spinner is aria-hidden)
      expect(computedName(document.body, busy)).toBe('Zähler Wird geladen');
    });

    it('busy: activation is ignored (click, Enter, Space), but it stays in the arrow order', async () => {
      await open();
      item('Zähler').click();
      item('Zähler').focus();
      keydown('Enter');
      keydown(' ');
      expect(host.clicked).toEqual([]);
      item('Profil').focus();
      keydown('ArrowDown');
      expect(document.activeElement).toBe(item('Zähler'));
    });

    it('busyLabel defaults to "Loading"', () => {
      const plain = TestBed.createComponent(MenuComponent);
      expect(plain.componentInstance.busyLabel()).toBe('Loading');
    });
  });

  describe('AC-10: badgeVariant', () => {
    it('renders an lc-badge (xs, rounded) in the variant; without it the old span', async () => {
      await open();
      const badge = item('Prüfungen').querySelector('lc-badge') as HTMLElement;
      expect(badge.classList.contains('lc-menu__item-badge-variant')).toBe(true);
      const box = badge.querySelector('.lc-badge') as HTMLElement;
      expect([...box.classList].filter((c) => /--(xs|warning|rounded)$/.test(c)).sort()).toEqual(['lc-badge--rounded', 'lc-badge--warning', 'lc-badge--xs']);
      expect(badge.textContent?.trim()).toBe('12');
      expect(item('Ohne Variante').querySelector('lc-badge')).toBeNull();
      expect(item('Ohne Variante').querySelector('span.lc-menu__item-badge')?.textContent).toBe('3');
    });
  });

  describe('AC-12: attrs', () => {
    it('renders id and data-* only; drops handlers, class, style, aria-*, upper case names and href (dev warning each)', async () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      await open();
      const profil = item('Profil');
      expect(profil.id).toBe('menu-profil');
      expect(profil.getAttribute('data-test')).toBe('profil');
      for (const name of ['onclick', 'style', 'aria-label', 'data-x', 'href']) expect([name, profil.hasAttribute(name)]).toEqual([name, false]);
      expect(profil.className).not.toContain(' x');
      expect(warn.mock.calls.map((c) => String(c[0]).match(/"([^"]+)"/)?.[1])).toEqual(['onclick', 'class', 'style', 'aria-label', 'Data-X', 'href']);
      warn.mockRestore();
    });

    it('a changed attrs value removes the old attributes', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => undefined);
      await open();
      host.items.set([{ ...ITEMS[0], attrs: { 'data-next': '1' } }]);
      fixture.detectChanges();
      expect(item('Profil').hasAttribute('id')).toBe(false);
      expect(item('Profil').hasAttribute('data-test')).toBe(false);
      expect(item('Profil').getAttribute('data-next')).toBe('1');
      jest.restoreAllMocks();
    });
  });

  describe('AC-9: sections to any depth', () => {
    it('nests groups named by their headings; the depth is a custom property; empty sections have no group role', async () => {
      await open();
      const top = document.querySelector('.lc-menu__section:not(.lc-menu__section--nested)') as HTMLElement;
      const nested = Array.from(top.querySelectorAll<HTMLElement>('.lc-menu__section--nested'));
      expect(nested.map((s) => [s.querySelector(':scope > .lc-menu__section-heading')?.textContent, s.style.getPropertyValue('--_lc-menu-depth'), s.getAttribute('role')])).toEqual([
        ['Objekte', '1', 'group'],
        ['Felder', '2', 'group'],
        ['Leer', '1', null],
      ]);
      for (const group of nested.filter((s) => s.getAttribute('role'))) {
        const heading = group.querySelector(':scope > .lc-menu__section-heading') as HTMLElement;
        expect(group.getAttribute('aria-labelledby')).toBe(heading.id);
        expect(heading.getAttribute('aria-hidden')).toBe('true');
      }
      expect(new Set(Array.from(document.querySelectorAll('.lc-menu__section-heading')).map((h) => h.id)).size).toBe(4);
      expect(nested[1].parentElement).toBe(nested[0]);
    });

    it('the arrows run over the items of every level in visual order', async () => {
      host.anchor.set(null);
      await open();
      expect(document.activeElement).toBe(item('Profil'));
      const path = Array.from({ length: 7 }, () => {
        keydown('ArrowDown');
        return (document.activeElement as HTMLElement).querySelector('.lc-menu__item-label')?.textContent;
      });
      // the disabled „Gesperrt“ (no reason) is skipped, the busy „Zähler“ is not
      expect(path).toEqual(['Zähler', 'Prüfungen', 'Ohne Variante', 'Objekttypen', 'Feldliste', 'Zuletzt', 'Profil']);
    });

    it('axe: no violations with nested sections, current, busy and badges', async () => {
      await open();
      expect(violations(await audit(document.body))).toEqual([]);
    });
  });

  describe('AC-13: Enter and Space', () => {
    it('are consumed on an item and activate it once; a form behind the menu is not submitted', async () => {
      host.anchor.set(null);
      await open();
      const enter = keydown('Enter', item('Ohne Variante'));
      expect(enter.defaultPrevented).toBe(true);
      const space = keydown(' ', item('Prüfungen'));
      expect(space.defaultPrevented).toBe(true);
      expect(host.clicked).toEqual(['plain', 'pruefungen']);
      expect(host.submits).toBe(0);
    });

    it('do not reach a page listener (stopped)', async () => {
      host.anchor.set(null);
      await open();
      const seen: string[] = [];
      const listener = (e: KeyboardEvent) => seen.push(e.key);
      el().addEventListener('keydown', listener);
      keydown('Enter', item('Ohne Variante'));
      keydown(' ', item('Ohne Variante'));
      el().removeEventListener('keydown', listener);
      expect(seen).toEqual([]);
    });
  });

  describe('AC-23: returnFocusTo', () => {
    it('point anchor, nothing focused: Escape gives the focus to returnFocusTo', async () => {
      host.returnTo.set(el().querySelector('.row') as HTMLElement);
      await open();
      keydown('Escape');
      expect(document.activeElement).toBe(el().querySelector('.row'));
    });

    it('Tab gives it the focus during the keydown (Tab moves on from there)', async () => {
      host.returnTo.set(el().querySelector('.row') as HTMLElement);
      await open();
      const event = keydown('Tab');
      expect(event.defaultPrevented).toBe(false);
      expect(document.activeElement).toBe(el().querySelector('.row'));
    });

    it('an item that closes the menu returns the focus there, also when the app clears it while closing', async () => {
      host.returnTo.set(el().querySelector('.row') as HTMLElement);
      host.clearReturnTo = true;
      host.items.set([{ id: 'x', label: 'Weiter', closeOnSelect: true }]);
      await open();
      item('Weiter').focus();
      keydown('Enter');
      expect(host.isOpen()).toBe(false);
      expect(document.activeElement).toBe(el().querySelector('.row'));
    });

    it('null (default): as before (the element focused at open)', async () => {
      (el().querySelector('.opener') as HTMLElement).focus();
      await open();
      keydown('Escape');
      expect(document.activeElement).toBe(el().querySelector('.opener'));
    });
  });

  describe('AC-11: --lc-menu-max-height', () => {
    it('is read on open and used when maxHeight is empty; maxHeight wins', async () => {
      host.anchor.set(null);
      (el().querySelector('lc-menu') as HTMLElement).style.setProperty('--lc-menu-max-height', '200px');
      await open();
      expect(panel()?.style.maxHeight).toBe('200px');
      expect(panel()?.classList.contains('lc-menu__dropdown--scroll')).toBe(true);
      host.isOpen.set(false);
      host.maxHeight.set('150px');
      fixture.detectChanges();
      await open();
      expect(panel()?.style.maxHeight).toBe('150px');
    });

    it('unset: no cap (as before)', async () => {
      host.anchor.set(null);
      await open();
      expect(panel()?.style.maxHeight).toBe('');
      expect(panel()?.classList.contains('lc-menu__dropdown--scroll')).toBe(false);
    });
  });

  describe('SCSS', () => {
    const css = '\n' + compile(resolve(__dirname, 'menu.component.scss')).css;
    const rule = (selector: string) => {
      const start = css.indexOf(`\n${selector} {`);
      expect([selector, start > -1]).toEqual([selector, true]);
      return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
    };
    const CURRENT = '.lc-menu__item--current:not(.lc-menu__item--disabled):not(.lc-menu__item--reason)';

    it('current: selected fill (kept on hover), a 3 px primary bar at the start, semibold label', () => {
      expect(rule(CURRENT)).toBe('position: relative; background-color: var(--color-surface-selected);');
      expect(rule(`${CURRENT}::before`)).toBe(
        'content: ""; position: absolute; inset-block: 0; inset-inline-start: 0; width: 3px; border-start-end-radius: 2px; border-end-end-radius: 2px; background-color: var(--color-primary-500);',
      );
      expect(rule(`${CURRENT} .lc-menu__item-label`)).toBe('font-weight: var(--font-weight-semibold);');
      expect(rule(`${CURRENT}:hover`)).toBe('background-color: var(--color-surface-selected);');
      expect(css).toMatch(/@media \(forced-colors: active\) \{[^@]*\.lc-menu__item--current:not\(\.lc-menu__item--disabled\):not\(\.lc-menu__item--reason\)::before \{\s*background-color: Highlight;\s*forced-color-adjust: none;/);
    });

    it('busy: progress cursor, positioned for the hidden text; the spinner never shrinks', () => {
      expect(rule('.lc-menu__item--busy')).toBe('position: relative; cursor: progress;');
      expect(rule('.lc-menu__item-spinner')).toBe('display: inline-flex; flex-shrink: 0;');
      expect(rule('.lc-menu__item-busy-text')).toContain('clip: rect(0, 0, 0, 0);');
      expect(rule('.lc-menu__item-badge-variant')).toBe('display: inline-flex; flex-shrink: 0;');
    });

    it('nested sections: one step per level for heading and items (md 16, sm 12, lg 20); headings without capitals', () => {
      expect(rule('.lc-menu__section--nested > .lc-menu__section-heading')).toBe(
        'padding-inline-start: calc(var(--lc-density-padding-md, var(--spacing-4)) + var(--_lc-menu-depth, 1) * var(--spacing-4)); letter-spacing: 0; text-transform: none;',
      );
      expect(rule('.lc-menu__section--nested .lc-menu__item')).toBe(
        'padding-inline-start: calc(var(--lc-density-padding-md, var(--spacing-4)) + var(--_lc-menu-depth, 1) * var(--spacing-4));',
      );
      expect(css).toMatch(/\.lc-menu__dropdown--sm \.lc-menu__section--nested > \.lc-menu__section-heading,\s*\.lc-menu__dropdown--sm \.lc-menu__section--nested \.lc-menu__item \{\s*padding-inline-start: calc\(var\(--lc-density-padding-sm, var\(--spacing-3\)\) \+ var\(--_lc-menu-depth, 1\) \* var\(--spacing-3\)\);/);
      expect(css).toMatch(/\.lc-menu__dropdown--lg \.lc-menu__section--nested > \.lc-menu__section-heading,\s*\.lc-menu__dropdown--lg \.lc-menu__section--nested \.lc-menu__item \{\s*padding-inline-start: calc\(var\(--spacing-5\) \+ var\(--_lc-menu-depth, 1\) \* var\(--spacing-5\)\);/);
    });
  });
});
