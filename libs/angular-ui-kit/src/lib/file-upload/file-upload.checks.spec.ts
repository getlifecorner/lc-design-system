import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import {
  FileUploadComponent,
  FileUploadFile,
  FileUploadRejection,
  FileUploadRejectionCode,
} from './file-upload.component';

/**
 * Request 037 (3.24, quellen row 2): `fileRejected` carries a `code`, `accept`
 * is checked for dropped and picked files alike (type first, then size), and
 * `locale` writes the sizes in the page's notation (design 037 §2).
 */
@Component({
  standalone: true,
  imports: [FileUploadComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-file-upload
      [accept]="accept()"
      [multiple]="multiple()"
      [maxSizeBytes]="maxSizeBytes()"
      [locale]="locale()"
      [maxSizeLabel]="maxSizeLabel()"
      (filesSelected)="events.push({ selected: $event })"
      (fileRejected)="events.push({ rejected: $event })"
    />
  `,
})
class HostComponent {
  readonly accept = signal('');
  readonly multiple = signal(false);
  readonly maxSizeBytes = signal(0);
  readonly locale = signal('');
  readonly maxSizeLabel = signal('Max:');
  readonly events: Array<{ selected?: FileUploadFile[]; rejected?: FileUploadRejection }> = [];
}

/** A file of `size` bytes without allocating them. */
function file(name: string, size = 10, type = ''): File {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

const MB20 = 20971520;

describe('lc-file-upload checks and locale (3.24, request 037)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
  });

  const zone = () => fixture.nativeElement.querySelector('.file-upload') as HTMLElement;
  /** jsdom has no DragEvent: a plain `drop` event with a `dataTransfer`. */
  const drop = (...files: File[]) => {
    const event = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', { value: { files } });
    zone().dispatchEvent(event);
    fixture.detectChanges();
  };
  const pick = (...files: File[]) => {
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  };
  const rejections = () => host.events.filter((e) => e.rejected).map((e) => e.rejected as FileUploadRejection);
  const lastSelected = () => [...host.events].reverse().find((e) => e.selected)?.selected?.map((f) => f.name);
  const shownNames = () =>
    [...fixture.nativeElement.querySelectorAll('.file-upload__file-name')].map((n) => (n as HTMLElement).textContent);
  const lines = () =>
    [...fixture.nativeElement.querySelectorAll('.file-upload__accept')].map((p) => (p as HTMLElement).textContent?.trim());
  const sizes = () =>
    [...fixture.nativeElement.querySelectorAll('.file-upload__file-size')].map((n) => (n as HTMLElement).textContent);

  describe('AC-6: the rejection code', () => {
    it('rejects a 25 MB file over 20 MB with code size and the unchanged reason', () => {
      host.maxSizeBytes.set(MB20);
      fixture.detectChanges();
      const big = file('ist.csv', 25 * 1024 * 1024, 'text/csv');
      drop(big);
      expect(rejections()).toEqual([{ file: big, reason: 'File too large', code: 'size' }]);
      expect(lastSelected()).toEqual([]);
    });

    it('stays assignable to the 3.23 payload { file; reason }', () => {
      const code: FileUploadRejectionCode = 'type';
      const old: { file: File; reason: string } = { file: file('a'), reason: 'x', code } as FileUploadRejection;
      expect(old.reason).toBe('x');
    });
  });

  describe('AC-7: accept, for dropped and picked files', () => {
    it('rejects a dropped liste.xlsx on .csv with code type and selects nothing', () => {
      host.accept.set('.csv');
      fixture.detectChanges();
      const xlsx = file('liste.xlsx', 10, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      drop(xlsx);
      expect(rejections()).toEqual([{ file: xlsx, reason: 'File type not accepted', code: 'type' }]);
      expect(lastSelected()).toEqual([]);
      expect(fixture.nativeElement.querySelector('.file-upload__list')).toBeNull();
    });

    it.each(['ist.csv', 'IST.CSV'])('selects a dropped %s on .csv', (name) => {
      host.accept.set('.csv');
      fixture.detectChanges();
      drop(file(name));
      expect(rejections()).toEqual([]);
      expect(lastSelected()).toEqual([name]);
      expect(shownNames()).toEqual([name]);
    });

    it.each<[string, string, string, FileUploadRejectionCode | null]>([
      ['text/csv', 'ist.csv', 'text/csv', null],
      ['text/csv', 'ist.csv', 'TEXT/CSV', null],
      ['text/csv', 'ist.csv', 'application/vnd.ms-excel', 'type'],
      ['text/csv', 'ist.csv', '', 'type'],
      ['image/*', 'foto.png', 'image/png', null],
      ['image/*', 'scan.pdf', 'application/pdf', 'type'],
      [' .PDF , image/* ', 'Scan.pdf', 'application/pdf', null],
      [' .PDF , image/* ', 'foto.jpg', 'image/jpeg', null],
      [' .PDF , image/* ', 'liste.csv', 'text/csv', 'type'],
      ['.csv,text/csv', 'ist.txt', 'text/csv', null],
      // The any-type wildcard accepts every file, as the browser's picker does.
      ['*/*', 'liste.xlsx', '', null],
      // A MIME type with parameters is no token (RFC 9110 tchar only), as for Chromium's picker (C-3).
      ['text/csv;charset=utf-8', 'liste.xlsx', '', null],
      ['text/csv; charset=utf-8', 'liste.xlsx', '', null],
      ['.csv,text/csv;charset=utf-8', 'liste.xlsx', 'text/csv', 'type'],
      ['.csv,text/csv;charset=utf-8', 'ist.csv', 'application/vnd.ms-excel', null],
    ])('accept "%s": %s (%s) → %s', (accept, name, type, code) => {
      host.accept.set(accept);
      fixture.detectChanges();
      drop(file(name, 10, type));
      expect(rejections().map((r) => r.code)).toEqual(code ? [code] : []);
      expect(lastSelected()).toEqual(code ? [] : [name]);
    });

    it('checks a picked file the same way (e.g. the picker\'s "All files" choice)', () => {
      host.accept.set('.csv');
      fixture.detectChanges();
      pick(file('liste.xlsx'));
      expect(rejections().map((r) => r.code)).toEqual(['type']);
      pick(file('ist.csv'));
      expect(lastSelected()).toEqual(['ist.csv']);
    });

    it('rejects each wrong file of a multiple drop and adds the rest', () => {
      host.accept.set('.csv');
      host.multiple.set(true);
      fixture.detectChanges();
      drop(file('a.csv'), file('b.xlsx'), file('c.CSV'));
      expect(rejections().map((r) => r.file.name)).toEqual(['b.xlsx']);
      expect(lastSelected()).toEqual(['a.csv', 'c.CSV']);
    });

    it('emits fileRejected before filesSelected', () => {
      host.accept.set('.csv');
      fixture.detectChanges();
      drop(file('liste.xlsx'));
      expect(host.events.map((e) => Object.keys(e)[0])).toEqual(['rejected', 'selected']);
    });
  });

  describe('AC-8: one rejection per file, type first', () => {
    it('rejects a 25 MB xlsx on .csv / 20 MB once, with code type', () => {
      host.accept.set('.csv');
      host.maxSizeBytes.set(MB20);
      fixture.detectChanges();
      drop(file('liste.xlsx', 25 * 1024 * 1024));
      expect(rejections().map((r) => r.code)).toEqual(['type']);
    });

    it.each(['', 'csv', ' , ', 'text'])('accepts every type with accept "%s" (no valid token)', (accept) => {
      host.accept.set(accept);
      fixture.detectChanges();
      drop(file('liste.xlsx', 10, 'application/vnd.ms-excel'));
      expect(rejections()).toEqual([]);
      expect(lastSelected()).toEqual(['liste.xlsx']);
    });
  });

  describe('AC-13: one file (multiple=false)', () => {
    it('replaces the selection with the next pick or drop', () => {
      fixture.detectChanges();
      drop(file('erste.csv'));
      pick(file('zweite.csv'), file('dritte.csv'));
      expect(lastSelected()).toEqual(['zweite.csv']);
      expect(shownNames()).toEqual(['zweite.csv']);
    });

    it.each<[string, () => void]>([
      ['size', () => drop(file('gross.csv', MB20 + 1))],
      ['type', () => drop(file('liste.xlsx'))],
    ])('clears the selection when the only file is rejected for %s', (_, act) => {
      host.accept.set('.csv');
      host.maxSizeBytes.set(MB20);
      fixture.detectChanges();
      drop(file('ist.csv'));
      expect(shownNames()).toEqual(['ist.csv']);
      act();
      expect(lastSelected()).toEqual([]);
      expect(shownNames()).toEqual([]);
    });
  });

  describe('AC-9, AC-10: locale', () => {
    it('writes the max line, the zone name and the list in de-DE', () => {
      host.maxSizeBytes.set(MB20);
      host.locale.set('de-DE');
      fixture.detectChanges();
      expect(lines()).toEqual(['Max: 20,0 MB']);
      expect(zone().getAttribute('aria-label')?.endsWith(', Max: 20,0 MB')).toBe(true);
      host.maxSizeLabel.set('Höchstens:');
      host.multiple.set(true);
      fixture.detectChanges();
      expect(lines()).toEqual(['Höchstens: 20,0 MB']);
      expect(zone().getAttribute('aria-label')?.endsWith(', Höchstens: 20,0 MB')).toBe(true);
      drop(file('ist.csv', 9830), file('klein.csv', 512), file('mittel.csv', 1048475));
      expect(sizes()).toEqual(['9,6 KB', '512 B', '1.023,9 KB']);
    });

    it.each(['de_DE', 'not a locale!'])('falls back to the built-in notation for "%s" without throwing', (locale) => {
      host.maxSizeBytes.set(MB20);
      host.locale.set(locale);
      expect(() => fixture.detectChanges()).not.toThrow();
      expect(lines()).toEqual(['Max: 20.0 MB']);
    });
  });

  describe('AC-11: defaults unchanged', () => {
    it('keeps the toFixed notation without locale', () => {
      host.maxSizeBytes.set(MB20);
      host.multiple.set(true);
      fixture.detectChanges();
      expect(lines()).toEqual(['Max: 20.0 MB']);
      expect(zone().getAttribute('aria-label')).toBe('Drag & drop files here, or click to browse, Max: 20.0 MB');
      drop(file('ist.csv', 9830), file('klein.csv', 512), file('mittel.csv', 1048475));
      expect(sizes()).toEqual(['9.6 KB', '512 B', '1023.9 KB']);
    });

    it('accepts every dropped type without accept, as before', () => {
      fixture.detectChanges();
      drop(file('liste.xlsx', 10, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
      expect(rejections()).toEqual([]);
      expect(lastSelected()).toEqual(['liste.xlsx']);
    });
  });
});
