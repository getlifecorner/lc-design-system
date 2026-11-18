import type { Meta, StoryObj } from '@storybook/angular';
import { AvatarGroupComponent } from './avatar-group.component';

const meta: Meta<AvatarGroupComponent> = {
  title: 'Data Display/Avatar Group',
  component: AvatarGroupComponent,
  argTypes: {
    avatars: {
      description:
        'Avatars to show (`AvatarGroupItem[]`: `name`, `src`, `alt`, `color` — `default` or a member colour `member-1` … `member-6`). 3.48 (usm-x row 66): `bg` / `fg` set the item\'s identity colours (`--lc-avatar-bg` / `--lc-avatar-color` on that avatar; any colour or `var()`), pick a 4.5:1 pair',
      table: { defaultValue: { summary: '[]' } },
    },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'], description: 'Size of every avatar' },
    max: { control: 'number', description: 'Maximum visible avatars before the "+N" count' },
    ring: {
      control: 'boolean',
      description:
        'Separate the avatars with a ring in the page colour (`--lc-avatar-ring-color`, default `--color-background`) instead of the 2 px surface border; later avatars sit on top',
      table: { defaultValue: { summary: 'false' } },
    },
    overlap: {
      control: 'text',
      description: 'How far each avatar overlaps the previous one (CSS length, e.g. `4px`); empty keeps the size default (6–12 px)',
      table: { defaultValue: { summary: "''" } },
    },
  },

  parameters: {
    docs: {
      description: {
        component: `
Avatar group component for displaying multiple user avatars.

**Key Features:**
- Overlapping avatar display with configurable max visible count
- Overflow indicator showing remaining count
- Shared size variant across all avatars (xs, sm, md, lg)
- Automatic truncation based on max property
- Member colours per item (\`color\`), later avatars on top
- \`ring\` + \`overlap="4px"\`: the member row of the "Weite" look (LK-7)
`,
      },
    },
  },
};

export default meta;
type Story = StoryObj<AvatarGroupComponent>;

const teamMembers = [
  { name: 'Alice Anders' },
  { name: 'Bob Bauer' },
  { name: 'Charlie Chen' },
  { name: 'Diana Dietrich' },
  { name: 'Erik Engel' },
  { name: 'Fiona Fischer' },
  { name: 'Georg Gross' },
];

export const Default: Story = {
  args: { avatars: teamMembers, size: 'md', max: 5 },
};

export const Small: Story = {
  args: { avatars: teamMembers.slice(0, 4), size: 'sm', max: 4 },
};

export const Large: Story = {
  args: { avatars: teamMembers, size: 'lg', max: 4 },
};

export const NoOverflow: Story = {
  args: { avatars: teamMembers.slice(0, 3), size: 'md', max: 5 },
};

export const WithImages: Story = {
  args: {
    avatars: [
      { name: 'Alice', src: 'https://i.pravatar.cc/100?img=1', alt: 'Alice' },
      { name: 'Bob', src: 'https://i.pravatar.cc/100?img=2', alt: 'Bob' },
      { name: 'Charlie', src: 'https://i.pravatar.cc/100?img=3', alt: 'Charlie' },
      { name: 'Diana', src: 'https://i.pravatar.cc/100?img=4', alt: 'Diana' },
      { name: 'Erik', src: 'https://i.pravatar.cc/100?img=5', alt: 'Erik' },
    ],
    size: 'lg',
    max: 4,
  },
};

/** The "Weite" member row (LK-7): member colours, a page-coloured ring and a 4 px overlap. */
export const MemberRow: Story = {
  args: {
    avatars: [
      { name: 'Johanna-Friederike Apfelbaum-Kieselbacher-Morgentau', color: 'member-1' },
      { name: 'Tom Ek', color: 'member-2' },
      { name: 'Lena Morgen', color: 'member-3' },
    ],
    size: 'sm',
    ring: true,
    overlap: '4px',
  },
};

/** 3.48 (request 068, usm-x row 66): presence wears the tone of each person's chip. */
export const IdentityColours: Story = {
  name: 'Identity Colours',
  parameters: {
    docs: {
      description: {
        story:
          '3.48 (usm-x row 66): `AvatarGroupItem.bg` / `fg` give each avatar its identity colour (set as `--lc-avatar-bg` / `--lc-avatar-color` on that avatar), so presence wears the same tone as the person\'s chip. The demo pairs are theme-independent: white on #0f5e74 (7.31:1), #9a4a14 (6.24:1) and #4b3f8f (8.73:1); the fourth avatar keeps a member colour.',
      },
    },
  },
  args: {
    avatars: [
      { name: 'Lena Brandt', bg: '#0f5e74', fg: '#ffffff' },
      { name: 'Tom Ek', bg: '#9a4a14', fg: '#ffffff' },
      { name: 'Kai von Stein', bg: '#4b3f8f', fg: '#ffffff' },
      { name: 'Ada Morgen', color: 'member-2' },
    ],
    size: 'md',
    ring: true,
  },
};

