import type { Meta, StoryObj } from '@storybook/angular';
import { SkeletonComponent } from './skeleton.component';
import { CardComponent } from '../card/card.component';

/**
 * Skeleton loaders provide a visual placeholder while content is loading.
 * They improve perceived performance by showing the expected layout shape
 * before data arrives. Available in line, circle, and rectangle variants.
 */
const meta: Meta<SkeletonComponent> = {
  title: 'Feedback/Skeleton',
  component: SkeletonComponent,
  argTypes: {
    variant: {
      control: 'select',
      options: ['line', 'circle', 'rect'],
      description: 'Shape of the skeleton — line for text, circle for avatars, rect for images/cards',
      table: { defaultValue: { summary: "'line'" } },
    },
    width: {
      description: 'Custom width (CSS value, e.g. "200px" or "60%"), applied once on the host',
      table: { defaultValue: { summary: "'100%' for line and rect, '40px' for circle" } },
    },
    height: {
      description: 'Custom height (CSS value)',
      table: { defaultValue: { summary: "'0.875rem' for line, '40px' for circle, '100px' for rect" } },
    },
    borderRadius: {
      description: 'Custom border radius for the rect variant',
      table: { defaultValue: { summary: "'0.25rem' for line, '50%' for circle, '0.5rem' for rect" } },
    },
  },

  parameters: {
    docs: {
      description: {
        component: `
Skeleton loader component for placeholder loading states.

**Key Features:**
- Variant shapes (text, rect, circle)
- Shimmer animation effect; a static fill under \`prefers-reduced-motion: reduce\` (since 3.3)
- Custom width, height, and border radius
- Composable for building complex loading layouts
- Dark mode compatible

**Colours:** the fill is \`--color-skeleton\` with the shimmer band \`--color-skeleton-highlight\`
(both visible on the white light page and on cards). Override per use with the hooks
\`--lc-skeleton-bg\` and \`--lc-skeleton-highlight\` on the element or an ancestor.

**Height from CSS (3.9, AS-27):** \`--lc-skeleton-height\` sets the fill's height from a
stylesheet, e.g. in a container query or in \`cqi\`, so a placeholder follows the tiles it
stands for. It wins over the \`height\` input (which stays the default) and works for every
variant; it changes only the height, so a circle becomes an oval unless its width follows.
Set it on the \`lc-skeleton\` element (a class): set on a wrapper, it reaches every skeleton
inside. See *Height from container*.

**Width (3.22.2):** \`width\` (CSS value) is applied once, to the host: a percentage is a share of
the containing block and the fill always spans the host (since 3.22.2; before, a percentage applied
twice, so \`30%\` drew 9 %). See *Percentage widths*.
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<SkeletonComponent>;

export const Line: Story = {
  name: 'Text Line',
  args: { variant: 'line', width: '100%', height: '16px' },
};

export const Circle: Story = {
  name: 'Circle (Avatar)',
  args: { variant: 'circle', width: '48px', height: '48px' },
};

export const Rectangle: Story = {
  name: 'Rectangle (Image)',
  args: { variant: 'rect', width: '200px', height: '120px', borderRadius: '8px' },
};

export const TextBlock: Story = {
  name: 'Text Block',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px; max-width: 400px;">
        <lc-skeleton variant="line" width="70%"></lc-skeleton>
        <lc-skeleton variant="line" width="100%"></lc-skeleton>
        <lc-skeleton variant="line" width="100%"></lc-skeleton>
        <lc-skeleton variant="line" width="45%"></lc-skeleton>
      </div>`,
  }),
};

export const UserCard: Story = {
  name: 'User Card Loading',
  render: () => ({
    template: `
      <div style="display: flex; gap: 12px; align-items: flex-start; padding: 16px; border: 1px solid #eee; border-radius: 8px; max-width: 360px;">
        <lc-skeleton variant="circle" width="48px" height="48px"></lc-skeleton>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
          <lc-skeleton variant="line" width="40%"></lc-skeleton>
          <lc-skeleton variant="line" width="65%"></lc-skeleton>
          <lc-skeleton variant="line" width="50%"></lc-skeleton>
        </div>
      </div>`,
  }),
};

export const ArticleCard: Story = {
  name: 'Article Card Loading',
  render: () => ({
    template: `
      <div style="border: 1px solid #eee; border-radius: 12px; overflow: hidden; max-width: 320px;">
        <lc-skeleton variant="rect" width="100%" height="180px"></lc-skeleton>
        <div style="padding: 16px; display: flex; flex-direction: column; gap: 10px;">
          <lc-skeleton variant="line" width="80%"></lc-skeleton>
          <lc-skeleton variant="line" width="100%"></lc-skeleton>
          <lc-skeleton variant="line" width="60%"></lc-skeleton>
          <div style="display: flex; gap: 8px; margin-top: 8px; align-items: center;">
            <lc-skeleton variant="circle" width="24px" height="24px"></lc-skeleton>
            <lc-skeleton variant="line" width="100px"></lc-skeleton>
          </div>
        </div>
      </div>`,
  }),
};

export const TableLoading: Story = {
  name: 'Table Rows Loading',
  render: () => ({
    template: `
      <div style="max-width: 500px;">
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
          <lc-skeleton variant="line" width="30%"></lc-skeleton>
          <lc-skeleton variant="line" width="20%"></lc-skeleton>
          <lc-skeleton variant="line" width="25%"></lc-skeleton>
          <lc-skeleton variant="line" width="15%"></lc-skeleton>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
          <lc-skeleton variant="line" width="30%"></lc-skeleton>
          <lc-skeleton variant="line" width="20%"></lc-skeleton>
          <lc-skeleton variant="line" width="25%"></lc-skeleton>
          <lc-skeleton variant="line" width="15%"></lc-skeleton>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
          <lc-skeleton variant="line" width="30%"></lc-skeleton>
          <lc-skeleton variant="line" width="20%"></lc-skeleton>
          <lc-skeleton variant="line" width="25%"></lc-skeleton>
          <lc-skeleton variant="line" width="15%"></lc-skeleton>
        </div>
      </div>`,
  }),
};

export const DashboardGrid: Story = {
  name: 'Dashboard Loading (Composition)',
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 700px;">
        <div style="border: 1px solid #eee; border-radius: 8px; padding: 16px;">
          <lc-skeleton variant="line" width="50%"></lc-skeleton>
          <div style="margin-top: 12px;"><lc-skeleton variant="line" width="60%" height="28px"></lc-skeleton></div>
          <div style="margin-top: 8px;"><lc-skeleton variant="line" width="40%"></lc-skeleton></div>
        </div>
        <div style="border: 1px solid #eee; border-radius: 8px; padding: 16px;">
          <lc-skeleton variant="line" width="50%"></lc-skeleton>
          <div style="margin-top: 12px;"><lc-skeleton variant="line" width="60%" height="28px"></lc-skeleton></div>
          <div style="margin-top: 8px;"><lc-skeleton variant="line" width="40%"></lc-skeleton></div>
        </div>
        <div style="border: 1px solid #eee; border-radius: 8px; padding: 16px;">
          <lc-skeleton variant="line" width="50%"></lc-skeleton>
          <div style="margin-top: 12px;"><lc-skeleton variant="line" width="60%" height="28px"></lc-skeleton></div>
          <div style="margin-top: 8px;"><lc-skeleton variant="line" width="40%"></lc-skeleton></div>
        </div>
      </div>`,
  }),
};

/**
 * 3.22.2 (request 032, finance-intelligence cockpit row 3): a percentage
 * `width` is applied once, on the host, so `60%` / `30%` in a `space-between`
 * row are 60 % and 30 % of the row, and the second ends at its right edge.
 */
export const PercentageWidths: Story = {
  name: 'Percentage widths',
  parameters: {
    docs: {
      description: {
        story:
          'Since 3.22.2 a percentage `width` is applied once, on the host, and the fill spans it: in this 294 px row (360 px) `60%` is 176.4 px and `30%` is 88.2 px and ends at the card\'s content edge (3.22.1: 105.8 / 26.5 px).',
      },
    },
  },
  render: () => ({
    moduleMetadata: { imports: [SkeletonComponent, CardComponent] },
    template: `
      <div class="story-pw">
        <lc-card variant="outlined" padding="md" borderRadius="md">
          <div class="story-pw__lines">
            <lc-skeleton width="45%" height="1.25rem" />
            <lc-skeleton width="30%" />
            <div class="story-pw__item">
              <div class="story-pw__row">
                <lc-skeleton width="60%" height="1.25rem" />
                <lc-skeleton width="30%" height="1.25rem" />
              </div>
              <div class="story-pw__row">
                <lc-skeleton width="80%" height="0.75rem" />
                <lc-skeleton width="15%" height="0.75rem" />
              </div>
            </div>
            <div class="story-pw__item">
              <div class="story-pw__row">
                <lc-skeleton width="60%" height="1.25rem" />
                <lc-skeleton width="30%" height="1.25rem" />
              </div>
              <div class="story-pw__row">
                <lc-skeleton width="80%" height="0.75rem" />
                <lc-skeleton width="15%" height="0.75rem" />
              </div>
            </div>
            <div class="story-pw__item">
              <div class="story-pw__row">
                <lc-skeleton width="60%" height="1.25rem" />
                <lc-skeleton width="30%" height="1.25rem" />
              </div>
              <div class="story-pw__row">
                <lc-skeleton width="80%" height="0.75rem" />
                <lc-skeleton width="15%" height="0.75rem" />
              </div>
            </div>
          </div>
        </lc-card>
      </div>
      <style>
        .story-pw { max-width: 30rem; }
        .story-pw__lines { display: flex; flex-direction: column; gap: var(--spacing-3); }
        .story-pw__item { display: flex; flex-direction: column; gap: var(--spacing-2); }
        .story-pw__row { display: flex; justify-content: space-between; align-items: center; }
      </style>`,
  }),
};

/**
 * 3.9 (AS-27): `--lc-skeleton-height` from a container query. The tiles are
 * 88 px across and 59 px once the list is narrower than 21.5rem and they stack;
 * the heading line is 14 px, 20 px from a 40rem container.
 */
export const HeightFromContainer: StoryObj<SkeletonComponent & { '--lc-skeleton-height': string }> = {
  name: 'Height from container',
  argTypes: {
    '--lc-skeleton-height': {
      control: false,
      description:
        'CSS hook on `lc-skeleton`: the fill\'s height from CSS (a container query, `cqi`). Wins over the `height` input; unset, the `height` input applies, else the variant default. Set it on the element: on a wrapper it reaches every skeleton inside.',
      table: { category: 'CSS hooks', defaultValue: { summary: 'unset (the height input)' } },
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'The tiles keep `height="88px"`; below a 21.5rem list they stack and `--lc-skeleton-height: 59px` (in `@container (max-width: 21.5rem)`) wins over it. The heading line keeps `height="14px"` and gets `--lc-skeleton-height: 20px` from `@container (min-width: 40rem)`. At 360 px: tiles 59 px, stacked, line 14 px; from 1024 px: tiles 88 px in a row, line 20 px.',
      },
    },
  },
  render: () => ({
    template: `
      <div class="story-hfc">
        <div style="width: 60%"><lc-skeleton class="story-hfc__line" height="14px" borderRadius="6px" /></div>
        <div class="story-hfc__tiles">
          <lc-skeleton class="story-hfc__tile" variant="rect" height="88px" borderRadius="18px" />
          <lc-skeleton class="story-hfc__tile" variant="rect" height="88px" borderRadius="18px" />
          <lc-skeleton class="story-hfc__tile" variant="rect" height="88px" borderRadius="18px" />
        </div>
      </div>
      <style>
        .story-hfc { container-type: inline-size; display: flex; flex-direction: column; gap: 12px; }
        .story-hfc__tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
        @container (max-width: 21.5rem) {
          .story-hfc__tiles { grid-template-columns: minmax(0, 1fr); }
          .story-hfc__tile { --lc-skeleton-height: 59px; }
        }
        @container (min-width: 40rem) {
          .story-hfc__line { --lc-skeleton-height: 20px; }
        }
      </style>`,
  }),
};
