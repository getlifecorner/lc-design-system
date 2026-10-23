import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { GalleryComponent, GalleryItem } from './gallery.component';
import { LABEL_IN_NAME as RULE, audit, computedName, installFakeCanvas, outcome, outcomeFor, violations } from '../../testing/axe-jsdom';

/**
 * Request 015 (AS-33, AC-1, AC-2, AC-5 … AC-7): the thumbnails
 * (`role="button"`) under axe-core 4.14. A shown caption follows `alt` (or
 * `imageFallbackLabel` and the number), unless one contains the other.
 */
describe('GalleryComponent — axe-core 4.14 (AS-33)', () => {
  let fixture: ComponentFixture<GalleryComponent>;
  let restoreCanvas: () => void;

  beforeAll(() => {
    restoreCanvas = installFakeCanvas();
  });

  afterAll(() => {
    restoreCanvas();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryComponent],
      providers: [provideHttpClient(withXhr())],
    }).compileComponents();
  });

  async function render(inputs: Record<string, unknown>): Promise<HTMLElement> {
    fixture = TestBed.createComponent(GalleryComponent);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const thumbs = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>('.gallery__item[role="button"]'));

  const LONG_DE = 'Blick vom Hochplateau über den nebligen Bodensee bei Sonnenaufgang';

  /** design.md §4: items, inputs, every thumbnail's computed name. */
  const rows: readonly { case: string; items: GalleryItem[]; inputs?: Record<string, unknown>; names: string[] }[] = [
    {
      case: 'EN caption',
      items: [
        { src: '/img/1.jpg', alt: 'Photo 1', caption: 'Sunset over the lake' },
        { src: '/img/2.jpg', alt: 'Photo 2', caption: 'Morning fog' },
      ],
      names: ['Photo 1, Sunset over the lake', 'Photo 2, Morning fog'],
    },
    {
      // The stories' captions contain the alt: the caption alone, no stutter.
      case: 'caption contains the alt (stories)',
      items: [
        { src: '/img/1.jpg', alt: 'Photo 1', caption: 'Photo 1 — Sample image from Picsum' },
        { src: '/img/2.jpg', alt: 'Bodensee', caption: LONG_DE },
      ],
      names: ['Photo 1 — Sample image from Picsum', LONG_DE],
    },
    {
      case: 'DE, no alt',
      items: [
        { src: '/img/1.jpg', caption: 'Hafen' },
        { src: '/img/2.jpg' },
        { src: '/img/3.jpg', caption: 'Sonnenuntergang am See' },
      ],
      inputs: { imageFallbackLabel: 'Bild' },
      names: ['Bild 1, Hafen', 'Bild 2', 'Bild 3, Sonnenuntergang am See'],
    },
    {
      case: 'long DE caption',
      items: [{ src: '/img/1.jpg', alt: 'Foto 7', caption: LONG_DE }],
      names: [`Foto 7, ${LONG_DE}`],
    },
  ];

  describe.each(rows)('$case', (row) => {
    it('names every thumbnail as designed, and each passes', async () => {
      const root = await render({ items: row.items, showCaptions: true, ...row.inputs });
      const items = thumbs(root);
      expect(items.map((t) => computedName(root, t))).toEqual(row.names);
      const results = await audit(root);
      expect(violations(results)).toEqual([]);
      items.forEach((t, i) => expect(outcomeFor(results, RULE, t)).toBe(row.items[i]?.caption ? 'pass' : 'inapplicable'));
    });
  });

  it('keeps alt as the prefix (AC-5) and a long caption once (AC-6)', async () => {
    const root = await render({ items: rows[3]?.items, showCaptions: true });
    const name = thumbs(root)[0]?.getAttribute('aria-label') ?? '';
    expect(name.startsWith('Foto 7, ')).toBe(true);
    expect(name.split(LONG_DE).length).toBe(2);
  });

  it('keeps the 3.11.4 names without captions, and follows showCaptions in the same pass (AC-7)', async () => {
    const root = await render({ items: rows[0]?.items });
    expect(thumbs(root).map((t) => t.getAttribute('aria-label'))).toEqual(['Photo 1', 'Photo 2']);
    fixture.componentRef.setInput('showCaptions', true);
    fixture.detectChanges();
    expect(thumbs(root).map((t) => t.getAttribute('aria-label'))).toEqual(['Photo 1, Sunset over the lake', 'Photo 2, Morning fog']);
  });

  it('fails label-content-name-mismatch with the pre-3.11.5 name (negative control, AC-2)', async () => {
    const root = await render({ items: rows[0]?.items, showCaptions: true });
    const first = thumbs(root)[0];
    if (!first) throw new Error('no thumbnail');
    first.setAttribute('aria-label', 'Photo 1');
    const results = await audit(root);
    expect(outcome(results, RULE)).toBe('violation');
    expect(results.violations.map((v) => v.id)).toEqual([RULE]);
    expect(outcomeFor(results, RULE, first)).toBe('violation');
  });
});
