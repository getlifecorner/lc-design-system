import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { resolve } from 'path';
import { compile } from 'sass';
import { FileUploadComponent } from './file-upload.component';

/**
 * Request 042 (F-21, design D-8): the 20 px remove button takes taps on a
 * 44 × 44 px `::before` without paint, gets the kit ring (Highlight in forced
 * colours) and a name per file: `removeFileAriaLabel` plus the file name.
 * The hit area itself is measured in the browser (`elementFromPoint`).
 */
const CSS = compile(resolve(__dirname, 'file-upload.component.scss')).css;

/** Declarations of the rule whose selector is exactly `selector` (outside @media unless `css` is a media body). */
function rule(selector: string, css = CSS): string {
  const at = css.search(new RegExp(`(^|\\n)\\s*${selector.replace(/[.*+?^${}()|[\]\\:]/g, '\\$&')} \\{`));
  expect([selector, at]).not.toEqual([selector, -1]);
  const open = css.indexOf('{', at);
  return css.slice(open + 1, css.indexOf('}', open)).trim().replace(/\s+/g, ' ');
}

function file(name: string, size = 12698): File {
  const f = new File(['x'], name, { type: 'text/csv' });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

describe('lc-file-upload remove target (3.27, request 042)', () => {
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadComponent],
      providers: [provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(FileUploadComponent);
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();
  });

  const drop = (...files: File[]) => {
    const event = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', { value: { files } });
    (fixture.nativeElement as HTMLElement).querySelector('.file-upload')?.dispatchEvent(event);
    fixture.detectChanges();
  };
  const names = () =>
    [...(fixture.nativeElement as HTMLElement).querySelectorAll('.file-upload__file-remove')].map((b) => b.getAttribute('aria-label'));

  it('AC-12: each remove button is named after its file (EN default)', () => {
    drop(file('bericht-2026.csv'), file('Kostenstellen-Übersicht-2026-final.xlsx'), file('a.txt'));
    expect(names()).toEqual([
      'Remove file bericht-2026.csv',
      'Remove file Kostenstellen-Übersicht-2026-final.xlsx',
      'Remove file a.txt',
    ]);
  });

  it('AC-12: removeFileAriaLabel localises the name (DE)', () => {
    fixture.componentRef.setInput('removeFileAriaLabel', 'Datei entfernen');
    drop(file('bericht-2026.csv'), file('a.txt'));
    expect(names()).toEqual(['Datei entfernen bericht-2026.csv', 'Datei entfernen a.txt']);
  });

  it('the second button still removes the second file, and the names follow the list', () => {
    drop(file('bericht-2026.csv'), file('b.csv'), file('a.txt'));
    ((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.file-upload__file-remove')[1]).click();
    fixture.detectChanges();
    expect(names()).toEqual(['Remove file bericht-2026.csv', 'Remove file a.txt']);
  });

  it('AC-11: the visible circle stays 20 px; a 44 px hit area without paint is centred on it', () => {
    const button = rule('.file-upload__file-remove');
    expect(button).toMatch(/position: relative;/);
    expect(button).toMatch(/width: 1\.25rem;\s*height: 1\.25rem;/);
    expect(button).toMatch(/border-radius: 50%;/);
    // At the token's 2.75rem the inset is (20 − 44) / 2 = −12 px on every side: 44 × 44.
    expect(rule('.file-upload__file-remove::before')).toBe(
      'content: ""; position: absolute; inset: calc((1.25rem - var(--size-min-touch-height, 2.75rem)) / 2);',
    );
  });

  it('AC-7: the hover look is unchanged', () => {
    expect(rule('.file-upload__file-remove:hover')).toBe('background: rgba(157, 14, 14, 0.18); color: var(--color-on-error-subtle);');
  });

  it('AC-3/AC-12: the ring is the kit ring, Highlight in forced colours, with no transition', () => {
    expect(rule('.file-upload__file-remove:focus-visible')).toBe('outline: 2px solid var(--color-primary-500); outline-offset: 2px;');
    const forced = CSS.slice(CSS.lastIndexOf('@media (forced-colors: active)'));
    expect(rule('.file-upload__file-remove:focus-visible', forced)).toBe('outline-color: Highlight;');
    expect(rule('.file-upload__file-remove')).not.toMatch(/transition/);
  });
});
