import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  COMMAND_PALETTE_LABELS_DE,
  CommandPaletteComponent,
  CommandPaletteGroup,
  CommandPaletteLabels,
  CommandPaletteSelectEvent,
} from './command-palette.component';
import { resolve } from 'path';
import { compile } from 'sass';
import { LABEL_IN_NAME, audit, axe, computedName, installFakeCanvas, outcome, violations } from '../../testing/axe-jsdom';

const PAGES: CommandPaletteGroup = {
  id: 'pages',
  heading: 'Pages',
  items: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'cost', label: 'Cost centres', description: 'Manage allocation', hint: 'Master data' },
    { id: 'locked', label: 'Locked page', disabled: true, disabledReason: 'No permission' },
  ],
};
const ACTIONS: CommandPaletteGroup = {
  id: 'actions',
  heading: 'Actions',
  items: [
    { id: 'new', label: 'New cost centre', shortcut: '⌘N' },
    { id: 'theme', label: 'Toggle theme', keepOpen: true },
  ],
};

@Component({
  standalone: true,
  imports: [CommandPaletteComponent],
  template: `
    <button id="trigger" type="button">Open</button>
    <lc-command-palette
      [(open)]="open"
      [(query)]="query"
      [groups]="groups()"
      [debounceMs]="debounceMs()"
      [shortcut]="shortcut()"
      [labels]="labels()"
      (itemSelect)="selected.push($event)"
      (groupRetry)="retried.push($event.id)"
      (searchChange)="searched.push($event)"
    />
  `,
})
class HostComponent {
  readonly open = signal(true);
  readonly query = signal('');
  readonly groups = signal<readonly CommandPaletteGroup[]>([PAGES, ACTIONS]);
  readonly debounceMs = signal(0);
  readonly shortcut = signal<string | null>(null);
  readonly labels = signal<Partial<CommandPaletteLabels>>({});
  readonly selected: CommandPaletteSelectEvent[] = [];
  readonly retried: string[] = [];
  readonly searched: string[] = [];
}

describe('lc-command-palette (3.45, usm-x row 34)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const field = (): HTMLInputElement => document.querySelector('.lc-command-palette input') as HTMLInputElement;
  const options = (): HTMLElement[] => Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'));
  const activeLabel = (): string | null => {
    const id = field().getAttribute('aria-activedescendant');
    return id ? (document.getElementById(id)?.querySelector('.lc-command-palette__label')?.textContent ?? null) : null;
  };
  const key = (k: string, init: KeyboardEventInit = {}): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init });
    field().dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };
  const type = (text: string): void => {
    field().value = text;
    field().dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };
  /**
   * jsdom has no layout (every rect is 0 × 0), so axe takes everything under
   * an `overflow: hidden` ancestor for clipped and skips it as not visible:
   * lc-modal locks the page (`body` overflow hidden), and the modal body clips
   * since review r1 (the listbox scrolls). The audits lift both, so axe checks
   * the options as a browser shows them.
   */
  const unclip = (): void => {
    document.body.style.setProperty('overflow', 'visible');
    (document.querySelector('.lc-command-palette .lc-modal__body') as HTMLElement).style.setProperty('overflow', 'visible');
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  describe('AC-8: entry, open model, shortcut', () => {
    it('renders nothing while closed (also no lc-modal host)', () => {
      host.open.set(false);
      fixture.detectChanges();
      const el = fixture.nativeElement.querySelector('lc-command-palette') as HTMLElement;
      expect(el.children.length).toBe(0);
      expect(el.textContent?.trim()).toBe('');
      expect(document.querySelector('[role="dialog"]')).toBeNull();
    });

    it('opens as a named modal dialog at the top placement', () => {
      const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
      expect(dialog.getAttribute('aria-modal')).toBe('true');
      expect(dialog.getAttribute('aria-label')).toBe('Command palette');
      expect(dialog.classList).toContain('lc-modal--placement-top');
    });

    it('has no shortcut by default: Ctrl+K and ⌘K do nothing', () => {
      host.open.set(false);
      fixture.detectChanges();
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
      fixture.detectChanges();
      expect(host.open()).toBe(false);
    });

    it('toggles with its shortcut (mod = Ctrl outside Apple systems) and marks it handled', () => {
      host.open.set(false);
      host.shortcut.set('mod+k');
      fixture.detectChanges();
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true });
      document.body.dispatchEvent(event);
      fixture.detectChanges();
      expect(host.open()).toBe(true);
      expect(event.defaultPrevented).toBe(true);
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'K', ctrlKey: true, bubbles: true }));
      fixture.detectChanges();
      expect(host.open()).toBe(false);
    });

    it('ignores a shortcut without ctrl/meta/alt while an editable field has the focus', () => {
      host.open.set(false);
      host.shortcut.set('/');
      fixture.detectChanges();
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }));
      fixture.detectChanges();
      expect(host.open()).toBe(false);
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: '/', bubbles: true }));
      fixture.detectChanges();
      expect(host.open()).toBe(true);
      input.remove();
    });
  });

  describe('AC-9: grouped listbox on a combobox field', () => {
    it('wires the field as a combobox over the listbox', () => {
      const input = field();
      const listbox = document.querySelector('[role="listbox"]') as HTMLElement;
      expect(input.getAttribute('role')).toBe('combobox');
      expect(input.getAttribute('aria-autocomplete')).toBe('list');
      expect(input.getAttribute('aria-expanded')).toBe('true');
      expect(input.getAttribute('aria-controls')).toBe(listbox.id);
      expect(input.getAttribute('aria-label')).toBe('Search commands and pages');
      expect(activeLabel()).toBe('Dashboard');
    });

    it('names each group by its heading and puts the options inside', () => {
      const groups = Array.from(document.querySelectorAll<HTMLElement>('[role="listbox"] > [role="group"]'));
      expect(groups.length).toBe(2);
      const heading = document.getElementById(groups[0].getAttribute('aria-labelledby') as string) as HTMLElement;
      expect(heading.textContent).toBe('Pages');
      expect(heading.getAttribute('role')).toBe('presentation');
      expect(groups[0].querySelectorAll('[role="option"]').length).toBe(3);
    });

    // Review r1 (D1, M1): the name was the label alone, with description,
    // hint/reason and shortcut as the description; axe's label-content-name-
    // mismatch failed every multi-part option, so the name is now every visible
    // part in DOM order and item options have no description.
    it('names an option by all its visible parts in DOM order, without a description', () => {
      const [dashboard, cost, locked, add] = options();
      const text = (ids: string | null): string =>
        (ids ?? '')
          .split(' ')
          .map((id) => document.getElementById(id)?.textContent)
          .join(' | ');
      expect(text(dashboard.getAttribute('aria-labelledby'))).toBe('Dashboard');
      expect(text(cost.getAttribute('aria-labelledby'))).toBe('Cost centres | Manage allocation | Master data');
      expect(locked.getAttribute('aria-disabled')).toBe('true');
      expect(text(locked.getAttribute('aria-labelledby'))).toBe('Locked page | No permission');
      expect(text(add.getAttribute('aria-labelledby'))).toBe('New cost centre | ⌘N');
      expect(add.querySelector('kbd')?.textContent).toBe('⌘N');
      expect(options().filter((o) => o.hasAttribute('aria-describedby'))).toEqual([]);
      // The DOM text keeps the parts apart, as the name does.
      const spaced = (el: HTMLElement): string => (el.textContent ?? '').replace(/\s+/g, ' ').trim();
      expect(spaced(cost)).toBe('Cost centres Manage allocation Master data');
      expect(spaced(add)).toBe('New cost centre ⌘N');
      expect(computedName(document.body, cost)).toBe('Cost centres Manage allocation Master data');
    });

    it('marks a disabled reason as the wrapping kind of hint', () => {
      const [, cost, locked] = options();
      expect(cost.querySelector('.lc-command-palette__hint')?.classList.contains('lc-command-palette__hint--reason')).toBe(false);
      expect(locked.querySelector('.lc-command-palette__hint')?.classList.contains('lc-command-palette__hint--reason')).toBe(true);
    });

    describe('label-content-name-mismatch (WCAG 2.5.3; experimental in axe 4.14, so the tag audit skips it)', () => {
      let restoreCanvas: () => void;
      beforeAll(() => (restoreCanvas = installFakeCanvas()));
      afterAll(() => restoreCanvas());
      const run = () => {
        unclip();
        return axe.run(document.querySelector('.lc-command-palette') as HTMLElement, { runOnly: [LABEL_IN_NAME] });
      };

      it('passes on every option', async () => {
        const results = await run();
        expect(outcome(results, LABEL_IN_NAME)).toBe('pass');
        expect(results.passes.find((r) => r.id === LABEL_IN_NAME)?.nodes.length).toBe(5);
      });

      it('negative control: without the spaces the parts run together and the rule fails', async () => {
        const cost = options()[1];
        const walker = document.createTreeWalker(cost, NodeFilter.SHOW_TEXT);
        const blanks: Text[] = [];
        for (let n = walker.nextNode(); n; n = walker.nextNode()) if (!(n.textContent ?? '').trim()) blanks.push(n as Text);
        blanks.forEach((n) => n.remove());
        expect(cost.textContent).toBe('Cost centresManage allocationMaster data');
        expect(outcome(await run(), LABEL_IN_NAME)).toBe('violation');
      });
    });

    it('emits queryChange on every keystroke and searchChange debounced', () => {
      jest.useFakeTimers();
      try {
        host.debounceMs.set(300);
        fixture.detectChanges();
        type('co');
        expect(host.query()).toBe('co');
        expect(host.searched).toEqual([]);
        jest.advanceTimersByTime(300);
        expect(host.searched).toEqual(['co']);
      } finally {
        jest.useRealTimers();
      }
    });

    it('marks the query in the labels, case-insensitive', () => {
      type('COST');
      const marks = Array.from(document.querySelectorAll('.lc-command-palette__option mark')).map((m) => m.textContent);
      expect(marks).toEqual(['Cost', 'cost']);
      expect(options()[1].querySelector('.lc-command-palette__label')?.textContent).toBe('Cost centres');
    });
  });

  describe('AC-10: async groups', () => {
    it('shows a busy group with aria-busy and a hidden busy row', () => {
      host.groups.set([PAGES, { id: 'server', heading: 'Records', items: [], loading: true }]);
      fixture.detectChanges();
      const group = document.querySelectorAll('[role="group"]')[1];
      expect(group.getAttribute('aria-busy')).toBe('true');
      const row = group.querySelector('.lc-command-palette__message') as HTMLElement;
      expect(row.getAttribute('aria-hidden')).toBe('true');
      expect(row.textContent).toContain('Searching…');
    });

    it('announces loading and the result count after debounceMs', () => {
      jest.useFakeTimers();
      try {
        host.debounceMs.set(300);
        host.groups.set([PAGES, { id: 'server', heading: 'Records', items: [], loading: true }]);
        fixture.detectChanges();
        const status = document.querySelector('[role="status"].lc-command-palette__status') as HTMLElement;
        jest.advanceTimersByTime(300);
        fixture.detectChanges();
        expect(status.textContent).toBe('Searching…');
        host.groups.set([PAGES, ACTIONS]);
        fixture.detectChanges();
        jest.advanceTimersByTime(300);
        fixture.detectChanges();
        expect(status.textContent).toBe('5 results');
      } finally {
        jest.useRealTimers();
      }
    });

    it('shows an error group with a retry option described by the message', () => {
      host.groups.set([{ id: 'server', heading: 'Records', items: [], error: true }]);
      fixture.detectChanges();
      const [retry] = options();
      expect(retry.textContent?.trim()).toBe('Try again');
      expect(document.getElementById(retry.getAttribute('aria-describedby') as string)?.textContent?.trim()).toBe(
        'Couldn’t load these results.',
      );
      key('Enter');
      expect(host.retried).toEqual(['server']);
      expect(host.open()).toBe(true);
    });

    it('shows a string error as the message', () => {
      host.groups.set([{ id: 'server', heading: 'Records', items: [], error: 'Server down' }]);
      fixture.detectChanges();
      expect(document.querySelector('.lc-command-palette__message--error')?.textContent?.trim()).toBe('Server down');
    });

    it('hides an empty group unless it has emptyText', () => {
      host.groups.set([
        { id: 'a', heading: 'Hidden', items: [] },
        { id: 'b', heading: 'Recent', items: [], emptyText: 'Nothing recent' },
      ]);
      fixture.detectChanges();
      const groups = document.querySelectorAll('[role="group"]');
      expect(groups.length).toBe(1);
      expect(groups[0].textContent).toContain('Nothing recent');
      expect(field().getAttribute('aria-expanded')).toBe('false');
    });

    it('shows the global no-results text when nothing is to show', () => {
      type('xyz');
      host.groups.set([]);
      fixture.detectChanges();
      expect(document.querySelector('.lc-command-palette__empty')?.textContent).toBe('No results for “xyz”');
    });

    it('keeps the cursor on its option when results arrive above or below it', () => {
      key('ArrowDown');
      expect(activeLabel()).toBe('Cost centres');
      host.groups.set([{ id: 'server', heading: 'Records', items: [{ id: 'r1', label: 'Record 1' }] }, PAGES, ACTIONS]);
      fixture.detectChanges();
      expect(activeLabel()).toBe('Cost centres');
    });

    it('moves the cursor to the first enabled option on a new query', () => {
      key('ArrowDown');
      type('c');
      expect(activeLabel()).toBe('Dashboard');
    });
  });

  describe('AC-11: keyboard', () => {
    it('moves over every group, skipping disabled options, and wraps', () => {
      const seen: (string | null)[] = [];
      for (let i = 0; i < 5; i++) {
        key('ArrowDown');
        seen.push(activeLabel());
      }
      expect(seen).toEqual(['Cost centres', 'New cost centre', 'Toggle theme', 'Dashboard', 'Cost centres']);
      key('ArrowUp');
      key('ArrowUp');
      expect(activeLabel()).toBe('Toggle theme');
    });

    it('goes to the first/last option with Home/End, leaves Shift+Home to the caret', () => {
      expect(key('End').defaultPrevented).toBe(true);
      expect(activeLabel()).toBe('Toggle theme');
      key('Home');
      expect(activeLabel()).toBe('Dashboard');
      expect(key('End', { shiftKey: true }).defaultPrevented).toBe(false);
      expect(activeLabel()).toBe('Dashboard');
    });

    it('moves 10 options with PageDown/PageUp, clamped', () => {
      key('PageDown');
      expect(activeLabel()).toBe('Toggle theme');
      key('PageUp');
      expect(activeLabel()).toBe('Dashboard');
    });

    it('selects with Enter (handled) and closes; keepOpen stays open', () => {
      key('ArrowDown');
      const event = key('Enter');
      expect(event.defaultPrevented).toBe(true);
      expect(host.selected.map((e) => [e.item.id, e.group.id])).toEqual([['cost', 'pages']]);
      expect(host.open()).toBe(false);

      host.open.set(true);
      fixture.detectChanges();
      key('End');
      key('Enter');
      expect(host.selected.at(-1)?.item.id).toBe('theme');
      expect(host.open()).toBe(true);
    });

    it('ignores Enter while composing', () => {
      key('Enter', { isComposing: true });
      expect(host.selected).toEqual([]);
    });

    it('clears the query with the first Escape and closes with the second', () => {
      type('cost');
      const first = key('Escape');
      expect(first.defaultPrevented).toBe(true);
      expect(host.query()).toBe('');
      expect(host.open()).toBe(true);
      expect(document.activeElement).toBe(field());
      key('Escape');
      expect(host.open()).toBe(false);
    });

    it('selects on click, but hovering does not move the cursor', () => {
      const cost = options()[1];
      cost.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      cost.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
      fixture.detectChanges();
      expect(activeLabel()).toBe('Dashboard');
      const down = new Event('pointerdown', { bubbles: true, cancelable: true });
      cost.dispatchEvent(down);
      expect(down.defaultPrevented).toBe(true);
      cost.click();
      fixture.detectChanges();
      expect(host.selected.at(-1)?.item.id).toBe('cost');
    });

    it('does not select a disabled option on click', () => {
      options()[2].click();
      expect(host.selected).toEqual([]);
    });

    it('closes from the backdrop', () => {
      (document.querySelector('.lc-modal-backdrop') as HTMLElement).click();
      fixture.detectChanges();
      expect(host.open()).toBe(false);
    });
  });

  /**
   * Review r1 (M2, S1): the listbox is the scroll container. jsdom has no
   * layout, so this lays the rows out by hand: from the listbox's 8 px top
   * padding, headings 30 px, options and messages 44 px; the listbox shows
   * 100 px at y 100 and clamps `scrollTop` like a browser.
   */
  describe('AC-10/11: the listbox scrolls (review r1 M2, S1)', () => {
    let list: HTMLElement;
    let restore: () => void;
    const rows = (): HTMLElement[] =>
      Array.from(list.querySelectorAll<HTMLElement>('.lc-command-palette__heading, [role="option"], .lc-command-palette__message'));
    const height = (el: Element): number => (el.classList.contains('lc-command-palette__heading') ? 30 : 44);
    const total = (): number => rows().reduce((y, r) => y + height(r), 16);
    const top = (el: Element): number => el.getBoundingClientRect().top - 100;
    const active = (): HTMLElement => document.getElementById(field().getAttribute('aria-activedescendant') as string) as HTMLElement;
    const heading = (i: number): HTMLElement => document.querySelectorAll<HTMLElement>('.lc-command-palette__heading')[i];

    beforeEach(() => {
      list = document.querySelector('[role="listbox"]') as HTMLElement;
      let scrollTop = 0;
      Object.defineProperty(list, 'clientHeight', { configurable: true, get: () => 100 });
      Object.defineProperty(list, 'scrollHeight', { configurable: true, get: total });
      Object.defineProperty(list, 'scrollTop', {
        configurable: true,
        get: () => scrollTop,
        set: (v: number) => (scrollTop = Math.max(0, Math.min(v, total() - 100))),
      });
      const original = HTMLElement.prototype.getBoundingClientRect;
      const rect = (y: number, h: number) => ({ x: 0, y, top: y, bottom: y + h, left: 0, right: 600, width: 600, height: h, toJSON: () => ({}) }) as DOMRect;
      HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement): DOMRect {
        if (this === list) return rect(100, 100);
        let at = 8;
        for (const r of rows()) {
          if (r === this) return rect(100 + at - scrollTop, height(r));
          at += height(r);
        }
        return original.call(this);
      };
      restore = () => (HTMLElement.prototype.getBoundingClientRect = original);
    });

    afterEach(() => restore());

    it('scrolls the active option in at the nearest edge', () => {
      key('ArrowDown'); // Cost centres, 82–126
      expect(list.scrollTop).toBe(26);
      expect(top(active())).toBe(56);
    });

    it('brings a group’s heading along with its first option', () => {
      key('ArrowDown');
      key('ArrowDown'); // New cost centre, first of „Actions“ (heading 170, option 200–244)
      expect(list.scrollTop).toBe(144);
      expect(top(heading(1))).toBe(26);
      key('End');
      key('ArrowUp'); // back to it from below: the heading at the top edge
      expect(top(heading(1))).toBe(0);
      expect(list.scrollTop).toBe(170);
    });

    it('scrolls to the end on the last option and to the top on the first (↑ wraps, then Home)', () => {
      key('ArrowUp'); // wraps to Toggle theme
      expect(activeLabel()).toBe('Toggle theme');
      expect(list.scrollTop).toBe(total() - 100);
      key('Home');
      expect(list.scrollTop).toBe(0);
      expect(top(heading(0))).toBe(8);
    });

    it('keeps the active option in place when a group arrives above it', () => {
      key('ArrowDown');
      expect(top(active())).toBe(56);
      host.groups.set([{ id: 'server', heading: 'Records', items: [{ id: 'r1', label: 'Record 1' }] }, PAGES, ACTIONS]);
      fixture.detectChanges();
      expect(activeLabel()).toBe('Cost centres');
      expect(list.scrollTop).toBe(26 + 74);
      expect(top(active())).toBe(56);
    });

    it('puts the list at its top on a new query', () => {
      key('End');
      expect(list.scrollTop).toBeGreaterThan(0);
      type('e');
      expect(list.scrollTop).toBe(0);
    });
  });

  describe('the scroll container and the hint in the compiled CSS (review r1 M2, S2)', () => {
    const css = '\n' + compile(resolve(__dirname, 'command-palette.component.scss')).css;
    const rule = (selector: string): string => {
      const start = css.indexOf(`\n${selector} {`);
      expect([selector, start > -1]).toEqual([selector, true]);
      return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
    };

    it('scrolls the listbox, not the modal body', () => {
      expect(rule('.lc-command-palette .lc-command-palette__modal .lc-modal__body')).toBe(
        'position: relative; gap: 0; min-height: 0; padding: 0; overflow: hidden;',
      );
      expect(rule('.lc-command-palette__body')).toBe('display: flex; flex-direction: column; min-height: 0;');
      expect(rule('.lc-command-palette__listbox')).toBe(
        'flex: 1 1 auto; min-height: 0; padding: var(--spacing-2) var(--spacing-3); overflow-y: auto; overscroll-behavior: contain;',
      );
    });

    it('never animates a heading’s padding (the pinning reads the new height at once, also under reduced motion)', () => {
      expect(rule('.lc-command-palette__heading')).toContain('transition-property: none;');
    });

    it('keeps the empty text’s 8 / 12 px inset when nothing is listed', () => {
      expect(rule('.lc-command-palette__listbox:has(+ .lc-command-palette__empty)')).toBe('padding-block: 0;');
      expect(rule('.lc-command-palette__empty')).toContain('margin: var(--spacing-2) var(--spacing-3);');
    });

    it('keeps a hint whole up to a third of the row; a reason wraps', () => {
      expect(rule('.lc-command-palette__hint')).toContain('flex: 0 0 auto; max-width: 33%;');
      expect(rule('.lc-command-palette__hint.lc-command-palette__hint--reason')).toBe('white-space: normal; text-align: end;');
    });
  });

  describe('AC-12: texts', () => {
    it('uses the German labels', () => {
      host.labels.set(COMMAND_PALETTE_LABELS_DE);
      fixture.detectChanges();
      expect(document.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Befehlspalette');
      // Review r1 (M3): „Suchen oder springen …“ (157 px) was clipped in the 123 px text box at 360.
      expect(field().placeholder).toBe('Suchen …');
      expect(document.querySelector('.lc-command-palette__cancel')?.textContent?.trim()).toBe('Abbrechen');
      type('xyz');
      host.groups.set([]);
      fixture.detectChanges();
      expect(document.querySelector('.lc-command-palette__empty')?.textContent).toBe('Keine Treffer für „xyz“');
    });

    it('closes with Cancel', () => {
      (document.querySelector('.lc-command-palette__cancel button') as HTMLButtonElement).click();
      fixture.detectChanges();
      expect(host.open()).toBe(false);
    });
  });

  it('AC-9: has no axe violations when open, also with busy and error groups', async () => {
    host.groups.set([
      PAGES,
      ACTIONS,
      { id: 'server', heading: 'Records', items: [], loading: true },
      { id: 'err', heading: 'Documents', items: [], error: true },
    ]);
    fixture.detectChanges();
    unclip();
    expect(violations(await audit(document.querySelector('.lc-command-palette') as HTMLElement))).toEqual([]);
  });
});
