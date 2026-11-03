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
        `,
      },
    },
  },
  argTypes: {
    accept: {
      control: 'text',
      description:
        'Accepted types, comma-separated, case-insensitive: extensions (`.csv`), MIME types (`text/csv`), wildcards (`image/*`). Since 3.24 checked for picked and dropped files alike; a file matching no token is rejected with `code: \'type\'`. Prefer extensions: systems report MIME types differently.',
      table: { defaultValue: { summary: "''" } },
    },
    multiple: {
      control: 'boolean',
      description:
        'Allow multiple files. `false`: a new pick or drop replaces the selection with its first accepted file; if all its files are rejected, the selection is cleared.',
      table: { defaultValue: { summary: 'false' } },
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
