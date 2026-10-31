import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NEVER } from 'rxjs';
import { provideLcIcons, type LcIconDefinition } from '@lifecorner/angular-ui-kit/icon';
import { ComboboxComponent, type ComboboxOption } from '@lifecorner/angular-ui-kit/combobox';
import { DocumentViewerComponent } from '@lifecorner/angular-ui-kit/document-viewer';
import { FieldGroupComponent } from '@lifecorner/angular-ui-kit/field-group';
import { FileUploadComponent } from '@lifecorner/angular-ui-kit/file-upload';
import { GalleryComponent } from '@lifecorner/angular-ui-kit/gallery';
import { LogViewerComponent } from '@lifecorner/angular-ui-kit/log-viewer';

/**
 * 3.19.1 (request 025, 024 review / build.md): the 29 lc-icon sites of
 * log-viewer, document-viewer, gallery, combobox, file-upload and field-group
 * are decorative. Each sits in a button named by `aria-label`, beside visible
 * text or beside a labelled field, so no unnamed `role="img"` is left
 * (axe svg-img-alt). The static scan in kit-icons.spec.ts covers every tag.
 */

/** A registered glyph per name, so every icon renders its svg without a fetch. */
const glyph = (name: string): LcIconDefinition => ({
  name,
  variant: 'outline',
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 18L18 6" /></svg>',
});
const NAMES = [
  'player-play', 'player-pause', 'trash', 'clipboard-document', 'magnifying-glass', 'arrow-down',
  'photo', 'document', 'minus', 'plus', 'arrows-pointing-out', 'arrows-pointing-in', 'arrow-down-tray',
  'exclamation-triangle', 'x-mark', 'chevron-left', 'chevron-right', 'cloud-arrow-up', 'map-pin', 'user',
];

describe('decorative icons in six kit components (3.19.1, request 025)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting(), provideLcIcons(NAMES.map(glyph))],
    });
  });

  function render<T>(component: Type<T>, inputs: Record<string, unknown> = {}): ComponentFixture<T> {
    const fixture = TestBed.createComponent(component);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    return fixture;
  }

  /** Every lc-icon under `roots` has rendered an aria-hidden svg with no role and no name. */
  function expectDecorative(roots: Element[], count: number): void {
    const icons = roots.flatMap((root) => Array.from(root.querySelectorAll('lc-icon')));
    expect(icons).toHaveLength(count);
    for (const icon of icons) {
      const svg = icon.querySelector('svg');
      expect(svg).toBeTruthy();
      expect([svg?.getAttribute('aria-hidden'), svg?.getAttribute('role'), svg?.getAttribute('aria-label')]).toEqual(['true', null, null]);
    }
  }

  it('lc-log-viewer: pause, clear, copy, search toggle, search field and jump-to-bottom (6)', () => {
    const fixture = render(LogViewerComponent, { lines: [{ text: 'boot' }, { text: 'ready' }], stream$: NEVER });
    const viewer = fixture.componentInstance as unknown as Record<string, { set(v: boolean): void }>;
    viewer['showSearch'].set(true);
    viewer['atBottom'].set(false);
    fixture.detectChanges();
    expectDecorative([fixture.nativeElement], 6);
  });

  it.each([
    ['image: type, zoom out, zoom in, reset, download, fullscreen', '/assets/test.png', 6],
    ['unknown type: type, download, fullscreen, preview icon, download file', '/file.xyz', 5],
    ['error: type, fullscreen, error icon', '', 3],
  ])('lc-document-viewer, %s', (_state, src, count) => {
    const fixture = render(DocumentViewerComponent, { src });
    expectDecorative([fixture.nativeElement], count);
  });

  it('lc-gallery lightbox: zoom out, zoom in, reset, download, close, previous, next (7)', () => {
    const items = ['/a.png', '/b.png', '/c.png'].map((src) => ({ src, alt: src }));
    const fixture = render(GalleryComponent, { items });
    (fixture.componentInstance as unknown as { openLightbox(i: number): void }).openLightbox(1);
    fixture.detectChanges();
    const lightbox = (fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]') as HTMLElement;
    expect(lightbox).toBeTruthy();
    expectDecorative([lightbox], 7);
  });

  it('lc-combobox: clear button, option icon and the create option (3)', () => {
    const options: ComboboxOption[] = [
      { value: 'b', label: 'Berlin', icon: 'map-pin' },
      { value: 'h', label: 'Hamburg' },
    ];
    const fixture = render(ComboboxComponent, { options, allowCreate: true });
    const combobox = fixture.componentInstance as unknown as Record<string, unknown> & { selectOption(o: ComboboxOption): void };
    combobox.selectOption(options[1]);
    (combobox['query'] as { set(v: string): void }).set('Ber');
    (combobox['isOpen'] as { set(v: boolean): void }).set(true);
    fixture.detectChanges();
    const dropdown = document.querySelector('.cdk-overlay-container .lc-combobox__dropdown') as HTMLElement;
    expect(dropdown).toBeTruthy();
    expectDecorative([fixture.nativeElement, dropdown], 3);
  });

  it('lc-file-upload: drop zone, file and remove (3)', () => {
    const fixture = render(FileUploadComponent);
    const file = new File(['x'], 'Kontoauszug.pdf', { type: 'application/pdf' });
    const upload = fixture.componentInstance as unknown as Record<string, { set(v: unknown): void }>;
    upload['selectedFiles'].set([{ file, name: file.name, size: file.size, type: file.type }]);
    fixture.detectChanges();
    expectDecorative([fixture.nativeElement], 3);
  });

  it('lc-field-group: the label icon (1)', () => {
    const fixture = render(FieldGroupComponent, { label: 'Owner', value: 'Alice Johnson', icon: 'user' });
    expectDecorative([fixture.nativeElement], 1);
  });
});
