import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { ToastOutletComponent } from './toast-outlet.component';
import { ToastService, type ToastPosition, type ToastVariant } from './toast.service';

/**
 * 3.33 (request 052, 045-n2, AC-18, D-1): in a bottom stack the newest toast
 * sits nearest the edge. The DOM keeps both live regions and the append
 * order (announcements unchanged); the region holding the newest toast is
 * marked and laid out at the edge. Geometry is measured in the story.
 */
describe('ToastOutletComponent — bottom stack order (3.33, 045-n2)', () => {
  let fixture: ComponentFixture<ToastOutletComponent>;
  let toasts: ToastService;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ToastOutletComponent] });
    fixture = TestBed.createComponent(ToastOutletComponent);
    toasts = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  afterEach(() => {
    toasts.closeAll();
    fixture.destroy();
  });

  const show = (variant: ToastVariant, position: ToastPosition = 'bottom-center') =>
    toasts.show({ message: variant, variant, position, duration: 0 });
  const stack = (position: ToastPosition) => el().querySelector(`.lc-toast-outlet__stack--${position}`) as HTMLElement;
  const regions = (position: ToastPosition) => [...stack(position).querySelectorAll<HTMLElement>('.lc-toast-outlet__region')];
  const latest = (position: ToastPosition) =>
    regions(position)
      .filter((r) => r.classList.contains('lc-toast-outlet__region--latest'))
      .map((r) => r.getAttribute('aria-live'));

  it('without toasts no region is marked (default DOM unchanged)', () => {
    expect(el().querySelectorAll('.lc-toast-outlet__region--latest')).toHaveLength(0);
    expect(regions('bottom-center').map((r) => r.className)).toEqual(['lc-toast-outlet__region', 'lc-toast-outlet__region']);
  });

  it('marks the region of the newest toast: Warning, Error, Success → polite', () => {
    show('warning');
    show('error');
    show('success');
    fixture.detectChanges();
    expect(latest('bottom-center')).toEqual(['polite']);
  });

  it('the mark follows the newest toast: Success, then Error → assertive', () => {
    show('success');
    show('error');
    fixture.detectChanges();
    expect(latest('bottom-center')).toEqual(['assertive']);
  });

  it('keeps the regions, their order and the append order inside them', () => {
    show('warning');
    show('error');
    show('success');
    fixture.detectChanges();
    expect(regions('bottom-center').map((r) => r.getAttribute('aria-live'))).toEqual(['assertive', 'polite']);
    expect(regions('bottom-center').map((r) => [...r.querySelectorAll('lc-toast')].map((t) => t.textContent?.trim().split(/\s+/)[0]))).toEqual([
      ['warning', 'error'],
      ['success'],
    ]);
  });

  it('top stacks get no mark (unchanged)', () => {
    show('warning', 'top-right');
    show('success', 'top-right');
    fixture.detectChanges();
    expect(latest('top-right')).toEqual([]);
  });

  it('after the newest toast closes, the mark moves to the next newest', () => {
    show('warning');
    const id = show('success');
    fixture.detectChanges();
    expect(latest('bottom-center')).toEqual(['polite']);
    toasts.close(id);
    fixture.detectChanges();
    expect(latest('bottom-center')).toEqual(['assertive']);
  });

  describe('CSS (compiled)', () => {
    const css = compile(resolve(__dirname, 'toast-outlet.component.scss')).css;
    const bottoms = ['bottom-left', 'bottom-center', 'bottom-right'].map((p) => `.lc-toast-outlet__stack--${p}`);

    it('bottom stacks stay column-reverse; their regions run top to bottom; the marked region comes first', () => {
      expect(css).toMatch(
        new RegExp(`${bottoms.map((s) => `\\${s} > \\.lc-toast-outlet__region`).join(',\\s*')} \\{\\s*flex-direction: column;\\s*\\}`),
      );
      expect(css).toMatch(
        new RegExp(`${bottoms.map((s) => `\\${s} > \\.lc-toast-outlet__region--latest`).join(',\\s*')} \\{\\s*order: -1;\\s*\\}`),
      );
    });

    it('top stacks and the region base rule are unchanged', () => {
      expect(css).toMatch(/\n\.lc-toast-outlet__region \{\s*display: flex;\s*flex-direction: inherit;\s*align-items: inherit;\s*width: 100%;\s*\}/);
      expect(css).not.toMatch(/--top-[a-z]+ > \.lc-toast-outlet__region/);
    });
  });
});
