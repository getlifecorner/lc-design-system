import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { compile } from 'sass';
import { join } from 'path';
import { ListComponent, ListItem } from './list.component';
import { audit, violations } from '../../testing/axe-jsdom';

@Component({
  standalone: true,
  imports: [ListComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div lang="de">
      <lc-list [items]="items()" [multiColumn]="columns()" [clickable]="clickable()" [showDividers]="true" />
    </div>
  `,
})
class HostComponent {
  readonly items = signal<ListItem[]>([]);
  readonly columns = signal(true);
  readonly clickable = signal(false);
  readonly list = viewChild.required(ListComponent);
}

const ROWS: ListItem[] = [
  { id: 'lead', label: 'Übersicht' },
  { id: 'h1', label: 'Stammdaten', heading: true },
  { id: 'a', label: 'Kostenstellen' },
  { id: 'b', label: 'Kostenarten' },
  { id: 'h2', label: 'Auswertungen', heading: true },
  { id: 'c', label: 'Monatsbericht' },
];

/** Request 065, backlog 064-n4 (AC-42) and 064-n5 (AC-43): headings stay with their rows in columns. */
describe('lc-list multiColumn groups (3.45)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideHttpClient(withXhr()), provideHttpClientTesting()] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  afterEach(() => fixture.destroy());

  const list = () => (fixture.nativeElement as HTMLElement).querySelector('[role="list"]') as HTMLElement;
  const shape = () =>
    Array.from(list().children).map((child) =>
      child.classList.contains('lc-list__group')
        ? Array.from(child.children).map((row) => row.textContent?.trim())
        : child.textContent?.trim(),
    );
  const render = (items: ListItem[]) => {
    host.items.set(items);
    fixture.detectChanges();
  };

  it('wraps each heading and its rows in a plain group; rows before the first heading stay list children', () => {
    render(ROWS);
    expect(shape()).toEqual(['Übersicht', ['Stammdaten', 'Kostenstellen', 'Kostenarten'], ['Auswertungen', 'Monatsbericht']]);
    const group = list().querySelector('.lc-list__group') as HTMLElement;
    expect(group.getAttribute('class')).toBe('lc-list__group');
    expect(group.hasAttribute('role')).toBe(false);
    expect(Array.from(group.children).every((row) => row.getAttribute('role') === 'listitem')).toBe(true);
  });

  it('renders no group without multiColumn or without a heading (as before)', () => {
    host.columns.set(false);
    render(ROWS);
    expect(list().querySelector('.lc-list__group')).toBeNull();
    expect(list().children).toHaveLength(ROWS.length);
    host.columns.set(true);
    render(ROWS.filter((row) => !row.heading));
    expect(list().querySelector('.lc-list__group')).toBeNull();
    expect(list().children).toHaveLength(4);
  });

  it('focusItem still finds a row inside a group', async () => {
    host.clickable.set(true);
    render(ROWS);
    host.list().focusItem('b');
    fixture.detectChanges();
    await fixture.whenStable();
    expect((document.activeElement as HTMLElement | null)?.textContent?.trim()).toBe('Kostenarten');
  });

  it('is axe clean (listitems inside a role-less wrapper)', async () => {
    render(ROWS);
    expect(violations(await audit(fixture.nativeElement))).toEqual([]);
  });

  it('stylesheet: groups never split, no divider under a group’s last row, corners not clipped', () => {
    const css = compile(join(__dirname, 'list.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
    expect(css).toMatch(/\.lc-list--vertical\.lc-list--columns > \* \{\s*break-inside: avoid;/);
    expect(css).toMatch(/\.lc-list--vertical\.lc-list--columns \{\s*overflow: visible;\s*\}/);
    expect(css).toMatch(
      /\.lc-list--vertical\.lc-list--columns > \.lc-list__group > \.lc-list__item:last-child,\s*\.lc-list--vertical\.lc-list--columns > \.lc-list__group > \.lc-list__item-wrapper:last-child \.lc-list__item \{\s*border-bottom: none;/,
    );
  });
});
