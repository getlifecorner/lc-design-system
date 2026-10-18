import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'sass';
import { LC_LOGO_BASE_PATH } from '@lifecorner/angular-ui-kit/logo';
import { CharacterComponent, LC_CHARACTER_BASE_PATH, type CharacterSize } from './character.component';

/** lc-character (3.8, gap G-4): AC-6 to AC-10, AC-12 and AC-13 of request 005. */
describe('CharacterComponent', () => {
  let fixture: ComponentFixture<CharacterComponent>;
  let host: HTMLElement;

  function images(): HTMLImageElement[] {
    return Array.from(host.querySelectorAll('img'));
  }

  function set(inputs: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  async function create(providers: unknown[] = []): Promise<void> {
    await TestBed.configureTestingModule({ imports: [CharacterComponent], providers: providers as never[] }).compileComponents();
    fixture = TestBed.createComponent(CharacterComponent);
    host = fixture.nativeElement;
    fixture.detectChanges();
  }

  describe('defaults', () => {
    beforeEach(() => create());

    it('renders calm at 64 px, both drawings from /assets/character, decorative', () => {
      expect(host.getAttribute('class')).toBe('lc-character lc-character--64');
      expect(images().map((i) => i.getAttribute('src'))).toEqual(['/assets/character/calm-light.svg', '/assets/character/calm-dark.svg']);
      expect(images().map((i) => i.className)).toEqual([
        'lc-character__img lc-character__img--light',
        'lc-character__img lc-character__img--dark',
      ]);
      expect(host.getAttribute('aria-hidden')).toBe('true');
    });

    it('AC-6: decorative by default: aria-hidden host and images, alt="", no role, tabindex or title', () => {
      expect(host.getAttribute('aria-hidden')).toBe('true');
      expect(host.hasAttribute('role')).toBe(false);
      expect(host.hasAttribute('aria-label')).toBe(false);
      expect(host.hasAttribute('tabindex')).toBe(false);
      expect(host.querySelector('title, svg, [tabindex]')).toBeNull();
      for (const img of images()) {
        expect(img.getAttribute('alt')).toBe('');
        expect(img.getAttribute('aria-hidden')).toBe('true');
        expect(img.getAttribute('width')).toBe('100');
        expect(img.getAttribute('height')).toBe('100');
        expect(img.getAttribute('decoding')).toBe('async');
        expect(img.getAttribute('fetchpriority')).toBe('low');
      }
      expect(host.tabIndex).toBe(-1);
    });

    it('AC-6: with ariaLabel the host is role="img" with that name, never focusable; the images stay alt=""', () => {
      set({ ariaLabel: 'Edu waves' });
      expect(host.getAttribute('role')).toBe('img');
      expect(host.getAttribute('aria-label')).toBe('Edu waves');
      expect(host.hasAttribute('aria-hidden')).toBe(false);
      expect(host.hasAttribute('tabindex')).toBe(false);
      expect(images().every((i) => i.getAttribute('alt') === '')).toBe(true);
      set({ ariaLabel: '' });
      expect(host.getAttribute('aria-hidden')).toBe('true');
      expect(host.hasAttribute('role')).toBe(false);
    });

    it.each([
      ['hello', 'hello'],
      ['connection-paused', 'connection-paused'],
    ])('draws the pose %s', (pose, file) => {
      set({ pose });
      expect(images().map((i) => i.getAttribute('src'))).toEqual([`/assets/character/${file}-light.svg`, `/assets/character/${file}-dark.svg`]);
    });

    it.each([48, 64, 80, 96, 128])('AC-8: size %s sets the host class lc-character--%s', (size) => {
      set({ size });
      expect(host.classList).toContain(`lc-character--${size}`);
      expect(host.classList).toContain('lc-character');
      expect(host.classList).toHaveLength(2);
    });

    it('AC-8: accepts the string form from a template (size="96")', () => {
      set({ size: '96' });
      expect(host.getAttribute('class')).toBe('lc-character lc-character--96');
      expect(fixture.componentInstance.size()).toBe(96);
    });

    it('AC-9: colorMode auto puts both drawings in the DOM, the stylesheet picks one', () => {
      set({ colorMode: 'auto', pose: 'hello' });
      expect(images()).toHaveLength(2);
      expect(host.querySelector('.lc-character__img--light')?.getAttribute('src')).toBe('/assets/character/hello-light.svg');
      expect(host.querySelector('.lc-character__img--dark')?.getAttribute('src')).toBe('/assets/character/hello-dark.svg');
    });

    it('AC-10: colorMode dark renders only the on-dark drawing, unmodified, and stays decorative', () => {
      set({ colorMode: 'dark', pose: 'hello' });
      expect(images()).toHaveLength(1);
      expect(images()[0].getAttribute('src')).toBe('/assets/character/hello-dark.svg');
      expect(images()[0].className).toBe('lc-character__img');
      expect(host.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('in a consumer template', () => {
    @Component({
      imports: [CharacterComponent],
      template: `<lc-character class="lc-horizon__figure" [size]="size()" pose="comforts" />`,
    })
    class SlotHost {
      readonly size = signal<CharacterSize>(64);
    }

    it('keeps the consumer’s class (the horizon slot) next to its own size class', async () => {
      await TestBed.configureTestingModule({ imports: [SlotHost] }).compileComponents();
      const slot = TestBed.createComponent(SlotHost);
      slot.detectChanges();
      const el: HTMLElement = slot.nativeElement.querySelector('lc-character');
      expect([...el.classList].sort()).toEqual(['lc-character', 'lc-character--64', 'lc-horizon__figure']);
      slot.componentInstance.size.set(128);
      slot.detectChanges();
      expect([...el.classList].sort()).toEqual(['lc-character', 'lc-character--128', 'lc-horizon__figure']);
    });
  });

  describe('base path (LC_CHARACTER_BASE_PATH)', () => {
    it('follows LC_LOGO_BASE_PATH, without a doubled slash', async () => {
      await create([{ provide: LC_LOGO_BASE_PATH, useValue: '/compat-logo/' }]);
      expect(images()[0].getAttribute('src')).toBe('/compat-logo/character/calm-light.svg');
    });

    it('can be set on its own', async () => {
      await create([{ provide: LC_CHARACTER_BASE_PATH, useValue: '/static/edu/' }]);
      expect(images().map((i) => i.getAttribute('src'))).toEqual(['/static/edu/calm-light.svg', '/static/edu/calm-dark.svg']);
    });
  });

  describe('styles', () => {
    const css = '\n' + compile(resolve(__dirname, 'character.component.scss')).css;

    it('AC-7: the host is a square box sized by CSS: aspect-ratio 1, width and height from the hook or the size', () => {
      const base = css.slice(css.indexOf('\n:host {'), css.indexOf('}', css.indexOf('\n:host {')));
      expect(base).toMatch(/--_lc-character-size:\s*64px/);
      expect(base).toMatch(/display:\s*block/);
      expect(base).toMatch(/flex:\s*none/);
      expect(base).toMatch(/width:\s*var\(--lc-character-size, var\(--_lc-character-size\)\)/);
      expect(base).toMatch(/height:\s*var\(--lc-character-size, var\(--_lc-character-size\)\)/);
      expect(base).toMatch(/aspect-ratio:\s*1/);
    });

    it.each([48, 80, 96, 128])('AC-8: lc-character--%s is %s px', (size) => {
      expect(css).toMatch(new RegExp(`:host\\(\\.lc-character--${size}\\) \\{\\s*--_lc-character-size: ${size}px;`));
    });

    it('AC-9: the dark drawing shows under the same root-theme selectors as lc-logo', () => {
      expect(css).toMatch(/\.lc-character__img--dark \{\s*display: none;/);
      expect(css).toContain(':host-context(:root.dark) .lc-character__img--light');
      expect(css).toContain(':host-context(:root:not(.light):not(.system)) .lc-character__img--dark');
      expect(css).toMatch(/@media \(prefers-color-scheme: dark\) \{\s*:host-context\(:root\.system:not\(\.light\)\) \.lc-character__img--light/);
    });

    it('AC-12: nothing moves, and a decorative figure is hidden (box kept) in forced colours', () => {
      expect(css).not.toMatch(/animation|transition|@keyframes/);
      expect(css).toMatch(/@media \(forced-colors: active\) \{\s*:host\(\[aria-hidden=["']?true["']?\]\) \{\s*visibility: hidden;/);
      expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    });

    it('AC-12: the images are never a pointer target', () => {
      expect(css).toMatch(/\.lc-character__img \{[^}]*pointer-events: none/);
    });
  });

  describe('Trusted Types (AC-13)', () => {
    const original = (window as { trustedTypes?: unknown }).trustedTypes;
    afterEach(() => {
      (window as { trustedTypes?: unknown }).trustedTypes = original;
    });

    it('creates no policy and binds no innerHTML: it renders <img>', async () => {
      const kitPolicies: string[] = [];
      (window as { trustedTypes?: unknown }).trustedTypes = {
        createPolicy: jest.fn((name: string, rules: Record<string, (s: string) => string>) => {
          if (!name.startsWith('angular')) kitPolicies.push(name);
          return { createHTML: (s: string) => rules['createHTML']?.(s) ?? s, createScript: (s: string) => s, createScriptURL: (s: string) => s };
        }),
      };
      await create();
      set({ pose: 'comforts', ariaLabel: 'Edu tröstet' });
      expect(kitPolicies).toEqual([]);
      const template = readFileSync(resolve(__dirname, 'character.component.html'), 'utf-8');
      const source = readFileSync(resolve(__dirname, 'character.component.ts'), 'utf-8');
      expect(template + source).not.toMatch(/innerHTML|outerHTML|bypassSecurityTrust|DomSanitizer/);
    });
  });
});
