import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'sass';
import {
  FileUploadComponent,
  type FileUploadFile,
  type FileUploadImageBackground,
  type FileUploadRejection,
  type FileUploadVariant,
} from './file-upload.component';
import { audit, computedName, installFakeCanvas, violations } from '../../testing/axe-jsdom';

/**
 * 3.49 (request 069, usm-x row 71, design D-5/D-6, §3B): `variant="image"`
 * is one image field: a preview tile with `imageSrc` on a chosen ground, a
 * choose/replace button and a remove button; a rejected file is shown in
 * place and announced. The drop zone default is untouched (its specs).
 */
const COMPONENT_CSS = compile(resolve(__dirname, 'file-upload.component.scss')).css;
const LOGO = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 1"/%3E';

@Component({
  imports: [FileUploadComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-file-upload
      [variant]="variant()"
      [imageSrc]="src()"
      [imageAlt]="alt()"
      [imageBackground]="ground()"
      [imageHint]="imageHint()"
      [accept]="accept()"
      [multiple]="multiple()"
      [maxSizeBytes]="maxSizeBytes()"
      [disabled]="disabled()"
      [locale]="locale()"
      [maxSizeLabel]="maxSizeLabel()"
      [sizeRejectedLabel]="sizeRejectedLabel()"
      (filesSelected)="selected.push($event)"
      (fileRejected)="rejected.push($event)"
      (imageRemoved)="onRemoved()"
    />
  `,
})
class HostComponent {
  readonly variant = signal<FileUploadVariant>('image');
  readonly src = signal(LOGO);
  readonly alt = signal('');
  readonly ground = signal<FileUploadImageBackground>('surface');
  readonly imageHint = signal('SVG or PNG, at most 85 kB.');
  readonly accept = signal('');
  readonly multiple = signal(false);
  readonly maxSizeBytes = signal(87040);
  readonly disabled = signal(false);
  readonly locale = signal('');
  readonly maxSizeLabel = signal('Max:');
  readonly sizeRejectedLabel = signal('This file is too large.');
  readonly selected: FileUploadFile[][] = [];
  readonly rejected: FileUploadRejection[] = [];
  removed = 0;
  /** The app clears the image when remove is pressed. */
  onRemoved(): void {
    this.removed++;
    this.src.set('');
  }
}

function fileOf(name: string, size: number, type: string): File {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

describe('lc-file-upload variant="image" (3.49, request 069)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let style: HTMLStyleElement;

  beforeAll(() => {
    style = document.head.appendChild(document.createElement('style'));
    style.textContent = COMPONENT_CSS;
  });
  afterAll(() => style.remove());

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent], providers: [provideHttpClient(withXhr())] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });
  afterEach(() => fixture.destroy());

  const root = () => fixture.nativeElement.querySelector('lc-file-upload') as HTMLElement;
  const input = () => root().querySelector('input[type="file"]') as HTMLInputElement;
  const tile = () => root().querySelector('.file-upload-image__tile') as HTMLElement;
  const buttons = () => Array.from(root().querySelectorAll<HTMLButtonElement>('.file-upload-image__actions button'));
  const alert = () => root().querySelector('[role="alert"]') as HTMLElement;
  const update = () => fixture.detectChanges();
  const drop = (...files: File[]) => {
    const event = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', { value: { files } });
    tile().dispatchEvent(event);
    update();
  };
  const pick = (...files: File[]) => {
    Object.defineProperty(input(), 'files', { configurable: true, value: files });
    input().dispatchEvent(new Event('change'));
    update();
  };

  describe('AC-7: one image field instead of the drop zone', () => {
    it('defaults to the drop zone (variant "dropzone"); "image" replaces zone and list', () => {
      host.variant.set('dropzone');
      update();
      expect(root().querySelector('.file-upload[role="button"]')).not.toBeNull();
      expect(root().querySelector('.file-upload-image')).toBeNull();
      host.variant.set('image');
      update();
      expect([...root().children].map((el) => `${el.tagName.toLowerCase()}.${el.className}`)).toEqual([
        'input.file-upload__input',
        'div.file-upload-image',
      ]);
      expect(root().querySelector('.file-upload, .file-upload__list')).toBeNull();
    });

    it('shows imageSrc in the tile; Replace and Remove with an image, Choose only without', () => {
      const img = tile().querySelector('img') as HTMLImageElement;
      expect(img.getAttribute('src')).toBe(LOGO);
      expect(img.getAttribute('alt')).toBe('');
      expect(buttons().map((b) => b.textContent?.trim())).toEqual(['Replace image', 'Remove image']);
      host.src.set('');
      update();
      expect(tile().querySelector('img')).toBeNull();
      expect(tile().querySelector('.file-upload-image__empty')?.textContent).toBe('No image');
      expect(buttons().map((b) => b.textContent?.trim())).toEqual(['Choose image']);
    });

    it('choose opens the native input; accept "" means image/*; multiple is ignored', () => {
      host.multiple.set(true);
      update();
      expect([input().accept, input().multiple]).toEqual(['image/*', false]);
      const open = jest.spyOn(input(), 'click').mockImplementation(() => undefined);
      buttons()[0].click();
      expect(open).toHaveBeenCalledTimes(1);
      host.accept.set('.svg,.png');
      update();
      expect(input().accept).toBe('.svg,.png');
    });

    it('a picked file is emitted as [file]; the component keeps no list', () => {
      const logo = fileOf('logo.png', 2048, 'image/png');
      pick(logo, fileOf('second.png', 10, 'image/png'));
      expect(host.selected).toEqual([[{ file: logo, name: 'logo.png', size: 2048, type: 'image/png' }]]);
      expect(root().querySelector('.file-upload__list')).toBeNull();
    });

    it('remove emits imageRemoved and moves the focus to the choose button', () => {
      buttons()[1].focus();
      buttons()[1].click();
      update();
      expect(host.removed).toBe(1);
      expect(buttons()).toHaveLength(1);
      expect(document.activeElement).toBe(buttons()[0]);
      expect(buttons()[0].textContent?.trim()).toBe('Choose image');
    });

    it('the inputs are documented with @default; the types are exported', () => {
      const source = readFileSync(resolve(__dirname, 'file-upload.component.ts'), 'utf8');
      for (const [name, value] of [
        ['variant', "'dropzone'"],
        ['imageSrc', "''"],
        ['imageAlt', "''"],
        ['imageBackground', "'surface'"],
        ['imageHint', "''"],
        ['chooseImageLabel', "'Choose image'"],
        ['replaceImageLabel', "'Replace image'"],
        ['removeImageLabel', "'Remove image'"],
        ['emptyImageLabel', "'No image'"],
        ['typeRejectedLabel', "'This file type is not accepted.'"],
        ['sizeRejectedLabel', "'This file is too large.'"],
      ]) {
        expect([name, new RegExp(`@default ${value.replace(/[.*()]/g, '\\$&')}\\s*\\n\\s*\\*/\\s*\\n\\s*readonly ${name} = input`).test(source)]).toEqual([name, true]);
      }
      expect(source).toMatch(/export type FileUploadVariant = 'dropzone' \| 'image';/);
      expect(source).toMatch(/export type FileUploadImageBackground = 'surface' \| 'light' \| 'dark' \| 'checkered';/);
    });
  });

  describe('AC-8: the ground to judge the image on', () => {
    it.each([
      ['surface', ''],
      ['light', 'lc-theme-light'],
      ['dark', 'lc-theme-dark'],
      ['checkered', ''],
    ] as const)('%s: tile class and theme scope', (ground, scope) => {
      host.ground.set(ground);
      update();
      expect(tile().classList.contains(`file-upload-image__tile--${ground}`)).toBe(true);
      expect(['lc-theme-light', 'lc-theme-dark'].filter((c) => tile().classList.contains(c))).toEqual(scope ? [scope] : []);
    });

    it('rules: tokens only; dark is the rail, the checks need an image; the image is contained', () => {
      const flat = COMPONENT_CSS.replace(/\s+/g, ' ');
      expect(flat).toContain('.file-upload-image__tile--dark { background-color: var(--color-sidebar); }');
      expect(flat).toContain(
        '.file-upload-image__tile--checkered:not(.file-upload-image__tile--empty) { background: repeating-conic-gradient(var(--color-neutral-300) 0 25%, var(--color-surface) 0 50%) 0 0/16px 16px; }',
      );
      expect(flat).toMatch(/\.file-upload-image__img \{ display: block; width: 100%; height: 100%; object-fit: contain; filter: var\(--lc-file-upload-image-filter, none\); pointer-events: none; \}/);
      expect(flat).toMatch(
        /\.file-upload-image__tile \{[^}]*width: var\(--lc-file-upload-image-width, 10rem\); height: var\(--lc-file-upload-image-height, 6rem\); max-width: 100%;[^}]*border-radius: var\(--lc-file-upload-image-radius, var\(--border-radius-md\)\);/,
      );
      const image = COMPONENT_CSS.slice(COMPONENT_CSS.indexOf('.file-upload-image {'));
      expect(image).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
    });

    it('imageAlt names the image; empty is decorative; the empty tile is dashed', () => {
      host.alt.set('Firmenlogo');
      update();
      expect(tile().querySelector('img')?.getAttribute('alt')).toBe('Firmenlogo');
      host.src.set('');
      update();
      expect(tile().classList.contains('file-upload-image__tile--empty')).toBe(true);
      expect(COMPONENT_CSS.replace(/\s+/g, ' ')).toContain('.file-upload-image__tile--empty { border-style: dashed; }');
    });

    it('a preview that fails to load shows the ground; a new imageSrc tries again', () => {
      tile().querySelector('img')?.dispatchEvent(new Event('error'));
      update();
      expect(tile().querySelector('img')?.classList.contains('file-upload-image__img--failed')).toBe(true);
      host.src.set(`${LOGO}#2`);
      update();
      expect(tile().querySelector('img')?.classList.contains('file-upload-image__img--failed')).toBe(false);
    });
  });

  describe('AC-9: checks as in the list mode; the rejection shown in place and announced', () => {
    it('size: fileRejected, the text with the max line in the alert, the image kept, no filesSelected', () => {
      drop(fileOf('gross.png', 204800, 'image/png'));
      expect(host.rejected.map((r) => r.code)).toEqual(['size']);
      expect(host.selected).toEqual([]);
      expect(alert().textContent).toBe('This file is too large. Max: 85.0 KB');
      expect(tile().querySelector('img')).not.toBeNull();
    });

    it('type (image/* by default): the type text; German size with locale', () => {
      drop(fileOf('liste.csv', 100, 'text/csv'));
      expect(host.rejected.map((r) => r.code)).toEqual(['type']);
      expect(alert().textContent).toBe('This file type is not accepted.');
      host.locale.set('de-DE');
      host.maxSizeLabel.set('Höchstens:');
      host.sizeRejectedLabel.set('Diese Datei ist zu groß.');
      update();
      drop(fileOf('gross.png', 204800, 'image/png'));
      expect(alert().textContent).toBe('Diese Datei ist zu groß. Höchstens: 85,0 KB');
    });

    it('the alert is always rendered (a live region before its text); an accepted file or remove clears it', () => {
      expect(alert().textContent).toBe('');
      drop(fileOf('gross.png', 204800, 'image/png'));
      drop(fileOf('klein.png', 2048, 'image/png'));
      expect(alert().textContent).toBe('');
      expect(host.selected).toHaveLength(1);
      drop(fileOf('gross.png', 204800, 'image/png'));
      buttons()[1].click();
      update();
      expect(alert().textContent).toBe('');
    });

    it('the same rejection again is cleared and set a frame later (announced again)', async () => {
      drop(fileOf('gross.png', 204800, 'image/png'));
      drop(fileOf('gross.png', 204800, 'image/png'));
      expect(alert().textContent).toBe('');
      await new Promise((r) => setTimeout(r, 30));
      update();
      expect(alert().textContent).toBe('This file is too large. Max: 85.0 KB');
      expect(host.rejected).toHaveLength(2);
    });

    it('disabled: both buttons disabled, drops ignored, the tile not dimmed', () => {
      host.disabled.set(true);
      update();
      expect(buttons().map((b) => b.disabled)).toEqual([true, true]);
      const open = jest.spyOn(input(), 'click').mockImplementation(() => undefined);
      buttons()[0].click();
      drop(fileOf('klein.png', 2048, 'image/png'));
      expect([open.mock.calls.length, host.selected.length]).toEqual([0, 0]);
      expect(COMPONENT_CSS.slice(COMPONENT_CSS.indexOf('.file-upload-image {'))).not.toMatch(/opacity/);
    });
  });

  describe('AC-10: drop on the tile, buttons, focus, names', () => {
    it('a drop on the tile is accepted; drag-over marks the tile', () => {
      const over = new Event('dragover', { bubbles: true, cancelable: true });
      tile().dispatchEvent(over);
      update();
      expect(tile().classList.contains('file-upload-image__tile--drag-over')).toBe(true);
      drop(fileOf('logo.svg', 900, 'image/svg+xml'));
      expect(tile().classList.contains('file-upload-image__tile--drag-over')).toBe(false);
      expect(host.selected[0][0].name).toBe('logo.svg');
    });

    it('the tile is no control (no role, no tab stop); the buttons are native, lg (48.5 px), outline and ghost', () => {
      expect([tile().getAttribute('role'), tile().getAttribute('tabindex')]).toEqual([null, null]);
      expect(buttons().map((b) => b.tagName)).toEqual(['BUTTON', 'BUTTON']);
      expect(buttons().map((b) => [b.classList.contains('btn-lg'), b.classList.contains('btn-outline') || b.classList.contains('btn-ghost')])).toEqual([
        [true, true],
        [true, true],
      ]);
      expect(buttons()[1].classList.contains('btn-ghost')).toBe(true);
    });

    it('the choose button is described by the hint, the max line and the alert (ids stable per instance)', () => {
      const ids = (buttons()[0].getAttribute('aria-describedby') ?? '').split(' ');
      expect(ids.map((id) => root().querySelector(`#${id}`)?.className)).toEqual(['file-upload__hint', 'file-upload__accept', 'file-upload-image__error']);
      expect(ids.every((id) => /^lc-file-upload-\d+-(hint|max|error)$/.test(id))).toBe(true);
      host.accept.set('.svg,.png');
      update();
      expect((buttons()[0].getAttribute('aria-describedby') ?? '').split(' ').map((id) => root().querySelector(`#${id}`)?.textContent)).toEqual([
        'SVG or PNG, at most 85 kB.',
        'Accepted: .svg,.png',
        'Max: 85.0 KB',
        '',
      ]);
    });

    describe('axe', () => {
      let restoreCanvas: () => void;
      beforeAll(() => {
        restoreCanvas = installFakeCanvas();
      });
      afterAll(() => restoreCanvas());

      it.each([
        ['filled', LOGO],
        ['empty', ''],
      ])('%s: no violations; the choose button is named by its label', async (_, src) => {
        host.src.set(src);
        update();
        await fixture.whenStable();
        expect(violations(await audit(root()))).toEqual([]);
        expect(computedName(root(), buttons()[0])).toBe(src ? 'Replace image' : 'Choose image');
      });
    });
  });

  describe('AC-11: every text is an input', () => {
    it('German labels', () => {
      const component = TestBed.createComponent(FileUploadComponent);
      for (const [k, v] of Object.entries({
        variant: 'image',
        imageSrc: LOGO,
        chooseImageLabel: 'Bild auswählen',
        replaceImageLabel: 'Bild ersetzen',
        removeImageLabel: 'Bild entfernen',
        emptyImageLabel: 'Kein Bild',
        typeRejectedLabel: 'Dieser Dateityp wird nicht akzeptiert.',
      })) {
        component.componentRef.setInput(k, v);
      }
      component.detectChanges();
      const el = component.nativeElement as HTMLElement;
      expect(Array.from(el.querySelectorAll('.file-upload-image__actions button')).map((b) => b.textContent?.trim())).toEqual(['Bild ersetzen', 'Bild entfernen']);
      component.componentRef.setInput('imageSrc', '');
      component.detectChanges();
      expect(el.querySelector('.file-upload-image__empty')?.textContent).toBe('Kein Bild');
      expect(el.querySelector('.file-upload-image__actions button')?.textContent?.trim()).toBe('Bild auswählen');
      component.destroy();
    });
  });
});
