import { TestBed } from '@angular/core/testing';
import { AvatarComponent, ɵavatarInitials } from './avatar.component';

/**
 * Request 014 (AS-33): `ɵavatarInitials` is the avatar's own algorithm, moved
 * out so `lc-header` can name its avatar trigger with exactly the text the
 * avatar shows. The values are the ones the avatar rendered before the move.
 */
describe('ɵavatarInitials — the text lc-avatar shows (014)', () => {
  const cases: readonly [name: string | undefined, initials: string][] = [
    ['Johanna Müller', 'JM'],
    ['Johanna', 'J'],
    ['', '?'],
    ['  ', '?'],
    [undefined, '?'],
    ['Johanna-Friederike Apfelbaum-Kieselbacher-Morgentau', 'JA'],
    ['  tom   van  ek ', 'TE'],
    ['Ülrich Özdemir', 'ÜÖ'],
  ];

  it.each(cases)('%p → %p', (name, initials) => {
    expect(ɵavatarInitials(name)).toBe(initials);
  });

  it.each(cases)('the avatar renders the same initials for %p', (name, initials) => {
    TestBed.configureTestingModule({ imports: [AvatarComponent] });
    const fixture = TestBed.createComponent(AvatarComponent);
    fixture.componentRef.setInput('name', name);
    fixture.detectChanges();
    const shown = (fixture.nativeElement as HTMLElement).querySelector('.lc-avatar__initials')?.textContent?.trim();
    expect(shown).toBe(initials);
    expect(shown).toBe(ɵavatarInitials(name));
    expect(fixture.componentInstance.initials()).toBe(initials);
  });
});
