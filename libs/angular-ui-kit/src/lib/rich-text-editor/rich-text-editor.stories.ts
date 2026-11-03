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
