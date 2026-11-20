import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { fn } from 'storybook/test';
import { ChangeDetectionStrategy, Component, computed, input, signal, type OnDestroy } from '@angular/core';
import { TableComponent, type RowToggleEvent, type SortEvent, type TableAction, type TableColumn } from './table.component';
import { TableCellDirective } from './table-cell.directive';
import { SortableHeadComponent } from './sortable-head.component';
import { BadgeComponent } from '../badge/badge.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { ChipComponent } from '../chip/chip.component';
import { ButtonComponent } from '../button/button.component';
import { MoneyComponent } from '../money/money.component';
import { SwitchComponent } from '../switch/switch.component';

/** Texts of the lazy-tree page (request 063), English and German. */
const LAZY_TEXTS = {
  en: {
    columns: [
      { key: 'name', label: 'Budget' },
      { key: 'plan', label: 'Plan (€)', align: 'end' },
      { key: 'actual', label: 'Actual (€)', align: 'end' },
    ] as TableColumn[],
    caption: 'Budgets with plan items',
    rows: [
      { id: 'b1', parentId: '', name: 'IT operations', plan: '120,000', actual: '98,400', hasPlanItems: true },
      { id: 'b2', parentId: '', name: 'Licences', plan: '80,000', actual: '81,200', hasPlanItems: true },
      { id: 'b3', parentId: '', name: 'Hardware', plan: '45,000', actual: '39,900', hasPlanItems: true },
      { id: 'b4', parentId: '', name: 'Consulting', plan: '20,000', actual: '15,000', hasPlanItems: false },
    ],
    items: [
      ['Maintenance contracts', '40,000', '38,100'],
      ['Cloud subscriptions', '25,000', '27,300'],
      ['Support hours', '15,000', '15,800'],
    ],
    loading: 'Loading plan items…',
    loaded: (n: number) => `${n} plan items loaded`,
    expand: 'Expand:',
    collapse: 'Collapse:',
  },
  de: {
    columns: [
      { key: 'name', label: 'Budget' },
      { key: 'plan', label: 'Plan (€)', align: 'end' },
      { key: 'actual', label: 'Ist (€)', align: 'end' },
    ] as TableColumn[],
    caption: 'Budgets mit Planposten',
    rows: [
      { id: 'b1', parentId: '', name: 'IT-Betrieb', plan: '120.000', actual: '98.400', hasPlanItems: true },
      { id: 'b2', parentId: '', name: 'Lizenzen', plan: '80.000', actual: '81.200', hasPlanItems: true },
      { id: 'b3', parentId: '', name: 'Hardware', plan: '45.000', actual: '39.900', hasPlanItems: true },
      { id: 'b4', parentId: '', name: 'Beratung', plan: '20.000', actual: '15.000', hasPlanItems: false },
    ],
    items: [
      ['Wartungsverträge', '40.000', '38.100'],
      ['Cloud-Abonnements', '25.000', '27.300'],
      ['Supportstunden', '15.000', '15.800'],
    ],
    loading: 'Planposten werden geladen …',
    loaded: (n: number) => `${n} Planposten geladen`,
    expand: 'Aufklappen:',
    collapse: 'Einklappen:',
  },
};

/**
 * The page side of a lazy tree (request 063): on the first open of a budget it
 * "loads" three plan items (500 ms) and adds them to `data`, and it announces
 * the loading in its own `role="status"`. The table only shows the chevron.
 */
@Component({
  selector: 'lc-table-lazy-tree-demo',
  standalone: true,
  imports: [TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [attr.lang]="lang()" style="display: flex; flex-direction: column; gap: 8px;">
      <lc-table
        [columns]="texts().columns"
        [data]="data()"
        [caption]="texts().caption"
        [size]="size()"
        idKey="id"
        parentKey="parentId"
        treeColumn="name"
        hasChildrenKey="hasPlanItems"
        [expandRowAriaLabel]="texts().expand"
        [collapseRowAriaLabel]="texts().collapse"
        (rowToggle)="onToggle($event)"
      ></lc-table>
      <p role="status" style="margin: 0; font-size: var(--typography-font-size-sm); color: var(--color-text-secondary);">{{ status() }}</p>
    </div>
  `,
})
class TableLazyTreeDemoComponent {
  /** Language of the texts. */
  readonly lang = input<'en' | 'de'>('en');
  /** Table size. */
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  protected readonly texts = computed(() => LAZY_TEXTS[this.lang()]);
  private readonly children = signal<Record<string, unknown>[]>([]);
  private readonly requested = new Set<string>();
  protected readonly data = computed(() => [...this.texts().rows, ...this.children()]);
  protected readonly status = signal('');

  protected onToggle(event: RowToggleEvent): void {
    if (!event.expanded || !event.row['hasPlanItems'] || this.requested.has(event.id)) return;
    this.requested.add(event.id);
    const texts = this.texts();
    this.status.set(texts.loading);
    setTimeout(() => {
      const items = texts.items.map(([name, plan, actual], i) => ({
        id: `${event.id}-${i + 1}`,
        parentId: event.id,
        name,
        plan,
        actual,
      }));
      this.children.update((list) => [...list, ...items]);
      this.status.set(texts.loaded(items.length));
    }, 500);
  }
}

const meta: Meta<TableComponent> = {
  title: 'Data Display/Table',
  component: TableComponent,
  decorators: [
    moduleMetadata({
      imports: [
        TableComponent,
        TableCellDirective,
        BadgeComponent,
        AvatarComponent,
        ChipComponent,
        ButtonComponent,
        MoneyComponent,
        SwitchComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The Table component displays structured data in rows and columns with advanced data management capabilities.

**Key Features:**
- 3 visual variants (default, striped, bordered)
- 3 sizes (sm, md, lg)
- Column-level sort configuration
- Per-column cell formatting via formatter callbacks
- Conditional cell styling via cellClass/cellStyle
- Custom lcTableCell templates for composed cells
- Rich examples with avatars, badges, chips and row actions
- Hoverable rows with click events
- Empty state with custom message
- Pagination with configurable page sizes
- Row selection with select-all checkbox
- Per-column text filtering
- Inline cell editing via double-click
- Clickable rows (\`clickable\`, 3.16): every flat row is a tab stop, Enter and Space emit \`rowClick\`; clicks and keys from a link, button or switch inside a row emit nothing. A focused row is announced by its cells, so let the row action open something that announces itself (a dialog, a page)
- A caption (\`caption\`, 3.16) names the table; \`showCaption=false\` keeps it for screen readers only
- Number columns (\`TableColumn.align: 'end'\`, 3.17): header and cells at the end edge with tabular figures; a sort arrow sits before the label
- 3.36: \`footerRow\`, a sum row in \`<tfoot>\` outside sorting, filtering, paging and the tree (see *Footer Row*), and \`TableAction.ariaLabel\`, a name per row for a row action (see *Row Action Names*)
- 3.37: \`TableAction.size\`, the kit size of a row action (default \`xs\`; see *Action Sizes*)
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'striped', 'bordered'],
      description: 'Visual style',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Row density',
      table: { defaultValue: { summary: 'md' } },
    },
    hoverable: { control: 'boolean', description: 'Highlight rows on hover' },
    paginate: { control: 'boolean', description: 'Enable pagination' },
    pageSize: { control: 'number', description: 'Rows per page' },
    pageSizeLabel: {
      control: 'text',
      description: "Pagination: the text after the number in each page-size option (`10 / page`); German '/ Seite' (3.19)",
      table: { defaultValue: { summary: "'/ page'" } },
    },
    selectable: { control: 'boolean', description: 'Enable row selection checkboxes' },
    filterable: { control: 'boolean', description: 'Enable per-column text filters' },
    editable: { control: 'boolean', description: 'Enable inline cell editing (double-click)' },
    clickable: {
      control: 'boolean',
      description:
        'Rows are keyboard-operable (3.16): tabindex 0, Enter and Space emit rowClick; events from controls inside a row emit nothing',
      table: { defaultValue: { summary: 'false' } },
    },
    caption: {
      control: 'text',
      description: 'Caption that names the table, rendered as its first child (3.16); empty renders none',
      table: { defaultValue: { summary: "''" } },
    },
    showCaption: {
      control: 'boolean',
      description: 'false keeps the caption for screen readers only (3.16)',
      table: { defaultValue: { summary: 'true' } },
    },
    showActionsLabel: {
      control: 'boolean',
      description:
        '3.48 (finance-intelligence kosten-prove row 7): `false` keeps `actionsLabel` as the actions head\'s name in visually hidden text and shows none; the column keeps `actionsWidth`. `th[lcSortableHead]` (3.48, usm-x row 60): `busy` (aria-busy, a 12 px ring instead of the arrow, clicks still emit) and the hooks `--lc-sortable-head-padding-block`, `--lc-sortable-head-padding-inline`, `--lc-sortable-head-border-bottom`',
      table: { defaultValue: { summary: 'true' } },
    },
    footerRow: {
      control: 'object',
      description:
        '3.36: one `<tfoot>` row below all data rows (a record of the data shape, e.g. a sum), with the columns, formatters and `lcTableCell` templates (`footer: true`); never sorted, filtered, paged, selected or counted; first cell is the row header',
      table: { defaultValue: { summary: 'undefined' } },
    },
    hasChildrenKey: {
      control: 'text',
      description:
        '3.43 (kosten-2026-11-17 row 1): tree mode, a row field that marks a row as expandable before its children are loaded. A truthy field shows the chevron (`aria-expanded="false"`, collapsed whatever `defaultExpanded` says); the first open emits `rowToggle` and the page adds the children to `data`. No loading state in the table: announce it in the page (`role="status"`)',
      table: { defaultValue: { summary: 'undefined' } },
    },
  },
};

export default meta;
type Story = StoryObj<TableComponent>;

const userColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status' },
];

const userData = [
  { name: 'Alice Johnson', email: 'alice@company.com', role: 'Admin', status: 'Active' },
  { name: 'Bob Smith', email: 'bob@company.com', role: 'Editor', status: 'Active' },
  { name: 'Carol White', email: 'carol@company.com', role: 'Viewer', status: 'Inactive' },
  { name: 'David Brown', email: 'david@company.com', role: 'Editor', status: 'Active' },
  { name: 'Eva Martinez', email: 'eva@company.com', role: 'Admin', status: 'Active' },
];

export const Default: Story = {
  args: { columns: userColumns, data: userData, variant: 'default', size: 'md', hoverable: true },
};

export const Striped: Story = {
  parameters: {
    docs: { description: { story: 'Striped variant alternates row backgrounds for better readability in dense tables.' } },
  },
  args: { columns: userColumns, data: userData, variant: 'striped', size: 'md', hoverable: true },
};

export const Bordered: Story = {
  parameters: {
    docs: { description: { story: 'Bordered variant adds cell borders for strict grid-style tables.' } },
  },
  args: { columns: userColumns, data: userData, variant: 'bordered', size: 'md' },
};

export const Compact: Story = {
  parameters: {
    docs: { description: { story: 'Small size reduces row height for data-dense views.' } },
  },
  args: { columns: userColumns, data: userData, variant: 'default', size: 'sm', hoverable: true },
};

export const Large: Story = {
  parameters: {
    docs: { description: { story: 'Large size increases row height for primary data tables.'},  } },
  args: { columns: userColumns, data: userData, variant: 'default', size: 'lg', hoverable: true },
};

export const Empty: Story = {
  parameters: {
    docs: { description: { story: 'Empty state when no data matches filters or the dataset is empty.' } },
  },
  args: { columns: userColumns, data: [], emptyText: 'No users found. Try adjusting your filters or invite new team members.' },
};

export const ProjectTable: Story = {
  parameters: {
    docs: { description: { story: 'Real-world example: a project list with various data types.' } },
  },
  args: {
    columns: [
      { key: 'name', label: 'Project', sortable: true },
      { key: 'owner', label: 'Owner' },
      { key: 'progress', label: 'Progress', sortable: true },
      { key: 'deadline', label: 'Deadline', sortable: true },
    ],
    data: [
      { name: 'Website Redesign', owner: 'Alice Johnson', progress: '75%', deadline: '2026-05-15' },
      { name: 'Mobile App v2', owner: 'Bob Smith', progress: '40%', deadline: '2026-06-30' },
      { name: 'API Migration', owner: 'Carol White', progress: '90%', deadline: '2026-04-30' },
      { name: 'Analytics Dashboard', owner: 'David Brown', progress: '20%', deadline: '2026-07-15' },
      { name: 'Security Audit', owner: 'Eva Martinez', progress: '100%', deadline: '2026-04-01' },
    ],
    variant: 'default',
    size: 'md',
    hoverable: true,
  },
};

// -- Advanced Feature Stories --

const largeDataset = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@company.com`,
  department: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'][i % 5],
  salary: 50000 + Math.floor(Math.random() * 60000),
}));

const largeColumns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'department', label: 'Department', sortable: true },
  { key: 'salary', label: 'Salary', sortable: true },
];

export const WithPagination: Story = {
  parameters: {
    docs: { description: { story: 'Pagination splits large datasets into pages. Configure page size and navigate between pages.' } },
  },
  args: {
    columns: largeColumns,
    data: largeDataset,
    paginate: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    variant: 'striped',
    hoverable: true,
  },
};

// 3.19 (request 024): the pager follows the table size, beside a select of the same height.
const pagedRows = Array.from({ length: 12 }, (_, i) => ({
  name: `User ${i + 1}`,
  email: `user${i + 1}@company.com`,
  role: ['Admin', 'Editor', 'Viewer'][i % 3],
  status: i % 4 === 3 ? 'Inactive' : 'Active',
}));

export const PaginationSizes: Story = {
  name: 'Pagination Sizes',
  parameters: {
    docs: {
      description: {
        story:
          'The pagination follows `size` (3.19): previous and next are 32, 40 or 44 px squares beside a page-size select of the same height, ' +
          'each with a 44 px tap area and a focus ring. The page-size select has no clear (×) control, because a page size cannot be empty. ' +
          'The option text comes from `pageSizeLabel` (default `/ page`).',
      },
    },
  },
  render: () => ({
    props: { columns: userColumns, data: pagedRows },
    template: `
      <div style="display: flex; flex-direction: column; gap: 32px;">
        <lc-table [columns]="columns" [data]="data" size="sm" caption="size sm" [paginate]="true" [pageSize]="5"></lc-table>
        <lc-table [columns]="columns" [data]="data" size="md" caption="size md" [paginate]="true" [pageSize]="5"></lc-table>
        <lc-table [columns]="columns" [data]="data" size="lg" caption="size lg" [paginate]="true" [pageSize]="5"></lc-table>
      </div>
    `,
  }),
};

export const WithSelection: Story = {
  parameters: {
    docs: { description: { story: 'Row selection adds checkboxes for each row and a select-all checkbox in the header. Selected rows are highlighted.' } },
  },
  args: {
    columns: userColumns,
    data: userData,
    selectable: true,
    hoverable: true,
    variant: 'default',
  },
};

export const KeyboardFocus: Story = {
  name: 'Keyboard Focus',
  parameters: {
    docs: {
      description: {
        story:
          '3.27 (request 042): the first row\'s selection checkbox is focused as Tab would focus it (in the story view). The checkboxes show the kit ring instead of the browser default (2.29:1 in dark): 2 px `--color-primary-500`, 2 px outside (4.36:1 light, 9.12:1 dark on the table), `Highlight` in forced colours. A mouse click shows none (`:focus-visible`).',
      },
    },
  },
  args: {
    columns: userColumns,
    data: userData.slice(0, 3),
    selectable: true,
    hoverable: true,
    variant: 'default',
  },
  play: async ({ canvasElement, viewMode }) => {
    if (viewMode !== 'story') return;
    canvasElement.querySelector<HTMLElement>('tbody .lc-table__checkbox')?.focus({ preventScroll: true });
  },
};

/** 3.27.1 (request 043, F-22): the selection cell is the checkbox's hit area. */
export const TouchTargets: Story = {
  name: 'Touch Targets',
  parameters: {
    docs: {
      description: {
        story:
          '3.27.1 (request 043, F-22): the selection column is 44 px wide at every width (was 40, squeezed to 32 at 360 px), and the whole cell is the checkbox\'s hit area: 44 × 45.5 px in `md`. `size="sm"` rows are 37–38 px, so the cell area is 44 × 37 px there: below 44 px high, WCAG 2.5.8 met by size (at least 24 px), because the row height is the density the consumer chose. The box stays 16 px and keeps its name and ring; a click anywhere in the cell toggles it and never reaches a clickable row.',
      },
    },
  },
  render: () => ({
    props: { columns: userColumns, data: userData.slice(0, 4) },
    template: `
      <div style="display: flex; flex-direction: column; gap: 32px;">
        <lc-table [columns]="columns" [data]="data" [selectable]="true" [hoverable]="true" caption="size md"></lc-table>
        <lc-table [columns]="columns" [data]="data" [selectable]="true" [hoverable]="true" size="sm" caption="size sm"></lc-table>
      </div>
    `,
  }),
};

export const WithRowActions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A trailing actions column renders per-row buttons such as **Freigeben** and **Ablehnen**. ' +
          'Action clicks emit `actionClick` and stop propagation, so the row `rowClick` is never triggered. ' +
          'Click a row vs. an action button and watch the event log to see they do not collide. ' +
          'Use the `hidden`/`disabled` predicates to control actions per row (here, already-approved rows hide both actions).',
      },
    },
  },
  render: () => ({
    props: {
      columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email' },
        { key: 'status', label: 'Status', sortable: true },
      ],
      data: [
        { name: 'Alice Schmidt', email: 'alice@example.com', status: 'Ausstehend' },
        { name: 'Bob Müller', email: 'bob@example.com', status: 'Ausstehend' },
        { name: 'Carla Weber', email: 'carla@example.com', status: 'Freigegeben' },
        { name: 'David Klein', email: 'david@example.com', status: 'Ausstehend' },
      ],
      actions: [
        { key: 'approve', label: 'Freigeben', icon: 'check', variant: 'primary' as const, hidden: (row: Record<string, unknown>) => row['status'] === 'Freigegeben' },
        { key: 'reject', label: 'Ablehnen', icon: 'x-mark', variant: 'danger' as const, hidden: (row: Record<string, unknown>) => row['status'] === 'Freigegeben' },
      ],
      lastEvent: 'Keine Aktion',
      onRowClick(row: Record<string, unknown>) {
        this['lastEvent'] = `Zeile geklickt: ${row['name']}`;
      },
      onActionClick(event: { action: string; row: Record<string, unknown> }) {
        const label = event.action === 'approve' ? 'Freigeben' : 'Ablehnen';
        this['lastEvent'] = `Aktion „${label}" für ${event.row['name']}`;
      },
    },
    template: `
      <lc-table
        [columns]="columns"
        [data]="data"
        [actions]="actions"
        actionsLabel="Aktionen"
        [hoverable]="true"
        variant="default"
        (rowClick)="onRowClick($event)"
        (actionClick)="onActionClick($event)"
      ></lc-table>
      <p style="margin-top: 1rem; font-family: monospace; color: var(--color-text-secondary);">
        Letztes Ereignis: <strong>{{ lastEvent }}</strong>
      </p>
    `,
  }),
};

export const WithIconOnlyActions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Omit the `label` to render compact icon-only action buttons. Always provide a `tooltip` ' +
          '(used as the accessible label). Here the actions are right-aligned via `actionsAlign="end"` — ' +
          'the header label follows the same alignment so it stays in sync with the buttons.',
      },
    },
  },
  render: () => ({
    props: {
      columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email' },
        { key: 'status', label: 'Status', sortable: true },
      ],
      data: [
        { name: 'Alice Schmidt', email: 'alice@example.com', status: 'Ausstehend' },
        { name: 'Bob Müller', email: 'bob@example.com', status: 'Ausstehend' },
        { name: 'David Klein', email: 'david@example.com', status: 'Ausstehend' },
      ],
      actions: [
        { key: 'approve', icon: 'check', variant: 'ghost' as const, tooltip: 'Freigeben' },
        { key: 'reject', icon: 'x-mark', variant: 'ghost' as const, tooltip: 'Ablehnen' },
      ],
    },
    template: `
      <lc-table
        [columns]="columns"
        [data]="data"
        [actions]="actions"
        actionsLabel="Aktionen"
        actionsAlign="end"
        [hoverable]="true"
        variant="default"
      ></lc-table>
    `,
  }),
};

export const WithFiltering: Story = {
  parameters: {
    docs: { description: { story: 'Per-column text filters allow users to narrow results. Filters are applied across all columns simultaneously.' } },
  },
  args: {
    columns: largeColumns,
    data: largeDataset,
    filterable: true,
    paginate: true,
    pageSize: 10,
    variant: 'default',
    hoverable: true,
  },
};

export const WithInlineEditing: Story = {
  parameters: {
    docs: { description: { story: 'Double-click any cell to edit its value inline. Press Enter to confirm or Escape to cancel.' } },
  },
  args: {
    columns: [
      { key: 'name', label: 'Name', sortable: true, editable: true },
      { key: 'email', label: 'Email', editable: true },
      { key: 'role', label: 'Role', editable: true },
      { key: 'status', label: 'Status', editable: true },
    ],
    data: userData,
    editable: true,
    hoverable: true,
    variant: 'bordered',
  },
};

export const WithCellFormatting: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Define a formatter per column to format values (for example currency, dates, or labels) without writing custom templates.',
      },
    },
  },
  args: {
    columns: [
      { key: 'invoice', label: 'Invoice', sortable: true },
      {
        key: 'total',
        label: 'Total',
        sortable: true,
        formatter: (value: unknown) =>
          new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
            Number(value ?? 0)
          ),
      },
      {
        key: 'dueDate',
        label: 'Due Date',
        sortable: true,
        formatter: (value: unknown) =>
          new Intl.DateTimeFormat('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(new Date(String(value))),
      },
      {
        key: 'status',
        label: 'Status',
        formatter: (value: unknown) => String(value).toUpperCase(),
      },
    ],
    data: [
      { invoice: 'INV-2026-001', total: 1250.5, dueDate: '2026-07-01', status: 'open' },
      { invoice: 'INV-2026-002', total: 990, dueDate: '2026-07-15', status: 'paid' },
      { invoice: 'INV-2026-003', total: 4020.75, dueDate: '2026-08-01', status: 'overdue' },
    ],
    variant: 'striped',
    hoverable: true,
  },
};

export const WithCellFormattingAndStyling: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Combine formatter callbacks with cellClass/cellStyle to highlight KPI states directly in the table. ' +
          "Since 3.19 a `cellClass` colour or font size wins over the kit's cell defaults: Margin is coloured by its class " +
          '(`--color-text-success`, `-warning`, `-error`) and Account is 16 px through `lc-table-story__cell--account`. ' +
          '`cellStyle` (inline) still wins over a class: Margin is bold, SLA under 99 % fades. ' +
          "The classes are global CSS (here `::ng-deep` in the story's `<style>`), because the cells are inside the table's view. " +
          "ARR and SLA are `align: 'end'` columns (3.17): header and figures end at the same edge, with tabular figures.",
      },
    },
  },
  render: () => ({
    props: {
      columns: [
        { key: 'account', label: 'Account', sortable: true, cellClass: 'lc-table-story__cell--account' },
        {
          key: 'arr',
          label: 'ARR',
          sortable: true,
          align: 'end' as const,
          formatter: (value: unknown) =>
            new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
              Number(value ?? 0)
            ),
        },
        {
          key: 'margin',
          label: 'Margin',
          sortable: true,
          formatter: (value: unknown) => `${Number(value ?? 0).toFixed(1)}%`,
          cellClass: (value: unknown) => {
            const numberValue = Number(value ?? 0);
            if (numberValue < 10) return 'lc-table-story__cell--danger';
            if (numberValue < 20) return 'lc-table-story__cell--warning';
            return 'lc-table-story__cell--success';
          },
          cellStyle: { fontWeight: '700' },
        },
        {
          key: 'sla',
          label: 'SLA',
          sortable: true,
          formatter: (value: unknown) => `${Number(value ?? 0).toFixed(2)}%`,
          align: 'end' as const,
          cellStyle: (value: unknown) => ({
            opacity: Number(value ?? 0) < 99.0 ? '0.85' : '1',
          }),
        },
      ],
      data: [
        { account: 'Acme GmbH', arr: 185000, margin: 23.4, sla: 99.82 },
        { account: 'Nova Health', arr: 123500, margin: 14.2, sla: 99.12 },
        { account: 'Orbit Labs', arr: 87000, margin: 7.8, sla: 98.74 },
      ],
    },
    template: `
      <style>
        ::ng-deep .lc-table-story__cell--success {
          color: var(--color-text-success);
        }

        ::ng-deep .lc-table-story__cell--warning {
          color: var(--color-text-warning);
        }

        ::ng-deep .lc-table-story__cell--danger {
          color: var(--color-text-error);
        }

        ::ng-deep .lc-table-story__cell--account {
          font-size: var(--typography-font-size-base);
        }
      </style>

      <lc-table [columns]="columns" [data]="data" variant="striped" [hoverable]="true" size="md"></lc-table>
    `,
  }),
};

export const WithBadgesAndAvatars: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Richer table cells with `lc-avatar` and `lc-badge` via `lcTableCell` templates. Use this style for user/admin lists.',
      },
    },
  },
  render: () => ({
    props: {
      columns: [
        { key: 'user', label: 'User', sortable: true },
        { key: 'team', label: 'Team', sortable: true },
        {
          key: 'mrr',
          label: 'MRR',
          sortable: true,
          formatter: (value: unknown) =>
            new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
              Number(value ?? 0)
            ),
        },
        { key: 'status', label: 'Status', sortable: true },
        {
          key: 'lastSeen',
          label: 'Last Seen',
          sortable: true,
          formatter: (value: unknown) =>
            new Intl.DateTimeFormat('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(new Date(String(value))),
        },
      ],
      data: [
        {
          user: 'Alice Johnson',
          email: 'alice@company.com',
          avatar: '',
          avatarStatus: 'online',
          team: 'Platform',
          mrr: 12500,
          status: 'active',
          lastSeen: '2026-06-17',
        },
        {
          user: 'Bob Smith',
          email: 'bob@company.com',
          avatar: '',
          avatarStatus: 'away',
          team: 'Sales',
          mrr: 8700,
          status: 'trial',
          lastSeen: '2026-06-16',
        },
        {
          user: 'Carol White',
          email: 'carol@company.com',
          avatar: '',
          avatarStatus: 'busy',
          team: 'Support',
          mrr: 4300,
          status: 'at risk',
          lastSeen: '2026-06-14',
        },
        {
          user: 'David Brown',
          email: 'david@company.com',
          avatar: '',
          avatarStatus: 'offline',
          team: 'Engineering',
          mrr: 15200,
          status: 'inactive',
          lastSeen: '2026-06-02',
        },
      ],
      statusVariant: (status: unknown) => {
        const normalized = String(status ?? '').toLowerCase();
        switch (normalized) {
          case 'active':
            return 'success';
          case 'trial':
            return 'info';
          case 'at risk':
            return 'warning';
          case 'inactive':
            return 'default';
          default:
            return 'default';
        }
      },
      statusLabel: (status: unknown) => {
        const value = String(status ?? '');
        return value ? value.charAt(0).toUpperCase() + value.slice(1) : '-';
      },
    },
    template: `
      <lc-table [columns]="columns" [data]="data" variant="striped" [hoverable]="true" size="md">
        <ng-template lcTableCell="user" let-row>
          <div style="display:flex; align-items:center; gap:10px; min-width:220px;">
            <lc-avatar
              [name]="row.user"
              [status]="row.avatarStatus"
              size="sm"
              [src]="row.avatar"
            ></lc-avatar>
            <div style="display:flex; flex-direction:column; line-height:1.2;">
              <span style="font-weight:600; color: var(--color-text-primary);">{{ row.user }}</span>
              <span style="font-size:12px; color: var(--color-text-secondary);">{{ row.email }}</span>
            </div>
          </div>
        </ng-template>

        <ng-template lcTableCell="status" let-row>
          <lc-badge [variant]="statusVariant(row.status)" size="sm">
            {{ statusLabel(row.status) }}
          </lc-badge>
        </ng-template>
      </lc-table>
    `,
  }),
};

export const EnterpriseUsers: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Premium example with composed cells: avatar profiles, team chips, status badges, trend indicator and row actions.',
      },
    },
  },
  render: () => ({
    props: {
      columns: [
        { key: 'user', label: 'User', sortable: true, width: '280px' },
        { key: 'team', label: 'Team', sortable: true, width: '140px' },
        {
          key: 'arr',
          label: 'ARR',
          sortable: true,
          formatter: (value: unknown) =>
            new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(
              Number(value ?? 0)
            ),
        },
        { key: 'status', label: 'Status', sortable: true, width: '130px' },
        { key: 'trend', label: 'Trend', sortable: true, width: '120px' },
        {
          key: 'renewal',
          label: 'Renewal',
          sortable: true,
          formatter: (value: unknown) =>
            new Intl.DateTimeFormat('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(new Date(String(value))),
        },
        { key: 'actions', label: 'Actions', width: '190px' },
      ],
      data: [
        {
          user: 'Alice Johnson',
          email: 'alice@company.com',
          avatarStatus: 'online',
          team: 'Platform',
          arr: 182400,
          status: 'healthy',
          trend: 8.2,
          renewal: '2026-11-30',
        },
        {
          user: 'Ben Carter',
          email: 'ben@company.com',
          avatarStatus: 'away',
          team: 'Sales',
          arr: 141600,
          status: 'watch',
          trend: -1.5,
          renewal: '2026-09-15',
        },
        {
          user: 'Carla Mendes',
          email: 'carla@company.com',
          avatarStatus: 'busy',
          team: 'Support',
          arr: 97800,
          status: 'risk',
          trend: -6.9,
          renewal: '2026-08-10',
        },
      ],
      statusVariant: (status: unknown) => {
        const normalized = String(status ?? '').toLowerCase();
        switch (normalized) {
          case 'healthy':
            return 'success';
          case 'watch':
            return 'warning';
          case 'risk':
            return 'error';
          default:
            return 'default';
        }
      },
      statusLabel: (status: unknown) => {
        const value = String(status ?? '');
        return value ? value.charAt(0).toUpperCase() + value.slice(1) : '-';
      },
      teamVariant: (team: unknown) => {
        const normalized = String(team ?? '').toLowerCase();
        switch (normalized) {
          case 'platform':
            return 'primary';
          case 'sales':
            return 'info';
          case 'support':
            return 'warning';
          default:
            return 'default';
        }
      },
      trendColor: (trend: unknown) => (Number(trend ?? 0) >= 0 ? '#047857' : '#b91c1c'),
      trendPrefix: (trend: unknown) => (Number(trend ?? 0) >= 0 ? '+' : ''),
      onDetails: (row: Record<string, unknown>) => {
        // Demo handler for Storybook interaction
        console.info('Details clicked', row);
      },
      onSuspend: (row: Record<string, unknown>) => {
        // Demo handler for Storybook interaction
        console.info('Suspend clicked', row);
      },
    },
    template: `
      <lc-table [columns]="columns" [data]="data" variant="bordered" [hoverable]="true" size="md">
        <ng-template lcTableCell="user" let-row>
          <div style="display:flex; align-items:center; gap:10px; min-width:250px;">
            <lc-avatar [name]="row.user" [status]="row.avatarStatus" size="sm"></lc-avatar>
            <div style="display:flex; flex-direction:column; line-height:1.2;">
              <span style="font-weight:600; color: var(--color-text-primary);">{{ row.user }}</span>
              <span style="font-size:12px; color: var(--color-text-secondary);">{{ row.email }}</span>
            </div>
          </div>
        </ng-template>

        <ng-template lcTableCell="team" let-row>
          <lc-chip [variant]="teamVariant(row.team)" size="sm">{{ row.team }}</lc-chip>
        </ng-template>

        <ng-template lcTableCell="status" let-row>
          <lc-badge [variant]="statusVariant(row.status)" size="sm">{{ statusLabel(row.status) }}</lc-badge>
        </ng-template>

        <ng-template lcTableCell="trend" let-row>
          <span [style.color]="trendColor(row.trend)" style="font-weight:600;">
            {{ trendPrefix(row.trend) }}{{ row.trend }}%
          </span>
        </ng-template>

        <ng-template lcTableCell="actions" let-row>
          <div style="display:flex; gap:8px;">
            <lc-button variant="ghost" size="xs" (clicked)="onDetails(row)">Details</lc-button>
            <lc-button variant="outline" size="xs" (clicked)="onSuspend(row)">Suspend</lc-button>
          </div>
        </ng-template>
      </lc-table>
    `,
  }),
};

export const TreeGroupedRows: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Hierarchical rows via `idKey` + `parentKey`. Children are indented beneath their parent ' +
          'and connected by an indent guide; parent rows show an expand/collapse chevron. ' +
          'Sorting sorts siblings within each group (the tree is never flattened), and the chevron ' +
          'click toggles a group without firing `rowClick`.',
      },
    },
  },
  render: () => ({
    props: {
      columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'value', label: 'Value' },
      ],
      // parentId points at the group row's id; roots have an empty parentId.
      data: [
        { id: 'group-1', parentId: '', kind: 'group', name: 'Group A', status: 'Active', value: '—' },
        { id: 'item-1', parentId: 'group-1', kind: 'item', name: 'Item A1', status: 'Active', value: '42' },
        { id: 'item-2', parentId: 'group-1', kind: 'item', name: 'Item A2', status: 'Blocked', value: '17' },
        { id: 'group-2', parentId: '', kind: 'group', name: 'Group B', status: 'Blocked', value: '—' },
        { id: 'item-3', parentId: 'group-2', kind: 'item', name: 'Item B1', status: 'Blocked', value: '8' },
        { id: 'item-4', parentId: '', kind: 'item', name: 'Standalone item', status: 'Pending', value: '3' },
      ],
      statusVariant: (status: unknown) => {
        switch (String(status ?? '')) {
          case 'Active':
            return 'info';
          case 'Blocked':
            return 'error';
          case 'Pending':
            return 'warning';
          default:
            return 'default';
        }
      },
    },
    template: `
      <lc-table
        [columns]="columns"
        [data]="data"
        idKey="id"
        parentKey="parentId"
        treeColumn="name"
        variant="bordered"
        [hoverable]="true"
        size="md"
      >
        <ng-template lcTableCell="name" let-row>
          <span style="display:inline-flex; align-items:center; gap:8px;">
            <span>{{ row.name }}</span>
            <lc-badge [variant]="row.kind === 'group' ? 'primary' : 'default'" size="sm">
              {{ row.kind === 'group' ? 'Group' : 'Item' }}
            </lc-badge>
          </span>
        </ng-template>

        <ng-template lcTableCell="status" let-row>
          <lc-badge [variant]="statusVariant(row.status)" size="sm">{{ row.status }}</lc-badge>
        </ng-template>
      </lc-table>
    `,
  }),
};

export const FullFeatured: Story = {
  parameters: {
    docs: { description: { story: 'All advanced features combined: pagination, selection, filtering, and inline editing.' } },
  },
  args: {
    columns: [
      { key: 'id', label: 'ID', sortable: true, editable: false },
      { key: 'name', label: 'Name', sortable: true, editable: true },
      { key: 'email', label: 'Email', editable: true },
      { key: 'department', label: 'Department', sortable: true, editable: true },
      { key: 'salary', label: 'Salary', sortable: true, editable: true },
    ],
    data: largeDataset,
    paginate: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25],
    selectable: true,
    filterable: true,
    editable: true,
    hoverable: true,
    variant: 'striped',
    size: 'md',
  },
};

// 3.16 (BA-3, request 022): clickable rows and the caption.
const transactionColumns = [
  { key: 'date', label: 'Datum' },
  { key: 'payee', label: 'Empfänger' },
  { key: 'category', label: 'Kategorie' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Betrag', align: 'end' as const },
  { key: 'shared', label: 'Geteilt' },
];

const transactionData = [
  { id: 't1', date: '02.10.2026', payee: 'Stadtwerke München', category: 'Strom', status: 'Gebucht', amount: -8450, shared: false },
  { id: 't2', date: '05.10.2026', payee: 'Muster GmbH (Gehalt)', category: 'Einkommen', status: 'Gebucht', amount: 342500, shared: true },
  { id: 't3', date: '12.10.2026', payee: 'Apotheke am Markt', category: 'Gesundheit', status: 'Vorgemerkt', amount: -2389, shared: false },
  { id: 't4', date: '18.10.2026', payee: 'REWE Markt', category: 'Lebensmittel', status: 'Gebucht', amount: -6712, shared: true },
];

const transactionActions = [{ key: 'more', icon: 'dots', variant: 'ghost' as const, tooltip: 'Mehr zu dieser Buchung' }];

const transactionTemplate = (extra: string) => `
  <div lang="de">
    <lc-table
      [columns]="columns"
      [data]="data"
      [actions]="actions"
      actionsLabel="Aktionen"
      actionsAlign="end"
      caption="Umsätze Oktober 2026"
      ${extra}
      (rowClick)="rowClick($event)"
      (actionClick)="actionClick($event)"
    >
      <ng-template lcTableCell="status" let-row>
        <lc-badge [variant]="row.status === 'Gebucht' ? 'success' : 'warning'" size="sm">{{ row.status }}</lc-badge>
      </ng-template>
      <ng-template lcTableCell="amount" let-row>
        <lc-money [amountMinor]="row.amount" currency="EUR" locale="de-DE" />
      </ng-template>
      <ng-template lcTableCell="shared" let-row>
        <lc-switch size="sm" [checked]="row.shared" [ariaLabel]="'Mit dem Haushalt teilen: ' + row.payee" />
      </ng-template>
    </lc-table>
  </div>
`;

export const ClickableRows: Story = {
  name: 'Clickable Rows',
  parameters: {
    docs: {
      description: {
        story:
          '`clickable` makes each row a tab stop: Enter and Space on the row emit `rowClick` (Space does not scroll). ' +
          'Clicks and keys from the switch and the action button inside a row emit nothing. ' +
          'The caption „Umsätze Oktober 2026“ names the table. The amounts are `lc-money` in an end-aligned column.',
      },
    },
  },
  args: { rowClick: fn(), actionClick: fn() },
  render: (args) => ({
    props: { ...args, columns: transactionColumns, data: transactionData, actions: transactionActions },
    template: transactionTemplate('[clickable]="true"'),
  }),
};

export const HiddenCaption: Story = {
  name: 'Hidden Caption',
  parameters: {
    docs: {
      description: {
        story:
          "`showCaption=false` keeps the caption as the table's name for screen readers and hides it visually (here with `hoverable` rows).",
      },
    },
  },
  args: { rowClick: fn(), actionClick: fn() },
  render: (args) => ({
    props: { ...args, columns: transactionColumns, data: transactionData, actions: transactionActions },
    template: transactionTemplate('[showCaption]="false" [hoverable]="true"'),
  }),
};

// 3.17 (request 021, finance-intelligence sources page): end-aligned number columns.
const deCount = new Intl.NumberFormat('de-DE');
const deEuro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const dePercent = new Intl.NumberFormat('de-DE', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});

const sourceColumns = [
  { key: 'source', label: 'Quelle', sortable: true },
  { key: 'bookings', label: 'Buchungen', align: 'end' as const, formatter: (value: unknown) => deCount.format(Number(value ?? 0)) },
  {
    key: 'amount',
    label: 'Betrag',
    sortable: true,
    align: 'end' as const,
    formatter: (value: unknown) => deEuro.format(Number(value ?? 0)),
  },
  {
    key: 'change',
    label: 'Abweichung zum Vorjahreszeitraum',
    align: 'end' as const,
    formatter: (value: unknown) => dePercent.format(Number(value ?? 0)),
    cellStyle: (value: unknown): Record<string, string> =>
      Number(value ?? 0) < 0 ? { color: 'var(--color-text-error)' } : {},
  },
];

const sourceData = [
  { source: 'Bankkonto', bookings: 1111, amount: 1111.11, change: -0.125 },
  { source: 'Kreditkarte', bookings: 8888, amount: 8888.88, change: 0.042 },
  { source: 'USM', bookings: 342, amount: 87000, change: 0.318 },
  { source: 'Lohnabrechnung', bookings: 24, amount: 45210.5, change: -0.031 },
  { source: 'Depot', bookings: 57, amount: 12.4, change: 0 },
  { source: 'PayPal', bookings: 1203, amount: 734.9, change: -0.27 },
  { source: 'Barkasse', bookings: 9, amount: 120, change: 1.5 },
];

const sourceActions = [{ key: 'more', icon: 'dots', variant: 'ghost' as const, tooltip: 'Mehr zu dieser Quelle' }];

export const NumberColumns: Story = {
  name: 'Number Columns',
  parameters: {
    docs: {
      description: {
        story:
          "`align: 'end'` on a column (3.17) aligns its header and cells at the end edge and sets tabular figures, so " +
          '„1.111“ and „8.888“ are equally wide and amounts line up digit by digit. Sorting puts the arrow before the label ' +
          '(sort „Betrag“), so the label stays flush with the figures. It works with `paginate`, `actions`, `cellClass` and ' +
          '`cellStyle` (here `cellStyle` colours the negative changes in `--color-text-error`); ' +
          'the „Aktionen“ header follows `actionsAlign="end"`. ' +
          'A long header widens its column, and the table scrolls inside its wrapper on a phone. ' +
          'The pagination is German too (`pageSizeLabel="/ Seite"`, 3.19); on a phone or at 200 % text it wraps: ' +
          'the range first, the page-size select and the pager at the end of the next lines.',
      },
    },
  },
  args: { actionClick: fn() },
  render: (args) => ({
    props: { ...args, columns: sourceColumns, data: sourceData, actions: sourceActions },
    template: `
      <div lang="de">
        <lc-table
          [columns]="columns"
          [data]="data"
          [actions]="actions"
          actionsLabel="Aktionen"
          actionsAlign="end"
          caption="Quellen, Oktober 2026"
          [paginate]="true"
          [pageSize]="5"
          [hoverable]="true"
          rangeOfLabel="von"
          pageSizeLabel="/ Seite"
          rowsPerPageAriaLabel="Zeilen pro Seite"
          previousPageAriaLabel="Vorherige Seite"
          nextPageAriaLabel="Nächste Seite"
          sortedAscendingLabel="aufsteigend sortiert"
          sortedDescendingLabel="absteigend sortiert"
          (actionClick)="actionClick($event)"
        ></lc-table>
      </div>
    `,
  }),
};

// 3.36 (request 056, finance-intelligence services rows 1–2): costs per service.
const serviceColumns = [
  { key: 'name', label: 'Service', sortable: true },
  { key: 'actual', label: 'Ist', sortable: true, align: 'end' as const, formatter: (value: unknown) => deEuro.format(Number(value ?? 0)) },
  { key: 'plan', label: 'Plan', sortable: true, align: 'end' as const, formatter: (value: unknown) => deEuro.format(Number(value ?? 0)) },
];

const serviceData = [
  { id: 'net', parentId: '', name: 'Demo Netz', actual: 214300, plan: 230000 },
  { id: 'wan', parentId: 'net', name: 'WAN-Anbindung', actual: 128900, plan: 135000 },
  { id: 'lan', parentId: 'net', name: 'LAN und WLAN', actual: 85400, plan: 95000 },
  { id: 'work', parentId: '', name: 'Arbeitsplatz', actual: 175730, plan: 210000 },
  { id: 'mail', parentId: 'work', name: 'E-Mail und Kalender', actual: 61230, plan: 70000 },
  { id: 'client', parentId: 'work', name: 'Client-Betrieb', actual: 114500, plan: 140000 },
  { id: 'none', parentId: '', name: 'Keinem Service zugeordnet', actual: 132500, plan: 160000 },
];

const serviceFooter = { name: 'Gesamtkosten Ist', actual: 522530, plan: 600000 };

const serviceActions = [
  { key: 'origin', label: 'Herkunft', variant: 'ghost' as const, ariaLabel: (row: Record<string, unknown>) => `Herkunft von ${row['name']}` },
];

/** 3.36 (request 056, services row 1): a sum row below a tree table, outside sorting and the tree. */
export const FooterRow: Story = {
  name: 'Footer Row',
  parameters: {
    docs: {
      description: {
        story:
          '3.36 (request 056, finance-intelligence services row 1): `footerRow` renders one row in `<tfoot>` below all data rows, with the table\'s columns, formatters and alignment (`align: \'end\'` amounts in tabular figures). Sort „Ist“ or „Plan“, or collapse a group: the sum stays last and unchanged. It is never sorted, filtered, paged, selected or counted. Its first cell is the row header (`<th scope="row">`), in tree mode a `rowheader` in a `row` of the treegrid, not in its keyboard model; its label lines up with the level-0 labels. A 1 px rule above and a 3 px double rule below in `--color-field-border` (4.39:1 light, 5.56:1 dark) separate it; its cells are semibold. Callbacks get `rowIndex` −1 and `lcTableCell` templates `footer: true`. On a phone the table scrolls, and the footer with it.',
      },
    },
  },
  args: { actionClick: fn() },
  render: (args) => ({
    props: { ...args, columns: serviceColumns, data: serviceData, footer: serviceFooter, actions: serviceActions },
    template: `
      <div lang="de">
        <lc-table
          [columns]="columns"
          [data]="data"
          [footerRow]="footer"
          [actions]="actions"
          actionsLabel="Aktionen"
          actionsAlign="end"
          idKey="id"
          parentKey="parentId"
          treeColumn="name"
          caption="Kosten je Service, Oktober 2026"
          sortedAscendingLabel="aufsteigend sortiert"
          sortedDescendingLabel="absteigend sortiert"
          (actionClick)="actionClick($event)"
        ></lc-table>
      </div>
    `,
  }),
};

/** 3.36 (request 056, services row 2): each row's action names its object. */
export const RowActionNames: Story = {
  name: 'Row Action Names',
  parameters: {
    docs: {
      description: {
        story:
          '3.36 (request 056, finance-intelligence services row 2): `TableAction.ariaLabel` as a function of the row, `(row) => \'Herkunft von \' + row.name`. Every row shows the same „Herkunft“ button, but each one is named after its object: „Herkunft von Demo Netz“, „Herkunft von WAN-Anbindung“ … (WCAG 4.1.2), and the visible label stays part of the name (2.5.3). It wins over `tooltip`, `label` and `key`; an empty result falls back to them, and without it the name is as before. A string works too.',
      },
    },
  },
  args: { actionClick: fn() },
  render: (args) => ({
    props: { ...args, columns: serviceColumns, data: serviceData.filter((row) => row.parentId === ''), actions: serviceActions },
    template: `
      <div lang="de">
        <lc-table
          [columns]="columns"
          [data]="data"
          [actions]="actions"
          actionsLabel="Aktionen"
          actionsAlign="end"
          caption="Services"
          (actionClick)="actionClick($event)"
        ></lc-table>
      </div>
    `,
  }),
};

const sizedActions = (size: 'sm' | 'lg') => [
  {
    key: 'origin',
    label: 'Herkunft',
    icon: 'information-circle',
    size,
    ariaLabel: (row: Record<string, unknown>) => `Herkunft von ${row['name']}`,
  },
  { key: 'details', icon: 'chevron-right', tooltip: 'Details', size },
];

/** 3.37 (request 057, services row 3): the row action in another kit size. */
export const ActionSizes: Story = {
  name: 'Action Sizes',
  parameters: {
    docs: {
      description: {
        story:
          '3.37 (request 057, finance-intelligence services row 3): `TableAction.size` sets the kit size of a row action\'s `lc-button`; without it the action stays `xs` (30 px with a label, 20 px icon-only). `sm` is 38 / 30 px, `lg` 48.5 / 45.6 px, a 44 px touch target. The icon stays 20 px in every size, and text, alignment, the name per row and the row-click isolation are as before. The kit does not switch sizes per breakpoint: pass `lg` below 1024 px and `sm` from 1024 px yourself. Below: one table with `sm`, one with `lg`; „Herkunft“ with an icon and a label, „Details“ icon-only. The `lg` table shows only the „Service“ column, so its actions are in view on a phone (3.45, backlog 057-n4; a wider table scrolls inside its wrapper as before).',
      },
    },
  },
  args: { actionClick: fn() },
  render: (args) => ({
    props: {
      ...args,
      columns: serviceColumns,
      lgColumns: serviceColumns.slice(0, 1),
      data: serviceData.filter((row) => row.parentId === ''),
      smActions: sizedActions('sm'),
      lgActions: sizedActions('lg'),
    },
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 24px;">
        <lc-table
          [columns]="columns"
          [data]="data"
          [actions]="smActions"
          actionsLabel="Aktionen"
          actionsAlign="end"
          caption="Services, Aktionen sm"
          (actionClick)="actionClick($event)"
        ></lc-table>
        <lc-table
          [columns]="lgColumns"
          [data]="data"
          [actions]="lgActions"
          actionsLabel="Aktionen"
          actionsAlign="end"
          caption="Services, Aktionen lg"
          (actionClick)="actionClick($event)"
        ></lc-table>
      </div>
    `,
  }),
};

/** 3.45 (request 065, usm-x row 33): an app-drawn table with `th[lcSortableHead]`. */
@Component({
  selector: 'lc-table-sortable-head-demo',
  standalone: true,
  imports: [SortableHeadComponent, TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de" style="display: flex; flex-direction: column; gap: 24px;">
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; background: var(--color-surface); color: var(--color-text-primary); font-family: var(--typography-font-family);">
          <caption style="text-align: start; padding-bottom: 12px; font-weight: 600;">Eigene Tabelle der App</caption>
          <thead>
            <tr>
              @for (column of columns; track column.key) {
                <th
                  scope="col"
                  [lcSortableHead]="column.key"
                  [align]="column.align ?? 'start'"
                  [sortDirection]="sort().column === column.key ? sort().direction : null"
                  sortedAscendingLabel="aufsteigend sortiert"
                  sortedDescendingLabel="absteigend sortiert"
                  (sortChange)="sort.set($event)"
                >
                  {{ column.label }}
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.id) {
              <tr style="border-bottom: 1px solid var(--color-divider);">
                <td style="padding: 12px 16px; font-size: var(--typography-font-size-sm);">{{ row.name }}</td>
                <td style="padding: 12px 16px; font-size: var(--typography-font-size-sm); text-align: end; font-variant-numeric: tabular-nums;">{{ euro(row.actual) }}</td>
                <td style="padding: 12px 16px; font-size: var(--typography-font-size-sm); text-align: end; font-variant-numeric: tabular-nums;">{{ euro(row.plan) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <lc-table
        [columns]="columns"
        [data]="data"
        caption="lc-table mit denselben Spalten"
        sortedAscendingLabel="aufsteigend sortiert"
        sortedDescendingLabel="absteigend sortiert"
      ></lc-table>
    </div>
  `,
})
class TableSortableHeadDemoComponent {
  protected readonly columns = serviceColumns;
  protected readonly data = serviceData.filter((row) => row.parentId === '');
  protected readonly sort = signal<SortEvent>({ column: 'name', direction: 'asc' });
  protected readonly rows = computed(() => {
    const { column, direction } = this.sort();
    const factor = direction === 'asc' ? 1 : -1;
    return [...this.data].sort((a, b) => {
      const x = a[column as keyof typeof a];
      const y = b[column as keyof typeof b];
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'de')) * factor;
    });
  });
  protected euro(value: number): string {
    return deEuro.format(value);
  }
}

export const SortableHeadOutsideTheTable: Story = {
  name: 'Sortable Head Outside The Table',
  decorators: [moduleMetadata({ imports: [TableSortableHeadDemoComponent] })],
  parameters: {
    docs: {
      description: {
        story:
          '3.45 (request 065, usm-x row 33): `th[lcSortableHead]` gives a table the app draws itself the header cell of `lc-table`: the same padding, capitals, colours, hover and sorted fill, the arrow 12 px from the end (before the label in an `align="end"` column), `aria-sort`, a tab stop and Enter/Space. The app owns the state: `[sortDirection]` of the column and `(sortChange)` with the next direction. The state is read as hidden text after the label („Service aufsteigend sortiert“). Above: the app table sorted by „Service“; below: an `lc-table` with the same columns, sorted the same way at load, for comparison.',
      },
    },
  },
  render: () => ({ template: `<lc-table-sortable-head-demo />` }),
  play: async ({ canvasElement }) => {
    // Sort the lc-table by its first column too, so both heads show the same state.
    (canvasElement.querySelector('lc-table th.sortable') as HTMLElement | null)?.click();
  },
};

const lazyTreeDecorator = moduleMetadata({ imports: [TableLazyTreeDemoComponent] });

export const TreeLazyRows: Story = {
  name: 'Tree Lazy Rows',
  decorators: [lazyTreeDecorator],
  parameters: {
    controls: { include: ['hasChildrenKey'] },
    docs: {
      description: {
        story:
          '3.43 (request 063, finance-intelligence kosten-2026-11-17 row 1): `hasChildrenKey="hasPlanItems"` gives the budgets a chevron before their plan items are loaded. Opening one emits `rowToggle` once; the row is `aria-expanded="true"` and stays one row high while it has no children. The page then adds three plan items to `data` (here after 500 ms), and they render indented under it with no second `rowToggle`. The table shows no loading state: the page announces "Loading plan items…" and "3 plan items loaded" in its own `role="status"`. *Consulting* has no plan items, so it has no chevron. The chevron has a 32 × 44 px hit area (32 × 36 at `sm`) that never covers the cell content.',
      },
    },
  },
  render: () => ({
    template: `<lc-table-lazy-tree-demo lang="en" size="md" />`,
  }),
};

export const TreeLazyRowsDe: Story = {
  name: 'Tree Lazy Rows (DE)',
  decorators: [lazyTreeDecorator],
  parameters: {
    controls: { include: ['hasChildrenKey'] },
    docs: {
      description: {
        story:
          '3.43 (request 063, AC-6): the same page in German at `sm`: „Budgets mit Planposten“, IT-Betrieb, Lizenzen and Hardware open lazily, Beratung has no Planposten. The page writes „Planposten werden geladen …“ and „3 Planposten geladen“ to its `role="status"`.',
      },
    },
  },
  render: () => ({
    template: `<lc-table-lazy-tree-demo lang="de" size="sm" />`,
  }),
};

/** 3.48 (request 068, finance-intelligence kosten-prove row 7): open rows whose buttons say what they do. */
const HIDDEN_HEAD_FIXTURE = {
  caption: 'Offene Positionen',
  columns: [
    { key: 'position', label: 'Position', sortable: true },
    { key: 'kostenstelle', label: 'Kostenstelle' },
    { key: 'betrag', label: 'Betrag', align: 'end', sortable: true },
  ] as TableColumn[],
  data: [
    { id: 1, position: 'Lizenzverlängerung', kostenstelle: '4711 IT-Betrieb', betrag: '1.200,00 €' },
    { id: 2, position: 'Wartungsvertrag Drucker', kostenstelle: '4712 Büro', betrag: '480,00 €' },
    { id: 3, position: 'Einmalige Beratung', kostenstelle: '4720 Projekte', betrag: '2.960,00 €' },
  ],
  actions: [
    { key: 'explain', label: 'Erklären', variant: 'ghost' },
    { key: 'once', label: 'Als einmalig kennzeichnen', variant: 'ghost' },
    { key: 'withdraw', label: 'Zurückziehen', variant: 'ghost' },
  ] as TableAction[],
};

export const HiddenActionsHead: Story = {
  name: 'Hidden Actions Head',
  args: {
    actionsLabel: 'Aktionen',
    showActionsLabel: false,
    actionsWidth: '420px',
    actionsAlign: 'end',
  },
  parameters: {
    controls: { include: ['showActionsLabel', 'actionsLabel', 'actionsWidth', 'actionsAlign', 'size'] },
    docs: {
      description: {
        story:
          '3.48 (finance-intelligence kosten-prove row 7): each row carries buttons that say what they do („Erklären“, „Als einmalig kennzeichnen“, „Zurückziehen“), so a visible „Aktionen“ repeats them. `actionsLabel="Aktionen"` with `[showActionsLabel]="false"`: the head shows no text, keeps the name „Aktionen“ as visually hidden text in the `th` (axe `empty-table-header` passes) and keeps its width from `actionsWidth`. Sorting, the other heads and the row actions are unchanged.',
      },
    },
  },
  // Args outside `controls.include` arrive undefined in a custom render: the
  // fixed rows come as props of their own.
  render: (args) => ({
    props: {
      ...args,
      fixedCaption: HIDDEN_HEAD_FIXTURE.caption,
      fixedColumns: HIDDEN_HEAD_FIXTURE.columns,
      fixedData: HIDDEN_HEAD_FIXTURE.data,
      fixedActions: HIDDEN_HEAD_FIXTURE.actions,
    },
    template: `
      <div lang="de">
        <lc-table
          [caption]="fixedCaption"
          [columns]="fixedColumns"
          [data]="fixedData"
          [actions]="fixedActions"
          [actionsLabel]="actionsLabel"
          [showActionsLabel]="showActionsLabel"
          [actionsWidth]="actionsWidth"
          [actionsAlign]="actionsAlign"
          [size]="size || 'md'"
          sortedAscendingLabel="aufsteigend sortiert"
          sortedDescendingLabel="absteigend sortiert"
        ></lc-table>
      </div>`,
  }),
};

/** 3.48 (request 068, usm-x row 60): an app table with its own sticky head shadow and a sort that asks the server. */
@Component({
  selector: 'lc-table-sortable-head-busy-demo',
  standalone: true,
  imports: [SortableHeadComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de" style="max-height: 260px; overflow: auto; border: 1px solid var(--color-border); border-radius: var(--border-radius-lg);">
      <table style="width: 100%; border-collapse: separate; border-spacing: 0; background: var(--color-surface); color: var(--color-text-primary); font-family: var(--typography-font-family);">
        <caption style="text-align: start; padding: 12px 16px; font-weight: 600;">Tickets (Sortierung auf dem Server)</caption>
        <thead style="position: sticky; top: 0; z-index: 1; box-shadow: var(--elevation-2);">
          <tr style="--lc-sortable-head-border-bottom: none; --lc-sortable-head-padding-block: 8px;">
            @for (column of columns; track column.key) {
              <th
                scope="col"
                [lcSortableHead]="column.key"
                [align]="column.align"
                [busy]="pending() === column.key"
                [sortDirection]="sort().column === column.key ? sort().direction : null"
                sortedAscendingLabel="aufsteigend sortiert"
                sortedDescendingLabel="absteigend sortiert"
                (sortChange)="onSort($event)"
              >
                {{ column.label }}
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track row.id) {
            <tr>
              <td style="padding: 12px 16px; border-bottom: 1px solid var(--color-divider); font-size: var(--typography-font-size-sm);">{{ row.titel }}</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid var(--color-divider); font-size: var(--typography-font-size-sm);">{{ row.status }}</td>
              <td style="padding: 12px 16px; border-bottom: 1px solid var(--color-divider); font-size: var(--typography-font-size-sm); text-align: end; font-variant-numeric: tabular-nums;">{{ row.alter }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
class TableSortableHeadBusyDemoComponent implements OnDestroy {
  protected readonly columns: { key: string; label: string; align: 'start' | 'end' }[] = [
    { key: 'titel', label: 'Titel', align: 'start' },
    { key: 'status', label: 'Status', align: 'start' },
    { key: 'alter', label: 'Alter (Tage)', align: 'end' },
  ];
  protected readonly rows = [
    { id: 1, titel: 'Drucker im 3. OG', status: 'Offen', alter: 4 },
    { id: 2, titel: 'VPN-Zugang für Lieferanten', status: 'In Arbeit', alter: 12 },
    { id: 3, titel: 'Lizenz verlängern', status: 'Offen', alter: 1 },
    { id: 4, titel: 'Neuer Arbeitsplatz', status: 'Wartet', alter: 7 },
    { id: 5, titel: 'Passwort zurücksetzen', status: 'Erledigt', alter: 0 },
  ];
  protected readonly sort = signal<SortEvent>({ column: 'titel', direction: 'asc' });
  /** The column whose sort the server is answering (the shot: „Status“). */
  protected readonly pending = signal<string | null>('status');
  private timer?: ReturnType<typeof setTimeout>;

  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }

  protected onSort(event: SortEvent): void {
    clearTimeout(this.timer);
    this.pending.set(event.column);
    this.timer = setTimeout(() => {
      this.sort.set(event);
      this.pending.set(null);
    }, 1500);
  }
}

export const SortableHeadHooksAndBusy: Story = {
  name: 'Sortable Head Hooks And Busy',
  decorators: [moduleMetadata({ imports: [TableSortableHeadBusyDemoComponent] })],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.48 (request 068, usm-x row 60): the app draws its head rule as a sticky shadow, so `--lc-sortable-head-border-bottom: none` drops the head\'s own 2 px rule, and `--lc-sortable-head-padding-block: 8px` makes the head lower (the 32 px arrow reserve stays). „Status“ is `[busy]`: the server is answering its sort, so the head is `aria-busy="true"`, shows a quiet 12 px ring in the arrow\'s slot (static under reduced motion) and the progress cursor. A click still emits `sortChange`; here the page answers after 1.5 s.',
      },
    },
  },
  render: () => ({ template: `<lc-table-sortable-head-busy-demo />` }),
};

/** The table, label, frame and cells of the 3.50 reserve story (inline, so the story needs no component). */
const RESERVE_TABLE = 'width: 100%; border-collapse: separate; border-spacing: 0; background: var(--color-surface); color: var(--color-text-primary); font-family: var(--typography-font-family);';
const RESERVE_FRAME = 'overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--border-radius-lg);';
const RESERVE_CAPTION = 'text-align: start; padding: 8px 0; font-weight: 600; font-size: var(--typography-font-size-sm);';
const RESERVE_CELL = 'padding: 12px 16px; font-size: var(--typography-font-size-sm);';

/** 3.50 (request 071, usm-x row 82; backlog 068-n1): the arrow reserve while unsorted, and RTL. */
export const SortableHeadReserveAndRtl: Story = {
  name: 'Sortable Head Reserve And RTL',
  decorators: [moduleMetadata({ imports: [SortableHeadComponent] })],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '3.50 (usm-x row 82): a sortable head keeps 32 px at its inline end for the arrow. `--lc-sortable-head-unsorted-reserve` sets that space while the head is neither sorted nor busy: the second table sets `var(--spacing-4)`, so its unsorted heads are 16 px narrower, while the sorted head („Titel“) and the busy head („Status“) keep 32 px for the arrow and the ring. The first table is the default. Backlog 068-n1: reserve, arrow and busy ring use logical properties, so in the third table (`dir="rtl"`) the ring and the arrow sit over the reserve on the left, 12 px from the inline end; LTR is unchanged. An `align="end"` head keeps its reserve on the start side.',
      },
    },
  },
  render: () => ({
    template: `
      <div lang="de" style="display: flex; flex-direction: column; gap: 24px;">
        @for (variant of ['default', 'hook', 'rtl']; track variant) {
          <div [attr.dir]="variant === 'rtl' ? 'rtl' : null">
            <p style="${RESERVE_CAPTION} margin: 0;">{{ variant === 'default' ? 'Standard (32 px)' : variant === 'hook' ? '--lc-sortable-head-unsorted-reserve: var(--spacing-4)' : 'dir=rtl' }}</p>
            <div style="${RESERVE_FRAME}">
            <table style="${RESERVE_TABLE}">
              <thead>
                <tr [style.--lc-sortable-head-unsorted-reserve]="variant === 'hook' ? 'var(--spacing-4)' : null">
                  <th scope="col" lcSortableHead="titel" sortDirection="asc">Titel</th>
                  <th scope="col" lcSortableHead="status" [busy]="true">Status</th>
                  <th scope="col" lcSortableHead="team">Team</th>
                  <th scope="col" lcSortableHead="alter" align="end">Alter</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="${RESERVE_CELL}">Drucker im 3. OG</td>
                  <td style="${RESERVE_CELL}">Offen</td>
                  <td style="${RESERVE_CELL}">Support</td>
                  <td style="${RESERVE_CELL} text-align: end; font-variant-numeric: tabular-nums;">4</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        }
      </div>`,
  }),
};
