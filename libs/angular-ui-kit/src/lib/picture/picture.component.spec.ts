import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { PictureComponent, type PictureSource } from './picture.component';
import { audit, violations } from '../../testing/axe-jsdom';

/**
 * 3.39 (request 059, life-os website-screenshots G-SS2, AC-9a to AC-13,
 * design D-3): a native `<picture>` with sources, theme variants and the
 * required intrinsic size. Boxes before and after load are measured in the
 * stories (build.md).
 */
const AVIF: PictureSource = { type: 'image/avif', srcset: '/s/home-280.avif 280w, /s/home-560.avif 560w' };
const WEBP: PictureSource = { type: 'image/webp', srcset: '/s/home-280.webp 280w, /s/home-560.webp 560w', sizes: '248px' };

@Component({
  standalone: true,
  imports: [PictureComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (attr()) {
      <lc-picture src="/s/home.png" alt="" width="360" height="780" loading="eager" fetchpriority="high" />
    } @else {
      <lc-picture
        [src]="src()"
        [alt]="alt()"
        [width]="width()"
        [height]="height()"
        [sources]="sources()"
        [srcset]="srcset()"
        [sizes]="sizes()"
        [darkSrc]="darkSrc()"
        [darkSrcset]="darkSrcset()"
      />
    }
  `,
})
class Host {
  readonly attr = signal(false);
  readonly src = signal('/s/home.png');
  readonly alt = signal('Startseite am Abend');
  readonly width = signal<number | string>(360);
  readonly height = signal<number | string>(780);
  readonly sources = signal<readonly PictureSource[]>([]);
  readonly srcset = signal('');
  readonly sizes = signal('');
  readonly darkSrc = signal('');
  readonly darkSrcset = signal('');
}

describe('PictureComponent (3.39, request 059)', () => {
  let fixture: ComponentFixture<Host>;
  let warn: jest.SpyInstance;
  const el = () => fixture.nativeElement as HTMLElement;
  const pictures = () => [...el().querySelectorAll('picture')];
  /** `name=value` of an element's own attributes, in DOM order. */
  const attrs = (e: Element) => [...e.attributes].filter((a) => !a.name.startsWith('_ng')).map((a) => `${a.name}=${a.value}`);
  const render = (set: (h: Host) => void = () => undefined) => {
    set(fixture.componentInstance);
    fixture.detectChanges();
  };

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
  });
  afterEach(() => {
    fixture?.destroy();
    warn.mockRestore();
  });

  describe('AC-10: the img', () => {
    it('defaults: one picture, the img with loading, decoding, width, height, alt, src in this order', () => {
      render();
      expect(pictures()).toHaveLength(1);
      expect(attrs(pictures()[0])).toEqual(['class=lc-picture__picture']);
      const img = el().querySelector('img') as HTMLImageElement;
      expect(attrs(img)).toEqual([
        'class=lc-picture__img',
        'loading=lazy',
        'decoding=async',
        'width=360',
        'height=780',
        'alt=Startseite am Abend',
        'src=/s/home.png',
      ]);
      expect(pictures()[0].children).toHaveLength(1);
      expect(warn).not.toHaveBeenCalled();
    });

    it('attribute forms: alt="" (decorative), eager, fetchpriority high; strings become numbers', () => {
      render((h) => h.attr.set(true));
      const img = el().querySelector('img') as HTMLImageElement;
      expect(attrs(img)).toEqual([
        'class=lc-picture__img',
        'loading=eager',
        'decoding=async',
        'fetchpriority=high',
        'width=360',
        'height=780',
        'alt=',
        'src=/s/home.png',
      ]);
      const instance = fixture.debugElement.query((d) => d.componentInstance instanceof PictureComponent).componentInstance as PictureComponent;
      expect(instance.width()).toBe(360);
      expect(instance.height()).toBe(780);
    });

    it('srcset and sizes on the img, after alt and before src', () => {
      render((h) => {
        h.srcset.set('/s/home.png 360w, /s/home@2x.png 720w');
        h.sizes.set('(min-width: 1024px) 200px, 248px');
      });
      expect(attrs(el().querySelector('img') as Element).slice(5)).toEqual([
        'alt=Startseite am Abend',
        'sizes=(min-width: 1024px) 200px, 248px',
        'srcset=/s/home.png 360w, /s/home@2x.png 720w',
        'src=/s/home.png',
      ]);
    });

    it.each([
      ['0', 780],
      [-360, 780],
      ['abc', 780],
      [360, ''],
    ])('width %p, height %p: no size attributes and a dev warning', (width, height) => {
      render((h) => {
        h.width.set(width);
        h.height.set(height);
      });
      const img = el().querySelector('img') as HTMLImageElement;
      expect(img.hasAttribute('width') && img.hasAttribute('height')).toBe(false);
      expect(warn).toHaveBeenCalledWith("lc-picture: width and height must be positive numbers; the box can't be reserved.");
    });

    it('rounds to whole px', () => {
      render((h) => {
        h.width.set('359.6');
        h.height.set(779.8);
      });
      const img = el().querySelector('img') as HTMLImageElement;
      expect([img.getAttribute('width'), img.getAttribute('height')]).toEqual(['360', '780']);
    });
  });

  describe('AC-9a: sources', () => {
    it('in their order before the img; the picture sizes is every source default', () => {
      render((h) => {
        h.sources.set([AVIF, WEBP, { srcset: '/s/wide.png', media: '(min-width: 1024px)' }]);
        h.sizes.set('(min-width: 1024px) 200px, 248px');
      });
      const children = [...pictures()[0].children];
      expect(children.map((c) => c.tagName)).toEqual(['SOURCE', 'SOURCE', 'SOURCE', 'IMG']);
      expect(children.slice(0, 3).map(attrs)).toEqual([
        ['type=image/avif', 'sizes=(min-width: 1024px) 200px, 248px', 'srcset=/s/home-280.avif 280w, /s/home-560.avif 560w'],
        ['type=image/webp', 'sizes=248px', 'srcset=/s/home-280.webp 280w, /s/home-560.webp 560w'],
        ['media=(min-width: 1024px)', 'sizes=(min-width: 1024px) 200px, 248px', 'srcset=/s/wide.png'],
      ]);
    });

    it('without sizes a source writes none', () => {
      render((h) => h.sources.set([AVIF]));
      expect(attrs(el().querySelector('source') as Element)).toEqual(['type=image/avif', 'srcset=/s/home-280.avif 280w, /s/home-560.avif 560w']);
    });

    it('every source srcset is written before the img src (the browser picks a source, not the fallback first)', () => {
      const writes: string[] = [];
      const observer = new MutationObserver((records) => {
        for (const r of records) if (r.type === 'attributes') writes.push(`${(r.target as Element).tagName.toLowerCase()}.${r.attributeName}`);
      });
      observer.observe(el(), { subtree: true, attributes: true, attributeFilter: ['src', 'srcset'] });
      render((h) => {
        h.sources.set([AVIF, WEBP]);
        h.darkSrc.set('/s/home-dark.png');
        h.srcset.set('/s/home.png 360w');
      });
      const records = observer.takeRecords();
      observer.disconnect();
      for (const r of records) if (r.type === 'attributes') writes.push(`${(r.target as Element).tagName.toLowerCase()}.${r.attributeName}`);
      // Per picture: the sources' srcset, then the img's srcset and src.
      expect(writes).toEqual([
        'source.srcset',
        'source.srcset',
        'img.srcset',
        'img.src',
        'source.srcset',
        'source.srcset',
        'img.src',
      ]);
    });
  });

  describe('AC-9b: light and dark', () => {
    const LIGHT: PictureSource = { type: 'image/avif', srcset: '/s/light.avif', theme: 'light' };
    const DARK: PictureSource = { type: 'image/avif', srcset: '/s/dark.avif', theme: 'dark' };

    it('a dark source makes a pair: --light without the dark sources, --dark without the light ones; both get the shared ones', () => {
      render((h) => h.sources.set([LIGHT, DARK, WEBP]));
      expect(pictures().map((p) => p.className)).toEqual(['lc-picture__picture lc-picture__picture--light', 'lc-picture__picture lc-picture__picture--dark']);
      const srcsets = (p: Element) => [...p.querySelectorAll('source')].map((s) => s.getAttribute('srcset'));
      expect(srcsets(pictures()[0])).toEqual(['/s/light.avif', WEBP.srcset]);
      expect(srcsets(pictures()[1])).toEqual(['/s/dark.avif', WEBP.srcset]);
      // No darkSrc: the dark fallback is src (and srcset).
      expect(pictures().map((p) => p.querySelector('img')?.getAttribute('src'))).toEqual(['/s/home.png', '/s/home.png']);
      expect(pictures().map((p) => p.querySelector('img')?.getAttribute('alt'))).toEqual(['Startseite am Abend', 'Startseite am Abend']);
    });

    it('darkSrc: the dark img takes it, and no light srcset', () => {
      render((h) => {
        h.darkSrc.set('/s/home-dark.png');
        h.srcset.set('/s/home.png 360w');
      });
      const [light, dark] = pictures().map((p) => p.querySelector('img') as HTMLImageElement);
      expect([light.getAttribute('src'), light.getAttribute('srcset')]).toEqual(['/s/home.png', '/s/home.png 360w']);
      expect([dark.getAttribute('src'), dark.hasAttribute('srcset')]).toEqual(['/s/home-dark.png', false]);
    });

    it('darkSrcset: on the dark img; without darkSrc the dark src stays src', () => {
      render((h) => {
        h.darkSrcset.set('/s/home-dark.png 360w');
        h.srcset.set('/s/home.png 360w');
      });
      const dark = pictures()[1].querySelector('img') as HTMLImageElement;
      expect([dark.getAttribute('src'), dark.getAttribute('srcset')]).toEqual(['/s/home.png', '/s/home-dark.png 360w']);
    });

    it('a light-only source makes no pair (it serves both themes then)', () => {
      render((h) => h.sources.set([LIGHT]));
      expect(pictures()).toHaveLength(1);
      expect(pictures()[0].querySelector('source')?.getAttribute('srcset')).toBe('/s/light.avif');
    });

    it('the root theme picks one with the selectors of lc-logo; the hidden picture is display: none', () => {
      const css = compile(resolve(__dirname, 'picture.component.scss')).css;
      const logo = compile(resolve(__dirname, '../logo/logo.component.scss')).css;
      const selectors = (s: string) => [...s.matchAll(/(:host-context\([^{]+)\{/g)].map((m) => m[1].trim());
      const asPicture = (s: string) => s.replaceAll('.lc-logo--light-src', '.lc-picture__picture--light').replaceAll('.lc-logo--dark-src', '.lc-picture__picture--dark');
      expect(selectors(css)).toEqual(selectors(logo).map(asPicture));
      expect(selectors(css)).toHaveLength(4);
      expect(css).toMatch(/\.lc-picture__picture--dark \{\s*display: none;\s*\}/);
      expect(css).toContain('@media (prefers-color-scheme: dark)');
    });
  });

  describe('AC-11, AC-12: the rules', () => {
    const css = compile(resolve(__dirname, 'picture.component.scss')).css;

    it('the img keeps its ratio and is never wider than its container; no border or radius unless hooked', () => {
      expect(css).toMatch(
        /\.lc-picture__img \{\s*display: block;\s*max-inline-size: 100%;\s*block-size: auto;\s*min-inline-size: var\(--lc-picture-min-width, 0px\);\s*border-radius: var\(--lc-picture-radius, 0px\);\s*\}/,
      );
      expect(css).not.toMatch(/border:|box-shadow|outline/);
    });

    it('the hooks are only read, never declared', () => {
      expect(css).not.toMatch(/--lc-picture-[\w-]+\s*:/);
    });
  });

  it('axe: no violations with a pair (the hidden img is out of the tree with display: none)', async () => {
    render((h) => h.darkSrc.set('/s/home-dark.png'));
    await fixture.whenStable();
    expect(violations(await audit(el()))).toEqual([]);
  });
});
