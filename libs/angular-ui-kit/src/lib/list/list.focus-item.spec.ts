import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListComponent, type ListItem, type ListItemPart, type ListSize } from './list.component';
import { ListItemTemplateDirective } from './list-item-template.directive';

/**
 * 3.34 (request 054, monatsstand row 3, AC-11 to AC-13): `focusItem(id, part)`
 * focuses a row's button or link, or its action, after the next render, and
 * does nothing when the item or the part doesn't exist.
 */
@Component({
  standalone: true,
  imports: [ListComponent, ListItemTemplateDirective],
  template: `
    <lc-list [items]="items()">
      <ng-template lcListItem let-item>
        <span>{{ item.label }}</span>
        <button type="button" class="own">Eigene Aktion</button>
      </ng-template>
    </lc-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TemplateHost {
  readonly items = signal<ListItem[]>([{ id: 'sep', label: 'September 2026 · Fassung 1', action: 'Details' }]);
}

const history: ListItem[] = [
  { id: 'sep', label: 'September 2026 · Fassung 1', selected: true, badge: 'Gewählt', badgeVariant: 'primary', action: 'Details', actionAriaLabel: 'Details zu September 2026 · Fassung 1' },
  { id: 'aug2', label: 'August 2026 · Fassung 2', action: 'Details', actionAriaLabel: 'Details zu August 2026 · Fassung 2' },
  { id: 'aug1', label: 'August 2026 · Fassung 1', badge: 'Ersetzt', action: 'Details', actionAriaLabel: 'Details zu August 2026 · Fassung 1' },
  { id: 'jul', label: 'Juli 2026 · Fassung 1', disabled: true, action: 'Details' },
  { id: 'jun', label: 'Juni 2026 · Fassung 1' },
];

describe('ListComponent — focusItem() (3.34, request 054)', () => {
  let fixture: ComponentFixture<ListComponent>;
  let el: HTMLElement;
  let outside: HTMLButtonElement;

  async function create(inputs: Record<string, unknown>): Promise<void> {
    TestBed.configureTestingModule({ imports: [ListComponent, TemplateHost] });
    fixture = TestBed.createComponent(ListComponent);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    await render();
    el = fixture.nativeElement;
  }

  async function render(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function focusItem(id: string, part?: ListItemPart): Promise<void> {
    if (part) fixture.componentInstance.focusItem(id, part);
    else fixture.componentInstance.focusItem(id);
    await render();
  }

  const rowOf = (label: string) =>
    [...el.querySelectorAll<HTMLElement>('[role="list"] > *')].find((r) => r.textContent?.includes(label)) as HTMLElement;
  const actionOf = (label: string) => rowOf(label).querySelector('.lc-list__action-area button') as HTMLButtonElement;

  beforeEach(() => {
    outside = document.createElement('button');
    outside.textContent = 'Schließen';
    document.body.appendChild(outside);
    outside.focus();
  });

  afterEach(() => {
    outside.remove();
    fixture?.destroy();
  });

  describe('AC-11: the part is focused', () => {
    it("'action' focuses that row's action button, after the next render", async () => {
      await create({ items: history, showDividers: true, actionVariant: 'outline', actionSize: 'lg' });
      fixture.componentInstance.focusItem('aug2', 'action');
      expect(document.activeElement).toBe(outside);
      await render();
      expect(document.activeElement).toBe(actionOf('August 2026 · Fassung 2'));
      expect(document.activeElement?.getAttribute('aria-label')).toBe('Details zu August 2026 · Fassung 2');
    });

    it("'row' (the default) focuses a clickable row's button", async () => {
      await create({ items: history, clickable: true });
      await focusItem('aug1');
      const row = rowOf('August 2026 · Fassung 1').querySelector('[role="button"]');
      expect(document.activeElement).toBe(row);
    });

    it("'row' focuses an href row's link", async () => {
      await create({ items: history.map((i) => ({ ...i, action: undefined, href: `/monatsstand/${i.id}` })) });
      await focusItem('sep', 'row');
      expect(document.activeElement?.tagName).toBe('A');
      expect(document.activeElement?.getAttribute('href')).toBe('/monatsstand/sep');
      expect(document.activeElement?.getAttribute('aria-current')).toBe('true');
    });

    it("'action' in a clickable list focuses the action, not the row", async () => {
      await create({ items: history, clickable: true });
      await focusItem('sep', 'action');
      expect(document.activeElement).toBe(actionOf('September 2026 · Fassung 1'));
    });

    it.each(['sm', 'md', 'lg'] as ListSize[])('size %s with dividers, badges and selected', async (size) => {
      await create({ items: history, size, showDividers: true, clickable: true });
      await focusItem('sep');
      expect(document.activeElement).toBe(rowOf('September 2026 · Fassung 1').querySelector('[role="button"]'));
      await focusItem('aug1', 'action');
      expect(document.activeElement).toBe(actionOf('August 2026 · Fassung 1'));
    });

    it('horizontal and card lists use the same lookup', async () => {
      await create({ items: history, orientation: 'horizontal', variant: 'card', clickable: true });
      await focusItem('aug2');
      expect(document.activeElement).toBe(rowOf('August 2026 · Fassung 2').querySelector('[role="button"]'));
    });

    it('items replaced, then called in the same tick: resolved against the new rows', async () => {
      await create({ items: history, clickable: true });
      fixture.componentRef.setInput('items', [{ id: 'okt', label: 'Oktober 2026 · Fassung 1' }, ...history]);
      await focusItem('okt');
      expect(document.activeElement).toBe(rowOf('Oktober 2026 · Fassung 1').querySelector('[role="button"]'));
    });

    it('duplicate ids: the first item', async () => {
      await create({ items: [...history, { id: 'aug2', label: 'Doppelt' }], clickable: true });
      await focusItem('aug2');
      expect(document.activeElement).toBe(rowOf('August 2026 · Fassung 2').querySelector('[role="button"]'));
    });

    it('a second call before the render replaces the first', async () => {
      await create({ items: history, clickable: true });
      fixture.componentInstance.focusItem('sep');
      fixture.componentInstance.focusItem('aug2', 'action');
      await render();
      expect(document.activeElement).toBe(actionOf('August 2026 · Fassung 2'));
    });
  });

  describe('AC-12: nothing to focus — no throw, the focus stays', () => {
    const cases: Array<[string, Record<string, unknown>, string, ListItemPart]> = [
      ['an unknown id', { items: history, clickable: true }, 'nope', 'row'],
      ['an unknown id for the action', { items: history }, 'nope', 'action'],
      ["'row' on a plain row (not clickable, no href)", { items: history }, 'aug2', 'row'],
      ["'row' on a disabled clickable row", { items: history, clickable: true }, 'jul', 'row'],
      ["'row' on a disabled href row (rendered plain)", { items: [{ id: 'x', label: 'X', href: '/x', disabled: true }] }, 'x', 'row'],
      ["'action' on a row without action", { items: history, clickable: true }, 'jun', 'action'],
      ['an empty list', { items: [] }, 'sep', 'row'],
      ['items bound to undefined', { items: undefined }, 'sep', 'action'],
    ];

    it.each(cases)('%s', async (_name, inputs, id, part) => {
      await create(inputs);
      expect(() => fixture.componentInstance.focusItem(id, part)).not.toThrow();
      await render();
      expect(document.activeElement).toBe(outside);
    });

    it("an lcListItem template's own controls are never focused", async () => {
      TestBed.configureTestingModule({ imports: [TemplateHost] });
      const hostFixture = TestBed.createComponent(TemplateHost);
      hostFixture.detectChanges();
      await hostFixture.whenStable();
      const list = hostFixture.debugElement.query((d) => d.name === 'lc-list').componentInstance as ListComponent;
      list.focusItem('sep', 'action');
      list.focusItem('sep');
      hostFixture.detectChanges();
      await hostFixture.whenStable();
      expect(hostFixture.nativeElement.querySelector('.own')).toBeTruthy();
      expect(document.activeElement).toBe(outside);
      hostFixture.destroy();
    });

    it('destroyed before the render: nothing happens', async () => {
      await create({ items: history, clickable: true });
      fixture.componentInstance.focusItem('sep');
      fixture.destroy();
      await fixture.whenStable();
      expect(document.activeElement).toBe(outside);
    });
  });

  it('without the call nothing changes: the list element has exactly class and role', async () => {
    await create({ items: history });
    const list = el.querySelector('[role="list"]') as HTMLElement;
    expect(list.getAttributeNames().filter((n) => !n.startsWith('_ng')).sort()).toEqual(['class', 'role']);
    expect(document.activeElement).toBe(outside);
  });
});
