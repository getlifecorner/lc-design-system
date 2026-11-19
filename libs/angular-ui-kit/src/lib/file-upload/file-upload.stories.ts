import type { Meta, StoryObj } from '@storybook/angular';
import { signal } from '@angular/core';
import { FileUploadComponent } from './file-upload.component';

const meta: Meta<FileUploadComponent> = {
  title: 'Form/File Upload',
  component: FileUploadComponent,
  parameters: {
    docs: {
      description: {
        component: `
Drag & drop file upload component.

**Key Features:**
- Drag & drop zone with visual feedback
- Click to browse fallback
- File type restrictions via \`accept\`, checked for picked and dropped files alike (3.24)
- Max file size validation
- Multiple file support
- File list with remove buttons
- One control: Tab reaches the zone (one tab stop); Enter or Space opens the file picker, so does a click anywhere in the zone, or drop files on it. The native file input sits hidden beside the zone, not inside it (3.25.2).
- Sizes in the page's notation with \`locale\` (3.24: \`locale="de-DE"\` → "20,0 MB")

**Checks and \`fileRejected\` (3.24):** each picked or dropped file is checked for its
type first (\`accept\`: extensions such as \`.csv\`, MIME types such as \`text/csv\`,
wildcards such as \`image/*\`; case-insensitive), then for its size (\`maxSizeBytes\`).
A file that fails emits one \`fileRejected\` with \`{ file, reason, code }\`, before
\`filesSelected\`: \`code\` is \`'type'\` or \`'size'\`, \`reason\` a fixed English text
("File type not accepted", "File too large"). The kit shows no rejection message:
show your own, translated from \`code\`.

**One file (\`multiple=false\`):** a new pick or drop replaces the selection with its
first accepted file. If all its files are rejected (size or type), the selection is
cleared and \`filesSelected\` emits \`[]\`.

**One image (\`variant="image"\`, 3.49, usm-x row 71):** a preview tile with the current image
(\`imageSrc\`) on a ground to judge it on (\`imageBackground\`: \`surface\`, \`light\`, \`dark\`,
\`checkered\`), a choose button („Replace image“ once there is one) and a remove button
(\`imageRemoved\`). A picked or dropped file is checked as above and emitted as \`[file]\`; the app
shows it by setting \`imageSrc\`. A rejected file is shown under the field and announced. See
*Image*, *Image Backgrounds*, *Image German*, *Image Rejected German*.
        `,
      },
    },
  },
  argTypes: {
    accept: {
      control: 'text',
      description:
        'Accepted types, comma-separated, case-insensitive: extensions (`.csv`), MIME types (`text/csv`), wildcards (`image/*`). Since 3.24 checked for picked and dropped files alike; a file matching no token is rejected with `code: \'type\'`. Prefer extensions: systems report MIME types differently. 3.49: empty means `image/*` in `variant="image"`.',
      table: { defaultValue: { summary: "''" } },
    },
    multiple: {
      control: 'boolean',
      description:
        'Allow multiple files. `false`: a new pick or drop replaces the selection with its first accepted file; if all its files are rejected, the selection is cleared. 3.49: ignored in `variant="image"` (one file).',
      table: { defaultValue: { summary: 'false' } },
    },
    variant: {
      control: 'inline-radio',
      options: ['dropzone', 'image'],
      description:
        '3.49 (usm-x row 71): `image` shows one image field (preview tile, choose/replace, remove) instead of the drop zone and its list. A file is checked as in the drop zone and emitted as `[file]`; a rejected one is shown under the field and announced.',
      table: { defaultValue: { summary: "'dropzone'" } },
    },
    imageSrc: {
      control: 'text',
      description: '3.49: the current image (URL, object URL, data URI) in `variant="image"`. Empty: the empty tile and „Choose image“. The kit never stores or uploads.',
      table: { defaultValue: { summary: "''" } },
    },
    imageAlt: {
      control: 'text',
      description: '3.49: alt text of the preview; empty = decorative (`alt=""`).',
      table: { defaultValue: { summary: "''" } },
    },
    imageBackground: {
      control: 'inline-radio',
      options: ['surface', 'light', 'dark', 'checkered'],
      description:
        '3.49: ground of the preview: `surface` (page theme), `light`, `dark` (the dark rail, `--color-sidebar`, in both themes), `checkered` (transparency, with an image only).',
      table: { defaultValue: { summary: "'surface'" } },
    },
    imageHint: {
      control: 'text',
      description: '3.49: line under the image field (the drop zone keeps `hint`); with the accepted and max lines it describes the choose button.',
      table: { defaultValue: { summary: "''" } },
    },
    chooseImageLabel: {
      control: 'text',
      description: '3.49: choose button without an image. German: „Bild auswählen“.',
      table: { defaultValue: { summary: "'Choose image'" } },
    },
    replaceImageLabel: {
      control: 'text',
      description: '3.49: choose button with an image. German: „Bild ersetzen“.',
      table: { defaultValue: { summary: "'Replace image'" } },
    },
    removeImageLabel: {
      control: 'text',
      description: '3.49: remove button (with an image). German: „Bild entfernen“.',
      table: { defaultValue: { summary: "'Remove image'" } },
    },
    emptyImageLabel: {
      control: 'text',
      description: '3.49: text of the empty tile. German: „Kein Bild“.',
      table: { defaultValue: { summary: "'No image'" } },
    },
    typeRejectedLabel: {
      control: 'text',
      description: '3.49: shown and announced under the image field for a file of another type. German: „Dieser Dateityp wird nicht akzeptiert.“',
      table: { defaultValue: { summary: "'This file type is not accepted.'" } },
    },
    sizeRejectedLabel: {
      control: 'text',
      description: '3.49: shown and announced for a file that is too large, followed by `maxSizeLabel` and the size. German: „Diese Datei ist zu groß.“',
      table: { defaultValue: { summary: "'This file is too large.'" } },
    },
    imageRemoved: {
      action: 'imageRemoved',
      description: '3.49: the remove button was pressed; the app clears `imageSrc`. The focus moves to the choose button.',
      table: { defaultValue: { summary: '—' } },
    },
    maxSizeBytes: {
      control: 'number',
      description: 'Max file size (bytes), 0 = unlimited. A larger file is rejected with `code: \'size\'`.',
      table: { defaultValue: { summary: '0' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the drop zone: dimmed, out of the tab order, aria-disabled="true"',
      table: { defaultValue: { summary: 'false' } },
    },
    hint: {
      control: 'text',
      description: 'Hint text shown in the drop zone; starts its accessible name',
      table: { defaultValue: { summary: 'Drag & drop files here, or click to browse' } },
    },
    locale: {
      control: 'text',
      description:
        '3.24: BCP 47 locale of the shown sizes (max line, drop zone name, file list): `de-DE` gives "20,0 MB". Units stay B/KB/MB (1024 base). Empty keeps the built-in notation ("20.0 MB"); an invalid locale falls back to it.',
      table: { defaultValue: { summary: "''" } },
    },
  },
};

export default meta;
type Story = StoryObj<FileUploadComponent>;

export const Default: Story = {
  args: {
    hint: 'Drag & drop files here, or click to browse',
    multiple: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'No restrictions: every file is accepted. With `multiple=false` a second pick or drop replaces the first file. Listen to `filesSelected` for the current selection.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<lc-file-upload [hint]="hint" [multiple]="multiple" />`,
  }),
};

export const WithRestrictions: Story = {
  args: {
    accept: '.pdf,.png,.jpg,.jpeg',
    maxSizeBytes: 5 * 1024 * 1024,
    multiple: true,
    hint: 'Upload your documents (PDF, PNG, JPG)',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Types and size: `accept` lists the extensions, `maxSizeBytes` the limit (5 MB). The zone shows both lines and reads them in its name. Each file of another type is rejected with `code: \'type\'`, each larger one with `code: \'size\'`; with `multiple=true` the accepted files are added to the list.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<lc-file-upload [accept]="accept" [maxSizeBytes]="maxSizeBytes" [multiple]="multiple" [hint]="hint" />`,
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    hint: 'Upload disabled',
  },
  parameters: {
    docs: {
      description: {
        story: '`disabled`: the zone is dimmed, leaves the tab order, ignores clicks, keys and drops, and reports `aria-disabled="true"`.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<lc-file-upload [disabled]="disabled" [hint]="hint" />`,
  }),
};

export const SingleFile: Story = {
  args: {
    multiple: false,
    accept: 'image/*',
    hint: 'Upload a profile picture',
  },
  parameters: {
    docs: {
      description: {
        story:
          'One file (`multiple=false`) of one kind (`accept="image/*"`). A new pick or drop replaces the selected file with its first accepted file. If all its files are rejected (size or type), the selection is cleared and `filesSelected` emits `[]`; `fileRejected` has fired before, once per file, with `code` `\'type\'` or `\'size\'`.',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<lc-file-upload [multiple]="multiple" [accept]="accept" [hint]="hint" />`,
  }),
};

/**
 * Drops `files` on the story's drop zone, as a browser does (story-shots does
 * not wait for it; the review polls the status line).
 */
function dropOn(canvasElement: HTMLElement, files: File[]): void {
  const zone = canvasElement.querySelector('.file-upload');
  const event = new Event('drop', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { files } });
  zone?.dispatchEvent(event);
}

/** A file of `size` bytes without allocating them. */
function fileOf(name: string, size: number, type: string): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

export const TypeRejectedOnDrop: Story = {
  name: 'Type Rejected On Drop',
  parameters: {
    docs: {
      description: {
        story:
          '3.24: `accept=".csv"` is checked for dropped files too. The story drops `liste.xlsx`: `fileRejected` emits `{ file, reason: "File type not accepted", code: "type" }` and nothing is selected. The page shows its own message, chosen by `code`, in a `role="status"` line (rendered empty at load).',
      },
    },
  },
  render: () => ({
    props: { status: signal('') },
    template: `
      <div style="max-width: 480px;">
        <lc-file-upload
          accept=".csv"
          [multiple]="false"
          [maxSizeBytes]="20971520"
          hint="Drop a CSV file here, or click to browse"
          (filesSelected)="$event.length && status.set('')"
          (fileRejected)="status.set($event.code === 'type' ? $event.file.name + ' is not a CSV file.' : $event.file.name + ' is larger than 20.0 MB.')"
        />
        <p role="status" style="margin: var(--spacing-2) 0 0; font-size: 0.875rem; color: var(--color-text-error);">{{ status() }}</p>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    dropOn(canvasElement, [fileOf('liste.xlsx', 18432, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')]);
  },
};

export const SizeRejected: Story = {
  name: 'Size Rejected',
  parameters: {
    docs: {
      description: {
        story:
          'The story drops `ist.csv` of 25 MB on a 20 MB limit: the type passes, the size does not, so `fileRejected` emits `code: "size"` (`reason` "File too large") and nothing is selected. Type is checked first, so a file failing both reports `code: "type"` once.',
      },
    },
  },
  render: () => ({
    props: { status: signal('') },
    template: `
      <div style="max-width: 480px;">
        <lc-file-upload
          accept=".csv"
          [multiple]="false"
          [maxSizeBytes]="20971520"
          hint="Drop a CSV file here, or click to browse"
          (filesSelected)="$event.length && status.set('')"
          (fileRejected)="status.set($event.code === 'type' ? $event.file.name + ' is not a CSV file.' : $event.file.name + ' is larger than 20.0 MB.')"
        />
        <p role="status" style="margin: var(--spacing-2) 0 0; font-size: 0.875rem; color: var(--color-text-error);">{{ status() }}</p>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    dropOn(canvasElement, [fileOf('ist.csv', 26214400, 'text/csv')]);
  },
};

export const GermanLocale: Story = {
  name: 'German Locale',
  parameters: {
    docs: {
      description: {
        story:
          '3.24: `locale="de-DE"` writes the sizes in German notation: the max line reads "Höchstens: 20,0 MB" (so does the zone\'s name), the list "9,6 KB". The units stay B/KB/MB. All labels are inputs; the status line shows the page\'s own German messages by `code`. The story drops `ist.csv` of 9 830 bytes.',
      },
    },
  },
  render: () => ({
    props: { status: signal('') },
    template: `
      <div lang="de" style="max-width: 480px;">
        <lc-file-upload
          accept=".csv"
          [multiple]="false"
          [maxSizeBytes]="20971520"
          locale="de-DE"
          hint="CSV-Datei hierher ziehen oder zum Auswählen klicken"
          acceptedLabel="Erlaubt:"
          maxSizeLabel="Höchstens:"
          removeFileAriaLabel="Datei entfernen"
          (filesSelected)="$event.length && status.set('')"
          (fileRejected)="status.set($event.code === 'type' ? '„' + $event.file.name + '“ ist keine CSV-Datei.' : '„' + $event.file.name + '“ ist größer als 20,0 MB.')"
        />
        <p role="status" style="margin: var(--spacing-2) 0 0; font-size: 0.875rem; color: var(--color-text-error);">{{ status() }}</p>
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    dropOn(canvasElement, [fileOf('ist.csv', 9830, 'text/csv')]);
  },
};

export const RemoveTargets: Story = {
  name: 'Remove Targets',
  parameters: {
    docs: {
      description: {
        story:
          '3.27 (request 042, F-21): each remove button keeps its 20 px circle but takes taps on a 44 × 44 px area centred on it (WCAG 2.5.8); the rows stay 42 px high and the areas of neighbouring rows don\'t overlap. Each button is named after its file: `removeFileAriaLabel` plus the file name ("Remove file bericht-2026.csv"). The story drops three files and focuses the second remove button as Tab would (in the story view): the kit ring, 2 px `--color-primary-500`, 2 px outside (4.17:1 light, 7.57:1 dark on the row), `Highlight` in forced colours.',
      },
    },
  },
  render: () => ({
    template: `<div style="max-width: 480px;"><lc-file-upload [multiple]="true" /></div>`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    dropOn(canvasElement, [
      fileOf('bericht-2026.csv', 12698, 'text/csv'),
      fileOf('Kostenstellen-Übersicht-2026-final.xlsx', 48230, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
      fileOf('a.txt', 120, 'text/plain'),
    ]);
    if (viewMode !== 'story') return;
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvasElement.querySelectorAll<HTMLElement>('.file-upload__file-remove')[1]?.focus({ preventScroll: true });
  },
};

/** 3.49: a stand-in logo (3:1, transparent around the shapes), as an inline SVG data URI. */
const LOGO =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect x="2" y="6" width="28" height="28" rx="7" fill="#3b6588"/><path d="M10 13v14h12" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="38" y="11" width="78" height="8" rx="4" fill="#1f2a37"/><rect x="38" y="24" width="54" height="6" rx="3" fill="#8a96a3"/></svg>',
  );

/** 3.49: the story's stand-in for the app: an object URL of the chosen file, shown as `imageSrc`. */
function urlOf(files: { file: File }[]): string {
  return files[0] ? URL.createObjectURL(files[0].file) : '';
}

/** 3.49: drops `files` on the image field's tile, as a browser does. */
function dropOnTile(canvasElement: HTMLElement, files: File[]): void {
  const tile = canvasElement.querySelector('.file-upload-image__tile');
  const event = new Event('drop', { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'dataTransfer', { value: { files } });
  tile?.dispatchEvent(event);
}

/** 3.49 (request 069, usm-x row 71): one image field, every new input on the controls. */
export const Image: Story = {
  args: {
    variant: 'image',
    imageSrc: LOGO,
    imageAlt: 'Company logo',
    imageBackground: 'surface',
    imageHint: 'SVG or PNG, at most 85 kB.',
    chooseImageLabel: 'Choose image',
    replaceImageLabel: 'Replace image',
    removeImageLabel: 'Remove image',
    emptyImageLabel: 'No image',
    typeRejectedLabel: 'This file type is not accepted.',
    sizeRejectedLabel: 'This file is too large.',
    accept: '',
    maxSizeBytes: 87040,
    disabled: false,
    locale: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          '3.49 (request 069, usm-x row 71, the logo in the settings): `variant="image"` shows the current image (`imageSrc`) in a 160 × 96 tile (`--lc-file-upload-image-width` / `-height`, `--lc-file-upload-image-radius`), `object-fit: contain` on the chosen ground, with „Replace image“ (outline, 48.5 px) and „Remove image“ (ghost) beside it; at 360 px they wrap under the tile. Choose opens the hidden native input (`accept` empty = `image/*`); a drop on the tile works too. The story plays the app: a chosen file is shown as an object URL, remove clears it (the focus moves to the choose button). The hint, accepted and max lines and the rejection describe the choose button. The kit never stores or uploads.',
      },
    },
  },
  render: (args) => ({
    props: { ...args, urlOf },
    template: `
      <div style="max-width: 480px;">
        <lc-file-upload
          [variant]="variant"
          [imageSrc]="imageSrc"
          [imageAlt]="imageAlt"
          [imageBackground]="imageBackground"
          [imageHint]="imageHint"
          [chooseImageLabel]="chooseImageLabel"
          [replaceImageLabel]="replaceImageLabel"
          [removeImageLabel]="removeImageLabel"
          [emptyImageLabel]="emptyImageLabel"
          [typeRejectedLabel]="typeRejectedLabel"
          [sizeRejectedLabel]="sizeRejectedLabel"
          [accept]="accept"
          [maxSizeBytes]="maxSizeBytes"
          [disabled]="disabled"
          [locale]="locale"
          (filesSelected)="imageSrc = urlOf($event)"
          (imageRemoved)="imageSrc = ''"
        />
      </div>`,
  }),
};

/** 3.49: the four grounds, and the dark rail's white silhouette through the filter hook. */
export const ImageBackgrounds: Story = {
  name: 'Image Backgrounds',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.49 (request 069, usm-x row 71): `imageBackground` sets the ground to judge the logo on, with tokens only: `surface` (the page theme\'s surface), `light` (white in both themes, a `.lc-theme-light` scope), `dark` (the dark rail, `--color-sidebar` #070e15 in both themes, a `.lc-theme-dark` scope whose border marks the edge on a dark page) and `checkered` (transparency checks in `--color-neutral-300` and the surface; the empty tile shows the surface). The last field shows the rail\'s white silhouette with `--lc-file-upload-image-filter: brightness(0) invert(1)`.',
      },
    },
  },
  render: () => ({
    props: { logo: LOGO },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr)); gap: 24px;">
        <div>
          <p style="margin: 0 0 8px; font-size: 0.75rem; color: var(--color-text-secondary);">surface</p>
          <lc-file-upload variant="image" [imageSrc]="logo" imageBackground="surface" />
        </div>
        <div>
          <p style="margin: 0 0 8px; font-size: 0.75rem; color: var(--color-text-secondary);">light</p>
          <lc-file-upload variant="image" [imageSrc]="logo" imageBackground="light" />
        </div>
        <div>
          <p style="margin: 0 0 8px; font-size: 0.75rem; color: var(--color-text-secondary);">dark</p>
          <lc-file-upload variant="image" [imageSrc]="logo" imageBackground="dark" />
        </div>
        <div>
          <p style="margin: 0 0 8px; font-size: 0.75rem; color: var(--color-text-secondary);">checkered</p>
          <lc-file-upload variant="image" [imageSrc]="logo" imageBackground="checkered" />
        </div>
        <div>
          <p style="margin: 0 0 8px; font-size: 0.75rem; color: var(--color-text-secondary);">dark + --lc-file-upload-image-filter: brightness(0) invert(1)</p>
          <lc-file-upload variant="image" [imageSrc]="logo" imageBackground="dark" style="--lc-file-upload-image-filter: brightness(0) invert(1);" />
        </div>
      </div>`,
  }),
};

/** The German labels of the image field (design §7). */
const IMAGE_DE = `
  imageHint="SVG oder PNG, höchstens 85 kB."
  accept=".svg,.png"
  [maxSizeBytes]="87040"
  locale="de-DE"
  acceptedLabel="Erlaubt:"
  maxSizeLabel="Höchstens:"
  chooseImageLabel="Bild auswählen"
  replaceImageLabel="Bild ersetzen"
  removeImageLabel="Bild entfernen"
  emptyImageLabel="Kein Bild"
  typeRejectedLabel="Dieser Dateityp wird nicht akzeptiert."
  sizeRejectedLabel="Diese Datei ist zu groß."`;

/** 3.49: German labels, empty and filled. */
export const ImageGerman: Story = {
  name: 'Image German',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.49 (request 069, usm-x row 71): every text is an input; German at 360 px fits without clipping: „Bild auswählen“ (175.7 px), „Bild ersetzen“, „Bild entfernen“, „Kein Bild“. Empty field first (dashed tile, only „Bild auswählen“), then a filled one (`imageAlt="Firmenlogo"`). `accept=".svg,.png"`, `maxSizeBytes=87040` and `locale="de-DE"` give „Erlaubt: .svg,.png“ and „Höchstens: 85,0 KB“; with `imageHint` they describe the choose button.',
      },
    },
  },
  render: () => ({
    props: { empty: signal(''), filled: signal(LOGO), urlOf },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 32px; max-width: 480px;">
        <lc-file-upload variant="image" [imageSrc]="empty()" ${IMAGE_DE}
          (filesSelected)="empty.set(urlOf($event))" (imageRemoved)="empty.set('')" />
        <lc-file-upload variant="image" [imageSrc]="filled()" imageAlt="Firmenlogo" ${IMAGE_DE}
          (filesSelected)="filled.set(urlOf($event))" (imageRemoved)="filled.set('')" />
      </div>`,
  }),
};

/** 3.49: a rejected file, shown in place and announced; a disabled field beside. */
export const ImageRejectedGerman: Story = {
  name: 'Image Rejected German',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.49 (request 069, usm-x row 71): the story drops `logo-gross.png` (200 KB, `image/png`) on the tile of an 85 KB field. `fileRejected` emits `code: "size"`, the image stays, `filesSelected` is not emitted, and „Diese Datei ist zu groß. Höchstens: 85,0 KB“ appears under the field in `--color-text-error` (`role="alert"`, announced; cleared by an accepted file or remove; the same rejection again is announced again). Beside it a `disabled` field: both buttons disabled, drops ignored, the tile not dimmed so the image stays judgeable.',
      },
    },
  },
  render: () => ({
    props: { filled: signal(LOGO), logo: LOGO, urlOf },
    template: `
      <div lang="de" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr)); gap: 32px;">
        <lc-file-upload variant="image" [imageSrc]="filled()" imageAlt="Firmenlogo" ${IMAGE_DE}
          (filesSelected)="filled.set(urlOf($event))" (imageRemoved)="filled.set('')" />
        <lc-file-upload variant="image" [imageSrc]="logo" imageAlt="Firmenlogo" [disabled]="true" ${IMAGE_DE} />
      </div>`,
  }),
  play: async ({ canvasElement }) => {
    dropOnTile(canvasElement, [fileOf('logo-gross.png', 204800, 'image/png')]);
  },
};

/** 3.49.1: LOGO's three shapes in white, without the L (a white-on-transparent silhouette). */
const WHITE_LOGO =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect x="2" y="6" width="28" height="28" rx="7" fill="#ffffff"/><rect x="38" y="11" width="78" height="8" rx="4" fill="#ffffff"/><rect x="38" y="24" width="54" height="6" rx="3" fill="#ffffff"/></svg>',
  );

const GROUP_LABEL = 'margin: 0 0 12px; font-size: 0.875rem; font-weight: 600; color: var(--color-text-primary);';
const CAPTION = 'margin: 0 0 8px; font-size: 0.75rem; color: var(--color-text-secondary);';
const GRID = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr)); gap: 24px;';

/** 3.49.1 (request 070, 069-s1): a white logo on the light, dark and checkered grounds, EN and DE, plus an empty dark field. */
export const ImageGroundsWhiteLogo: Story = {
  name: 'Image Grounds White Logo',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.49.1 (request 070, 069-s1): a white logo on the `light`, `dark` and `checkered` grounds, EN and DE, plus an empty `dark` field. On `light` the white logo vanishes by design: the ground shows where it won\'t work. In forced colours (Windows high contrast; DevTools → Rendering → `forced-colors: active`) these grounds keep their colours once an image is shown: white on `dark` 19.4:1 against #070e15. The edge stays CanvasText and the drag ring Highlight; empty tiles and `surface` follow the system colours.',
      },
    },
  },
  render: () => ({
    props: { logo: WHITE_LOGO },
    template: `
      <div style="display: flex; flex-direction: column; gap: 32px;">
        <div lang="en">
          <p style="${GROUP_LABEL}">English</p>
          <div style="${GRID}">
            <div>
              <p style="${CAPTION}">light</p>
              <lc-file-upload variant="image" [imageSrc]="logo" imageAlt="Company logo (white)" imageBackground="light" />
            </div>
            <div>
              <p style="${CAPTION}">dark</p>
              <lc-file-upload variant="image" [imageSrc]="logo" imageAlt="Company logo (white)" imageBackground="dark" />
            </div>
            <div>
              <p style="${CAPTION}">checkered</p>
              <lc-file-upload variant="image" [imageSrc]="logo" imageAlt="Company logo (white)" imageBackground="checkered" />
            </div>
            <div>
              <p style="${CAPTION}">dark, empty</p>
              <lc-file-upload variant="image" imageBackground="dark" />
            </div>
          </div>
        </div>
        <div lang="de">
          <p style="${GROUP_LABEL}">Deutsch</p>
          <div style="${GRID}">
            <div>
              <p style="${CAPTION}">light</p>
              <lc-file-upload variant="image" [imageSrc]="logo" imageAlt="Firmenlogo (weiß)" imageBackground="light" ${IMAGE_DE} />
            </div>
            <div>
              <p style="${CAPTION}">dark</p>
              <lc-file-upload variant="image" [imageSrc]="logo" imageAlt="Firmenlogo (weiß)" imageBackground="dark" ${IMAGE_DE} />
            </div>
            <div>
              <p style="${CAPTION}">checkered</p>
              <lc-file-upload variant="image" [imageSrc]="logo" imageAlt="Firmenlogo (weiß)" imageBackground="checkered" ${IMAGE_DE} />
            </div>
            <div>
              <p style="${CAPTION}">dark, leer</p>
              <lc-file-upload variant="image" imageBackground="dark" ${IMAGE_DE} />
            </div>
          </div>
        </div>
      </div>`,
  }),
};
