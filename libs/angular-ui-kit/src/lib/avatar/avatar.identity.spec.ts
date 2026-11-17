import { TestBed } from '@angular/core/testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'sass';
import * as avatarEntry from './index';
import { avatarInitials, ɵavatarInitials } from './avatar.component';
import { AvatarGroupComponent } from '../avatar-group/avatar-group.component';

/** Request 065 (usm-x row 37): identity colour hooks and one initials rule (AC-22, AC-23). */
describe('lc-avatar identity colours and initials rule (3.45)', () => {
  describe('AC-23: avatarInitials', () => {
    it('is public in the entry; ɵavatarInitials stays as the same function', () => {
      expect(avatarEntry.avatarInitials).toBe(avatarInitials);
      expect(ɵavatarInitials).toBe(avatarInitials);
    });

    it.each([
      ['Lena Maria Brandt', 'LB'],
      ['tom ek', 'TE'],
      ['Administrator', 'A'],
      ['  Kai   von Stein  ', 'KS'],
      ['', '?'],
      ['   ', '?'],
    ])('%p → %p', (name, initials) => {
      expect(avatarInitials(name)).toBe(initials);
    });

    it('lc-avatar-group shows the same initials (it renders lc-avatar)', () => {
      TestBed.configureTestingModule({ imports: [AvatarGroupComponent] });
      const fixture = TestBed.createComponent(AvatarGroupComponent);
      fixture.componentRef.setInput('avatars', [{ name: 'Lena Maria Brandt' }, { name: 'Administrator' }]);
      fixture.detectChanges();
      const shown = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.lc-avatar__initials')).map((el) => el.textContent?.trim());
      expect(shown).toEqual([avatarInitials('Lena Maria Brandt'), avatarInitials('Administrator')]);
    });

    it('lc-header builds the trigger name with avatarInitials (no own rule)', () => {
      const source = readFileSync(resolve(__dirname, '../header/header.component.ts'), 'utf-8');
      expect(source).toMatch(/import \{[^}]*\bavatarInitials\b[^}]*\} from '@lifecorner\/angular-ui-kit\/avatar';/);
      expect(source).toContain('const initials = avatarInitials(this.userName());');
      expect(source).not.toContain('ɵavatarInitials');
    });
  });

  describe('AC-22: --lc-avatar-bg / --lc-avatar-color', () => {
    const css = compile(resolve(__dirname, 'avatar.component.scss')).css;

    it('reads the hooks on the neutral disc with the old values as fallback', () => {
      expect(css).toMatch(/\n\.lc-avatar \{[^}]*background-color: var\(--lc-avatar-bg, var\(--color-surface-hover\)\);\s*color: var\(--lc-avatar-color, var\(--color-text-secondary\)\);/);
    });

    it('reads them on every member colour too', () => {
      expect(css).toMatch(/\n\.lc-avatar--member \{\s*color: var\(--lc-avatar-color, var\(--color-on-member, #ffffff\)\);/);
      for (const [index, hex] of [[1, '#1a6a79'], [2, '#b04a22'], [3, '#4e3f84'], [4, '#5f7150'], [5, '#9e3846'], [6, '#5a798c']]) {
        expect(css).toContain(`.lc-avatar--member-${index} {\n  background-color: var(--lc-avatar-bg, var(--color-member-${index}, ${hex}));`);
      }
    });

    it('never declares them (so a value on any ancestor reaches the avatar)', () => {
      expect(css).not.toMatch(/--lc-avatar-(bg|color)\s*:/);
    });

    it('leaves the person fallback on its neutral disc (later rule, same weight)', () => {
      const person = css.indexOf('\n.lc-avatar--person {');
      expect(person).toBeGreaterThan(css.lastIndexOf('.lc-avatar--member-6 {'));
      expect(css).toMatch(/\n\.lc-avatar--person \{\s*background-color: var\(--color-neutral-300\);\s*color: var\(--color-neutral-700\);/);
    });
  });

  it('documents the hooks and the default on `color`', () => {
    const source = readFileSync(resolve(__dirname, 'avatar.component.ts'), 'utf-8');
    const doc = source.match(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*color = input<AvatarColor>\('default'\);/)?.[1] ?? '';
    expect(doc).toContain('`--lc-avatar-bg`');
    expect(doc).toContain('`--lc-avatar-color`');
    expect(doc).toContain("@default 'default'");
  });
});
