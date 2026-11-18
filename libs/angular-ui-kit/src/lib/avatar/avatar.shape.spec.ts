import { TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { AvatarComponent, type AvatarShape, type AvatarSize } from './avatar.component';
import { AvatarGroupComponent } from '../avatar-group/avatar-group.component';

/**
 * Request 068 (3.48, design §2, §3, §5): `lc-avatar` `shape="square"`
 * (usm-x row 65) and `AvatarGroupItem.bg` / `fg` (usm-x row 66).
 */
describe('lc-avatar shape (3.48, usm-x row 65)', () => {
  const render = (inputs: Record<string, unknown>) => {
    TestBed.configureTestingModule({ imports: [AvatarComponent] });
    const fixture = TestBed.createComponent(AvatarComponent);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.lc-avatar') as HTMLElement;
    // `[class]` writes the classes in its own order: compare them as a set
    return { el, className: [...el.classList].sort().join(' '), querySelector: (s: string) => el.querySelector(s) };
  };
  const sorted = (classes: string) => classes.split(' ').sort().join(' ');

  it('default: round, the class list as before', () => {
    expect(render({ name: 'Ticket 4711', size: 'md' }).className).toBe(sorted('lc-avatar lc-avatar--md'));
  });

  it.each<[AvatarSize, AvatarShape]>([
    ['xs', 'square'],
    ['sm', 'square'],
    ['md', 'square'],
    ['lg', 'square'],
    ['xl', 'square'],
  ])('%s square: the class follows the others (initials, image and person content)', (size, shape) => {
    expect(render({ name: 'CI', size, shape }).className).toBe(sorted(`lc-avatar lc-avatar--${size} lc-avatar--square`));
    TestBed.resetTestingModule();
    const image = render({ src: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=', alt: 'Server', size, shape, ring: true });
    expect(image.className).toBe(sorted(`lc-avatar lc-avatar--${size} lc-avatar--ring lc-avatar--square`));
    expect(image.querySelector('.lc-avatar__image')).not.toBeNull();
    TestBed.resetTestingModule();
    const person = render({ fallback: 'person', size, shape });
    expect(person.className).toBe(sorted(`lc-avatar lc-avatar--${size} lc-avatar--person lc-avatar--square`));
  });

  it('the radius is --lc-avatar-square-radius (25 %), the image inherits it; colours are untouched', () => {
    const css = compile(resolve(__dirname, 'avatar.component.scss')).css.replace(/\s+/g, ' ');
    expect(css).toContain('.lc-avatar--square { border-radius: var(--lc-avatar-square-radius, 25%); }');
    expect(css).toContain('.lc-avatar--square .lc-avatar__image { border-radius: inherit; }');
    const square = css.slice(css.indexOf('.lc-avatar--square {'));
    expect(square).not.toMatch(/color/);
    // after the base rule, so it wins at equal specificity
    expect(css.indexOf('.lc-avatar--square {')).toBeGreaterThan(css.indexOf('.lc-avatar {'));
  });
});

describe('AvatarGroupItem bg / fg (3.48, usm-x row 66)', () => {
  const render = (avatars: unknown[]) => {
    TestBed.configureTestingModule({ imports: [AvatarGroupComponent] });
    const fixture = TestBed.createComponent(AvatarGroupComponent);
    fixture.componentRef.setInput('avatars', avatars);
    fixture.detectChanges();
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('lc-avatar'));
  };

  it('sets --lc-avatar-bg / --lc-avatar-color on that avatar only', () => {
    const [lena, tom] = render([
      { name: 'Lena Brandt', bg: '#0f5e74', fg: '#ffffff' },
      { name: 'Tom Ek', color: 'member-2' },
    ]);
    expect(lena.style.getPropertyValue('--lc-avatar-bg')).toBe('#0f5e74');
    expect(lena.style.getPropertyValue('--lc-avatar-color')).toBe('#ffffff');
    expect(tom.hasAttribute('style')).toBe(false);
    expect(tom.querySelector('.lc-avatar')?.classList).toContain('lc-avatar--member-2');
  });

  it('takes a var() too', () => {
    const [item] = render([{ name: 'Ada', bg: 'var(--app-identity-ada)' }]);
    expect(item.style.getPropertyValue('--lc-avatar-bg')).toBe('var(--app-identity-ada)');
    expect(item.style.getPropertyValue('--lc-avatar-color')).toBe('');
  });
});
