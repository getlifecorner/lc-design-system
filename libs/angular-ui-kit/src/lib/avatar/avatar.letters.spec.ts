import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { compile } from 'sass';
import { join } from 'path';
import { AvatarComponent, AvatarFallback, AvatarShape } from './avatar.component';

/**
 * Request 071 (3.50, usm-x row 81, AC-14): `letters` replaces the name's
 * initials (at most 3 characters, 3 at 0.75 em); the accessible name stays
 * `alt` / `name`; without it the avatar renders as before.
 */
@Component({
  imports: [AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<lc-avatar [name]="name()" [alt]="alt()" [letters]="letters()" [shape]="shape()" [fallback]="fallback()" />`,
})
class HostComponent {
  readonly name = signal<string | undefined>('Incident Nord');
  readonly alt = signal<string | undefined>(undefined);
  readonly letters = signal('');
  readonly shape = signal<AvatarShape>('square');
  readonly fallback = signal<AvatarFallback>('initials');
}

describe('lc-avatar letters (3.50)', () => {
  function render(set: Partial<{ name: string | undefined; alt: string; letters: string; shape: AvatarShape; fallback: AvatarFallback }> = {}) {
    const fixture = TestBed.createComponent(HostComponent);
    const host = fixture.componentInstance;
    if ('name' in set) host.name.set(set.name);
    if (set.alt !== undefined) host.alt.set(set.alt);
    if (set.letters !== undefined) host.letters.set(set.letters);
    if (set.shape) host.shape.set(set.shape);
    if (set.fallback) host.fallback.set(set.fallback);
    fixture.detectChanges();
    const box = fixture.nativeElement.querySelector('.lc-avatar') as HTMLElement;
    const text = box.querySelector('.lc-avatar__initials') as HTMLElement | null;
    return { fixture, host, box, text };
  }

  it('default (no letters): the name initials in the same span as before', () => {
    const { text, box } = render();
    expect(text?.outerHTML).toBe('<span class="lc-avatar__initials">IN</span>');
    expect(box.getAttribute('aria-label')).toBe('Incident Nord');
  });

  it.each([
    ['IN', 'IN', false],
    ['ci', 'ci', false],
    ['CRM', 'CRM', true],
    ['  CRM  ', 'CRM', true],
    ['ABCD', 'ABC', true],
  ])('letters %j show %j (three letters smaller: %s)', (letters, shown, three) => {
    const { text } = render({ letters });
    expect(text?.textContent).toBe(shown);
    expect(text?.classList.contains('lc-avatar__initials--3')).toBe(three);
  });

  it('the accessible name stays alt, then name, then "Avatar"', () => {
    expect(render({ letters: 'CRM' }).box.getAttribute('aria-label')).toBe('Incident Nord');
    expect(render({ letters: 'CRM', alt: 'CRM-System' }).box.getAttribute('aria-label')).toBe('CRM-System');
    expect(render({ letters: 'CRM', name: undefined }).box.getAttribute('aria-label')).toBe('Avatar');
  });

  it('the public initials() keeps the name rule', () => {
    const { fixture } = render({ letters: 'CRM' });
    const avatar = fixture.debugElement.children[0].componentInstance as AvatarComponent;
    expect(avatar.initials()).toBe('IN');
  });

  it('letters win over the person fallback; without them the person glyph shows as before', () => {
    const withLetters = render({ name: undefined, fallback: 'person', letters: 'IN' });
    expect(withLetters.text?.textContent).toBe('IN');
    expect(withLetters.box.querySelector('.lc-avatar__person')).toBeNull();
    const without = render({ name: undefined, fallback: 'person' });
    expect(without.text).toBeNull();
    expect(without.box.querySelector('.lc-avatar__person')).not.toBeNull();
  });

  it('works on the circle too', () => {
    const { text, box } = render({ letters: 'IN', shape: 'circle' });
    expect(text?.textContent).toBe('IN');
    expect(box.classList.contains('lc-avatar--square')).toBe(false);
  });

  it('CSS: three letters at 0.75 em, after the base rule', () => {
    const css = compile(join(__dirname, 'avatar.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
    const at = css.indexOf('\n.lc-avatar__initials--3 {');
    expect(at).toBeGreaterThan(css.indexOf('\n.lc-avatar__initials {'));
    expect(css.slice(at, css.indexOf('}', at))).toMatch(/\{\s*font-size: 0\.75em;\s*$/);
  });
});
