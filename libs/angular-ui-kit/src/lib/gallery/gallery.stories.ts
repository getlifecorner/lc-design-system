import type { Meta, StoryObj } from '@storybook/angular';
import { GalleryComponent, GalleryItem } from './gallery.component';

function generateItems(count: number, withCategories = false): GalleryItem[] {
  const categories = ['Nature', 'Architecture', 'People', 'Abstract'];
  return Array.from({ length: count }, (_, i) => ({
    src: `https://picsum.photos/seed/${i + 1}/800/600`,
    thumbnail: `https://picsum.photos/seed/${i + 1}/400/300`,
    alt: `Photo ${i + 1}`,
    caption: `Photo ${i + 1} — Sample image from Picsum`,
    ...(withCategories ? { category: categories[i % categories.length] } : {}),
  }));
}

const meta: Meta<GalleryComponent> = {
  title: 'Data Display/Gallery',
  component: GalleryComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
Gallery component for displaying image collections with lightbox.

**Key Features:**
- Grid and masonry layout modes
- Responsive column count via size presets (sm, md, lg thumbnails)
- Configurable custom column count
- Lightbox overlay with navigation (prev/next)
- Keyboard navigation (Arrow keys, Escape)
- Optional captions and category filtering
- Lazy loading with placeholder shimmer
- Zoom control in lightbox
- Download button in lightbox
- Dark/light theme support
`,
      },
    },
  },
  argTypes: {
    layout: { control: 'select', options: ['grid', 'masonry'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;

type Story = StoryObj<GalleryComponent>;

export const Default: Story = {
  args: {
    items: generateItems(9),
    layout: 'grid',
    size: 'md',
    gap: 8,
    showCaptions: false,
    enableLightbox: true,
  },
};

export const WithCaptions: Story = {
  args: {
    items: generateItems(6),
    layout: 'grid',
    size: 'md',
    showCaptions: true,
  },
};

export const WithCategories: Story = {
  args: {
    items: generateItems(12, true),
    layout: 'grid',
    size: 'md',
    showCaptions: true,
  },
};

export const MasonryLayout: Story = {
  args: {
    items: generateItems(12),
    layout: 'masonry',
    size: 'md',
    showCaptions: true,
  },
};

export const SmallThumbnails: Story = {
  args: {
    items: generateItems(16),
    layout: 'grid',
    size: 'sm',
    gap: 4,
  },
};

export const LargeThumbnails: Story = {
  args: {
    items: generateItems(4),
    layout: 'grid',
    size: 'lg',
    showCaptions: true,
    gap: 12,
  },
};

export const CustomColumns: Story = {
  args: {
    items: generateItems(10),
    layout: 'grid',
    columns: 5,
    gap: 6,
  },
};

export const LightboxDisabled: Story = {
  args: {
    items: generateItems(6),
    layout: 'grid',
    size: 'md',
    enableLightbox: false,
  },
};

export const KeyboardFocus: Story = {
  name: 'Keyboard Focus',
  parameters: {
    docs: {
      description: {
        story:
          '3.27 (request 042): the second category filter is focused as Tab would focus it (in the story view). Filter buttons show the kit ring: 2 px `--color-primary-500`, 2 px outside (4.17:1 light, 9.95:1 dark on the page), `Highlight` in forced colours. A mouse click shows none (`:focus-visible`).',
      },
    },
  },
  args: {
    items: generateItems(4, true),
    layout: 'grid',
    size: 'md',
    showCaptions: true,
  },
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    canvasElement.querySelectorAll<HTMLElement>('.gallery__filter-btn')[1]?.focus({ preventScroll: true });
  },
};
