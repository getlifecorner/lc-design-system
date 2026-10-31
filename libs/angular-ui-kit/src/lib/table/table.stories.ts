import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { fn } from 'storybook/test';
import { TableComponent } from './table.component';
import { TableCellDirective } from './table-cell.directive';
import { BadgeComponent } from '../badge/badge.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { ChipComponent } from '../chip/chip.component';
import { ButtonComponent } from '../button/button.component';
import { MoneyComponent } from '../money/money.component';
import { SwitchComponent } from '../switch/switch.component';

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
