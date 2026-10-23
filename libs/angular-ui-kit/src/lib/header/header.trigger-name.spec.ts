import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HeaderComponent } from './header.component';

/**
 * Request 014 (AS-33, WCAG 2.5.3 Label in Name): the avatar trigger is named
 * `userMenuAriaLabel`, a comma and the initials the avatar shows, so the
 * visible text is a word of the name. The icon trigger keeps its name byte
 * for byte, and the header's icons are decoration inside named buttons.
 */
describe('HeaderComponent — avatar trigger name (AS-33)', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let el: HTMLElement;

  const longName = 'Johanna-Friederike Apfelbaum-Kieselbacher-Morgentau';

  function set(inputs: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  const avatarTrigger = () => el.querySelector<HTMLButtonElement>('button.lc-header__profile-trigger--avatar');
  const iconTrigger = () => el.querySelector<HTMLButtonElement>('button.lc-header__profile-trigger:not(.lc-header__profile-trigger--avatar)');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    el = fixture.nativeElement;
  });

  /** design.md §4: inputs, the initials shown, the avatar trigger's name. */
  const rows: readonly { case: string; userName: string; label?: string; shows: string; name: string }[] = [
    { case: 'EN', userName: 'Johanna Müller', label: 'Menu for Johanna Müller', shows: 'JM', name: 'Menu for Johanna Müller, JM' },
    { case: 'DE', userName: 'Johanna Müller', label: 'Menü für Johanna Müller', shows: 'JM', name: 'Menü für Johanna Müller, JM' },
    { case: 'long DE name', userName: longName, label: `Menü für ${longName}`, shows: 'JA', name: `Menü für ${longName}, JA` },
    { case: 'one word', userName: 'Johanna', label: 'Menü für Johanna', shows: 'J', name: 'Menü für Johanna, J' },
    { case: 'no name, default label', userName: '', shows: '?', name: 'Open user menu' },
    { case: 'no name, DE label', userName: '', label: 'Benutzermenü öffnen', shows: '?', name: 'Benutzermenü öffnen' },
    { case: 'default label with a name', userName: 'Sarah Connor', shows: 'SC', name: 'Open user menu, SC' },
    { case: 'label already holds them', userName: 'Al Lee', label: 'Menu for Al Lee', shows: 'AL', name: 'Menu for Al Lee' },
    { case: 'label holds them, other case', userName: 'Al Lee', label: 'Konto (al lee) – al', shows: 'AL', name: 'Konto (al lee) – al' },
    { case: 'only in a parenthetical (axe drops it)', userName: 'Tom Ek', label: 'Menü für Tom Ek (TE)', shows: 'TE', name: 'Menü für Tom Ek (TE), TE' },
    { case: 'empty label', userName: 'Tom Ek', label: '', shows: 'TE', name: 'TE' },
    { case: 'blank label', userName: 'Tom Ek', label: '  ', shows: 'TE', name: 'TE' },
  ];

  describe.each(rows)('$case', (row) => {
    const inputs = () => ({ userName: row.userName, ...(row.label === undefined ? {} : { userMenuAriaLabel: row.label }) });

    it(`avatar trigger shows "${row.shows}" and is named "${row.name}"`, () => {
      set({ ...inputs(), userMenuTrigger: 'avatar' });
      const trigger = avatarTrigger();
      expect(trigger?.querySelector('.lc-avatar__initials')?.textContent?.trim()).toBe(row.shows);
      expect(trigger?.getAttribute('aria-label')).toBe(row.name);
    });

    it('icon trigger keeps userMenuAriaLabel as its name, byte for byte', () => {
      set(inputs());
      expect(avatarTrigger()).toBeNull();
      const expected = row.label ?? 'Open user menu';
      // An empty string binds as an empty attribute, as before.
      expect(iconTrigger()?.getAttribute('aria-label')).toBe(expected);
    });
  });

  it('holds the label once and the visible initials as a whole word (AC-1, AC-7, AC-8)', () => {
    set({ userName: 'Johanna Müller', userMenuTrigger: 'avatar', userMenuAriaLabel: 'Menü für Johanna Müller' });
    const name = avatarTrigger()?.getAttribute('aria-label') ?? '';
    expect(name.startsWith('Menü für Johanna Müller')).toBe(true);
    expect(name.split('Johanna Müller').length - 1).toBe(1);
    expect(name.split(/[^\p{L}\p{N}]+/u)).toContain('JM');
    // The avatar stays hidden from assistive technology.
    const avatar = avatarTrigger()?.querySelector('.lc-avatar');
    expect(avatar?.getAttribute('aria-hidden')).toBe('true');
    expect(avatar?.getAttribute('role')).toBeNull();
  });

  it('follows userName and userMenuAriaLabel changes', () => {
    set({ userName: 'Tom Ek', userMenuTrigger: 'avatar', userMenuAriaLabel: 'Menu for Tom Ek' });
    expect(avatarTrigger()?.getAttribute('aria-label')).toBe('Menu for Tom Ek, TE');
    set({ userName: 'Sarah Miller', userMenuAriaLabel: 'Menu for Sarah Miller' });
    expect(avatarTrigger()?.getAttribute('aria-label')).toBe('Menu for Sarah Miller, SM');
  });

  describe('with a photo (AC-4)', () => {
    beforeEach(() => {
      set({ userName: 'Tom Ek', userMenuTrigger: 'avatar', userMenuAriaLabel: 'Menü für Tom Ek', userAvatarSrc: '/photos/tom.jpg' });
    });

    it('keeps the initials in the name while the photo shows (no visible text)', () => {
      expect(avatarTrigger()?.querySelector('img')?.getAttribute('src')).toBe('/photos/tom.jpg');
      expect(avatarTrigger()?.querySelector('.lc-avatar__initials')).toBeNull();
      expect(avatarTrigger()?.getAttribute('aria-label')).toBe('Menü für Tom Ek, TE');
    });

    it('shows the initials when the photo fails, under the same name', () => {
      avatarTrigger()?.querySelector('img')?.dispatchEvent(new Event('error'));
      fixture.detectChanges();
      expect(avatarTrigger()?.querySelector('img')).toBeNull();
      expect(avatarTrigger()?.querySelector('.lc-avatar__initials')?.textContent?.trim()).toBe('TE');
      expect(avatarTrigger()?.getAttribute('aria-label')).toBe('Menü für Tom Ek, TE');
    });
  });

  describe('default rendering (AC-9)', () => {
    it('keeps the icon trigger: same element, classes, attributes and name', () => {
      set({ userName: 'Sarah Connor', userEmail: 'sarah@example.com' });
      const trigger = iconTrigger();
      expect(trigger?.className).toBe('lc-header__profile-trigger');
      expect(trigger?.getAttribute('type')).toBe('button');
      expect(trigger?.getAttribute('aria-label')).toBe('Open user menu');
      expect(trigger?.getAttribute('aria-expanded')).toBe('false');
      expect(trigger?.getAttribute('aria-haspopup')).toBe('menu');
      expect(Array.from(trigger?.querySelectorAll('lc-icon') ?? []).map((icon) => icon.getAttribute('name'))).toEqual([
        'user',
        'chevron-down',
      ]);
      expect(trigger?.textContent?.trim()).toBe('');
    });
  });

  describe('icons inside named buttons are decorative (svg-img-alt, 1.1.1)', () => {
    /** Each rendered icon's svg: aria-hidden, no role, no label. */
    function expectDecorative(svgs: SVGElement[], count: number): void {
      expect(svgs.length).toBe(count);
      for (const svg of svgs) {
        expect(svg.getAttribute('aria-hidden')).toBe('true');
        expect(svg.getAttribute('role')).toBeNull();
        expect(svg.getAttribute('aria-label')).toBeNull();
      }
    }

    it('hamburger, theme button and the icon trigger', () => {
      set({ showHamburger: true, showThemeButton: true, userName: 'Sarah Connor' });
      expectDecorative(Array.from(el.querySelectorAll<SVGElement>('.lc-header__hamburger svg')), 1);
      expectDecorative(Array.from(el.querySelectorAll<SVGElement>('.lc-header__theme-toggle svg')), 1);
      expectDecorative(Array.from(iconTrigger()?.querySelectorAll<SVGElement>('svg') ?? []), 2);
      // The buttons keep their names.
      expect(el.querySelector('.lc-header__hamburger button')?.getAttribute('aria-label')).toBe('Toggle sidebar menu');
      expect(el.querySelector('.lc-header__theme-toggle button')?.getAttribute('aria-label')).toMatch(/^Switch to (dark|light) mode$/);
    });

    it('the account menu items', () => {
      set({ userName: 'Tom Ek', userMenuTrigger: 'avatar' });
      avatarTrigger()?.click();
      fixture.detectChanges();
      expectDecorative(Array.from(el.querySelectorAll<SVGElement>('[role="menuitem"] svg')), 2);
      expect(Array.from(el.querySelectorAll('[role="menuitem"]')).map((item) => item.textContent?.trim())).toEqual([
        'Profile',
        'Logout',
      ]);
    });
  });
});
