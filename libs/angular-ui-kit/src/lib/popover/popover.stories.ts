import type { Meta, StoryObj } from '@storybook/angular';
import { AfterViewInit, ChangeDetectionStrategy, Component, viewChildren } from '@angular/core';
import { PopoverComponent } from './popover.component';

const TRIGGER_STYLE =
  'min-height: 44px; padding: 8px 16px; border: 1px solid var(--color-field-border); border-radius: var(--border-radius-md); background: var(--color-surface); color: var(--color-text-primary); font: inherit; cursor: pointer;';
const NOTE_STYLE = 'margin: 0; font-size: 14px; line-height: 20px; color: var(--color-text-primary);';

/** 3.45 (usm-x row 35): `align` and the viewport shift at the 360 px edges, opened at load. */
@Component({
  selector: 'lc-popover-placement-demo',
  standalone: true,
  imports: [PopoverComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- One demo per row, so the four open panels don't overlap at 360 px. -->
    <div lang="de" style="display: flex; flex-direction: column; gap: 140px; padding-bottom: 140px;">
      <div style="display: flex; justify-content: flex-start;">
        <lc-popover align="start">
          <button popover-trigger type="button" style="${TRIGGER_STYLE}">Start</button>
          <div popover-content style="width: 15rem;"><p style="${NOTE_STYLE}">align="start": die Startkante des Panels liegt auf der des Auslösers.</p></div>
        </lc-popover>
      </div>
      <div style="display: flex; justify-content: flex-end;">
        <lc-popover align="end">
          <button popover-trigger type="button" style="${TRIGGER_STYLE}">Ende</button>
          <div popover-content style="width: 15rem;"><p style="${NOTE_STYLE}">align="end": die Endkante des Panels liegt auf der des Auslösers.</p></div>
        </lc-popover>
      </div>
      <div style="display: flex; justify-content: flex-start;">
        <lc-popover>
          <button popover-trigger type="button" style="${TRIGGER_STYLE}">Mitte am Rand</button>
          <div popover-content style="width: 15rem;"><p style="${NOTE_STYLE}">Zentriert, aber 8 px vom Rand verschoben; der Pfeil zeigt auf den Auslöser.</p></div>
        </lc-popover>
      </div>
      <div style="display: flex; justify-content: flex-end;">
        <lc-popover position="right">
          <button popover-trigger type="button" style="${TRIGGER_STYLE}">Rechts</button>
          <div popover-content style="width: 15rem;"><p style="${NOTE_STYLE}">position="right" passt nicht: das Panel weicht nach unten aus.</p></div>
        </lc-popover>
      </div>
    </div>
  `,
})
class PopoverPlacementDemoComponent implements AfterViewInit {
  private readonly popovers = viewChildren(PopoverComponent);
  ngAfterViewInit(): void {
    // Demo only: open every panel at load, so the shot shows the placement.
    this.popovers().forEach((p) => p.open());
  }
}

/** 3.48 (usm-x row 64): a relation chip opens the object; a long press only shows its card. */
@Component({
  selector: 'lc-popover-long-press-description-demo',
  standalone: true,
  imports: [PopoverComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de" style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding-bottom: 160px;">
      <span style="${NOTE_STYLE}">Verknüpft mit</span>
      <lc-popover trigger="longpress" panelRole="tooltip" align="start">
        <a
          popover-trigger
          href="#ticket-4711"
          style="display: inline-flex; align-items: center; min-height: 44px; padding: 0 12px; border-radius: var(--border-radius-full); background: var(--color-surface-2); border: 1px solid var(--color-border-strong); color: var(--color-text-primary); text-decoration: none; font: inherit;"
          >Ticket 4711</a
        >
        <div popover-content style="width: 16rem;">
          <p style="${NOTE_STYLE}"><strong>Drucker im 3. OG</strong></p>
          <p style="${NOTE_STYLE} color: var(--color-text-secondary);">Offen · Priorität hoch · seit 4 Tagen</p>
        </div>
      </lc-popover>
    </div>
  `,
})
class PopoverLongPressDescriptionDemoComponent implements AfterViewInit {
  private readonly popovers = viewChildren(PopoverComponent);
  ngAfterViewInit(): void {
    // Demo only: the card is open at load, so the shot shows it.
    this.popovers().forEach((p) => p.open());
  }
}

const meta: Meta<PopoverComponent> = {
  title: 'Feedback/Popover',
  component: PopoverComponent,
  parameters: {
    docs: {
      description: {
        component: `
A floating panel for rich content triggered by click or hover.

**Key Features:**
- 4 positions (top, bottom, left, right)
- Click or hover trigger
- Optional arrow indicator
- Closes on click outside or Escape key
- Content projection for trigger and body
        `,
      },
    },
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Side of the trigger. 3.45: a panel that doesn’t fit flips (top ↔ bottom; left/right fall back to bottom, then top).',
      table: { defaultValue: { summary: 'bottom' } },
    },
    trigger: {
      control: 'select',
      options: ['click', 'hover', 'focus', 'longpress'],
      description:
        '`click`, `hover`; 3.45: `focus` (keyboard focus), `longpress` (touch hold of `longPressMs`, right click, Shift+F10, Menu key), or an array of kinds. Hover/focus-only panels are tooltips; interactive content needs `click` or `longpress`.',
      table: { defaultValue: { summary: 'click' } },
    },
    showArrow: { control: 'boolean', description: 'Arrow pointing at the trigger.', table: { defaultValue: { summary: 'true' } } },
    openDelay: {
      control: { type: 'number', min: 0, max: 2000 },
      description: '3.45: ms before a hover / focus opens the panel.',
      table: { defaultValue: { summary: '0' } },
    },
    closeDelay: {
      control: { type: 'number', min: 0, max: 2000 },
      description: '3.45: ms before leaving trigger and panel closes a hover / focus panel.',
      table: { defaultValue: { summary: '0' } },
    },
    longPressMs: {
      control: { type: 'number', min: 200, max: 2000 },
      description: '3.45: hold time of a `longpress` (a move of 10 px cancels it).',
      table: { defaultValue: { summary: '500' } },
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: '3.45: the panel’s start / end edge on the trigger’s, or centred. The panel shifts to stay 8 px inside the viewport; the arrow follows the trigger.',
      table: { defaultValue: { summary: 'center' } },
    },
    panelRole: {
      control: 'inline-radio',
      options: ['auto', 'tooltip'],
      description:
        '3.48 (usm-x row 64): `tooltip` keeps a `longpress` panel `role="tooltip"` (the trigger gets no `aria-haspopup`/`aria-expanded`/`aria-controls`, only `aria-describedby` while open; a tap outside or Escape closes it), for a card the long press only shows while the trigger’s own click does something else. Ignored with `click`.',
      table: { defaultValue: { summary: 'auto' } },
    },
  },
};

export default meta;
type Story = StoryObj<PopoverComponent>;

const panelStyle =
  'padding: 8px 0; display: flex; flex-direction: column;';
const itemStyle =
  'padding: 6px 16px; font-size: 14px; cursor: pointer; color: var(--color-text-primary);';

export const Default: Story = {
  args: { position: 'bottom', trigger: 'click', showArrow: true },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <lc-popover [position]="position" [trigger]="trigger" [showArrow]="showArrow">
          <button popover-trigger style="padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer;">
            Open Popover
          </button>
          <div popover-content>
            <div style="${panelStyle}">
              <div style="${itemStyle}">Edit</div>
              <div style="${itemStyle}">Duplicate</div>
              <div style="${itemStyle}">Archive</div>
              <div style="${itemStyle}; color: #9d0e0e;">Delete</div>
            </div>
          </div>
        </lc-popover>
      </div>`,
  }),
};

export const HoverTrigger: Story = {
  args: { position: 'bottom', trigger: 'hover', showArrow: true },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <lc-popover [position]="position" [trigger]="trigger" [showArrow]="showArrow">
          <span popover-trigger style="text-decoration: underline; cursor: help; color: #208497;">
            Hover me for details
          </span>
          <div popover-content>
            <p style="margin: 0; font-size: 14px; color: var(--color-text-primary);">
              This popover appears on hover and disappears when you move away.
            </p>
          </div>
        </lc-popover>
      </div>`,
  }),
};

export const Positions: Story = {
  render: () => ({
    template: `
      <div style="padding: 120px; display: flex; gap: 80px; justify-content: center; flex-wrap: wrap;">
        <lc-popover position="top">
          <button popover-trigger style="padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer;">Top</button>
          <div popover-content><p style="margin: 0; font-size: 14px;">Top popover</p></div>
        </lc-popover>
        <lc-popover position="bottom">
          <button popover-trigger style="padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer;">Bottom</button>
          <div popover-content><p style="margin: 0; font-size: 14px;">Bottom popover</p></div>
        </lc-popover>
        <lc-popover position="left">
          <button popover-trigger style="padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer;">Left</button>
          <div popover-content><p style="margin: 0; font-size: 14px;">Left popover</p></div>
        </lc-popover>
        <lc-popover position="right">
          <button popover-trigger style="padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer;">Right</button>
          <div popover-content><p style="margin: 0; font-size: 14px;">Right popover</p></div>
        </lc-popover>
      </div>`,
  }),
};

export const NoArrow: Story = {
  args: { position: 'bottom', trigger: 'click', showArrow: false },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 100px; display: flex; justify-content: center;">
        <lc-popover [position]="position" [showArrow]="showArrow">
          <button popover-trigger style="padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer;">
            No Arrow
          </button>
          <div popover-content>
            <p style="margin: 0; font-size: 14px; color: var(--color-text-primary);">
              A popover without the arrow indicator.
            </p>
          </div>
        </lc-popover>
      </div>`,
  }),
};

export const Triggers: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '3.45 (request 065, usm-x row 35). **Info card:** `[trigger]="[\'hover\', \'focus\', \'longpress\']"` with `openDelay` 300 and `closeDelay` 200: it opens after 300 ms of hover or on keyboard focus, on a 500 ms touch hold, right click, Shift+F10 or the Menu key; the pointer can move onto the panel (a bridge over the gap), Escape closes it and the same hover doesn’t reopen it until the pointer leaves. **Keyboard focus:** `trigger="focus"` only — a hover/focus-only panel is a `tooltip` the trigger is described by. **Long press:** `trigger="longpress"`; the click that ends the hold is cancelled. **Programmatic:** the outer buttons call `open()` and `close()`; `openChange` emits once per change.',
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 24px; padding-bottom: 160px;">
        <lc-popover [trigger]="['hover', 'focus', 'longpress']" [openDelay]="300" [closeDelay]="200">
          <button popover-trigger type="button" style="${TRIGGER_STYLE}">Info card (hover, focus, long press)</button>
          <div popover-content style="width: 16rem;">
            <p style="${NOTE_STYLE}"><strong>Cost centre 4711</strong><br />Facility management · owner M. Weber</p>
          </div>
        </lc-popover>
        <lc-popover trigger="focus">
          <button popover-trigger type="button" style="${TRIGGER_STYLE}">Keyboard focus only</button>
          <div popover-content style="width: 16rem;"><p style="${NOTE_STYLE}">Opens when the button gets keyboard focus.</p></div>
        </lc-popover>
        <lc-popover trigger="longpress">
          <button popover-trigger type="button" style="${TRIGGER_STYLE}">Long press or right click</button>
          <div popover-content style="width: 16rem;"><p style="${NOTE_STYLE}">Hold 500 ms on touch, right click, Shift+F10 or the Menu key.</p></div>
        </lc-popover>
        <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px;">
          <lc-popover #pop>
            <button popover-trigger type="button" style="${TRIGGER_STYLE}">Programmatic</button>
            <div popover-content style="width: 16rem;"><p style="${NOTE_STYLE}">Opened by open(), closed by close().</p></div>
          </lc-popover>
          <button type="button" style="${TRIGGER_STYLE}" (click)="$event.stopPropagation(); pop.open()">open()</button>
          <button type="button" style="${TRIGGER_STYLE}" (click)="$event.stopPropagation(); pop.close()">close()</button>
        </div>
      </div>`,
  }),
};

export const Placement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '3.45 (request 065, usm-x row 35): `align="start"` and `align="end"` line the panel up with the trigger’s start / end edge; a centred panel at the edge shifts to stay 8 px inside the viewport with its arrow on the trigger’s centre; `position="right"` without room falls back to bottom. All four are opened by `open()` at load (demo).',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [PopoverPlacementDemoComponent] },
    template: `<lc-popover-placement-demo />`,
  }),
};

export const LongPressDescription: Story = {
  name: 'Long Press Description',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.48 (request 068, usm-x row 64): the relation chip „Ticket 4711“ is a link that opens the object; a long press (or a right click, Shift+F10, the Menu key) only shows its card. `trigger="longpress"` with `panelRole="tooltip"`: the panel stays `role="tooltip"`, the chip is not announced as „has popup dialog“ (no `aria-haspopup`, `aria-expanded` or `aria-controls`), it is described by the card (`aria-describedby`) while open, and a tap outside or Escape closes it. The chip’s own click is untouched. The card is open at load (demo).',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [PopoverLongPressDescriptionDemoComponent] },
    template: `<lc-popover-long-press-description-demo />`,
  }),
};
