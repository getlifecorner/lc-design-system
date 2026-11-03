import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  computed,
  ElementRef,
  viewChild,
} from '@angular/core';
import { IconComponent, ɵprovideKitIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_FILE, ICON_X_MARK } from '@lifecorner/angular-ui-kit/icons';

export interface FileUploadFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

/** Why `lc-file-upload` rejected a file. */
export type FileUploadRejectionCode = 'size' | 'type';

/** Payload of `lc-file-upload`'s `fileRejected`. */
export interface FileUploadRejection {
  file: File;
  /** Fixed English text ("File type not accepted", "File too large"); translate from `code`. */
  reason: string;
  /** `'type'`: matches no `accept` token (checked first); `'size'`: over `maxSizeBytes`. */
  code: FileUploadRejectionCode;
}

/** RFC 9110 `token` (lower-cased): one MIME type or subtype, without parameters. */
const MIME_PART = "[!#$%&'*+.^_`|~0-9a-z-]+";
const MIME_TOKEN = new RegExp(`^${MIME_PART}/${MIME_PART}$`);

/**
 * Whether `token` is an `accept` token the check knows: `.ext`, `type/subtype`
 * or `type/*`. A MIME type with parameters (`text/csv;charset=utf-8`) is not
 * one, as for Chromium's picker.
 */
function isAcceptToken(token: string): boolean {
  return (token.length > 1 && token.startsWith('.')) || MIME_TOKEN.test(token);
}

/** Whether `file` matches one `accept` token (lower-cased). The any-type wildcard matches every file. */
function matchesToken(file: File, token: string): boolean {
  if (token.startsWith('.')) return (file.name || '').toLowerCase().endsWith(token);
  const type = (file.type || '').toLowerCase();
  if (token === '*/*') return true;
  if (token.endsWith('/*')) return type.startsWith(token.slice(0, -1));
  return type === token;
}

/**
 * File upload / dropzone component with drag & drop support.
 *
 * @example
 * ```html
 * <lc-file-upload
 *   accept=".pdf,.png,.jpg"
 *   [multiple]="true"
 *   [maxSizeBytes]="5242880"
 *   (filesSelected)="onFiles($event)"
 * ></lc-file-upload>
 * ```
 */
@Component({
  selector: 'lc-file-upload',
  standalone: true,
  imports: [IconComponent],
  viewProviders: [ɵprovideKitIcons([ICON_FILE, ICON_X_MARK])],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * File upload component with drag-and-drop support.
 *
 * Features:
 * - Drag-and-drop file dropzone with visual feedback
 * - Click-to-browse file selection
 * - File type and size validation, the same for picked and dropped files
 *   (3.24): type first (`accept`), then size (`maxSizeBytes`); a file that
 *   fails emits one `fileRejected` (`{ file, reason, code }`, `code` `'type'`
 *   or `'size'`), before `filesSelected`. The kit shows no rejection message:
 *   show your own, translated from `code`.
 * - Multi-file upload support. With `multiple=false` a new pick or drop
 *   replaces the selection with its first accepted file; if all its files
 *   are rejected, the selection is cleared and `filesSelected` emits `[]`.
 * - File list display with removal
 * - Sizes in the page's notation with `locale` (3.24, `'de-DE'`: "20,0 MB")
 * - Disabled state support
 *
 * @example
 * ```html
 * <lc-file-upload accept=".pdf,.jpg" [multiple]="true" [maxSizeBytes]="5242880" />
 * ```
 */
export class FileUploadComponent {
  /**
   * Accepted types, comma-separated, case-insensitive: extensions (`.csv`),
   * MIME types (`text/csv`), wildcards (`image/*`); `*\/*` accepts every type.
   * Since 3.24 checked for picked and dropped files alike; a file matching no
   * token is rejected with `code: 'type'`. Tokens that are neither, such as a
   * MIME type with parameters (`text/csv;charset=utf-8`), are ignored, as by
   * the browser's picker; none left = every type. Prefer extensions: systems report MIME
   * types differently (a CSV can arrive as `application/vnd.ms-excel`).
   * @default ''
   */
  accept = input<string>('');

  /**
   * Allow multiple files. `false`: one file. A new pick or drop replaces the
   * selection with its first accepted file; if all its files are rejected
   * (size or type), the selection is cleared and `filesSelected` emits `[]`.
   * `true`: accepted files are added to the selection.
   * @default false
   */
  multiple = input<boolean>(false);

  /**
   * Maximum file size in bytes. 0 for unlimited.
   * @default 0
   */
  maxSizeBytes = input<number>(0);

  /**
   * Whether the dropzone is disabled.
   * @default false
   */
  disabled = input<boolean>(false);

  /**
   * Hint text shown in the dropzone. The drop zone's accessible name is
   * `hint`, then the shown accepted and max lines, comma-separated (WCAG 2.5.3
   * Label in Name).
   * @default 'Drag & drop files here, or click to browse'
   */
  hint = input<string>('Drag & drop files here, or click to browse');

  /**
   * Prefix of the accepted file types line (`accept`). The shown line is part
   * of the drop zone's accessible name, after `hint`.
   * @default 'Accepted:'
   */
  acceptedLabel = input('Accepted:');

  /**
   * Prefix of the maximum file size line (`maxSizeBytes`). The shown line is
   * part of the drop zone's accessible name, after `hint`.
   * @default 'Max:'
   */
  maxSizeLabel = input('Max:');

  /** Accessible name of a selected file's remove button. */
  removeFileAriaLabel = input('Remove file');

  /**
   * BCP 47 locale of the shown sizes (max line, drop zone name, file list):
   * `'de-DE'` gives "20,0 MB". Units stay B/KB/MB (1024 base). Empty keeps
   * the built-in notation ("20.0 MB"); an invalid locale falls back to it.
   * @default ''
   */
  locale = input<string>('');

  /**
   * Emitted with selected files after validation.
   */
  readonly filesSelected = output<FileUploadFile[]>();

  /**
   * Emitted once per rejected file, before `filesSelected`. `code`: `'type'`
   * (matches no `accept` token; checked first) or `'size'` (over
   * `maxSizeBytes`). `reason` is a fixed English text ("File type not
   * accepted", "File too large"); translate from `code`.
   */
  readonly fileRejected = output<FileUploadRejection>();

  protected isDragOver = signal(false);
  protected selectedFiles = signal<FileUploadFile[]>([]);
  protected readonly fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected dropzoneClasses = computed(() => {
    return [
      'file-upload',
      this.isDragOver() ? 'file-upload--drag-over' : '',
      this.disabled() ? 'file-upload--disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');
  });

  /**
   * Name of the drop zone (AS-33, WCAG 2.5.3 Label in Name): `hint`, then the
   * accepted and max lines it shows, comma-separated.
   */
  protected readonly dropzoneAriaLabel = computed(() =>
    [
      this.hint(),
      this.accept() ? `${this.acceptedLabel()} ${this.accept()}` : '',
      this.maxSizeBytes() > 0 ? `${this.maxSizeLabel()} ${this.formatSize(this.maxSizeBytes())}` : '',
    ]
      .filter(Boolean)
      .join(', '),
  );

  /**
   * The size notation of `locale` (3.24): whole bytes, KB/MB to one decimal.
   * Null keeps the built-in `toFixed` notation (no or an invalid locale).
   */
  private readonly sizeFormats = computed(() => {
    const locale = this.locale();
    if (!locale) return null;
    try {
      return {
        whole: new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
        tenths: new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      };
    } catch {
      return null;
    }
  });

  /** The `accept` tokens the check knows, lower-cased; empty = every type. */
  private readonly acceptTokens = computed(() =>
    // `|| ''`: an untyped template may bind null, as it could before 3.24.
    (this.accept() || '')
      .split(',')
      .map((token) => token.trim().toLowerCase())
      .filter(isAcceptToken),
  );

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled()) {
      this.isDragOver.set(true);
    }
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    if (this.disabled() || !event.dataTransfer?.files.length) return;
    this.processFiles(event.dataTransfer.files);
  }

  protected onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.processFiles(input.files);
    }
    // Reset so the same file can be re-selected
    input.value = '';
  }

  protected openFilePicker(): void {
    if (!this.disabled()) {
      this.fileInputRef()?.nativeElement.click();
    }
  }

  /**
   * Enter or Space on the zone (3.25.2): no page scroll on Space, one open per
   * press (auto-repeat ignored).
   */
  protected onKeyActivate(event: Event): void {
    event.preventDefault();
    if (!(event as KeyboardEvent).repeat) {
      this.openFilePicker();
    }
  }

  protected removeFile(index: number): void {
    this.selectedFiles.update((files) => files.filter((_, i) => i !== index));
    this.filesSelected.emit(this.selectedFiles());
  }

  protected formatSize(bytes: number): string {
    const formats = this.sizeFormats();
    if (formats) {
      if (bytes < 1024) return `${formats.whole.format(bytes)} B`;
      if (bytes < 1024 * 1024) return `${formats.tenths.format(bytes / 1024)} KB`;
      return `${formats.tenths.format(bytes / (1024 * 1024))} MB`;
    }
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /** Why `file` is rejected: type first, then size; null when it is accepted. */
  private rejectionOf(file: File): FileUploadRejection | null {
    const tokens = this.acceptTokens();
    if (tokens.length && !tokens.some((token) => matchesToken(file, token))) {
      return { file, reason: 'File type not accepted', code: 'type' };
    }
    if (this.maxSizeBytes() > 0 && file.size > this.maxSizeBytes()) {
      return { file, reason: 'File too large', code: 'size' };
    }
    return null;
  }

  private processFiles(fileList: FileList): void {
    const files = Array.from(fileList);
    const accepted: FileUploadFile[] = [];

    for (const file of files) {
      const rejection = this.rejectionOf(file);
      if (rejection) {
        this.fileRejected.emit(rejection);
        continue;
      }
      accepted.push({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }

    if (this.multiple()) {
      this.selectedFiles.update((prev) => [...prev, ...accepted]);
    } else {
      this.selectedFiles.set(accepted.slice(0, 1));
    }

    this.filesSelected.emit(this.selectedFiles());
  }
}
