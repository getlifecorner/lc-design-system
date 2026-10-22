import { ComponentFixture, TestBed } from '@angular/core/testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'sass';
import { AvatarComponent } from './avatar.component';

/** lc-avatar image size and `loading` (3.11.2, G-40): AC-6, AC-7, AC-11 and AC-13 of request 012. */
describe('AvatarComponent image size and loading (G-40)', () => {
  let fixture: ComponentFixture<AvatarComponent>;
  let host: HTMLElement;

  const PX = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 } as const;

  function img(): HTMLImageElement | null {
    return host.querySelector('img');
  }

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

  describe('width and height from size (AC-6)', () => {
    it('defaults to md: 40 × 40', () => {
      set({ src: '/photos/tom.jpg', alt: 'Tom Ek' });
      expect(img()?.getAttribute('width')).toBe('40');
      expect(img()?.getAttribute('height')).toBe('40');
    });

    it.each(Object.entries(PX))('size %s: width = height = %s', (size, px) => {
      set({ src: '/photos/tom.jpg', size });
      expect(img()?.getAttribute('width')).toBe(String(px));
      expect(img()?.getAttribute('height')).toBe(String(px));
    });

    it('the attributes equal the CSS box of each size at 100 % text (rem × 16)', () => {
      const css = compile(resolve(__dirname, 'avatar.component.scss')).css;
      for (const [size, px] of Object.entries(PX)) {
        const box = css.match(new RegExp(`\\.lc-avatar--${size} \\{\\s*width: ([\\d.]+)rem;\\s*height: ([\\d.]+)rem;`));
        expect(box).not.toBeNull();
        expect(Number(box?.[1]) * 16).toBe(px);
        expect(Number(box?.[2]) * 16).toBe(px);
      }
      // CSS still sizes the image to the box (the attributes only give the ratio).
      expect(css).toMatch(/\.lc-avatar__image \{[^}]*width: 100%;[^}]*height: 100%;/);
    });
  });

  describe('loading (AC-7)', () => {
    it('defaults to eager and writes no attribute', () => {
      expect(fixture.componentInstance.loading()).toBe('eager');
      set({ src: '/photos/tom.jpg' });
      expect(img()?.hasAttribute('loading')).toBe(false);
      set({ loading: 'eager' });
      expect(img()?.hasAttribute('loading')).toBe(false);
    });

    it('lazy writes loading="lazy" on the image, before src', () => {
      set({ src: '/photos/tom.jpg', size: 'lg', loading: 'lazy' });
      const image = img() as HTMLImageElement;
      expect(image.getAttribute('loading')).toBe('lazy');
      expect(image.getAttribute('src')).toBe('/photos/tom.jpg');
      const names = image.getAttributeNames();
      expect(names.indexOf('loading')).toBeLessThan(names.indexOf('src'));
      const template = readFileSync(resolve(__dirname, 'avatar.component.html'), 'utf-8');
      expect(template).not.toMatch(/\[src\]/);
      const tag = template.match(/<img[^>]*>/)?.[0] ?? '';
      expect(tag.indexOf('[attr.loading]')).toBeGreaterThan(-1);
      expect(tag.indexOf('[attr.loading]')).toBeLessThan(tag.indexOf('[attr.src]'));
    });

    it('the error fallback still shows the initials with lazy', () => {
      set({ src: '/photos/missing.jpg', name: 'Tom Ek', loading: 'lazy' });
      (img() as HTMLImageElement).dispatchEvent(new Event('error'));
      fixture.detectChanges();
      expect(img()).toBeNull();
      expect(host.querySelector('.lc-avatar__initials')?.textContent).toBe('TE');
    });

    it('without src it shows the initials and no image, whatever loading says', () => {
      set({ name: 'Tom Ek', loading: 'lazy' });
      expect(img()).toBeNull();
      expect(host.querySelector('.lc-avatar__initials')?.textContent).toBe('TE');
    });
  });

  describe('unchanged rendering (AC-11, AC-13)', () => {
    it('the default image carries alt, class, src and the new width/height, nothing else', () => {
      set({ src: '/photos/tom.jpg', alt: 'Tom Ek' });
      expect(img()?.getAttributeNames().sort()).toEqual(['alt', 'class', 'height', 'src', 'width']);
      expect(img()?.getAttribute('class')).toBe('lc-avatar__image');
      expect(img()?.getAttribute('style')).toBeNull();
    });

    it('the initials avatar renders as before (no image, no new attribute on the box)', () => {
      set({ name: 'Tom Ek', loading: 'lazy' });
      const box = host.querySelector('.lc-avatar') as HTMLElement;
      expect(box.getAttributeNames().sort()).toEqual(['aria-label', 'class', 'role']);
    });

    it('keeps role, aria-label and alt with lazy; decorative still hides it', () => {
      set({ src: '/photos/tom.jpg', alt: 'Tom Ek', loading: 'lazy' });
      const box = host.querySelector('.lc-avatar') as HTMLElement;
      expect(box.getAttribute('role')).toBe('img');
      expect(box.getAttribute('aria-label')).toBe('Tom Ek');
      expect(img()?.getAttribute('alt')).toBe('Tom Ek');
      set({ decorative: true });
      expect(box.hasAttribute('role')).toBe(false);
      expect(box.getAttribute('aria-hidden')).toBe('true');
      expect(img()?.getAttribute('loading')).toBe('lazy');
    });
  });
});
