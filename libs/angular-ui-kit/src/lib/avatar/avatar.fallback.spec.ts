import { ComponentFixture, TestBed } from '@angular/core/testing';
import { reflectComponentType } from '@angular/core';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'sass';
import { AvatarComponent } from './avatar.component';

/** Request 020, row 5: `fallback="person"` (AC-10, AC-11, AC-12). */
describe('AvatarComponent — person fallback (020)', () => {
  let fixture: ComponentFixture<AvatarComponent>;
  let host: HTMLElement;

  const root = () => host.querySelector('.lc-avatar') as HTMLElement;
  const glyph = () => host.querySelector('svg.lc-avatar__person');

  function set(inputs: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AvatarComponent] }).compileComponents();
    fixture = TestBed.createComponent(AvatarComponent);
    host = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('is an optional input, `initials` by default, documented with @default', () => {
    const input = reflectComponentType(AvatarComponent)?.inputs.find((i) => i.propName === 'fallback');
    expect(input).toBeDefined();
    expect(fixture.componentInstance.fallback()).toBe('initials');
    const source = readFileSync(resolve(__dirname, 'avatar.component.ts'), 'utf-8');
    expect(source).toMatch(/@default 'initials'\s*\*\/\s*fallback = input<AvatarFallback>\('initials'\);/);
  });

  it('renders exactly as before by default: "?" without a name, no new class or element', () => {
    expect(root().className).toBe('lc-avatar lc-avatar--md');
    expect(host.querySelector('.lc-avatar__initials')?.textContent).toBe('?');
    expect(glyph()).toBeNull();
    expect(root().getAttribute('role')).toBe('img');
    expect(root().getAttribute('aria-label')).toBe('Avatar');
  });

  it('AC-10: shows the person symbol on the neutral disc without a name and without an image', () => {
    set({ fallback: 'person' });
    expect(root().classList).toContain('lc-avatar--person');
    expect(glyph()).toBeTruthy();
    expect(host.querySelector('.lc-avatar__initials')).toBeNull();
    expect(glyph()?.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(glyph()?.querySelector('path')?.getAttribute('d')).toMatch(/^M7\.5 6a4\.5 4\.5 0 119 0/);
  });

  it.each(['', '   '])('treats the name %j as no name', (name) => {
    set({ fallback: 'person', name });
    expect(glyph()).toBeTruthy();
  });

  it('AC-11: with a name, both fallbacks show the initials', () => {
    set({ fallback: 'person', name: 'Tom Ek' });
    expect(glyph()).toBeNull();
    expect(root().classList).not.toContain('lc-avatar--person');
    expect(host.querySelector('.lc-avatar__initials')?.textContent).toBe('TE');
    expect(root().getAttribute('aria-label')).toBe('Tom Ek');
  });

  it('ignores `color` while the person shows, and uses it again with a name', () => {
    set({ fallback: 'person', color: 'member-3' });
    expect(root().className).toBe('lc-avatar lc-avatar--md lc-avatar--person');
    set({ name: 'Tom Ek' });
    expect(root().classList).toContain('lc-avatar--member-3');
  });

  it('shows the image when there is one, and the person after the image fails', () => {
    set({ fallback: 'person', src: '/photos/missing.jpg' });
    expect(host.querySelector('img')).toBeTruthy();
    expect(glyph()).toBeNull();
    host.querySelector('img')?.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(host.querySelector('img')).toBeNull();
    expect(glyph()).toBeTruthy();
  });

  it('AC-11: named "Avatar" or the alt text as an img; the glyph itself is hidden and not focusable', () => {
    set({ fallback: 'person' });
    expect(root().getAttribute('role')).toBe('img');
    expect(root().getAttribute('aria-label')).toBe('Avatar');
    expect(glyph()?.getAttribute('aria-hidden')).toBe('true');
    expect(glyph()?.getAttribute('focusable')).toBe('false');
    set({ alt: 'Kein Profilname' });
    expect(root().getAttribute('aria-label')).toBe('Kein Profilname');
    expect(host.querySelectorAll('[tabindex]').length).toBe(0);
  });

  it('AC-11: decorative drops the role and the name', () => {
    set({ fallback: 'person', decorative: true });
    expect(root().hasAttribute('role')).toBe(false);
    expect(root().hasAttribute('aria-label')).toBe(false);
    expect(root().getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps the status dot and the ring', () => {
    set({ fallback: 'person', status: 'online', ring: true });
    expect(root().classList).toContain('lc-avatar--with-status');
    expect(root().classList).toContain('lc-avatar--ring');
    expect(host.querySelector('.lc-avatar__status--online')).toBeTruthy();
  });

  describe('styles (AC-12)', () => {
    const css = compile(resolve(__dirname, 'avatar.component.scss')).css;

    it('paints the disc and glyph from the neutral tokens, the glyph at 60 % in currentColor', () => {
      expect(css).toMatch(/\n\.lc-avatar--person \{\s*background-color: var\(--color-neutral-300\);\s*color: var\(--color-neutral-700\);/);
      expect(css).toMatch(/\n\.lc-avatar__person \{[^}]*width: 60%;[^}]*height: 60%;[^}]*fill: currentColor;/);
    });

    it('outlines the disc in forced colours without changing its size', () => {
      expect(css).toMatch(/@media \(forced-colors: active\) \{\s*\.lc-avatar--person \{\s*box-sizing: border-box;\s*border: 1px solid CanvasText;/);
    });
  });
});
