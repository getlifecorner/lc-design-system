import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MenuComponent, type MenuItem } from './menu.component';

/**
 * 3.31 (request 050, AC-4, WCAG 3.1.2): the menu panel is not a body overlay
 * but an inline descendant of the host, so it inherits the host's `lang`
 * through the DOM. No code change; this pins it.
 */
const ITEMS: MenuItem[] = [
  { id: 'edit', label: 'Bearbeiten' },
  { id: 'delete', label: 'Löschen' },
];

@Component({
  standalone: true,
  imports: [MenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de">
      <lc-menu [items]="items" [isOpen]="true">
        <button trigger type="button">Aktionen</button>
      </lc-menu>
    </div>
  `,
})
class Host {
  readonly items = ITEMS;
}

describe('lc-menu panel language (request 050, AC-4)', () => {
  it('renders the open panel inside the host, so it resolves the host lang', () => {
    TestBed.configureTestingModule({ imports: [Host] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const panel = root.querySelector('.lc-menu__dropdown') as HTMLElement;
    expect(panel).not.toBeNull();
    expect(root.querySelector('lc-menu')?.contains(panel)).toBe(true);
    expect(panel.closest('[lang]')?.getAttribute('lang')).toBe('de');
    expect(panel.querySelector('[role="menu"]')?.closest('[lang]')?.getAttribute('lang')).toBe('de');
    expect(document.querySelector('.cdk-overlay-container .lc-menu__dropdown')).toBeNull();
    fixture.destroy();
  });
});
