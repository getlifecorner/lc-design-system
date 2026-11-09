import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { ListComponent, type ListItem } from './list.component';
import { ListItemTemplateDirective } from './list-item-template.directive';
import { audit, computedName, outcome, violations } from '../../testing/axe-jsdom';

/**
 * 3.37 (request 057, 056 F-2, design D-7): a `clickable` row with a built-in
 * `action` is no `role="button"` any more, so the action is not nested in a
 * control (axe `nested-interactive`, WCAG 4.1.2, since 3.3). The row holds an
 * empty native button stretched over it, named by the row, beside the action.
 */
@Component({
  standalone: true,
  imports: [ListComponent, ListItemTemplateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (withTemplate()) {
      <lc-list [items]="items()" [clickable]="true">
        <ng-template lcListItem let-item><span class="custom">{{ item.label }}</span></ng-template>
      </lc-list>
    } @else {
      <lc-list
        [items]="items()"
        [clickable]="clickable()"
        [showChevron]="true"
        actionSize="lg"
        (itemClick)="events.push('item:' + $event.id)"
        (actionClick)="events.push('action:' + $event.id)"
      />
    }
  `,
})
class Host {
  readonly list = viewChild(ListComponent);
  readonly withTemplate = signal(false);
  readonly clickable = signal(true);
  readonly items = signal<ListItem[]>([
    {
      id: 'sap',
      label: 'SAP-Ist (Kostenstellen-Einzelposten, Buchungskreis 1000)',
      metadata: 'Heute, 06:00',
      badge: 'Geladen',
      badgeVariant: 'success',
      action: 'Laden',
      selected: true,
    },
    { id: 'usm', label: 'USM-Leistungsverrechnung', action: 'Laden', actionAriaLabel: 'USM-Leistungsverrechnung laden' },
    { id: 'plan', label: 'SAP-Plan', action: 'Laden', disabled: true },
    { id: 'none', label: 'Ohne Aktion' },
  ]);
  readonly events: string[] = [];
}

describe('lc-list — clickable row with an action (3.37, request 057, F-2)', () => {
  let fixture: ComponentFixture<Host>;
  const el = () => fixture.nativeElement as HTMLElement;
  const rows = () => Array.from(el().querySelectorAll<HTMLElement>('[role="list"] > [role="listitem"]'));
  const rowOf = (id: number) => rows()[id].firstElementChild as HTMLElement;
  const buttonOf = (id: number) => rowOf(id).querySelector<HTMLButtonElement>(':scope > .lc-list__item-button') as HTMLButtonElement;
  const actionOf = (id: number) => rowOf(id).querySelector<HTMLButtonElement>('.lc-list__action-area button') as HTMLButtonElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => fixture?.destroy());

  describe('AC-19: markup', () => {
    it('the row has no role or tabindex; its first child is an empty native button named by the row', () => {
      const row = rowOf(0);
      expect(row.className).toBe('lc-list__item lc-list__item--selected lc-list__item--split');
      expect(row.hasAttribute('role')).toBe(false);
      expect(row.hasAttribute('tabindex')).toBe(false);
      expect(row.id).toMatch(/^lc-list-\d+-row-0$/);
      const button = buttonOf(0);
      expect(row.firstElementChild).toBe(button);
      expect(button.type).toBe('button');
      expect(button.textContent).toBe('');
      expect(button.getAttribute('aria-labelledby')).toBe(row.id);
      expect(button.hasAttribute('tabindex')).toBe(false);
      expect(button.getAttribute('aria-current')).toBe('true');
      expect(button.hasAttribute('aria-disabled')).toBe(false);
      // The action stays a real button inside the trailing column, after the row's button.
      expect(actionOf(0).closest('.lc-list__trailing')).not.toBeNull();
      expect(button.compareDocumentPosition(actionOf(0)) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('row ids are unique per list and per row', () => {
      const ids = rows().slice(0, 3).map((r) => (r.firstElementChild as HTMLElement).id);
      expect(new Set(ids).size).toBe(3);
      expect(el().querySelectorAll('[id]').length).toBeGreaterThanOrEqual(3);
    });

    it('a disabled row: the button leaves the Tab order and is aria-disabled', () => {
      const button = buttonOf(2);
      expect(rowOf(2).classList).toContain('lc-list__item--disabled');
      expect(button.getAttribute('tabindex')).toBe('-1');
      expect(button.getAttribute('aria-disabled')).toBe('true');
    });

    it('rows without an action and rows drawn by a template keep the role="button" row', () => {
      expect(rowOf(3).getAttribute('role')).toBe('button');
      expect(rowOf(3).getAttribute('tabindex')).toBe('0');
      expect(rowOf(3).querySelector('.lc-list__item-button')).toBeNull();
      fixture.componentInstance.withTemplate.set(true);
      fixture.detectChanges();
      expect(rowOf(0).getAttribute('role')).toBe('button');
      expect(el().querySelector('.lc-list__item--split')).toBeNull();
    });

    it('without clickable the row is the plain listitem, as before', () => {
      fixture.componentInstance.clickable.set(false);
      fixture.detectChanges();
      expect(el().querySelector('.lc-list__item--split, .lc-list__item-button, [role="button"]')).toBeNull();
    });
  });

  describe('AC-19: names and axe', () => {
    it('the row button is named by the row text, as the role="button" row was', () => {
      // The same string as the 3.36 role="button" row in jsdom (compared once
      // against the 3.36 template, build.md). jsdom has no layout, so the badge
      // and the metadata spans run together; a browser separates the blocks.
      expect(computedName(el(), buttonOf(0))).toBe('SAP-Ist (Kostenstellen-Einzelposten, Buchungskreis 1000) GeladenHeute, 06:00 Laden');
      expect(computedName(el(), actionOf(1))).toBe('USM-Leistungsverrechnung laden');
    });

    it('nested-interactive and button-name pass, no violations', async () => {
      const results = await audit(el());
      expect(violations(results)).toEqual([]);
      expect(outcome(results, 'nested-interactive')).not.toBe('violation');
      expect(outcome(results, 'button-name')).toBe('pass');
    });
  });

  describe('AC-19: keyboard and pointer', () => {
    it('one Tab stop for the row (its button), then the action', () => {
      const tabbable = Array.from(el().querySelectorAll<HTMLElement>('button, [tabindex]')).filter(
        (n) => n.getAttribute('tabindex') !== '-1' && !(n as HTMLButtonElement).disabled,
      );
      expect(tabbable.slice(0, 4)).toEqual([buttonOf(0), actionOf(0), buttonOf(1), actionOf(1)]);
    });

    it('activating the row button (a native click, as Enter and Space do) emits itemClick', () => {
      buttonOf(1).click();
      expect(fixture.componentInstance.events).toEqual(['item:usm']);
    });

    it('a click anywhere on the row emits itemClick once', () => {
      (rowOf(0).querySelector('.lc-list__label') as HTMLElement).click();
      expect(fixture.componentInstance.events).toEqual(['item:sap']);
    });

    it('the action emits actionClick only, never itemClick', () => {
      actionOf(0).click();
      expect(fixture.componentInstance.events).toEqual(['action:sap']);
    });

    it('a disabled row emits nothing', () => {
      buttonOf(2).click();
      expect(fixture.componentInstance.events).toEqual([]);
    });

    it("focusItem(id) focuses the row's button; a disabled row's button is skipped", async () => {
      const list = fixture.componentInstance.list() as ListComponent;
      list.focusItem('usm');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(document.activeElement).toBe(buttonOf(1));
      list.focusItem('plan');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(document.activeElement).toBe(buttonOf(1));
      list.focusItem('sap', 'action');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(document.activeElement).toBe(actionOf(0));
    });
  });

  describe('AC-19 / AC-23: the rules', () => {
    const css = compile(resolve(__dirname, 'list.component.scss')).css;
    const rule = (selector: string, from = 0) => {
      const at = css.indexOf(`\n${selector} {`, from);
      expect([selector, at > -1]).toEqual([selector, true]);
      return css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at));
    };

    it('the button covers the row with the UA look reset; the action area sits above it', () => {
      expect(rule('.lc-list__item--split')).toMatch(/^\s*position: relative;\s*isolation: isolate;\s*$/);
      expect(rule('.lc-list__item-button')).toMatch(
        /^\s*position: absolute;\s*inset: 0;\s*margin: 0;\s*padding: 0;\s*border: 0;\s*border-radius: inherit;\s*background: none;\s*font: inherit;\s*color: inherit;\s*cursor: inherit;\s*outline: none;\s*$/,
      );
      expect(rule('.lc-list__item--split .lc-list__action-area')).toMatch(/^\s*position: relative;\s*z-index: 1;\s*$/);
    });

    it("the row draws today's inset ring for its focused button, an outline in forced colours", () => {
      expect(rule('.lc-list__item:has(> .lc-list__item-button:focus-visible)')).toMatch(
        /^\s*box-shadow: inset 0 0 0 2px var\(--color-primary-500\);\s*$/,
      );
      const forced = css.lastIndexOf('@media (forced-colors: active)');
      expect(rule('  .lc-list__item:has(> .lc-list__item-button:focus-visible)', forced)).toMatch(
        /outline: 2px solid Highlight;\s*outline-offset: -2px;/,
      );
      // The 3.36 row ring is unchanged.
      expect(rule('.lc-list__item:focus-visible')).toMatch(/outline: none;\s*box-shadow: inset 0 0 0 2px var\(--color-primary-500\);/);
    });

    it('AC-23: the label hyphenates in the page language before it breaks anywhere', () => {
      expect(rule('.lc-list__label')).toMatch(/overflow-wrap: anywhere;\s*hyphens: auto;\s*hyphenate-limit-chars: 12 4 3;/);
    });
  });
});
