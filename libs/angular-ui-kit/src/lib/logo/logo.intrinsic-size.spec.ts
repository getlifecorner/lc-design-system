import { ComponentFixture, TestBed } from '@angular/core/testing';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { LogoComponent } from './logo.component';

/** lc-logo intrinsic size (3.11.2, G-38): AC-1 to AC-3, AC-11 and AC-13 of request 012. */
describe('LogoComponent intrinsic size (G-38)', () => {
  let fixture: ComponentFixture<LogoComponent>;

  const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
  const PX = { xs: 24, sm: 32, md: 48, lg: 64, xl: 96 } as const;

  function images(): HTMLImageElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('img'));
  }

  /** `[width, height]` of every rendered `<img>`, `null` where an attribute is absent. */
  function sizes(): [string | null, string | null][] {
    return images().map((img) => [img.getAttribute('width'), img.getAttribute('height')]);
  }

  function set(inputs: Record<string, unknown>): void {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LogoComponent] }).compileComponents();
    fixture = TestBed.createComponent(LogoComponent);
    fixture.detectChanges();
  });

  describe('built-in lockup (AC-1)', () => {
    it.each(SIZES)('size %s: both images in colorMode auto carry 485 × 100 (ratio 4.85)', (size) => {
      set({ size });
      expect(images()).toHaveLength(2);
      expect(sizes()).toEqual([
        ['485', '100'],
        ['485', '100'],
      ]);
      for (const img of images()) {
        expect(Number(img.getAttribute('width')) / Number(img.getAttribute('height'))).toBeCloseTo(4.85, 5);
      }
    });

    it.each(['light', 'dark'])('colorMode %s: the one image carries 485 × 100', (colorMode) => {
      set({ colorMode, size: 'lg' });
      expect(sizes()).toEqual([['485', '100']]);
    });

    it('matches the lockup files’ own size (viewBox and width/height)', () => {
      const assets = resolve(__dirname, '../../assets');
      for (const file of ['lifecorner-logo.svg', 'lifecorner-logo-on-dark.svg']) {
        const svg = readFileSync(resolve(assets, file), 'utf-8');
        expect(svg).toMatch(/viewBox="0 0 485 100"/);
        expect(svg).toMatch(/\swidth="485"/);
        expect(svg).toMatch(/\sheight="100"/);
      }
    });
  });

  describe('built-in emblem (AC-2)', () => {
    it.each(SIZES)('size %s: width = height = the size’s px on both images (normal and small drawing)', (size) => {
      set({ variant: 'emblem', size });
      expect(images()).toHaveLength(2);
      const px = String(PX[size]);
      expect(sizes()).toEqual([
        [px, px],
        [px, px],
      ]);
    });

    it('the emblem files are square, so the size’s px reserve the loaded box', () => {
      const assets = resolve(__dirname, '../../assets');
      for (const file of [
        'lifecorner-emblem.svg',
        'lifecorner-emblem-on-dark.svg',
        'lifecorner-emblem-small.svg',
        'lifecorner-emblem-small-on-dark.svg',
      ]) {
        expect(readFileSync(resolve(assets, file), 'utf-8')).toMatch(/viewBox="0 0 100 100"/);
      }
    });
  });

  describe('custom sources (AC-3)', () => {
    it('writes no size attributes for a custom src without the inputs (markup as before)', () => {
      set({ src: '/brand/logo.svg' });
      expect(sizes()).toEqual([[null, null]]);
      set({ variant: 'emblem', emblemSrc: '/brand/emblem.svg' });
      expect(sizes()).toEqual([[null, null]]);
    });

    it('srcWidth and srcHeight size the light and the dark lockup', () => {
      set({ src: '/brand/logo.svg', darkSrc: '/brand/logo-dark.svg', srcWidth: 320, srcHeight: 80 });
      expect(images().map((i) => i.getAttribute('src'))).toEqual(['/brand/logo.svg', '/brand/logo-dark.svg']);
      expect(sizes()).toEqual([
        ['320', '80'],
        ['320', '80'],
      ]);
    });

    it('writes nothing when only one of the pair is set', () => {
      set({ src: '/brand/logo.svg', srcWidth: 320 });
      expect(sizes()).toEqual([[null, null]]);
      set({ srcWidth: undefined, srcHeight: 80 });
      expect(sizes()).toEqual([[null, null]]);
    });

    it.each([
      ['160', 160],
      [159.6, 160],
      [' 42 ', 42],
    ])('accepts %p and writes %p', (value, expected) => {
      set({ src: '/brand/logo.svg', srcWidth: value, srcHeight: value });
      expect(fixture.componentInstance.srcWidth()).toBe(expected);
      expect(sizes()).toEqual([[String(expected), String(expected)]]);
    });

    it.each([0, -10, Number.NaN, Number.POSITIVE_INFINITY, '', 'abc', null, undefined])('ignores %p', (value) => {
      set({ src: '/brand/logo.svg', srcWidth: value, srcHeight: 80 });
      expect(fixture.componentInstance.srcWidth()).toBeUndefined();
      expect(sizes()).toEqual([[null, null]]);
    });

    it('the emblem pair applies only to emblem files, the lockup pair only to lockup files', () => {
      set({ src: '/brand/logo.svg', emblemSrc: '/brand/emblem.svg', emblemSrcWidth: 100, emblemSrcHeight: 100 });
      expect(sizes()).toEqual([[null, null]]);
      set({ variant: 'emblem' });
      expect(sizes()).toEqual([['100', '100']]);
      set({ srcWidth: 320, srcHeight: 80, emblemSrcWidth: undefined });
      expect(sizes()).toEqual([[null, null]]);
    });

    it('a dark emblem file shares the pair of its light partner', () => {
      set({
        variant: 'emblem',
        emblemSrc: '/brand/emblem.svg',
        darkEmblemSrc: '/brand/emblem-dark.svg',
        emblemSrcWidth: 120,
        emblemSrcHeight: 100,
      });
      expect(sizes()).toEqual([
        ['120', '100'],
        ['120', '100'],
      ]);
    });

    it('mixed: only darkSrc set → the built-in light lockup gets 485 × 100, the custom dark file the src pair or nothing', () => {
      set({ darkSrc: '/brand/logo-dark.svg' });
      expect(images().map((i) => i.getAttribute('src'))).toEqual(['/assets/lifecorner-logo.svg', '/brand/logo-dark.svg']);
      expect(sizes()).toEqual([
        ['485', '100'],
        [null, null],
      ]);
      set({ srcWidth: 300, srcHeight: 60 });
      expect(sizes()).toEqual([
        ['485', '100'],
        ['300', '60'],
      ]);
    });

    it('a custom emblem leaves the built-in lockup sized (the files follow the variant)', () => {
      set({ emblemSrc: '/brand/emblem.svg' });
      expect(sizes()).toEqual([
        ['485', '100'],
        ['485', '100'],
      ]);
    });
  });

  describe('unchanged rendering (AC-11, AC-13)', () => {
    it('the default lockup images carry exactly src, alt, class and the new width/height', () => {
      expect(images().map((i) => i.getAttributeNames().sort())).toEqual([
        ['alt', 'class', 'height', 'src', 'width'],
        ['alt', 'class', 'height', 'src', 'width'],
      ]);
      expect(images().map((i) => [...i.classList].sort())).toEqual([
        ['lc-logo', 'lc-logo--light-src', 'size-md'],
        ['lc-logo', 'lc-logo--dark-src', 'size-md'],
      ]);
    });

    it('keeps alt and adds no role, aria-* or loading attribute', () => {
      set({ alt: 'Acme Inc.', src: '/brand/logo.svg', srcWidth: 320, srcHeight: 80 });
      for (const img of images()) {
        expect(img.getAttribute('alt')).toBe('Acme Inc.');
        expect(img.getAttributeNames().filter((n) => n === 'role' || n === 'loading' || n.startsWith('aria-'))).toEqual([]);
        expect(img.getAttribute('style')).toBeNull();
      }
    });
  });
});
