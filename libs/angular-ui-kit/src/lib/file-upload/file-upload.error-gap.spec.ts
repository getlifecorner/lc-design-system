import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { resolve } from 'path';
import { compile } from 'sass';
import { FileUploadComponent } from './file-upload.component';

/**
 * Request 071 (3.50, backlog 069-n1, AC-24): an image field without a
 * rejection adds no 8 px gap below its last line: the empty live region
 * takes the column gap back with a negative margin, and stays in the DOM
 * (`role="alert"` before its text). The measured gap is in build.md.
 */
@Component({
  imports: [FileUploadComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<lc-file-upload variant="image" imageHint="Erscheint oben in der Seitenleiste und auf Rechnungen." [maxSizeBytes]="87040" />`,
})
class HostComponent {}

describe('lc-file-upload image field: no gap under an empty rejection line (3.50)', () => {
  const css = '\n' + compile(resolve(__dirname, 'file-upload.component.scss')).css;
  const rule = (selector: string) => {
    const start = css.indexOf(`\n${selector} {`);
    expect([selector, start > -1]).toEqual([selector, true]);
    return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
  };

  it('the empty live region is in the DOM, last in the column, with no text (so :empty matches)', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withXhr())] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const column = fixture.nativeElement.querySelector('.file-upload-image') as HTMLElement;
    const error = column.lastElementChild as HTMLElement;
    expect(error.className).toBe('file-upload-image__error');
    expect(error.getAttribute('role')).toBe('alert');
    expect(error.textContent).toBe('');
    // Only zero-length text nodes: browsers count those as `:empty` (jsdom's
    // selector engine does not; the browser gap is measured on the stories).
    expect(Array.from(error.childNodes).every((n) => n.nodeType === Node.TEXT_NODE && (n as Text).data === '')).toBe(true);
  });

  it('CSS: the empty region takes back the 8 px column gap; the column gap and the region rule are unchanged', () => {
    expect(rule('.file-upload-image__error:empty')).toBe('margin-block-start: calc(-1 * var(--spacing-2));');
    expect(rule('.file-upload-image')).toBe('display: flex; flex-direction: column; gap: var(--spacing-2);');
    expect(rule('.file-upload-image__error')).toBe('margin: 0; font-size: var(--font-size-xs); color: var(--color-text-error);');
  });

  it('the forced-colours block is still the last one in the file', () => {
    expect(css.indexOf('.file-upload-image__error:empty')).toBeLessThan(css.lastIndexOf('@media (forced-colors: active)'));
  });
});
