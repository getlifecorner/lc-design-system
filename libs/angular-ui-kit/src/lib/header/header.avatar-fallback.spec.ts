import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HeaderComponent } from './header.component';

/**
 * Request 020, row 5: `userAvatarFallback` passes `fallback` to the trigger
 * avatar and the menu avatar, so a user menu without a name shows a person
 * symbol instead of "?". The trigger keeps its name (`userMenuAriaLabel`).
 */
describe('HeaderComponent — userAvatarFallback (020)', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let el: HTMLElement;

  function set(inputs: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  const trigger = () => el.querySelector<HTMLButtonElement>('button.lc-header__profile-trigger--avatar');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    el = fixture.nativeElement;
  });

  it('keeps "?" on the trigger by default (unchanged)', () => {
    set({ userMenuTrigger: 'avatar', userName: '', userMenuAriaLabel: 'Benutzermenü' });
    expect(trigger()?.querySelector('.lc-avatar__initials')?.textContent?.trim()).toBe('?');
    expect(trigger()?.querySelector('.lc-avatar--person')).toBeNull();
  });

  it('shows the person symbol on the trigger and in the menu without a name', () => {
    set({ userMenuTrigger: 'avatar', userName: '', userEmail: 'kein.name@example.org', userMenuAriaLabel: 'Benutzermenü', userAvatarFallback: 'person', userAvatarColor: 'member-2' });
    const avatar = trigger()?.querySelector('.lc-avatar') as HTMLElement;
    expect(avatar.classList).toContain('lc-avatar--person');
    expect(avatar.classList).not.toContain('lc-avatar--member-2');
    expect(avatar.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(avatar.querySelector('.lc-avatar__initials')).toBeNull();
    // The trigger stays named by the label; the avatar inside stays decorative.
    expect(trigger()?.getAttribute('aria-label')).toBe('Benutzermenü');
    expect(avatar.getAttribute('aria-hidden')).toBe('true');
    expect(avatar.hasAttribute('role')).toBe(false);

    fixture.componentInstance.toggleDropdown();
    fixture.detectChanges();
    expect(el.querySelector('.lc-header__menu-header .lc-avatar')?.classList).toContain('lc-avatar--person');
  });

  it('shows the initials again once there is a name', () => {
    set({ userMenuTrigger: 'avatar', userName: 'Tom Ek', userAvatarFallback: 'person' });
    expect(trigger()?.querySelector('.lc-avatar__initials')?.textContent?.trim()).toBe('TE');
    expect(trigger()?.querySelector('.lc-avatar--person')).toBeNull();
  });
});
