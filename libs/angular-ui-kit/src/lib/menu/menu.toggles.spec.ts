import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MenuComponent, type MenuItem, type MenuItemToggleEvent } from './menu.component';
import { audit, violations } from '../../testing/axe-jsdom';

const COLUMNS: MenuItem[] = [
  { id: 'name', label: 'Name', type: 'checkbox', checked: true },
  { id: 'status', label: 'Status', type: 'checkbox' },
  { id: 'open', label: 'Open details', closeOnSelect: true },
  {
    id: 'density',
    label: 'Row height',
    children: [
      { id: 'compact', label: 'Compact', type: 'radio', radioGroup: 'density' },
      { id: 'standard', label: 'Standard', type: 'radio', radioGroup: 'density', checked: true },
    ],
  },
];

/** Applies the events the way an app does (controlled `checked`). */
function apply(items: readonly MenuItem[], { item, checked }: MenuItemToggleEvent): MenuItem[] {
  return items.map((i) => {
    if (i.children) return { ...i, children: apply(i.children, { item, checked }) };
    if (i.id === item.id) return { ...i, checked };
    if (item.type === 'radio' && i.type === 'radio' && i.radioGroup === item.radioGroup) return { ...i, checked: false };
    return i;
  });
}

@Component({
  standalone: true,
  imports: [MenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-menu
      [items]="items()"
      [isOpen]="true"
      (itemToggle)="toggles.push($event); items.set(apply(items(), $event))"
      (itemClick)="clicks.push($event.id)"
      (closed)="closed = closed + 1"
    >
      <button trigger type="button">Columns</button>
    </lc-menu>
  `,
})
class Host {
  readonly items = signal<MenuItem[]>(COLUMNS);
  readonly toggles: MenuItemToggleEvent[] = [];
  readonly clicks: string[] = [];
  closed = 0;
  readonly apply = apply;
}

/** Request 065 (usm-x row 31): checkbox and radio menu items (AC-1, AC-2, AC-3). */
describe('lc-menu checkbox and radio items (3.45)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  const item = (label: string): HTMLButtonElement =>
    Array.from(fixture.nativeElement.querySelectorAll('.lc-menu__item') as NodeListOf<HTMLButtonElement>).find(
      (b) => b.querySelector('.lc-menu__item-label')?.textContent === label,
    ) as HTMLButtonElement;
  const click = (label: string): void => {
    item(label).click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('AC-1: renders menuitemcheckbox / menuitemradio with aria-checked and a mark', () => {
    expect(item('Name').getAttribute('role')).toBe('menuitemcheckbox');
    expect(item('Name').getAttribute('aria-checked')).toBe('true');
    expect(item('Status').getAttribute('aria-checked')).toBe('false');
    expect(item('Standard').getAttribute('role')).toBe('menuitemradio');
    expect(item('Standard').getAttribute('aria-checked')).toBe('true');
    expect(item('Name').querySelector('.lc-menu__item-indicator lc-icon')).not.toBeNull();
    expect(item('Name').querySelector('.lc-menu__item-indicator')?.getAttribute('aria-hidden')).toBe('true');
    expect(item('Status').querySelector('.lc-menu__item-indicator')?.children.length).toBe(0);
    expect(item('Standard').querySelector('.lc-menu__item-indicator svg circle')?.getAttribute('r')).toBe('4');
    expect(item('Open details').getAttribute('role')).toBe('menuitem');
  });

  it('AC-1: groups a radio set in its section, named by the heading', () => {
    const group = item('Compact').closest('[role="group"]') as HTMLElement;
    expect(document.getElementById(group.getAttribute('aria-labelledby') as string)?.textContent).toBe('Row height');
  });

  it('AC-2: a checkbox emits itemToggle with its new state, no itemClick, and stays open with the focus', () => {
    item('Status').focus();
    const before = item('Status');
    click('Status');
    expect(host.toggles.map((e) => [e.item.id, e.checked])).toEqual([['status', true]]);
    expect(host.clicks).toEqual([]);
    expect(host.closed).toBe(0);
    expect(item('Status')).toBe(before);
    expect(item('Status').getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(before);
    expect(item('Status').getAttribute('tabindex')).toBe('0');
    click('Status');
    expect(host.toggles.at(-1)?.checked).toBe(false);
  });

  it('AC-2: a radio emits only when it becomes checked; the app keeps the set exclusive', () => {
    click('Standard');
    expect(host.toggles).toEqual([]);
    click('Compact');
    expect(host.toggles.map((e) => [e.item.id, e.checked])).toEqual([['compact', true]]);
    expect(item('Compact').getAttribute('aria-checked')).toBe('true');
    expect(item('Standard').getAttribute('aria-checked')).toBe('false');
  });

  it('AC-2: arrow keys run over toggles as over items (roving tabindex unchanged)', () => {
    const menu = fixture.nativeElement.querySelector('[role="menu"]') as HTMLElement;
    item('Name').focus();
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(item('Status'));
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(item('Standard'));
  });

  it('AC-1: closeOnSelect true emits closed after the item acts; unset does not', () => {
    click('Open details');
    expect(host.clicks).toEqual(['open']);
    expect(host.closed).toBe(1);
    click('Name');
    expect(host.closed).toBe(1);
  });

  it('AC-1: a link with a type stays a link', () => {
    host.items.set([{ id: 'help', label: 'Help', href: '/help', type: 'checkbox', checked: true }]);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a.lc-menu__item') as HTMLElement;
    expect(link.getAttribute('role')).toBe('menuitem');
    expect(link.hasAttribute('aria-checked')).toBe(false);
  });

  it('AC-3: every item gets the indicator slot only when the menu has a toggle', () => {
    const panel = (): HTMLElement => fixture.nativeElement.querySelector('.lc-menu__dropdown');
    expect(panel().classList).toContain('lc-menu__dropdown--has-toggles');
    host.items.set([{ id: 'a', label: 'A' }]);
    fixture.detectChanges();
    expect(panel().getAttribute('class')).toBe('lc-menu__dropdown lc-menu__dropdown--bottom-right');
  });

  it('AC-3: no axe violations with toggles', async () => {
    expect(violations(await audit(fixture.nativeElement))).toEqual([]);
  });
});
