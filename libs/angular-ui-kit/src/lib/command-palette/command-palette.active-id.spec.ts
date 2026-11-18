import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { CommandPaletteComponent, CommandPaletteGroup, CommandPaletteSelectEvent } from './command-palette.component';
import { LABEL_IN_NAME, audit, axe, computedName, installFakeCanvas, outcome, violations } from '../../testing/axe-jsdom';

/**
 * Request 068 (3.48, usm-x rows 47 and 48, design §2, §6, §9): the
 * `activeId` model and `CommandPaletteItem.badge`.
 */
const NAV: CommandPaletteGroup = {
  id: 'nav',
  heading: 'Navigation',
  items: [
    { id: 'tickets', label: 'Offene Tickets', hint: 'Stammdaten', badge: '56/60' },
    { id: 'locked', label: 'Gesperrt', disabled: true, badge: '0' },
    { id: 'probleme', label: 'Probleme', badge: '4', badgeVariant: 'primary' },
  ],
};
const ACTIONS: CommandPaletteGroup = {
  id: 'actions',
  heading: 'Aktionen',
  items: [
    { id: 'pin', label: 'Ansicht anheften', keepOpen: true },
    { id: 'neu', label: 'Neues Ticket', shortcut: '⌘N' },
  ],
};
/** After „Ansicht anheften“: its line is replaced by „Ansicht lösen“. */
const ACTIONS_AFTER: CommandPaletteGroup = {
  ...ACTIONS,
  items: [{ id: 'unpin', label: 'Ansicht lösen', keepOpen: true }, ACTIONS.items[1]],
};

@Component({
  standalone: true,
  imports: [CommandPaletteComponent],
  template: `
    <div lang="de">
      <lc-command-palette
        [(open)]="open"
        [groups]="groups()"
        [debounceMs]="0"
        [(activeId)]="activeId"
        (itemSelect)="onSelect($event)"
      />
    </div>
  `,
})
class HostComponent {
  readonly open = signal(true);
  readonly groups = signal<readonly CommandPaletteGroup[]>([NAV, ACTIONS]);
  readonly activeId = signal<string | null>(null);
  readonly ids: (string | null)[] = [];

  onSelect(event: CommandPaletteSelectEvent): void {
    if (event.item.id === 'pin') {
      // the app's pattern: the replacement line takes the cursor, in the same change
      this.groups.set([NAV, ACTIONS_AFTER]);
      this.activeId.set('unpin');
    }
  }
}

@Component({
  standalone: true,
  imports: [CommandPaletteComponent],
  template: `<lc-command-palette [open]="true" [groups]="groups" [debounceMs]="0" />`,
})
class PlainHostComponent {
  readonly groups = [NAV];
}

describe('lc-command-palette 3.48 (request 068)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const field = (): HTMLInputElement => document.querySelector('.lc-command-palette input') as HTMLInputElement;
  const option = (label: string): HTMLElement =>
    Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
      (o) => o.querySelector('.lc-command-palette__label')?.textContent === label,
    ) as HTMLElement;
  const activeLabel = (): string | null => {
    const id = field().getAttribute('aria-activedescendant');
    return id ? (document.getElementById(id)?.querySelector('.lc-command-palette__label')?.textContent ?? null) : null;
  };
  const key = (k: string): void => {
    field().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    fixture.detectChanges();
  };
  const settle = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HostComponent, PlainHostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await settle();
  });

  afterEach(() => fixture.destroy());

  describe('AC-1: activeId', () => {
    it('the palette writes the cursor’s item id on every move', () => {
      expect(activeLabel()).toBe('Offene Tickets');
      expect(host.activeId()).toBe('tickets');
      key('ArrowDown');
      expect(host.activeId()).toBe('probleme');
      key('ArrowDown');
      expect(host.activeId()).toBe('pin');
    });

    it('setting it moves the cursor (aria-activedescendant) and scrolls it into view', async () => {
      const list = document.querySelector('[role="listbox"]') as HTMLElement;
      Object.defineProperty(list, 'clientHeight', { configurable: true, value: 100 });
      list.getBoundingClientRect = () => ({ top: 0, bottom: 100 }) as DOMRect;
      option('Ansicht anheften').getBoundingClientRect = () => ({ top: 150, bottom: 194 }) as DOMRect;
      host.activeId.set('pin');
      await settle();
      expect(activeLabel()).toBe('Ansicht anheften');
      expect(option('Ansicht anheften').getAttribute('aria-selected')).toBe('true');
      expect(list.scrollTop).toBe(94);
    });

    it('an unknown or disabled id falls back to the first enabled option and writes its id back', async () => {
      key('ArrowDown');
      host.activeId.set('nope');
      await settle();
      expect(activeLabel()).toBe('Offene Tickets');
      expect(host.activeId()).toBe('tickets');
      host.activeId.set('locked');
      await settle();
      expect(activeLabel()).toBe('Offene Tickets');
      expect(host.activeId()).toBe('tickets');
    });

    it('after a keepOpen item the app puts the cursor on the line that took its place', async () => {
      host.activeId.set('pin');
      await settle();
      field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      await settle();
      expect(host.open()).toBe(true);
      expect(activeLabel()).toBe('Ansicht lösen');
      expect(host.activeId()).toBe('unpin');
    });

    it('without a binding the cursor works as before', async () => {
      fixture.destroy();
      const plain = TestBed.createComponent(PlainHostComponent);
      plain.detectChanges();
      await plain.whenStable();
      plain.detectChanges();
      expect(activeLabel()).toBe('Offene Tickets');
      field().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
      plain.detectChanges();
      expect(activeLabel()).toBe('Probleme');
      plain.destroy();
    });
  });

  describe('AC-2: badge', () => {
    it('draws an lc-badge xs after the hint, before the shortcut, in the option’s name', () => {
      const tickets = option('Offene Tickets');
      const badge = tickets.querySelector('.lc-command-palette__badge') as HTMLElement;
      expect(badge.localName).toBe('lc-badge');
      expect(badge.textContent?.trim()).toBe('56/60');
      expect(badge.previousElementSibling?.classList.contains('lc-command-palette__hint')).toBe(true);
      expect(tickets.getAttribute('aria-labelledby')?.split(' ').pop()).toBe(badge.id);
      expect(computedName(document.body, tickets)).toBe('Offene Tickets Stammdaten 56/60');
      expect(option('Probleme').querySelector('.lc-badge--primary')).not.toBeNull();
      expect(option('Neues Ticket').querySelector('.lc-command-palette__badge')).toBeNull();
    });

    it('never shrinks; a disabled row’s badge takes the disabled ink', () => {
      const css = compile(resolve(__dirname, 'command-palette.component.scss')).css.replace(/\s+/g, ' ');
      expect(css).toContain('.lc-command-palette__badge { display: inline-flex; flex-shrink: 0; white-space: nowrap; }');
      expect(css).toContain('.lc-command-palette__option--disabled .lc-command-palette__badge .lc-badge { --_lc-badge-fg: var(--color-text-disabled); }');
    });

    it('axe: no violations; label-in-name passes on every option with a badge', async () => {
      const restoreCanvas = installFakeCanvas();
      try {
        document.body.style.setProperty('overflow', 'visible');
        (document.querySelector('.lc-command-palette .lc-modal__body') as HTMLElement).style.setProperty('overflow', 'visible');
        const palette = document.querySelector('.lc-command-palette') as HTMLElement;
        expect(violations(await audit(palette))).toEqual([]);
        const results = await axe.run(palette, { runOnly: [LABEL_IN_NAME] });
        expect(outcome(results, LABEL_IN_NAME)).toBe('pass');
      } finally {
        restoreCanvas();
        document.body.style.removeProperty('overflow');
      }
    });
  });
});
