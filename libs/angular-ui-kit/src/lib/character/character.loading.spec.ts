import { ComponentFixture, TestBed } from '@angular/core/testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { CharacterComponent } from './character.component';

/** lc-character `loading` (3.11.2, G-39): AC-5, AC-11 and AC-13 of request 012. */
describe('CharacterComponent loading (G-39)', () => {
  let fixture: ComponentFixture<CharacterComponent>;
  let host: HTMLElement;

  function images(): HTMLImageElement[] {
    return Array.from(host.querySelectorAll('img'));
  }

  function set(inputs: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CharacterComponent] }).compileComponents();
    fixture = TestBed.createComponent(CharacterComponent);
    host = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('defaults to eager', () => {
    expect(fixture.componentInstance.loading()).toBe('eager');
  });

  it('AC-11: by default the drawings carry exactly the 3.11.1 attributes, no loading', () => {
    for (const img of images()) {
      expect(img.getAttributeNames().sort()).toEqual([
        'alt',
        'aria-hidden',
        'class',
        'decoding',
        'fetchpriority',
        'height',
        'src',
        'width',
      ]);
    }
  });

  it.each(['auto', 'dark'])('AC-5: colorMode %s, loading eager writes no attribute', (colorMode) => {
    set({ colorMode, loading: 'eager' });
    expect(images().length).toBeGreaterThan(0);
    expect(images().every((i) => !i.hasAttribute('loading'))).toBe(true);
  });

  it.each([
    ['auto', 2],
    ['dark', 1],
  ])('AC-5: colorMode %s, loading lazy writes loading="lazy" on all %s drawings', (colorMode, count) => {
    set({ colorMode, loading: 'lazy', pose: 'hello' });
    expect(images()).toHaveLength(count);
    expect(images().map((i) => i.getAttribute('loading'))).toEqual(Array(count).fill('lazy'));
  });

  it.each(['auto', 'dark'])('AC-5: colorMode %s, loading is set before src on the first render, so no engine starts an eager request first', (colorMode) => {
    fixture = TestBed.createComponent(CharacterComponent);
    host = fixture.nativeElement;
    fixture.componentRef.setInput('loading', 'lazy');
    fixture.componentRef.setInput('colorMode', colorMode);
    fixture.detectChanges();
    expect(images().length).toBeGreaterThan(0);
    for (const img of images()) {
      const names = img.getAttributeNames();
      expect(names.indexOf('loading')).toBeGreaterThan(-1);
      expect(names.indexOf('loading')).toBeLessThan(names.indexOf('src'));
    }
    const template = readFileSync(resolve(__dirname, 'character.component.html'), 'utf-8');
    expect(template).not.toMatch(/\[src\]/);
    for (const tag of template.match(/<img[^>]*>/g) ?? []) {
      expect(tag.indexOf('[attr.loading]')).toBeLessThan(tag.indexOf('[attr.src]'));
    }
  });

  it('AC-5: switching back to eager removes the attribute', () => {
    set({ loading: 'lazy' });
    set({ loading: 'eager' });
    expect(images().every((i) => !i.hasAttribute('loading'))).toBe(true);
  });

  it('AC-5, AC-13: lazy leaves src, width, height, decoding, fetchpriority, alt and aria-hidden as they are', () => {
    set({ loading: 'lazy', pose: 'hello' });
    expect(images().map((i) => i.getAttribute('src'))).toEqual(['/assets/character/hello-light.svg', '/assets/character/hello-dark.svg']);
    for (const img of images()) {
      expect(img.getAttribute('width')).toBe('100');
      expect(img.getAttribute('height')).toBe('100');
      expect(img.getAttribute('decoding')).toBe('async');
      expect(img.getAttribute('fetchpriority')).toBe('low');
      expect(img.getAttribute('alt')).toBe('');
      expect(img.getAttribute('aria-hidden')).toBe('true');
    }
    expect(host.getAttribute('aria-hidden')).toBe('true');
    set({ ariaLabel: 'Edu waves' });
    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('Edu waves');
    expect(images().every((i) => i.getAttribute('loading') === 'lazy')).toBe(true);
  });
});
