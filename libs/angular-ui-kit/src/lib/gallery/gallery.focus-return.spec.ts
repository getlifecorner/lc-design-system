import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { GalleryComponent, GalleryItem } from './gallery.component';

/**
 * 3.35 (request 055, AC-14, design D-1): the lightbox returns the focus to
 * the thumbnail that opened it also when a tap didn't focus it (WebKit), so
 * `lc-gallery` needs no `returnFocusTo`. Each test starts with `body` active
 * and opens with `HTMLElement.click()`, which focuses nothing.
 */
@Component({
  standalone: true,
  imports: [GalleryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<lc-gallery [items]="items" />`,
})
class Host {
  readonly items: GalleryItem[] = [
    { src: '/img/1.jpg', alt: 'Belege Oktober' },
    { src: '/img/2.jpg', alt: 'Belege September' },
    { src: '/img/3.jpg', alt: 'Belege August' },
  ];
}

describe('GalleryComponent — focus return after a tap (3.35, request 055)', () => {
  let fixture: ComponentFixture<Host>;
  const root = () => fixture.nativeElement as HTMLElement;
  const thumbs = () => [...root().querySelectorAll<HTMLElement>('.gallery__item')];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => (document.activeElement as HTMLElement | null)?.blur());

  async function tapOpen(index: number): Promise<HTMLElement> {
    (document.activeElement as HTMLElement | null)?.blur();
    expect(document.activeElement).toBe(document.body);
    const thumb = thumbs()[index];
    thumb.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root().querySelector('.gallery__lightbox')?.contains(document.activeElement)).toBe(true);
    return thumb;
  }

  const paths: Array<[string, () => void]> = [
    ['the close button', () => (root().querySelector('[aria-label="Close"]') as HTMLElement).click()],
    [
      'Escape',
      () => root().querySelector('.gallery__lightbox')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
    ],
    ['the backdrop', () => (root().querySelector('.gallery__lightbox-backdrop') as HTMLElement).click()],
  ];

  it.each(paths)('%s gives the focus to the tapped thumbnail, not body', async (_name, close) => {
    const thumb = await tapOpen(1);
    close();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(root().querySelector('.gallery__lightbox')).toBeNull();
    expect(document.activeElement).toBe(thumb);
  });

  it('has no returnFocusTo input', () => {
    const gallery = fixture.debugElement.children[0].componentInstance as Record<string, unknown>;
    expect(gallery).toBeInstanceOf(GalleryComponent);
    expect('returnFocusTo' in gallery).toBe(false);
  });
});
