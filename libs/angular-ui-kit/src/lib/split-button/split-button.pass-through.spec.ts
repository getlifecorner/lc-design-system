import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import type { ButtonTone } from '@lifecorner/angular-ui-kit/button';
import type { MenuItem } from '@lifecorner/angular-ui-kit/menu';
import { SplitButtonComponent, SplitButtonSize } from './split-button.component';

/**
 * Request 068 (3.48, usm-x row 63, design §2): `accessKey`,
 * `ariaKeyShortcuts` and `tone` reach the face (`tone` also the caret);
 * `menuSize`, `menuMinWidth` and `menuMaxWidth` reach the menu.
 */
const ITEMS: MenuItem[] = [
  { id: 'open-new', label: 'In neuem Fenster öffnen' },
  { id: 'copy-link', label: 'Link kopieren' },
];

@Component({
  standalone: true,
  imports: [SplitButtonComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-split-button
      [items]="items"
      size="sm"
      [tone]="tone()"
      [accessKey]="accessKey()"
      [ariaKeyShortcuts]="shortcuts()"
      [menuSize]="menuSize()"
      [menuMinWidth]="menuMinWidth()"
      [menuMaxWidth]="menuMaxWidth()"
      menuAriaLabel="Weitere Aktionen"
    >
      Öffnen
    </lc-split-button>
  `,
})
class HostComponent {
  readonly items = ITEMS;
  readonly tone = signal<ButtonTone>('neutral');
  readonly accessKey = signal('');
  readonly shortcuts = signal('');
  readonly menuSize = signal<SplitButtonSize>('md');
  readonly menuMinWidth = signal('220px');
  readonly menuMaxWidth = signal('');
}

describe('lc-split-button pass-through (3.48)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const face = () => fixture.nativeElement.querySelector('.lc-split-button__face button') as HTMLButtonElement;
  const caret = () => fixture.nativeElement.querySelector('.lc-split-button__caret') as HTMLButtonElement;
  const panel = () => fixture.nativeElement.querySelector('.lc-menu__dropdown') as HTMLElement;
  const openMenu = () => {
    caret().click();
    fixture.detectChanges();
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

  it('defaults: no accesskey or aria-keyshortcuts, neutral tone, the menu md at 220 px without a cap', () => {
    expect(face().hasAttribute('accesskey')).toBe(false);
    expect(face().hasAttribute('aria-keyshortcuts')).toBe(false);
    expect(face().classList).not.toContain('btn-tone-primary');
    expect(caret().classList).not.toContain('btn-tone-primary');
    openMenu();
    expect(panel().classList).not.toContain('lc-menu__dropdown--sm');
    expect(panel().style.minWidth).toBe('220px');
    expect(panel().style.maxWidth).toBe('');
  });

  it('accessKey and ariaKeyShortcuts reach the face', () => {
    host.accessKey.set('o');
    host.shortcuts.set('Alt+O');
    fixture.detectChanges();
    expect(face().getAttribute('accesskey')).toBe('o');
    expect(face().getAttribute('aria-keyshortcuts')).toBe('Alt+O');
    expect(caret().hasAttribute('accesskey')).toBe(false);
  });

  it('tone="primary" reaches the face and the caret of the outline look', () => {
    host.tone.set('primary');
    fixture.detectChanges();
    expect(face().classList).toContain('btn-tone-primary');
    expect(caret().classList).toContain('btn-tone-primary');
  });

  it('menuSize, menuMinWidth and menuMaxWidth reach the menu', () => {
    host.menuSize.set('sm');
    host.menuMinWidth.set('180px');
    host.menuMaxWidth.set('min(18rem, calc(100vw - 2rem))');
    fixture.detectChanges();
    openMenu();
    expect(panel().classList).toContain('lc-menu__dropdown--sm');
    expect(panel().style.minWidth).toBe('180px');
    expect(panel().style.maxWidth).toBe('min(18rem, calc(100vw - 2rem))');
  });
});
