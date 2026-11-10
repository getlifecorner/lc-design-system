import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { ListComponent, ListItem } from './list.component';
import { ListItemTemplateDirective } from './list-item-template.directive';

/**
 * 3.36 (request 056, quellen row 3, AC-8): `showChevron` ends every
 * `clickable` or `href` row with a decorative `chevron-right`.
 */
const SOURCES: ListItem[] = [
  { id: 'sap', label: 'SAP-Ist', subtitle: 'Heute, 06:00', badge: 'Geladen', badgeVariant: 'success', action: 'Laden', actionAriaLabel: 'SAP-Ist laden' },
  { id: 'usm', label: 'USM-Leistungsverrechnung', badge: 'Fehlgeschlagen', badgeVariant: 'error' },
  { id: 'plan', label: 'Planwerte 2026', disabled: true },
];
const LINKS: ListItem[] = [
  { id: 'giro', label: 'Girokonto', metadata: '2.418,36 €', href: '/konten/giro' },
  { id: 'old', label: 'Altes Konto', href: '/konten/alt', disabled: true },
];

describe('ListComponent — showChevron (3.36, request 056)', () => {
  let fixture: ComponentFixture<ListComponent>;

  beforeEach(() => TestBed.configureTestingModule({ imports: [ListComponent] }));

  const render = (items: ListItem[], inputs: Record<string, unknown> = {}) => {
    fixture = TestBed.createComponent(ListComponent);
    fixture.componentRef.setInput('items', items);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };
  const rows = (el: HTMLElement) => [...el.querySelectorAll<HTMLElement>('.lc-list__item')];
  const chevrons = (el: HTMLElement) => [...el.querySelectorAll<HTMLElement>('.lc-list__chevron')];
  const strip = (html: string) => html.replace(/<!--[\s\S]*?-->/g, '');

  afterEach(() => fixture?.destroy());

  it('defaults to false: no chevron on clickable or link rows, and the markup is the same as without the input', () => {
    const clickable = render(SOURCES, { clickable: true });
    expect(fixture.componentInstance.showChevron()).toBe(false);
    expect(chevrons(clickable)).toHaveLength(0);
    const before = strip(clickable.innerHTML);
    fixture.componentRef.setInput('showChevron', false);
    fixture.detectChanges();
    expect(strip(clickable.innerHTML)).toBe(before);
    fixture.destroy();
    expect(chevrons(render(LINKS))).toHaveLength(0);
  });

  it('clickable rows: every row ends with the chevron after the trailing group, disabled rows too', () => {
    const el = render(SOURCES, { clickable: true, showChevron: true });
    for (const row of rows(el)) {
      const last = row.lastElementChild as HTMLElement;
      expect(last.tagName).toBe('LC-ICON');
      expect(last.classList).toContain('lc-list__chevron');
      expect(last.getAttribute('name')).toBe('chevron-right');
      expect(last.getAttribute('size')).toBe('sm');
      expect(last.previousElementSibling?.classList).toContain('lc-list__trailing');
    }
    expect(chevrons(el)).toHaveLength(3);
  });

  it('link rows get it, a disabled href row (a plain row) too; rows without clickable or href do not', () => {
    const el = render([...LINKS, { id: 'plain', label: 'Nur Text' }], { showChevron: true });
    const [link, disabled, plain] = rows(el);
    expect(link.tagName).toBe('A');
    expect(link.lastElementChild?.classList).toContain('lc-list__chevron');
    expect(disabled.lastElementChild?.classList).toContain('lc-list__chevron');
    expect(plain.querySelector('.lc-list__chevron')).toBeNull();
  });

  it('a plain list gets none, also with the input set', () => {
    expect(chevrons(render(SOURCES, { showChevron: true }))).toHaveLength(0);
  });

  it('is hidden from screen readers and keeps the row and action names', () => {
    const el = render(SOURCES, { clickable: true, showChevron: true });
    for (const icon of chevrons(el)) {
      const svgOrHost = icon.querySelector('svg') ?? icon;
      expect(icon.getAttribute('aria-hidden') === 'true' || svgOrHost.getAttribute('aria-hidden') === 'true').toBe(true);
      expect(icon.hasAttribute('aria-label')).toBe(false);
    }
    const row = rows(el)[0];
    // 3.37 (request 057, F-2): a row with an action is no role="button" any
    // more; its native button (a Tab stop, named by the row) is the control.
    const rowButton = row.querySelector(':scope > .lc-list__item-button') as HTMLButtonElement;
    expect(row.hasAttribute('role')).toBe(false);
    // 3.39 (request 059, AC-14, 057-n5): named by aria-label, not by the row's id.
    expect(rowButton.getAttribute('aria-label')).toBe('SAP-Ist, Heute, 06:00, Geladen');
    expect(rowButton.hasAttribute('aria-labelledby')).toBe(false);
    expect(rowButton.tabIndex).toBe(0);
    expect(row.querySelector('.lc-list__action-area button')?.getAttribute('aria-label')).toBe('SAP-Ist laden');
  });

  it('actionClick and itemClick behave as before', () => {
    const el = render(SOURCES, { clickable: true, showChevron: true });
    const actions: string[] = [];
    const clicks: string[] = [];
    fixture.componentInstance.actionClick.subscribe((i) => actions.push(i.id as string));
    fixture.componentInstance.itemClick.subscribe((i) => clicks.push(i.id as string));
    (el.querySelector('.lc-list__action-area button') as HTMLButtonElement).click();
    rows(el)[1].click();
    (rows(el)[1].querySelector('.lc-list__chevron') as HTMLElement).click();
    expect(actions).toEqual(['sap']);
    expect(clicks).toEqual(['usm', 'usm']);
  });

  it('an lcListItem template draws its own row: no chevron added', () => {
    @Component({
      standalone: true,
      imports: [ListComponent, ListItemTemplateDirective],
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        <lc-list [items]="items" [clickable]="true" [showChevron]="true">
          <ng-template lcListItem let-item><span class="own">{{ item.label }}</span></ng-template>
        </lc-list>
      `,
    })
    class Host {
      readonly items = SOURCES;
    }
    const host = TestBed.createComponent(Host);
    host.detectChanges();
    const el = host.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.own')).toHaveLength(3);
    expect(el.querySelectorAll('.lc-list__chevron')).toHaveLength(0);
    host.destroy();
  });

  it('styles: no shrink, tertiary ink, mirrored in right-to-left text; no other rule changes', () => {
    const css = compile(resolve(__dirname, 'list.component.scss')).css;
    expect(css).toMatch(/\n\.lc-list__chevron \{\s*flex-shrink: 0;\s*color: var\(--color-text-tertiary\);\s*\}/);
    expect(css).toMatch(/\n\.lc-list__chevron:dir\(rtl\) \{\s*transform: scaleX\(-1\);\s*\}/);
    expect(css.match(/lc-list__chevron/g)).toHaveLength(2);
  });
});
