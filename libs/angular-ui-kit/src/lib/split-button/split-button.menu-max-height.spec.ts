import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { readFileSync } from 'fs';
import { join } from 'path';
import { MenuComponent, type MenuItem } from '@lifecorner/angular-ui-kit/menu';
import { SplitButtonComponent } from './split-button.component';

/**
 * Request 071 (3.50, usm-x row 79, AC-11): `menuMaxHeight` reaches the menu's
 * `maxHeight` (`'room'` too); empty falls back to the menu's CSS hook
 * `--lc-menu-max-height`; `menuAriaLabel` also names the open `role="menu"`.
 */
const ITEMS: MenuItem[] = Array.from({ length: 12 }, (_, i) => ({ id: `a${i}`, label: `Aktion ${i + 1}` }));

@Component({
  standalone: true,
  imports: [SplitButtonComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<lc-split-button [items]="items" [menuMaxHeight]="maxHeight()" menuAriaLabel="Weitere Aktionen">Speichern</lc-split-button>`,
})
class HostComponent {
  readonly items = ITEMS;
  readonly maxHeight = signal('');
}

describe('lc-split-button menuMaxHeight and the menu name (3.50)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const caret = () => fixture.nativeElement.querySelector('.lc-split-button__caret') as HTMLButtonElement;
  const panel = () => fixture.nativeElement.querySelector('.lc-menu__dropdown') as HTMLElement | null;
  const menu = () => fixture.debugElement.query((d) => d.componentInstance instanceof MenuComponent).componentInstance as MenuComponent;
  const openMenu = () => {
    caret().click();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr()), provideHttpClientTesting()] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    fixture.nativeElement.remove();
  });

  it('defaults to "" (documented); the menu then has no cap', () => {
    const source = readFileSync(join(__dirname, 'split-button.component.ts'), 'utf8');
    expect(source).toMatch(/@default ''\s*\n\s*\*\/\s*\n\s*readonly menuMaxHeight = input\(''\);/);
    expect(menu().maxHeight()).toBe('');
    openMenu();
    expect(panel()?.style.maxHeight).toBe('');
  });

  it('a length reaches the menu and caps the panel (its items scroll)', () => {
    host.maxHeight.set('200px');
    fixture.detectChanges();
    expect(menu().maxHeight()).toBe('200px');
    openMenu();
    expect(panel()?.style.maxHeight).toBe('200px');
    expect(panel()?.classList.contains('lc-menu__dropdown--scroll')).toBe(true);
  });

  it("'room' reaches the menu as the keyword", () => {
    host.maxHeight.set('room');
    fixture.detectChanges();
    expect(menu().maxHeight()).toBe('room');
    openMenu();
    expect(panel()?.classList.contains('lc-menu__dropdown--room')).toBe(true);
  });

  it('empty: the hook --lc-menu-max-height set on the split button caps the panel', () => {
    (fixture.nativeElement.querySelector('lc-split-button') as HTMLElement).style.setProperty('--lc-menu-max-height', '180px');
    // jsdom does not inherit custom properties: set it where the menu reads it
    (fixture.nativeElement.querySelector('lc-menu') as HTMLElement).style.setProperty('--lc-menu-max-height', '180px');
    openMenu();
    expect(panel()?.style.maxHeight).toBe('180px');
  });

  it('menuAriaLabel names the caret and the open role="menu"', () => {
    expect(caret().getAttribute('aria-label')).toBe('Weitere Aktionen');
    openMenu();
    expect(fixture.nativeElement.querySelector('[role="menu"]')?.getAttribute('aria-label')).toBe('Weitere Aktionen');
  });
});
