import type { Meta, StoryObj } from '@storybook/angular';
import { AvatarComponent, avatarInitials } from './avatar.component';

/**
 * Avatars represent users or entities with initials, images, or status indicators.
 * Used in headers, comments, team lists, and anywhere you need to identify a person.
 */
const meta: Meta<AvatarComponent> = {
  title: 'Data Display/Avatar',
  component: AvatarComponent,
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Controls the avatar dimensions from 24px (xs) to 64px (xl)',
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'away', 'busy'],
      description: 'Shows a colored dot indicator for user presence',
    },
    name: { description: 'Full name — initials are extracted automatically (e.g. "John Doe" → "JD")' },
    src: { description: 'URL for the avatar image. Falls back to initials if the image fails to load' },
    color: {
      control: 'select',
      options: ['default', 'member-1', 'member-2', 'member-3', 'member-4', 'member-5', 'member-6'],
      description:
        'Background of the initials: `default` (neutral) or a member colour `member-1` … `member-6` (teal, rust, violet, sage, berry, slate) with white initials, each at least 4.5:1. Assign per person in a stable order; `AVATAR_MEMBER_COLORS` lists them',
      table: { defaultValue: { summary: 'default' } },
    },
    ring: {
      control: 'boolean',
      description:
        'A ring in the page colour around the avatar (3 px; 2 px for xs/sm) so stacked avatars stay apart. Colour: `--lc-avatar-ring-color` (default `--color-background`)',
      table: { defaultValue: { summary: 'false' } },
    },
    loading: {
      control: 'inline-radio',
      options: ['eager', 'lazy'],
      description:
        'How the browser loads the image. `lazy`: for an avatar below the fold; writes `loading="lazy"`. `eager` writes no attribute (the browser default). The initials still replace an image that fails.',
      table: { defaultValue: { summary: "'eager'" } },
    },
    fallback: {
      control: 'inline-radio',
      options: ['initials', 'person'],
      description:
        "3.15: what shows without an image and without a `name`. `'initials'`: \"?\" (as before). `'person'`: a person glyph (60 % of the circle, `--color-neutral-700` on `--color-neutral-300`; 7.00:1 light, 6.10:1 dark), neutral whatever the `color`. A `name` still shows its initials; a failed image falls back to the person",
      table: { defaultValue: { summary: "'initials'" } },
    },
    shape: {
      control: 'inline-radio',
      options: ['circle', 'square'],
      description:
        "3.48 (usm-x row 65): `'square'` draws a rounded square (`--lc-avatar-square-radius`, default 25 %: 6/8/10/12/16 px at xs…xl) for a thing (a ticket, a CI) beside round people; image, ring and person glyph follow it, colours are unchanged",
      table: { defaultValue: { summary: "'circle'" } },
    },
  },

  parameters: {
    docs: {
      description: {
        component: `
Avatar component for circular user representation.

**Key Features:**
- Image display with fallback to initials
- Auto-generated initials from user name
- Status indicator (online, offline, busy, away)
- Multiple size variants (xs, sm, md, lg, xl)
- Member colours (\`color\`: \`member-1\` … \`member-6\`) with white initials — colour is never the only cue, the initials and the name stay
- \`ring\`: a gap in the page colour, for stacks and avatars on tints
- Accessible with alt text support
- The \`<img>\` carries the size's px as \`width\`/\`height\` (xs 24, sm 32, md 40, lg 48, xl 64; 3.11.2, G-40), and \`loading="lazy"\` defers an avatar below the fold
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<AvatarComponent>;

export const WithInitials: Story = {
  name: 'Initials',
  args: { name: 'Sarah Connor', size: 'md' },
};

export const WithImage: Story = {
  name: 'Image',
  args: { src: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', alt: 'Sarah Connor', name: 'Sarah Connor', size: 'md' },
};

export const OnlineStatus: Story = {
  args: { name: 'David Park', size: 'md', status: 'online' },
};

export const BusyStatus: Story = {
  args: { name: 'Maria Garcia', size: 'md', status: 'busy' },
};

export const AllSizes: Story = {
  name: 'Size Comparison',
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="text-align: center;">
          <lc-avatar name="Anna Bell" size="xs"></lc-avatar>
          <div style="margin-top: 4px; font-size: 11px; color: #666;">xs</div>
        </div>
        <div style="text-align: center;">
          <lc-avatar name="Ben Carter" size="sm"></lc-avatar>
          <div style="margin-top: 4px; font-size: 11px; color: #666;">sm</div>
        </div>
        <div style="text-align: center;">
          <lc-avatar name="Clara Davis" size="md"></lc-avatar>
          <div style="margin-top: 4px; font-size: 11px; color: #666;">md</div>
        </div>
        <div style="text-align: center;">
          <lc-avatar name="Daniel Evans" size="lg"></lc-avatar>
          <div style="margin-top: 4px; font-size: 11px; color: #666;">lg</div>
        </div>
        <div style="text-align: center;">
          <lc-avatar name="Emma Fischer" size="xl"></lc-avatar>
          <div style="margin-top: 4px; font-size: 11px; color: #666;">xl</div>
        </div>
      </div>`,
  }),
};

export const StatusVariants: Story = {
  name: 'All Status Indicators',
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 24px;">
        <div style="text-align: center;">
          <lc-avatar name="Online User" size="lg" status="online"></lc-avatar>
          <div style="margin-top: 8px; font-size: 12px; color: #666;">Online</div>
        </div>
        <div style="text-align: center;">
          <lc-avatar name="Away User" size="lg" status="away"></lc-avatar>
          <div style="margin-top: 8px; font-size: 12px; color: #666;">Away</div>
        </div>
        <div style="text-align: center;">
          <lc-avatar name="Busy User" size="lg" status="busy"></lc-avatar>
          <div style="margin-top: 8px; font-size: 12px; color: #666;">Busy</div>
        </div>
        <div style="text-align: center;">
          <lc-avatar name="Offline User" size="lg" status="offline"></lc-avatar>
          <div style="margin-top: 8px; font-size: 12px; color: #666;">Offline</div>
        </div>
      </div>`,
  }),
};

export const TeamList: Story = {
  name: 'Team Members (Composition)',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 320px;">
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px;">
          <lc-avatar name="Alice Johnson" size="md" status="online"></lc-avatar>
          <div>
            <div style="font-weight: 500;">Alice Johnson</div>
            <div style="font-size: 12px; color: #666;">Product Manager</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px;">
          <lc-avatar name="Bob Williams" size="md" status="busy"></lc-avatar>
          <div>
            <div style="font-weight: 500;">Bob Williams</div>
            <div style="font-size: 12px; color: #666;">Senior Engineer</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px;">
          <lc-avatar name="Carol Martinez" size="md" status="away"></lc-avatar>
          <div>
            <div style="font-weight: 500;">Carol Martinez</div>
            <div style="font-size: 12px; color: #666;">UX Designer</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px;">
          <lc-avatar name="Dan Lee" size="md" status="offline"></lc-avatar>
          <div>
            <div style="font-weight: 500;">Dan Lee</div>
            <div style="font-size: 12px; color: #666;">QA Engineer</div>
          </div>
        </div>
      </div>`,
  }),
};

export const AvatarStack: Story = {
  name: 'Stacked Avatars',
  render: () => ({
    template: `
      <div style="display: flex;">
        <lc-avatar name="User One" size="md" style="margin-left: 0; border: 2px solid white; border-radius: 50%;"></lc-avatar>
        <lc-avatar name="User Two" size="md" style="margin-left: -8px; border: 2px solid white; border-radius: 50%;"></lc-avatar>
        <lc-avatar name="User Three" size="md" style="margin-left: -8px; border: 2px solid white; border-radius: 50%;"></lc-avatar>
        <lc-avatar name="+5" size="md" style="margin-left: -8px; border: 2px solid white; border-radius: 50%;"></lc-avatar>
      </div>`,
  }),
};

/** The six member colours (LK-7) in join order, white initials on each. */
export const MemberColors: Story = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
        <lc-avatar name="Johanna Apfelbaum" color="member-1" />
        <lc-avatar name="Tom Ek" color="member-2" />
        <lc-avatar name="Lena Morgen" color="member-3" />
        <lc-avatar name="Ole Sand" color="member-4" />
        <lc-avatar name="Bea Kraus" color="member-5" />
        <lc-avatar name="Kai Stein" color="member-6" />
      </div>`,
  }),
};

/** A member colour with the ring, as in a stack on the page. */
export const MemberWithRing: Story = {
  args: { name: 'Tom Ek', size: 'lg', color: 'member-2', ring: true },
};

/**
 * The image at every size (3.11.2, G-40): the `<img>` carries the size's px
 * as `width`/`height`, equal to the box.
 */
export const ImageSizes: Story = {
  name: 'Image Size Comparison',
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="text-align: center;">
          <lc-avatar src="/assets/lifecorner-emblem.svg" alt="LifeCorner" size="xs"></lc-avatar>
          <div style="margin-top: 4px; font-size: 11px; color: var(--color-text-secondary);">xs</div>
        </div>
        <div style="text-align: center;">
          <lc-avatar src="/assets/lifecorner-emblem.svg" alt="LifeCorner" size="sm"></lc-avatar>
          <div style="margin-top: 4px; font-size: 11px; color: var(--color-text-secondary);">sm</div>
        </div>
        <div style="text-align: center;">
          <lc-avatar src="/assets/lifecorner-emblem.svg" alt="LifeCorner" size="md"></lc-avatar>
          <div style="margin-top: 4px; font-size: 11px; color: var(--color-text-secondary);">md</div>
        </div>
        <div style="text-align: center;">
          <lc-avatar src="/assets/lifecorner-emblem.svg" alt="LifeCorner" size="lg"></lc-avatar>
          <div style="margin-top: 4px; font-size: 11px; color: var(--color-text-secondary);">lg</div>
        </div>
        <div style="text-align: center;">
          <lc-avatar src="/assets/lifecorner-emblem.svg" alt="LifeCorner" size="xl"></lc-avatar>
          <div style="margin-top: 4px; font-size: 11px; color: var(--color-text-secondary);">xl</div>
        </div>
      </div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'The `<img>` carries `width`/`height` 24, 32, 40, 48 and 64, so the browser reserves the circle before the file loads. CSS sizes the box (1.5 … 4 rem), so at 200 % text the box grows and the attributes only give the 1:1 ratio.',
      },
    },
  },
};

/** `loading="lazy"` for an avatar below the fold (3.11.2, G-40). */
export const LazyImage: Story = {
  name: 'Lazy Image',
  args: { src: '/assets/lifecorner-emblem.svg', alt: 'LifeCorner', name: 'Life Corner', size: 'lg', loading: 'lazy' },
  parameters: {
    docs: {
      description: {
        story:
          'The `<img>` carries `loading="lazy"` and `width`/`height` 48: the browser fetches it only near the viewport, into a reserved circle. The initials still replace an image that fails. `eager` (the default) writes no attribute.',
      },
    },
  },
};

/** 3.15 (finance-intelligence app-shell-prove 5): a person instead of "?" when there is no name. */
export const PersonFallback: Story = {
  args: { fallback: 'person' },
  parameters: {
    docs: {
      description: {
        story:
          'Row 1: `fallback` (the control) without a `name`, xs to xl (24 … 64 px, glyph 60 %). Row 2: with a `name` the initials show; `color="member-1"` without a name stays neutral; a broken `src` without a name falls back to the person; `decorative` drops `role="img"` and the label. Without `alt` the accessible name stays "Avatar".',
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <lc-avatar size="xs" [fallback]="fallback" />
          <lc-avatar size="sm" [fallback]="fallback" />
          <lc-avatar size="md" [fallback]="fallback" />
          <lc-avatar size="lg" [fallback]="fallback" />
          <lc-avatar size="xl" [fallback]="fallback" />
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <lc-avatar size="lg" name="Rita Berger" [fallback]="fallback" />
          <lc-avatar size="lg" color="member-1" [fallback]="fallback" />
          <lc-avatar size="lg" src="/assets/avatar-does-not-exist.png" [fallback]="fallback" />
          <lc-avatar size="lg" [decorative]="true" [fallback]="fallback" />
        </div>
      </div>`,
  }),
};

/**
 * 3.45 (usm-x row 37): an app's identity colours through `--lc-avatar-bg` and
 * `--lc-avatar-color`, on the avatar itself or on any ancestor.
 */
export const IdentityColours: Story = {
  name: 'Identity Colours',
  parameters: {
    docs: {
      description: {
        story:
          'Row 1: the hooks on each avatar (`style="--lc-avatar-bg: …; --lc-avatar-color: …"`): `--color-secondary-fill` + `--color-on-secondary` (4.62:1), `--color-surface-selected` + `--color-on-surface-selected` (7.85:1 light, 8.14:1 dark). Row 2: the same pair on a wrapper, so every avatar inside takes it, also one with `color="member-3"` (the hooks win over a member colour). Row 3: no hooks, the defaults (neutral, member-1). The `person` fallback keeps its neutral disc. Pick a pair at 4.5:1 or more.',
      },
    },
    controls: { include: [] },
  },
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
          <lc-avatar size="lg" name="Johanna Apfelbaum" style="--lc-avatar-bg: var(--color-secondary-fill); --lc-avatar-color: var(--color-on-secondary);" />
          <lc-avatar size="lg" name="Tom Ek" style="--lc-avatar-bg: var(--color-surface-selected); --lc-avatar-color: var(--color-on-surface-selected);" />
        </div>
        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap; --lc-avatar-bg: var(--color-surface-selected); --lc-avatar-color: var(--color-on-surface-selected);">
          <lc-avatar size="lg" name="Lena Morgen" />
          <lc-avatar size="lg" name="Ole Sand" color="member-3" />
          <lc-avatar size="lg" fallback="person" />
        </div>
        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
          <lc-avatar size="lg" name="Bea Kraus" />
          <lc-avatar size="lg" name="Kai Stein" color="member-1" />
        </div>
      </div>`,
  }),
};

/** 3.45 (usm-x row 37): the one initials rule, `avatarInitials(name)`. */
export const InitialsRule: Story = {
  name: 'Initials Rule',
  parameters: {
    docs: {
      description: {
        story:
          '`avatarInitials(name)` (exported from `@lifecorner/angular-ui-kit/avatar`) is the rule of `lc-avatar`, `lc-avatar-group` and `lc-header`: the first letter of the first and of the last whitespace-separated word, upper case; one word gives its first letter; empty gives "?". Use it wherever the app shows initials next to the kit’s.',
      },
    },
    controls: { include: [] },
  },
  render: () => ({
    props: {
      rows: ['Lena Maria Brandt', 'tom ek', 'Administrator', '  Kai   von Stein  ', ''].map((name) => ({
        name,
        initials: avatarInitials(name),
      })),
    },
    template: `
      <ul style="display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; color: var(--color-text-primary); font-size: 14px;">
        @for (row of rows; track $index) {
          <li style="display: flex; align-items: center; gap: 12px;">
            <lc-avatar size="md" [name]="row.name" [decorative]="true" />
            <code style="color: var(--color-text-secondary);">"{{ row.name }}"</code> → <strong>{{ row.initials }}</strong>
          </li>
        }
      </ul>`,
  }),
};

/** 3.48 (request 068, usm-x row 65): things wear a rounded square beside round people. */
export const SquareShape: Story = {
  name: 'Square Shape',
  parameters: {
    docs: {
      description: {
        story:
          '3.48 (usm-x row 65): `shape="square"` at every size with an image, initials (a ticket „T4“, a member colour) and the person fallback; the round person avatar on the left of each row for comparison. The radius is 25 % of the box (6/8/10/12/16 px at xs…xl, `--lc-avatar-square-radius`); the ring follows it; colours and the initials\' contrast are unchanged.',
      },
    },
    controls: { include: [] },
  },
  render: () => ({
    props: { sizes: ['xs', 'sm', 'md', 'lg', 'xl'] },
    template: `
      <div lang="de" style="display: grid; gap: 16px;">
        @for (size of sizes; track size) {
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px;">
            <lc-avatar [size]="size" name="Lena Brandt" color="member-1" />
            <lc-avatar [size]="size" shape="square" src="/assets/lifecorner-emblem.svg" alt="Server LC-01" />
            <lc-avatar [size]="size" shape="square" name="T4" alt="Ticket 4711" />
            <lc-avatar [size]="size" shape="square" name="Change Request" color="member-4" [ring]="true" />
            <lc-avatar [size]="size" shape="square" fallback="person" />
          </div>
        }
      </div>`,
  }),
};

