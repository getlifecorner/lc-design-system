import type { Meta, StoryObj } from '@storybook/angular';
import { TooltipDirective } from './tooltip.directive';
import { ButtonComponent } from '../button/button.component';

/**
 * Tooltips display informative text when users hover over or focus on an element.
 * Applied as a directive (`lcTooltip`) on any element. Supports four positions
 * and an optional show delay.
 */
const meta: Meta<TooltipDirective> = {
  title: 'Feedback/Tooltip',
  component: TooltipDirective,
  argTypes: {
    lcTooltip: { description: 'The text content to display in the tooltip' },
    tooltipPosition: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Which side of the element the tooltip appears on',
    },
    tooltipShowDelay: { description: 'Delay in milliseconds before showing (default: 0)' },
  },
};

export default meta;
type Story = StoryObj<TooltipDirective>;

export const Default: Story = {
  render: () => ({
    template: `<lc-button lcTooltip="Save your current progress">Hover me</lc-button>`,
  }),
};

export const Positions: Story = {
  name: 'All Positions',
  render: () => ({
    template: `
      <div style="display: flex; gap: 24px; padding: 80px 60px;">
        <lc-button lcTooltip="Appears above the element" tooltipPosition="top" variant="outlined">Top</lc-button>
        <lc-button lcTooltip="Appears below the element" tooltipPosition="bottom" variant="outlined">Bottom</lc-button>
        <lc-button lcTooltip="Appears to the left" tooltipPosition="left" variant="outlined">Left</lc-button>
        <lc-button lcTooltip="Appears to the right" tooltipPosition="right" variant="outlined">Right</lc-button>
      </div>`,
  }),
};

export const WithDelay: Story = {
  name: 'With Show Delay',
  render: () => ({
    template: `
      <div style="display: flex; gap: 16px; padding: 40px;">
        <lc-button lcTooltip="Instant (0ms)" [tooltipShowDelay]="0" variant="outlined">No delay</lc-button>
        <lc-button lcTooltip="Shows after 300ms" [tooltipShowDelay]="300" variant="outlined">300ms</lc-button>
        <lc-button lcTooltip="Shows after 800ms" [tooltipShowDelay]="800" variant="outlined">800ms</lc-button>
      </div>`,
  }),
};

export const OnIcons: Story = {
  name: 'On Icon Buttons',
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; padding: 40px;">
        <lc-button lcTooltip="Edit document" tooltipPosition="bottom" variant="outlined" [iconOnly]="true" iconBefore="pencil" size="sm"></lc-button>
        <lc-button lcTooltip="Delete item" tooltipPosition="bottom" variant="outlined" [iconOnly]="true" iconBefore="trash" size="sm"></lc-button>
        <lc-button lcTooltip="Share link" tooltipPosition="bottom" variant="outlined" [iconOnly]="true" iconBefore="share" size="sm"></lc-button>
        <lc-button lcTooltip="Download file" tooltipPosition="bottom" variant="outlined" [iconOnly]="true" iconBefore="arrow-down-tray" size="sm"></lc-button>
      </div>`,
  }),
};

export const LongContent: Story = {
  name: 'Long Content',
  render: () => ({
    template: `
      <div style="padding: 60px;">
        <lc-button lcTooltip="This tooltip has a longer description that explains the action in more detail. It wraps to multiple lines automatically." tooltipPosition="top" variant="outlined">Hover for details</lc-button>
      </div>`,
  }),
};

export const Toolbar: Story = {
  name: 'Toolbar (Composition)',
  render: () => ({
    template: `
      <div style="display: inline-flex; gap: 2px; padding: 40px; background: var(--color-surface-2); border-radius: 8px;">
        <lc-button lcTooltip="Bold (Ctrl+B)" tooltipPosition="bottom" variant="ghost" size="sm" [iconOnly]="true" ariaLabel="Bold"><lc-icon slot="icon-before" name="bold" size="sm" [decorative]="true"></lc-icon></lc-button>
        <lc-button lcTooltip="Italic (Ctrl+I)" tooltipPosition="bottom" variant="ghost" size="sm" [iconOnly]="true" ariaLabel="Italic"><lc-icon slot="icon-before" name="italic" size="sm" [decorative]="true"></lc-icon></lc-button>
        <lc-button lcTooltip="Underline (Ctrl+U)" tooltipPosition="bottom" variant="ghost" size="sm" [iconOnly]="true" ariaLabel="Underline"><lc-icon slot="icon-before" name="underline" size="sm" [decorative]="true"></lc-icon></lc-button>
        <div style="width: 1px; background: var(--color-border); margin: 4px 6px;"></div>
        <lc-button lcTooltip="Align left" tooltipPosition="bottom" variant="ghost" size="sm" [iconOnly]="true" ariaLabel="Align left"><lc-icon slot="icon-before" name="align-left" size="sm" [decorative]="true"></lc-icon></lc-button>
        <lc-button lcTooltip="Align center" tooltipPosition="bottom" variant="ghost" size="sm" [iconOnly]="true" ariaLabel="Align center"><lc-icon slot="icon-before" name="align-center" size="sm" [decorative]="true"></lc-icon></lc-button>
        <lc-button lcTooltip="Align right" tooltipPosition="bottom" variant="ghost" size="sm" [iconOnly]="true" ariaLabel="Align right"><lc-icon slot="icon-before" name="align-right" size="sm" [decorative]="true"></lc-icon></lc-button>
      </div>`,
  }),
};

/** 3.31 (request 050, 049-f1): the tooltip takes the host's language. */
export const Language: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '3.31 (request 050, follow-up 049-f1, WCAG 3.1.2): the tooltip opens in an overlay under `<body>`, outside its host\'s `lang`, so the tooltip element (the one `aria-describedby` points at) takes the `lang` of the host\'s closest `[lang]` at every show: the German button inside `<div lang="de">` shows its tooltip with `lang="de"`. The English one takes the page\'s `lang`. Without any `lang` above the host, the tooltip gets none. The story shows the German tooltip (in the story view).',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: flex; gap: 24px; padding: 60px 16px;">
        <lc-button lcTooltip="Save your current progress">Save</lc-button>
        <div lang="de">
          <lc-button lcTooltip="Änderungen speichern, bevor du die Seite verlässt" tooltipPosition="bottom">Speichern</lc-button>
        </div>
      </div>`,
  }),
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    await new Promise((resolve) => setTimeout(resolve, 50));
    canvasElement.querySelector('[lang="de"] lc-button')?.dispatchEvent(new MouseEvent('mouseenter'));
  },
};
