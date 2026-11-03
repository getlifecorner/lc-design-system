import type { Meta, StoryObj } from '@storybook/angular';
import { ChatComponent, ChatMessage } from './chat.component';
import { DiffViewerComponent } from '../diff-viewer/diff-viewer.component';
import { MarkdownComponent } from '../markdown/markdown.component';

const now = new Date();
const t = (min: number) => new Date(now.getTime() - min * 60000);

// Neutral placeholder conversation — generic names and tasks only.
const conversationMessages: ChatMessage[] = [
  { id: '1', role: 'system', content: 'Chat begonnen', timestamp: t(10) },
  { id: '2', role: 'user', content: 'Hallo! Kannst du mir bei einer Aufgabe helfen?', name: 'Alex Example', timestamp: t(9) },
  { id: '3', role: 'agent', content: 'Natürlich! Worum geht es genau?', name: 'Assistant', timestamp: t(8) },
  { id: '4', role: 'user', content: 'Ich brauche eine kurze Zusammenfassung eines längeren Textes.', name: 'Alex Example', timestamp: t(7) },
  { id: '5', role: 'agent', content: 'Gern! Ich fasse den Text in drei Absätzen zusammen: Ausgangslage, Kernaussagen und Fazit.\n\nSoll ich zusätzlich eine Stichpunktliste anhängen?', name: 'Assistant', timestamp: t(6) },
  { id: '6', role: 'user', content: 'Nein, die Absätze reichen. Danke!', name: 'Alex Example', timestamp: t(5) },
];

const streamingMessages: ChatMessage[] = [
  ...conversationMessages,
  { id: '7', role: 'agent', content: 'Ich erstelle jetzt die Zusammenfassung und gliedere sie in drei Absätze…', name: 'Assistant', timestamp: new Date(), streaming: true },
];

const multiUserMessages: ChatMessage[] = [
  { id: '1', role: 'user', content: 'Hallo zusammen, der Entwurf ist fertig!', name: 'Alex Example', timestamp: t(15) },
  { id: '2', role: 'agent', content: 'Sieht gut aus! Ich habe die Notizen dazu zusammengestellt.', name: 'Assistant', timestamp: t(14) },
  { id: '3', role: 'system', content: 'Sam Sample hat den Chat betreten', timestamp: t(13) },
  { id: '4', role: 'user', content: 'Prima, ich übernehme die Durchsicht.', name: 'Sam Sample', timestamp: t(12) },
  { id: '5', role: 'agent', content: 'Die Prüfung ist abgeschlossen. Alle Punkte sind erledigt.', name: 'Assistant', timestamp: t(11) },
];

const statusMessages: ChatMessage[] = [
  { id: '1', role: 'user', content: 'Lege bitte ein neues Dokument an.', name: 'Alex Example', timestamp: t(6) },
  { id: '2', role: 'agent', content: 'Klar, ich lege das Dokument an und fülle die Standardabschnitte aus.', name: 'Assistant', timestamp: t(5) },
  { id: '3', role: 'system', content: 'Einstellungen aktualisiert', status: 'info', timestamp: t(4) },
  { id: '4', role: 'agent', content: 'Dokument erstellt und gespeichert.', name: 'Assistant', status: 'success', timestamp: t(3) },
  { id: '5', role: 'agent', content: 'Limit erreicht — neuer Versuch in 5 s …', name: 'Assistant', status: 'warning', timestamp: t(2) },
  { id: '6', role: 'agent', content: 'Dienst nicht erreichbar — die Verbindung ist fehlgeschlagen.', name: 'Assistant', status: 'error', timestamp: t(1) },
];

const meta: Meta<ChatComponent> = {
  title: 'Components/Chat',
  component: ChatComponent,
  tags: ['autodocs'],

  parameters: {
    docs: {
      description: {
        component: `
Chat component for conversational user interfaces.

Compact, document-style layout: agent/system turns flow as full-width text on a
left timeline rail; user turns are right-aligned, accent-tinted bubbles (no name
label) with an optional avatar — an \`avatar\` image or an initials monogram from
\`name\`. Spacing is a single space-efficient scale (no roomy variant), tunable
via the \`--lc-chat-*\` custom properties.

**Key Features:**
- User, agent, and system message roles
- Right-aligned user bubbles with avatar / initials monogram (\`showAvatars\`)
- **Semantic status** per message (\`info\` / \`success\` / \`warning\` / \`error\`)
- Streaming cursor indicator for AI responses
- Typing indicator with animated dots
- Auto-scroll to the latest message (new turns, streamed tokens, history loads) — pauses while the reader has scrolled up
- Optional avatars and timestamps
- Configurable header with title
- Send on Enter with Shift+Enter for newline (IME compositions are respected)
- Accessible composer label (\`inputLabel\`) and a polite live region announcing completed assistant turns
- **File upload** via \`allowFileUpload\` with \`accept\` / \`maxFileSize\`
  constraints, pending-attachment chips, and rendered attachments
  (image thumbnails / file links) inside messages

**Status:** Set \`status\` on a \`ChatMessage\` to \`info\`, \`success\`,
\`warning\` or \`error\` to flag it semantically — orthogonal to \`role\`
(role = *who* speaks, status = *what kind* of message). It colours the rail
icon with a semantic token, pairs it with an icon and a visually-hidden label,
and sets the matching ARIA (\`error\` → \`role="alert"\` / \`aria-live="assertive"\`,
others → polite). \`error\` never pulses. Omitting \`status\` (or \`'default'\`)
is identical to today's role-coloured output. See the *Semantic status* story.

**Attachments:** Set \`allowFileUpload="true"\` to show the paperclip button.
Selected files appear as chips above the textarea and are emitted on
\`messageSend\` as \`event.attachments\` (\`ChatAttachment[]\`).
Historical messages can also carry \`attachments\` for replay.
See the *With File Upload* story for a full example.
`,
      },
    },
  },
};
export default meta;
type Story = StoryObj<ChatComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <div style="height: 500px;">
        <lc-chat title="AI Chat" [messages]="messages"></lc-chat>
      </div>
    `,
    props: { messages: conversationMessages },
    moduleMetadata: { imports: [ChatComponent] },
  }),
};

// A tiny inline SVG avatar so the story stays self-contained (no network).
const sampleAvatar =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" rx="24" fill="#208497"/><text x="24" y="31" font-family="sans-serif" font-size="20" fill="#fff" text-anchor="middle">A</text></svg>`,
  );

/**
 * User turns render as a right-aligned accent bubble. With `showAvatars` (on by
 * default), a user turn shows its `avatar` image on the outer right edge, or a
 * monogram built from `name` when no image is set. Agent turns keep the left
 * rail. Set `showAvatars=false` to drop avatars entirely.
 */
export const UserAvatar: Story = {
  name: 'User avatar & monogram',
  render: () => ({
    template: `
      <div style="height: 500px;">
        <lc-chat title="Assistant" [messages]="messages"></lc-chat>
      </div>
    `,
    props: {
      messages: [
        { id: '1', role: 'user', content: 'Nachricht mit Avatar-Bild.', name: 'Sam Sample', avatar: sampleAvatar, timestamp: t(5) },
        { id: '2', role: 'agent', content: 'Alles klar, ich übernehme das.', name: 'Assistant', timestamp: t(4) },
        { id: '3', role: 'user', content: 'Diese hier fällt auf ein Monogramm zurück (kein Bild).', name: 'Alex Example', timestamp: t(3) },
      ] as ChatMessage[],
    },
    moduleMetadata: { imports: [ChatComponent] },
  }),
};

export const Streaming: Story = {
  render: () => ({
    template: `
      <div style="height: 500px;">
        <lc-chat title="AI Chat" [messages]="messages" [isStreaming]="true"></lc-chat>
      </div>
    `,
    props: { messages: streamingMessages },
    moduleMetadata: { imports: [ChatComponent] },
  }),
};

export const TypingIndicator: Story = {
  render: () => ({
    template: `
      <div style="height: 500px;">
        <lc-chat title="AI Chat" [messages]="messages" [isStreaming]="true"></lc-chat>
      </div>
    `,
    props: { messages: conversationMessages },
    moduleMetadata: { imports: [ChatComponent] },
  }),
};

export const Empty: Story = {
  render: () => ({
    template: `
      <div style="height: 500px;">
        <lc-chat title="Neuer Chat" [messages]="[]" placeholder="Stelle eine Frage…"></lc-chat>
      </div>
    `,
    moduleMetadata: { imports: [ChatComponent] },
  }),
};

export const MultiUser: Story = {
  render: () => ({
    template: `
      <div style="height: 500px;">
        <lc-chat title="Team Chat" [messages]="messages"></lc-chat>
      </div>
    `,
    props: { messages: multiUserMessages },
    moduleMetadata: { imports: [ChatComponent] },
  }),
};

/**
 * `status` marks a message as `info | success | warning | error`, orthogonal to
 * `role`. It colours the rail icon with a semantic token, pairs it with an icon
 * and a visually-hidden label, and sets the right ARIA (`error` → `role="alert"`
 * / `aria-live="assertive"`, others → polite). `error` never pulses. Omitting
 * `status` is identical to the default role-coloured behaviour.
 */
export const MessageStatus: Story = {
  name: 'Semantic status',
  render: () => ({
    template: `
      <div style="height: 500px;">
        <lc-chat title="Assistant" [messages]="messages"></lc-chat>
      </div>
    `,
    props: { messages: statusMessages },
    moduleMetadata: { imports: [ChatComponent] },
  }),
  parameters: {
    docs: {
      description: {
        story: 'Setze `status` auf einer `ChatMessage` (`info`, `success`, `warning`, `error`), um den Rail-Punkt semantisch einzufärben — z. B. für „Dienst nicht erreichbar" (`error`) oder „Dokument erstellt" (`success`). Unabhängig von `role`, voll abwärtskompatibel.',
      },
    },
  },
};

export const NoHeader: Story = {
  render: () => ({
    template: `
      <div style="height: 500px;">
        <lc-chat [showHeader]="false" [messages]="messages"></lc-chat>
      </div>
    `,
    props: { messages: conversationMessages.slice(1) },
    moduleMetadata: { imports: [ChatComponent] },
  }),
};

/**
 * `messageAnchor="bottom"` keeps a short conversation pinned to the bottom of
 * the message area (empty space above), like most messaging apps. Once messages
 * overflow the height it scrolls normally and the top stays reachable.
 */
export const BottomAnchored: Story = {
  name: 'Bottom-anchored',
  render: () => ({
    template: `
      <div style="height: 500px;">
        <lc-chat [showHeader]="false" messageAnchor="bottom" [messages]="messages"></lc-chat>
      </div>
    `,
    props: { messages: conversationMessages.slice(1, 4) },
    moduleMetadata: { imports: [ChatComponent] },
  }),
};

/**
 * `bordered=false` drops the card border + rounded corners so the chat fills its
 * container flush — e.g. as the full-height body of an `<lc-page-layout>` sitting
 * directly under a page header. See **Layout/PageLayout → Chat (full height)**.
 */
export const Borderless: Story = {
  name: 'Borderless (flush)',
  render: () => ({
    template: `
      <div style="height: 500px; border: 1px dashed var(--color-border); border-radius: 8px; overflow: hidden;">
        <lc-chat [showHeader]="false" [bordered]="false" [messages]="messages"></lc-chat>
      </div>
    `,
    props: { messages: conversationMessages.slice(1) },
    moduleMetadata: { imports: [ChatComponent] },
  }),
};

/**
 * By default the thread and composer span the full available width.
 * `contentWidth="narrow"` constrains them to a centered reading column (~46rem)
 * for a document-style chat.
 */
export const ReadingColumn: Story = {
  name: 'Narrow reading column',
  render: () => ({
    template: `
      <div style="height: 500px;">
        <lc-chat title="AI Chat" contentWidth="narrow" [messages]="messages"></lc-chat>
      </div>
    `,
    props: { messages: conversationMessages },
    moduleMetadata: { imports: [ChatComponent] },
  }),
};

// --- File upload ---

const fileUploadMessages: ChatMessage[] = [
  { id: '1', role: 'user', content: 'Hier ist das aktuelle Bild:', name: 'Alex Example', timestamp: t(5),
    attachments: [
      { id: 'a1', name: 'logo.png', type: 'image/png', size: 24_128,
        url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&h=200&fit=crop' },
    ],
  },
  { id: '2', role: 'agent', content: 'Sieht gut aus! Anbei die Notizen als PDF.', name: 'Assistant', timestamp: t(4),
    attachments: [
      { id: 'a2', name: 'notizen.pdf', type: 'application/pdf', size: 184_322 },
      { id: 'a3', name: 'entwurf.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 56_120 },
    ],
  },
];

export const WithFileUpload: Story = {
  name: 'With File Upload',
  render: () => ({
    template: `
      <div style="height: 600px;">
        <lc-chat
          title="AI Chat"
          [messages]="messages"
          [allowFileUpload]="true"
          accept="image/*,.pdf,.docx,.txt"
          [maxFileSize]="5 * 1024 * 1024"
          (messageSend)="onSend($event)"
          (fileAttach)="onAttach($event)"
        ></lc-chat>
      </div>
    `,
    props: {
      messages: fileUploadMessages,
      onSend: (e: unknown) => console.log('send', e),
      onAttach: (e: unknown) => console.log('attach', e),
    },
    moduleMetadata: { imports: [ChatComponent] },
  }),
  parameters: {
    docs: {
      description: {
        story: 'Aktiviert den Datei-Upload-Button im Input-Bereich. Nutze `allowFileUpload`, `accept` und `maxFileSize`, um Dateitypen und -größen einzuschränken. Angehängte Dateien werden als Chips angezeigt und beim Senden via `messageSend` mitgegeben (`attachments`).',
      },
    },
  },
};

// --- Rich content stories ---

const docOld = `## Ziel\n\n_TBD_\n\n## Zielgruppe\n\n_TBD_`;
const docNew = `## Ziel\n\nEin Beispieldokument zur Demonstration des Diff-Viewers.\n\n## Zielgruppe\n\nLeserinnen und Leser dieser Storybook-Story.`;

const diffMessages: ChatMessage[] = [
  { id: '1', role: 'system', content: 'Bearbeitung gestartet', timestamp: t(5) },
  { id: '2', role: 'user', content: 'Bitte fülle Ziel und Zielgruppe im Beispieldokument aus.', name: 'Alex Example', timestamp: t(4) },
  {
    id: '3', role: 'agent',
    content: 'Ich habe Ziel und Zielgruppe in der Vorlage ausgefüllt:',
    name: 'Assistant',
    timestamp: t(3),
    data: {
      diff: true,
      oldText: docOld,
      newText: docNew,
    },
  },
  { id: '4', role: 'user', content: 'Passt! Kannst du noch eine Checkliste ergänzen?', name: 'Alex Example', timestamp: t(2) },
  {
    id: '5', role: 'agent',
    content: 'Checkliste hinzugefügt:',
    name: 'Assistant',
    timestamp: t(1),
    data: {
      diff: true,
      oldText: docNew,
      newText: docNew + `\n\n## Checkliste\n\n- [ ] Erster Punkt\n- [ ] Zweiter Punkt\n- [ ] Dritter Punkt`,
    },
  },
];

const markdownMessages: ChatMessage[] = [
  { id: '1', role: 'user', content: 'Zeig mir eine Übersicht als Tabelle.', name: 'Alex Example', timestamp: t(3) },
  {
    id: '2', role: 'agent',
    content: '',
    name: 'Assistant',
    timestamp: t(2),
    data: {
      markdown: true,
      markdownContent: `### Übersicht\n\n| Spalte A | Spalte B | Beschreibung |\n|----------|----------|-------------|\n| \`eins\` | \`/beispiel/a\` | Erster Eintrag |\n| \`zwei\` | \`/beispiel/b\` | Zweiter Eintrag |\n| \`drei\` | \`/beispiel/c\` | Dritter Eintrag |\n\n> **Hinweis:** Dies ist Platzhalter-Inhalt.\n\n- Punkt: **eins**\n- Format: \`text/plain\``,
    },
  },
  { id: '3', role: 'user', content: 'Danke, kannst du den dritten Eintrag noch ergänzen?', name: 'Alex Example', timestamp: t(1) },
];

export const WithDiffViewer: Story = {
  name: 'With Diff Viewer',
  render: () => ({
    template: `
      <div style="height: 600px;">
        <lc-chat title="Assistant" [messages]="messages">
          <ng-template #messageTemplate let-msg>
            {{ msg.content }}
            @if (msg.data?.diff) {
              <div style="margin-top: 8px;">
                <lc-diff-viewer
                  [oldText]="msg.data.oldText"
                  [newText]="msg.data.newText"
                  mode="inline"
                  [showLineNumbers]="false"
                  [contextLines]="3"
                />
              </div>
            }
          </ng-template>
        </lc-chat>
      </div>
    `,
    props: { messages: diffMessages },
    moduleMetadata: { imports: [ChatComponent, DiffViewerComponent] },
  }),
  parameters: {
    docs: {
      description: {
        story: 'Agent-Nachrichten können einen eingebetteten Diff-Viewer enthalten, um Änderungen am Dokument direkt im Chat sichtbar zu machen. Nutze `data.diff`, `data.oldText` und `data.newText` auf der ChatMessage zusammen mit einem custom `#messageTemplate`.',
      },
    },
  },
};

export const WithMarkdown: Story = {
  name: 'With Markdown',
  render: () => ({
    template: `
      <div style="height: 600px;">
        <lc-chat title="Assistant" [messages]="messages">
          <ng-template #messageTemplate let-msg>
            @if (msg.data?.markdown) {
              <lc-markdown [content]="msg.data.markdownContent" variant="compact" />
            } @else {
              {{ msg.content }}
            }
          </ng-template>
        </lc-chat>
      </div>
    `,
    props: { messages: markdownMessages },
    moduleMetadata: { imports: [ChatComponent, MarkdownComponent] },
  }),
  parameters: {
    docs: {
      description: {
        story: 'Agent-Nachrichten können Markdown rendern — Tabellen, Listen, Codeblöcke und mehr. Nutze `data.markdown` und `data.markdownContent` zusammen mit `#messageTemplate`.',
      },
    },
  },
};

export const KeyboardFocus: Story = {
  name: 'Keyboard Focus',
  render: () => ({
    template: `
      <div style="height: 600px;">
        <lc-chat
          title="AI Chat"
          [messages]="messages"
          [allowFileUpload]="true"
          accept="image/*,.pdf,.docx,.txt"
        ></lc-chat>
      </div>
    `,
    props: { messages: fileUploadMessages },
    moduleMetadata: { imports: [ChatComponent] },
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    canvasElement.querySelector<HTMLElement>('.lc-chat__attachment--file')?.focus({ preventScroll: true });
  },
  parameters: {
    docs: {
      description: {
        story:
          '3.27 (request 042): the first file attachment link is focused as Tab would focus it (in the story view). Attachment links (image and file), the attach, send and pending-remove buttons show the kit ring: 2 px `--color-primary-500`, 2 px outside (3.70:1 light, 6.13:1 dark on a user bubble; 4.17:1 / 7.57:1 on the composer), `Highlight` in forced colours. A mouse click shows none (`:focus-visible`).',
      },
    },
  },
};

/** 3.27.1 (request 043, F-22, F-26): the composer's 44 px hit areas and the monogram ink. */
export const TouchTargets: Story = {
  name: 'Touch Targets',
  render: () => ({
    template: `
      <div style="height: 420px;">
        <lc-chat title="Assistent" [messages]="messages" [allowFileUpload]="true" accept="image/*,.pdf"></lc-chat>
      </div>
    `,
    props: {
      messages: [
        { id: 't1', role: 'user', content: 'Kannst du die Reisekosten für das dritte Quartal zusammenfassen?', name: 'Alex Example', timestamp: new Date(2026, 10, 3, 9, 15) },
        { id: 't2', role: 'agent', content: 'Gern. Die Reisekosten liegen 4 % unter dem Budget.', name: 'Assistent', timestamp: new Date(2026, 10, 3, 9, 16) },
      ] as ChatMessage[],
    },
    moduleMetadata: { imports: [ChatComponent] },
  }),
  parameters: {
    docs: {
      description: {
        story:
          '3.27.1 (request 043). The send and attach buttons (32 px) have a 44 × 44 px hit area each (F-22, WCAG 2.5.8), centred and without paint, 2 px clear of the message input; they look as before. The user monogram uses `--color-on-primary-subtle` (F-26): 7.00:1 in light on its 18 % tint (was 3.34), 5.11:1 in dark (unchanged). Fixed message times, so the shot is stable.',
      },
    },
  },
};

/**
 * Selects four files through the hidden file input, as the attach button's
 * file dialog would: three PDFs with long names and a 56 × 56 PNG (request 044).
 */
async function addPendingFiles(root: HTMLElement): Promise<void> {
  const input = root.querySelector<HTMLInputElement>('.lc-chat__file-input');
  if (!input) return;
  const canvas = document.createElement('canvas');
  canvas.width = 56;
  canvas.height = 56;
  const paint = canvas.getContext('2d');
  if (paint) {
    // The picture's content (a teal square), not a kit colour.
    paint.fillStyle = '#208497';
    paint.fillRect(0, 0, 56, 56);
  }
  const png = await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/png'));
  const files = new DataTransfer();
  files.items.add(new File(['x'.repeat(1_258_291)], 'Quarterly-travel-expense-report-2026-final.pdf', { type: 'application/pdf' }));
  files.items.add(new File(['x'.repeat(5_120)], 'Kostenstellen-Übersicht-Oktober-2026.pdf', { type: 'application/pdf' }));
  files.items.add(new File(['x'.repeat(245_760)], 'Reisekostenabrechnung-Q3-2026-Entwurf.pdf', { type: 'application/pdf' }));
  if (png) files.items.add(new File([png], 'beleg.png', { type: 'image/png' }));
  input.files = files.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

/** 3.27.2 (request 044, F-28): the remove buttons of pending attachments, in German. */
export const PendingAttachments: Story = {
  name: 'Pending Attachments (DE)',
  render: () => ({
    template: `
      <div style="height: 560px;">
        <lc-chat title="Assistent" [messages]="messages" [allowFileUpload]="true" accept="image/*,.pdf"></lc-chat>
      </div>
    `,
    props: {
      messages: [
        { id: 't1', role: 'user', content: 'Kannst du die Reisekosten für das dritte Quartal zusammenfassen?', name: 'Alex Example', timestamp: new Date(2026, 10, 3, 9, 15) },
        { id: 't2', role: 'agent', content: 'Gern. Die Reisekosten liegen 4 % unter dem Budget.', name: 'Assistent', timestamp: new Date(2026, 10, 3, 9, 16) },
      ] as ChatMessage[],
    },
    moduleMetadata: { imports: [ChatComponent] },
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    await addPendingFiles(canvasElement);
  },
  parameters: {
    docs: {
      description: {
        story:
          '3.27.2 (request 044, F-28). Four files are selected in the story view: three PDFs with long names and an image. Each remove button stays 20 × 20 px but has a 44 × 44 px hit area (WCAG 2.5.8), centred and without paint, so its hover fill shows anywhere in it; the focus ring stays round the 20 px button (`Highlight` in forced colours). Chips whose remove buttons line up in wrapped rows are now 14 px apart (were 6): the two hit areas meet in the middle of the gap instead of overlapping by 8 px, where the lower button won a click on the upper chip. Chip sizes and the 144 px names (ellipsis) are as before; at 1280 px all four chips share one row and nothing moves.',
      },
    },
  },
};

/** 3.27.2 (request 044, F-28): the same pending attachments with English texts. */
export const PendingAttachmentsEnglish: Story = {
  name: 'Pending Attachments (EN)',
  render: () => ({
    template: `
      <div style="height: 560px;">
        <lc-chat
          title="Assistant"
          placeholder="Type a message…"
          inputLabel="Message"
          attachAriaLabel="Attach file"
          sendAriaLabel="Send"
          removeAttachmentAriaLabel="Remove:"
          [messages]="messages"
          [allowFileUpload]="true"
          accept="image/*,.pdf"
        ></lc-chat>
      </div>
    `,
    props: {
      messages: [
        { id: 't1', role: 'user', content: 'Can you sum up the travel expenses for the third quarter?', name: 'Alex Example', timestamp: new Date(2026, 10, 3, 9, 15) },
        { id: 't2', role: 'agent', content: 'Sure. Travel expenses are 4 % below budget.', name: 'Assistant', timestamp: new Date(2026, 10, 3, 9, 16) },
      ] as ChatMessage[],
    },
    moduleMetadata: { imports: [ChatComponent] },
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    await addPendingFiles(canvasElement);
  },
  parameters: {
    docs: {
      description: {
        story:
          '3.27.2 (request 044, F-28): *Pending Attachments (DE)* with English texts. Each remove button is named "Remove: <file name>" and has a 44 × 44 px hit area round its 20 px button; wrapped chip rows are 14 px apart, so the areas never overlap.',
      },
    },
  },
};
