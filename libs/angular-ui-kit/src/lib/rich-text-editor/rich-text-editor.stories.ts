import type { Meta, StoryObj } from '@storybook/angular';
import { RichTextEditorComponent } from './rich-text-editor.component';

const meta: Meta<RichTextEditorComponent> = {
  title: 'Editors/Rich Text Editor',
  component: RichTextEditorComponent,
  parameters: {
    docs: {
      description: {
        component: `
A full-featured Rich Text Editor with built-in Markdown support and live preview.

**Key Features:**
- 3 editing modes: Rich (WYSIWYG), Markdown (raw), and Split (side-by-side)
- Customizable toolbar with formatting actions (bold, italic, headings, lists, code, links, etc.)
- Built-in Markdown-to-HTML rendering (no external dependencies)
- Reactive Forms integration via ControlValueAccessor
- Word and character count display
- Configurable min/max height
- Disabled and readonly states
- Dark mode support
        `,
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['rich', 'markdown', 'split'],
      description: 'Initial editor mode',
      table: { defaultValue: { summary: 'rich' } },
    },
    placeholder: { control: 'text', description: 'Placeholder text' },
    minHeight: { control: 'number', description: 'Minimum height in px' },
    maxHeight: { control: 'number', description: 'Maximum height (0 = unlimited)' },
    disabled: { control: 'boolean', description: 'Disable the editor' },
    readonly: { control: 'boolean', description: 'Make the editor readonly' },
    showWordCount: { control: 'boolean', description: 'Show word/character count footer' },
  },
};

export default meta;
type Story = StoryObj<RichTextEditorComponent>;

const sampleMarkdown = `# Welcome to the Editor

This is a **rich text editor** with *Markdown* support.

## Features

- Bold, italic, and ~~strikethrough~~
- Headings (H1, H2, H3)
- Ordered and unordered lists
- \`Inline code\` and code blocks
- [Links](https://example.com)
- Blockquotes and horizontal rules

> This is a blockquote that can span multiple lines.

---

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

That's it! Enjoy writing.`;

export const Default: Story = {
  args: {
    mode: 'rich',
    placeholder: 'Start typing...',
    minHeight: 300,
    showWordCount: true,
  },
};

export const MarkdownMode: Story = {
  parameters: {
    docs: { description: { story: 'Raw Markdown editing mode with monospace font and syntax-friendly textarea.' } },
  },
  args: {
    mode: 'markdown',
    placeholder: 'Write markdown here...',
    minHeight: 300,
    showWordCount: true,
  },
};

export const SplitMode: Story = {
  parameters: {
    docs: { description: { story: 'Side-by-side view: edit Markdown on the left and see rendered HTML preview on the right in real-time.' } },
  },
  args: {
    mode: 'split',
    placeholder: 'Type markdown to see live preview...',
    minHeight: 400,
    showWordCount: true,
  },
};

export const WithContent: Story = {
  parameters: {
    docs: { description: { story: 'Editor pre-filled with rich Markdown content demonstrating various formatting options.' } },
  },
  render: (args) => ({
    props: {
      ...args,
      initialValue: sampleMarkdown,
    },
    template: `<lc-rich-text-editor
      [mode]="'split'"
      [minHeight]="400"
      [showWordCount]="true"
      #editor
    ></lc-rich-text-editor>`,
  }),
  args: {
    mode: 'split',
    minHeight: 400,
  },
};

export const CustomToolbar: Story = {
  parameters: {
    docs: { description: { story: 'Toolbar can be customized to show only the actions you need.' } },
  },
  args: {
    mode: 'rich',
    toolbar: { actions: ['bold', 'italic', 'h1', 'h2', 'ul', 'ol', 'link', 'code'] },
    placeholder: 'Simplified toolbar...',
    minHeight: 250,
    showWordCount: true,
  },
};

export const MinimalToolbar: Story = {
  parameters: {
    docs: { description: { story: 'A minimal editor with only basic formatting — ideal for comments or short notes.' } },
  },
  args: {
    mode: 'rich',
    toolbar: { actions: ['bold', 'italic', 'link'] },
    placeholder: 'Add a comment...',
    minHeight: 120,
    maxHeight: 200,
    showWordCount: false,
  },
};

export const Disabled: Story = {
  parameters: {
    docs: { description: { story: 'Disabled state prevents all interaction and dims the editor.' } },
  },
  args: {
    mode: 'markdown',
    disabled: true,
    placeholder: 'Editor is disabled',
    minHeight: 200,
  },
};

export const Readonly: Story = {
  parameters: {
    docs: { description: { story: 'Readonly mode allows viewing but not editing the content.' } },
  },
  args: {
    mode: 'markdown',
    readonly: true,
    placeholder: 'Editor is readonly',
    minHeight: 200,
  },
};

export const TallEditor: Story = {
  parameters: {
    docs: { description: { story: 'Editor with increased minimum height for long-form content editing.' } },
  },
  args: {
    mode: 'split',
    minHeight: 600,
    placeholder: 'Write long-form content here...',
    showWordCount: true,
  },
};

export const KeyboardFocus: Story = {
  name: 'Keyboard Focus',
  parameters: {
    docs: {
      description: {
        story:
          '3.27 (request 042): the editing surface is focused as Tab would focus it (in the story view). The frame shows the field ring, as lc-input does: border and a 2 px outline in `--color-primary-500` (4.17:1 light, 9.95:1 dark on the page), `Highlight` in forced colours. The toolbar and mode buttons have the kit ring too (2 px, 2 px outside; 4.36:1 / 9.12:1 on the toolbar). A mouse click on a button shows none (`:focus-visible`).',
      },
    },
  },
  args: {
    mode: 'rich',
    placeholder: 'Start typing...',
    minHeight: 300,
    showWordCount: true,
  },
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    canvasElement.querySelector<HTMLElement>('.lc-rich-text-editor__rich')?.focus({ preventScroll: true });
  },
};

/** 3.27.1 (request 043, F-22, F-24, F-26): 44 px buttons, the field frame and the pressed mode, in German. */
export const TouchTargets: Story = {
  name: 'Touch Targets (DE)',
  parameters: {
    docs: {
      description: {
        story:
          '3.27.1 (request 043), every built-in text German. The 14 toolbar buttons are 44 × 44 px (were 32) and the mode buttons at least 44 px high (were 26), WCAG 2.5.8: the buttons sit 2 px apart, so a hit area alone would overlap the neighbour. The toolbar is 201 px high at 360 px (was 113) and 61 px from 1024 px (was 49); the German modes fit at 320 px. The frame is the field boundary `--color-field-border` (F-24): 4.83:1 in light and 7.31:1 in dark on the page (`--color-border` was 1.23 / 1.29). The pressed mode uses the fill pair (F-26): 6.21:1 in both themes (was 4.36 light, 1.89 dark).',
      },
    },
  },
  args: {
    mode: 'rich',
    placeholder: 'Notiz schreiben …',
    minHeight: 200,
    showWordCount: true,
    richModeLabel: 'Formatiert',
    richModeTitle: 'Formatierter Text',
    markdownModeLabel: 'Markdown',
    markdownModeTitle: 'Markdown',
    splitModeLabel: 'Geteilt',
    splitModeTitle: 'Geteilte Ansicht',
    markdownEditorAriaLabel: 'Markdown-Editor',
    wordsLabel: 'Wörter',
    charactersLabel: 'Zeichen',
    actionTitles: {
      bold: 'Fett',
      italic: 'Kursiv',
      underline: 'Unterstrichen',
      strikethrough: 'Durchgestrichen',
      h1: 'Überschrift 1',
      h2: 'Überschrift 2',
      h3: 'Überschrift 3',
      ul: 'Aufzählung',
      ol: 'Nummerierung',
      blockquote: 'Zitat',
      code: 'Code',
      codeblock: 'Codeblock',
      link: 'Link',
      hr: 'Trennlinie',
    },
  },
};
