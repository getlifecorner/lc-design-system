import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { resolve } from 'path';
import { compile } from 'sass';
import { FileUploadComponent, type FileUploadImageBackground } from './file-upload.component';

/**
 * 3.49.1 (request 070, 069-s1, design D-1…D-5): in forced colours the browser
 * paints every tile Canvas, so a white logo on the `dark` ground measured
 * 1.00. A tile with a `light`, `dark` or `checkered` ground keeps that ground
 * once it shows an image (`forced-color-adjust: none`); `surface` and empty
 * tiles keep the system colours. The edge stays CanvasText, the drag ring
 * Highlight. The colours themselves are measured in the browser
 * (`tmp/story-shots/070/fc-measure.js`, `--forced-colors`).
 */
const CSS = compile(resolve(__dirname, 'file-upload.component.scss')).css;
const FORCED_AT = CSS.indexOf('@media (forced-colors: active)');
const FORCED = CSS.slice(FORCED_AT);
const LOGO = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 1"/%3E';
const GROUNDS: FileUploadImageBackground[] = ['surface', 'light', 'dark', 'checkered'];

/** `[selector, declarations]` of every rule in `css` (no nesting), whitespace folded. */
function rules(css: string): [string, string][] {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [
    m[1].trim().replace(/\s+/g, ' '),
    m[2].trim().replace(/\s+/g, ' '),
  ]);
}

/** The forced block's body (between its braces). */
const FORCED_BODY = FORCED.slice(FORCED.indexOf('{') + 1, FORCED.lastIndexOf('}'));
/** The compiled selector list of the request-070 rule, read from the CSS (not retyped). */
const KEEP_GROUND = rules(FORCED_BODY).find(([sel, decl]) => sel.includes('__tile') && decl === 'forced-color-adjust: none;')?.[0] ?? '';

describe('lc-file-upload image grounds in forced colours (3.49.1, request 070)', () => {
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadComponent],
      providers: [provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(FileUploadComponent);
    fixture.componentRef.setInput('variant', 'image');
    fixture.componentRef.setInput('imageHint', 'SVG or PNG, at most 85 kB.');
    fixture.componentRef.setInput('accept', '.svg,.png');
    fixture.componentRef.setInput('maxSizeBytes', 87040);
    fixture.detectChanges();
  });
  afterEach(() => fixture.destroy());

  const host = () => fixture.nativeElement as HTMLElement;
  const tile = () => host().querySelector('.file-upload-image__tile') as HTMLElement;
  const show = (ground: FileUploadImageBackground, src: string) => {
    fixture.componentRef.setInput('imageBackground', ground);
    fixture.componentRef.setInput('imageSrc', src);
    fixture.detectChanges();
  };

  describe('AC-1: light, dark and checkered keep their ground once there is an image', () => {
    it('one rule in the forced block, exactly forced-color-adjust: none, on the three grounds without --empty', () => {
      expect(KEEP_GROUND).toBe(
        '.file-upload-image__tile--light:not(.file-upload-image__tile--empty), ' +
          '.file-upload-image__tile--dark:not(.file-upload-image__tile--empty), ' +
          '.file-upload-image__tile--checkered:not(.file-upload-image__tile--empty)',
      );
      expect(rules(FORCED_BODY).filter(([sel]) => sel === KEEP_GROUND)).toEqual([[KEEP_GROUND, 'forced-color-adjust: none;']]);
    });

    it.each([['light'], ['dark'], ['checkered']] as [FileUploadImageBackground][])('a %s tile with an image matches the rule', (ground) => {
      show(ground, LOGO);
      expect(tile().classList.contains('file-upload-image__tile--empty')).toBe(false);
      expect(tile().matches(KEEP_GROUND)).toBe(true);
    });

    it('D-5: a dark tile whose image failed to load keeps its ground (the tile is not empty)', () => {
      show('dark', LOGO);
      tile().querySelector('img')?.dispatchEvent(new Event('error'));
      fixture.detectChanges();
      expect(tile().querySelector('img')?.classList.contains('file-upload-image__img--failed')).toBe(true);
      expect(tile().matches(KEEP_GROUND)).toBe(true);
    });

    it('a dark tile with an image during drag-over keeps its ground and gets the drag class', () => {
      show('dark', LOGO);
      const event = new Event('dragover', { bubbles: true, cancelable: true });
      tile().dispatchEvent(event);
      fixture.detectChanges();
      expect(tile().classList.contains('file-upload-image__tile--drag-over')).toBe(true);
      expect(tile().matches(KEEP_GROUND)).toBe(true);
    });
  });

  describe('AC-3: the edge stays CanvasText, the drag ring Highlight, the image as drawn', () => {
    it('the 3.49 forced rules are still in the block, unchanged', () => {
      const body = rules(FORCED_BODY);
      expect(body).toContainEqual(['.file-upload-image__tile', 'border-color: CanvasText;']);
      expect(body).toContainEqual(['.file-upload-image__tile--drag-over', 'outline-color: Highlight;']);
      expect(body).toContainEqual(['.file-upload-image__img', 'forced-color-adjust: none;']);
      expect(body).toContainEqual(['.file-upload__file-remove:focus-visible', 'outline-color: Highlight;']);
    });

    it('one forced block, the file\'s last; forced-color-adjust appears nowhere outside it', () => {
      expect(CSS.split('@media (forced-colors: active)').length).toBe(2);
      expect(CSS.lastIndexOf('}')).toBe(FORCED_AT + FORCED.lastIndexOf('}'));
      expect(CSS.slice(0, FORCED_AT)).not.toMatch(/forced-color-adjust/);
      expect(rules(FORCED_BODY).filter(([, decl]) => decl.includes('forced-color-adjust')).length).toBe(2);
    });

    it('the new rule sets no colour of its own (system colours and the tile\'s tokens only)', () => {
      expect(FORCED).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
    });
  });

  describe('AC-4: surface and empty tiles keep the system colours; nothing beside the tile opts out', () => {
    it('a surface tile with an image does not match', () => {
      show('surface', LOGO);
      expect(tile().matches(KEEP_GROUND)).toBe(false);
    });

    it.each(GROUNDS.map((g) => [g]))('an empty %s tile does not match (its hint follows the user\'s palette)', (ground) => {
      show(ground, '');
      expect(tile().classList.contains('file-upload-image__tile--empty')).toBe(true);
      expect(tile().matches(KEEP_GROUND)).toBe(false);
    });

    it.each([['light'], ['dark'], ['checkered']] as [FileUploadImageBackground][])(
      '%s: only the tile matches; the buttons, hint, accepted/max lines and error are not inside it',
      (ground) => {
        show(ground, LOGO);
        expect([...host().querySelectorAll(KEEP_GROUND)]).toEqual([tile()]);
        // forced-color-adjust inherits: the tile's only descendant is the image (already `none`).
        expect([...tile().querySelectorAll('*')].map((e) => e.className)).toEqual(['file-upload-image__img']);
        const beside = host().querySelectorAll('lc-button, .file-upload__hint, .file-upload__accept, .file-upload-image__error');
        expect(beside.length).toBe(6);
        expect([...beside].filter((e) => e.closest(KEEP_GROUND))).toEqual([]);
      },
    );
  });

  describe('defaults render as before (no markup, class or normal-mode rule changed)', () => {
    it.each(GROUNDS.map((g) => [g]))('%s: the tile classes, filled and empty, are the 3.49.0 ones', (ground) => {
      const scope = ground === 'dark' ? ' lc-theme-dark' : ground === 'light' ? ' lc-theme-light' : '';
      show(ground, LOGO);
      expect(tile().getAttribute('class')).toBe(`file-upload-image__tile file-upload-image__tile--${ground}${scope}`);
      show(ground, '');
      expect(tile().getAttribute('class')).toBe(`file-upload-image__tile file-upload-image__tile--${ground}${scope} file-upload-image__tile--empty`);
    });

    it('the normal-mode tile rules are the 3.49.0 ones', () => {
      const tiles = rules(CSS.slice(CSS.indexOf('.file-upload-image {'), FORCED_AT)).filter(([sel]) => sel.startsWith('.file-upload-image__tile'));
      expect(tiles).toEqual([
        [
          '.file-upload-image__tile',
          'display: flex; align-items: center; justify-content: center; box-sizing: border-box; width: var(--lc-file-upload-image-width, 10rem); height: var(--lc-file-upload-image-height, 6rem); max-width: 100%; padding: var(--spacing-2); border: 1px solid var(--color-border); border-radius: var(--lc-file-upload-image-radius, var(--border-radius-md)); background-color: var(--color-surface);',
        ],
        ['.file-upload-image__tile--empty', 'border-style: dashed;'],
        ['.file-upload-image__tile--dark', 'background-color: var(--color-sidebar);'],
        [
          '.file-upload-image__tile--checkered:not(.file-upload-image__tile--empty)',
          'background: repeating-conic-gradient(var(--color-neutral-300) 0 25%, var(--color-surface) 0 50%) 0 0/16px 16px;',
        ],
        ['.file-upload-image__tile--drag-over', 'outline: 2px dashed var(--color-primary-500); outline-offset: 2px;'],
      ]);
    });
  });
});
