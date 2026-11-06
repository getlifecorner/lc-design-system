import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListComponent, type ListItem } from './list.component';
import { audit, installFakeCanvas, violations } from '../../testing/axe-jsdom';

/**
 * 3.33 (request 052, app-shell row 2, AC-9): `ListItem.selected` sets
 * `aria-current="true"` on the row element of every row kind; nothing else
 * changes, and no other row carries the attribute.
 */
describe('ListComponent — aria-current on the selected row (3.33, request 052)', () => {
  let fixture: ComponentFixture<ListComponent>;
  let el: HTMLElement;
  let restoreCanvas: () => void;

  beforeAll(() => (restoreCanvas = installFakeCanvas()));
  afterAll(() => restoreCanvas());

  const choices: ListItem[] = [
    { id: 'sep', label: 'September 2026 · Fassung 1', selected: true, badge: 'Gewählt', badgeVariant: 'primary' },
    { id: 'aug', label: 'August 2026 · Fassung 2', selected: false },
    { id: 'jul', label: 'Juli 2026 · Fassung 1' },
  ];

  function render(items: ListItem[], clickable = false): void {
    TestBed.configureTestingModule({ imports: [ListComponent] });
    fixture = TestBed.createComponent(ListComponent);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('clickable', clickable);
    fixture.detectChanges();
    el = fixture.nativeElement;
    document.body.appendChild(el);
  }

  afterEach(() => {
    el?.remove();
    fixture?.destroy();
  });

  const current = () => [...el.querySelectorAll('[aria-current]')];

  it('button rows (clickable): only the selected row carries aria-current="true"', () => {
    render(choices, true);
    const rows = [...el.querySelectorAll('[role="button"]')];
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.getAttribute('aria-current'))).toEqual(['true', null, null]);
    expect(current()).toEqual([rows[0]]);
  });

  it('link rows (href): the link of the selected row carries it', () => {
    render(choices.map((c) => ({ ...c, href: `/monatsstand/${c.id}` })));
    const links = [...el.querySelectorAll('a')];
    expect(links).toHaveLength(3);
    expect(links.map((a) => a.getAttribute('aria-current'))).toEqual(['true', null, null]);
    expect(current()).toEqual([links[0]]);
  });

  it('plain rows: the row (role="listitem") carries it', () => {
    render(choices);
    const rows = [...el.querySelectorAll('.lc-list__item')];
    expect(rows.map((r) => [r.getAttribute('role'), r.getAttribute('aria-current')])).toEqual([
      ['listitem', 'true'],
      ['listitem', null],
      ['listitem', null],
    ]);
  });

  it('a disabled selected row keeps both its states', () => {
    render([{ label: 'Gesperrt', selected: true, disabled: true }], true);
    const row = el.querySelector('[role="button"]') as HTMLElement;
    expect(row.getAttribute('aria-current')).toBe('true');
    expect(row.getAttribute('aria-disabled')).toBe('true');
  });

  it('without selected (false or unset) no row carries the attribute', () => {
    render([{ label: 'A' }, { label: 'B', selected: false }], true);
    expect(current()).toHaveLength(0);
  });

  it('the selected row keeps its tint class (look unchanged)', () => {
    render([{ label: 'A', selected: true }], true);
    expect(el.querySelector('[role="button"]')?.classList).toContain('lc-list__item--selected');
  });

  it.each([
    ['clickable', true, false],
    ['href', false, true],
    ['plain', false, false],
  ] as const)('axe: no violation (%s rows)', async (_kind, clickable, href) => {
    render(href ? choices.map((c) => ({ ...c, href: `/m/${c.id}` })) : choices, clickable);
    expect(violations(await audit(el))).toEqual([]);
  });
});
