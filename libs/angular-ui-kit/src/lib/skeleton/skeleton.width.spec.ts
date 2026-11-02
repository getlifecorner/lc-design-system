import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonComponent, SkeletonVariant } from './skeleton.component';

/**
 * Request 032 (3.22.2, finance-intelligence cockpit row 3): `width` is applied
 * once, to the host, and the fill always spans it. Before, the fill took the
 * width again, so a percentage resolved against the host (`30%` drew 9 %).
 * jsdom has no layout: the measured widths (AC-1, AC-5) come from the
 * *Percentage widths* story; this spec pins the DOM contract (AC-2, AC-7, AC-8).
 */
@Component({
  standalone: true,
  imports: [SkeletonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div style="display: flex"><lc-skeleton [variant]="variant()" [width]="width()" /></div>`,
})
class HostComponent {
  readonly variant = signal<SkeletonVariant>('line');
  readonly width = signal<string | undefined>(undefined);
}

describe('lc-skeleton width (request 032)', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
  });

  function render(variant: SkeletonVariant, width?: string): { host: HTMLElement; fill: HTMLElement } {
    fixture.componentInstance.variant.set(variant);
    fixture.componentInstance.width.set(width);
    fixture.detectChanges();
    const host = (fixture.nativeElement as HTMLElement).querySelector('lc-skeleton') as HTMLElement;
    return { host, fill: host.querySelector('.lc-skeleton') as HTMLElement };
  }

  /** The element's markup without Angular's encapsulation attributes. */
  const markup = (el: HTMLElement) => el.outerHTML.replace(/\s_ng(host|content)-[\w-]+=""/g, '');

  describe('AC-2: the host carries the requested width, the fill spans it', () => {
    it.each([
      ['line', '30%', '30%'],
      ['line', '60%', '60%'],
      ['line', '120px', '120px'],
      ['line', '12rem', '12rem'],
      ['line', 'calc(100% - 2rem)', 'calc(100% - 2rem)'],
      ['rect', '45%', '45%'],
      ['circle', '40px', '40px'],
      ['line', undefined, '100%'],
      ['rect', undefined, '100%'],
      ['circle', undefined, '40px'],
    ] as const)('%s width=%s: host %s, fill 100%', (variant: SkeletonVariant, width, hostWidth) => {
      const { host, fill } = render(variant, width);
      expect(host.style.width).toBe(hostWidth);
      expect(fill.style.width).toBe('100%');
    });
  });

  it('AC-7: a circle with width="40px" stays 40px on the host and never shrinks in a flex row', () => {
    const { host, fill } = render('circle', '40px');
    expect(host.style.width).toBe('40px');
    expect(host.style.flexShrink).toBe('0');
    expect(fill.style.width).toBe('100%');
    expect(fill.style.height).toBe('40px');
  });

  it('AC-7: a percentage on the host does not shrink in a flex row either', () => {
    const { host } = render('line', '30%');
    expect(host.style.width).toBe('30%');
    expect(host.style.flexShrink).toBe('0');
  });

  it('AC-8: the serialised markup holds the width on the host and 100% on the fill (no script needed)', () => {
    const { host, fill } = render('line', '30%');
    expect(host.getAttribute('style')).toBe('width: 30%; flex-shrink: 0;');
    // Angular writes a [style] map in its own order (as 3.22.1 did with the same keys).
    expect(fill.getAttribute('style')).toBe('border-radius: 0.25rem; height: 0.875rem; width: 100%;');
  });

  // The defaults render as in 3.22.1: the old fill width of line and rect was
  // already `100%`; a circle's old fill width equalled its 40px host, so it
  // paints the same box (AC-4 proves the pixels by shot hash).
  it.each([
    [
      'line',
      '<lc-skeleton style="width: 100%; flex-shrink: 0;"><div class="lc-skeleton lc-skeleton--line" style="border-radius: 0.25rem; height: 0.875rem; width: 100%;"></div></lc-skeleton>',
    ],
    [
      'rect',
      '<lc-skeleton style="width: 100%; flex-shrink: 0;"><div class="lc-skeleton lc-skeleton--rect" style="border-radius: 0.5rem; height: 100px; width: 100%;"></div></lc-skeleton>',
    ],
    [
      'circle',
      '<lc-skeleton style="width: 40px; flex-shrink: 0;"><div class="lc-skeleton lc-skeleton--circle" style="border-radius: 50%; height: 40px; width: 100%;"></div></lc-skeleton>',
    ],
  ] as const)('pins the default %s markup', (variant: SkeletonVariant, html) => {
    expect(markup(render(variant).host)).toBe(html);
  });
});
