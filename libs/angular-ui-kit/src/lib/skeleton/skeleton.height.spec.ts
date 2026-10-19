import { ComponentFixture, TestBed } from '@angular/core/testing';
import { compile } from 'sass';
import { resolve } from 'path';
import { SkeletonComponent, SkeletonVariant } from './skeleton.component';

/**
 * `--lc-skeleton-height` (3.9, AS-27, request 006): the fill's height from
 * CSS. jsdom applies no stylesheets, so the rule is read from the compiled CSS
 * and the measured heights come from the story (height-from-container).
 */
const css = '\n' + compile(resolve(__dirname, 'skeleton.component.scss')).css;

/** The declarations of the top-level rule whose selector is exactly `selector`. */
function rule(selector: string): string {
  const start = css.indexOf(`\n${selector} {`);
  expect(start).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf('}', start));
}

describe('lc-skeleton --lc-skeleton-height (AS-27)', () => {
  it('AC-15: sets min- and max-height from the hook, so it wins over the inline height', () => {
    const fill = rule('.lc-skeleton');
    expect(fill).toMatch(/min-height:\s*var\(--lc-skeleton-height, 0px\);/);
    expect(fill).toMatch(/max-height:\s*var\(--lc-skeleton-height, none\);/);
  });

  it('AC-16: on the fill of every variant (no variant rule, nothing else sets a height)', () => {
    expect(css).not.toMatch(/\.lc-skeleton--/);
    expect(css.match(/(^|\s)(min-|max-)?height:/gm)).toHaveLength(2);
  });

  describe('AC-17: the inputs render exactly as before', () => {
    let fixture: ComponentFixture<SkeletonComponent>;
    let host: HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [SkeletonComponent] }).compileComponents();
      fixture = TestBed.createComponent(SkeletonComponent);
      host = fixture.nativeElement as HTMLElement;
    });

    /** The fill's inline declarations, by name (Angular writes them in its own order). */
    const inline = (fill: HTMLElement) =>
      Object.fromEntries([...Array(fill.style.length)].map((_, i) => [fill.style[i], fill.style.getPropertyValue(fill.style[i])]));

    it.each([
      ['line', { width: '100%', height: '0.875rem', 'border-radius': '0.25rem' }, '100%'],
      ['circle', { width: '40px', height: '40px', 'border-radius': '50%' }, '40px'],
      ['rect', { width: '100%', height: '100px', 'border-radius': '0.5rem' }, '100%'],
    ] as const)('%s defaults: the same inline styles and host width', (variant: SkeletonVariant, style, width) => {
      fixture.componentRef.setInput('variant', variant);
      fixture.detectChanges();
      const fill = host.querySelector('.lc-skeleton') as HTMLElement;
      expect(inline(fill)).toEqual(style);
      expect(fill.className).toBe(`lc-skeleton lc-skeleton--${variant}`);
      expect(host.style.width).toBe(width);
      expect(host.style.flexShrink).toBe('0');
    });

    it('an explicit height stays the inline height of the fill', () => {
      fixture.componentRef.setInput('variant', 'rect');
      fixture.componentRef.setInput('height', '88px');
      fixture.componentRef.setInput('borderRadius', '18px');
      fixture.detectChanges();
      expect(inline(host.querySelector('.lc-skeleton') as HTMLElement)).toEqual({ width: '100%', height: '88px', 'border-radius': '18px' });
    });
  });
});
