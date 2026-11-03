import type { Meta, StoryObj } from '@storybook/angular';
import { DependencyViewerComponent, DependencyNode } from './dependency-viewer.component';

const meta: Meta<DependencyViewerComponent> = {
  title: 'Data Display/Dependency Viewer',
  component: DependencyViewerComponent,
  tags: ['autodocs'],
  argTypes: {
    layout: { control: 'radio', options: ['tree', 'layered'] },
    direction: { control: 'radio', options: ['horizontal', 'vertical'] },
    fitMode: { control: 'radio', options: [null, 'none', 'contain', 'fit-width'] },
    minNodeSize: { control: { type: 'number', min: 20, max: 240, step: 10 } },
    regionLabel: {
      control: 'text',
      description:
        '3.27: accessible name of the canvas while it scrolls sideways (`fitMode="fit-width"` with a `minNodeSize` the frame can\'t hold). It is then a focusable `role="region"`, scrolled with the arrow keys. Set a short, localised name that is unique on the page. Not used otherwise.',
      table: { defaultValue: { summary: "'Dependency graph'" } },
    },
    showToolbar: { control: 'boolean' },
    showEdgeLabels: { control: 'boolean' },
    height: { control: 'text' },
    edgeWidth: { control: { type: 'number', min: 0.5, max: 4, step: 0.5 } },
    autoFit: { control: 'boolean' },
    interactive: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Dependency viewer for visualizing hierarchical and cross-cutting relationships. ' +
          'Supports horizontal/vertical layout, bidirectional dependencies, relationship types ' +
          '(blocks, references, requires, extends, implements, uses), edge labels, pan & zoom, ' +
          'collapsible sub-trees, and an interactive detail panel. Set `autoFit` to scale the ' +
          'whole graph into the frame, and `interactive: false` to turn it into a static ' +
          'overview that is still click-through.\n\n' +
          'Two layouts: `tree` (default) places nodes by their depth in the `children` nesting, ' +
          '`layered` by their depth in the *dependency* graph — use it for order-of-work, ' +
          'sequencing and impact views. `fitMode` controls the trade between fitting everything ' +
          'in (`contain`) and keeping nodes readable (`fit-width`).',
      },
    },
  },
};
export default meta;
type Story = StoryObj<DependencyViewerComponent>;

// ── Data ────────────────────────────────────────────────────────────────────

const simpleTree: DependencyNode = {
  id: 'app',
  label: 'App',
  status: 'active',
  description: 'Main application',
  children: [
    { id: 'auth', label: 'Auth Module', status: 'success' },
    {
      id: 'core',
      label: 'Core Module',
      status: 'success',
      children: [
        { id: 'http', label: 'HTTP Client', status: 'default' },
        { id: 'store', label: 'State Store', status: 'default' },
      ],
    },
    { id: 'ui', label: 'UI Kit', status: 'warning' },
  ],
};

const bidirectionalTree: DependencyNode = {
  id: 'api',
  label: 'API Gateway',
  status: 'active',
  description: 'Central API gateway for all services',
  children: [
    {
      id: 'user-svc',
      label: 'User Service',
      status: 'success',
      description: 'Manages user accounts',
      children: [
        { id: 'user-db', label: 'User DB', status: 'default' },
      ],
    },
    {
      id: 'order-svc',
      label: 'Order Service',
      status: 'warning',
      description: 'Handles order processing',
      dependsOn: [
        { id: 'user-svc', relation: 'requires' },
      ],
      children: [
        { id: 'order-db', label: 'Order DB', status: 'default' },
        {
          id: 'payment',
          label: 'Payment',
          status: 'error',
          dependsOn: [{ id: 'user-svc', relation: 'references' }],
        },
      ],
    },
    {
      id: 'notification',
      label: 'Notifications',
      status: 'success',
      dependsOn: [
        { id: 'user-svc', relation: 'depends' },
        { id: 'order-svc', relation: 'blocks' },
      ],
    },
  ],
};

const complexTree: DependencyNode = {
  id: 'platform',
  label: 'Platform',
  status: 'active',
  children: [
    {
      id: 'frontend',
      label: 'Frontend',
      status: 'success',
      dependsOn: [{ id: 'design-system', relation: 'uses' }],
      children: [
        { id: 'dashboard', label: 'Dashboard', status: 'default' },
        { id: 'settings', label: 'Settings', status: 'default', dependsOn: [{ id: 'auth-lib', relation: 'requires' }] },
      ],
    },
    {
      id: 'backend',
      label: 'Backend',
      status: 'success',
      children: [
        { id: 'auth-lib', label: 'Auth Lib', status: 'active' },
        { id: 'data-layer', label: 'Data Layer', status: 'default', dependsOn: [{ id: 'auth-lib', relation: 'extends' }] },
      ],
    },
    {
      id: 'design-system',
      label: 'Design System',
      status: 'warning',
      children: [
        { id: 'tokens', label: 'Tokens', status: 'default' },
        { id: 'components', label: 'Components', status: 'default', dependsOn: [{ id: 'tokens', relation: 'implements' }] },
      ],
    },
  ],
};

// ── Stories ──────────────────────────────────────────────────────────────────

export const Horizontal: Story = {
  args: {
    root: simpleTree,
    direction: 'horizontal',
    height: '400px',
  },
};

export const Vertical: Story = {
  args: {
    root: simpleTree,
    direction: 'vertical',
    height: '500px',
  },
};

export const BidirectionalDependencies: Story = {
  args: {
    root: bidirectionalTree,
    direction: 'horizontal',
    height: '500px',
  },
};

export const BidirectionalVertical: Story = {
  args: {
    root: bidirectionalTree,
    direction: 'vertical',
    height: '600px',
  },
};

export const ComplexRelationships: Story = {
  args: {
    root: complexTree,
    direction: 'horizontal',
    height: '500px',
  },
};

export const NoEdgeLabels: Story = {
  args: {
    root: bidirectionalTree,
    direction: 'horizontal',
    showEdgeLabels: false,
    height: '500px',
  },
};

export const WithoutToolbar: Story = {
  args: {
    root: simpleTree,
    direction: 'horizontal',
    showToolbar: false,
    height: '400px',
  },
};

export const SingleNode: Story = {
  args: {
    root: { id: 'single', label: 'Single Node', status: 'active', description: 'A lone node' },
    height: '200px',
  },
};

// ── Graph explorer capabilities ──────────────────────────────────────────────

export const FreeFormRelationLabels: Story = {
  name: 'Free-form Relation Labels',
  args: {
    root: {
      id: 'n1',
      label: 'Node One',
      status: 'active',
      children: [
        { id: 'n2', label: 'Node Two' },
        { id: 'n3', label: 'Node Three', dependsOn: [{ id: 'n2', relationLabel: 'CUSTOM_LABEL' }] },
        { id: 'n4', label: 'Node Four', dependsOn: [{ id: 'n3', relationLabel: 'ANOTHER_LABEL' }] },
      ],
    },
    direction: 'horizontal',
    height: '400px',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use `relationLabel` on an edge when the relationship vocabulary is wider than the ' +
          'built-in `relation` enum. The label is shown verbatim; colouring follows `relation` ' +
          '(here omitted, so edges take the generic style).',
      },
    },
  },
};

export const TypedNodes: Story = {
  name: 'Node Types & Legend',
  args: {
    root: {
      id: 'root',
      label: 'Root',
      type: 'Alpha',
      children: [
        { id: 'c1', label: 'Item One', type: 'Beta' },
        { id: 'c2', label: 'Item Two', type: 'Gamma', children: [{ id: 'c3', label: 'Item Three', type: 'Beta' }] },
      ],
    },
    typeColors: {
      Alpha: '#c1e3e9',
      Beta: '#cdd6c2',
      Gamma: '#f1d3a7',
    },
    direction: 'horizontal',
    height: '400px',
  },
  parameters: {
    docs: {
      description: {
        story:
          '`type` colours nodes along a category axis, independent of the semantic `status` axis, ' +
          'and drives its own legend. A resolved type colour wins over `status` for the fill.',
      },
    },
  },
};

export const LongLabels: Story = {
  name: 'Long Labels & Sibling Dependencies',
  args: {
    root: {
      id: 'group',
      label: 'Group A',
      type: 'Group',
      children: [
        { id: 'a1', label: 'Item A1 with a fairly long descriptive label', type: 'Highlight' },
        {
          id: 'a2',
          label: 'Item A2 with a long label',
          type: 'Item',
          dependsOn: [{ id: 'a1', relation: 'requires' }],
        },
        {
          id: 'a3',
          label: 'Item A3 with an even longer descriptive label that wraps and is cut',
          type: 'Item',
          dependsOn: [{ id: 'a1', relation: 'requires' }],
        },
        {
          id: 'a4',
          label: 'Item A4 with a long label',
          type: 'Item',
          dependsOn: [
            { id: 'a1', relation: 'requires' },
            { id: 'a2', relation: 'references' },
          ],
        },
      ],
    },
    typeColors: { Group: '#c1e3e9', Highlight: '#2f6f86', Item: '#eef6f7' },
    direction: 'horizontal',
    fitMode: 'contain',
    interactive: false,
    height: '440px',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Boxes size themselves to the labels: the width grows with the longest label up to a cap, ' +
          'past which labels wrap onto a second line, and what still does not fit is ellipsised ' +
          '(hover for the full text). Dependencies between siblings — nodes in the same column — ' +
          'bow out beside the column, nested into lanes when they overlap, so every arc stays its ' +
          'own line and no edge runs through the nodes it connects.',
      },
    },
  },
};

export const CappedNeighbourhood: Story = {
  name: 'Truncation Indicator',
  args: {
    root: {
      id: 'hub',
      label: 'Hub Node',
      status: 'active',
      moreCount: 128,
      children: [
        { id: 'x1', label: 'Neighbour One' },
        { id: 'x2', label: 'Neighbour Two', moreCount: 7 },
      ],
    },
    direction: 'horizontal',
    height: '300px',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `moreCount` when a node has more neighbours than are shown, so the truncation is ' +
          'visible instead of silent. Typical for highly connected nodes whose neighbourhood is capped.',
      },
    },
  },
};

export const CyclicGraph: Story = {
  name: 'Cyclic Graph (Tolerance)',
  args: {
    root: (() => {
      const three: DependencyNode = { id: 'three', label: 'Three' };
      const two: DependencyNode = { id: 'two', label: 'Two', children: [three] };
      const one: DependencyNode = { id: 'one', label: 'One', status: 'active', children: [two] };
      three.children = [one]; // closes the loop: one → two → three → one
      return one;
    })(),
    direction: 'horizontal',
    height: '300px',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The input is a tree, but real graphs loop. A link back to an already-placed node — a ' +
          'cycle, or a node reached from a second parent — is drawn as a cross-reference arrow ' +
          'instead of being followed, so each node is rendered exactly once.',
      },
    },
  },
};

// ── Auto-fit & static mode ───────────────────────────────────────────────────

// Deliberately wider and deeper than the frames below can show at 100% — the
// point of these stories is what happens when the graph does not fit.
const broadTree: DependencyNode = {
  id: 'root',
  label: 'Root',
  status: 'active',
  children: [
    {
      id: 'group-a',
      label: 'Group A',
      status: 'success',
      children: [
        { id: 'a-1', label: 'Item A1' },
        { id: 'a-2', label: 'Item A2' },
        { id: 'a-3', label: 'Item A3', children: [{ id: 'a-3-1', label: 'Item A3.1' }] },
      ],
    },
    {
      id: 'group-b',
      label: 'Group B',
      status: 'warning',
      children: [
        { id: 'b-1', label: 'Item B1', dependsOn: [{ id: 'a-1', relation: 'requires' }] },
        { id: 'b-2', label: 'Item B2' },
      ],
    },
    {
      id: 'group-c',
      label: 'Group C',
      children: [
        { id: 'c-1', label: 'Item C1' },
        { id: 'c-2', label: 'Item C2', children: [{ id: 'c-2-1', label: 'Item C2.1' }] },
        { id: 'c-3', label: 'Item C3' },
      ],
    },
  ],
};

export const AutoFit: Story = {
  args: {
    root: broadTree,
    direction: 'horizontal',
    autoFit: true,
    height: '360px',
  },
  parameters: {
    docs: {
      description: {
        story:
          '`autoFit` scales and centres the graph so all of it fits the frame, and re-fits on ' +
          'container resize (drag the preview wider) and whenever the graph changes shape. It ' +
          'only ever shrinks — a small graph keeps its natural size rather than ballooning to ' +
          'fill the frame. Pan and zoom still work on top of the fit; add `interactive: false` ' +
          'to freeze it.',
      },
    },
  },
};

const statusTree: DependencyNode = {
  id: 'standard',
  label: 'Standard',
  status: 'default',
  children: [
    { id: 'aktiv', label: 'Aktiv', status: 'active' },
    { id: 'erfolg', label: 'Erfolg', status: 'success' },
    { id: 'warnung', label: 'Warnung', status: 'warning' },
    { id: 'fehler', label: 'Fehler', status: 'error' },
    {
      id: 'gedaempft',
      label: 'Gedämpft',
      status: 'muted',
      children: [{ id: 'unterknoten', label: 'Unterknoten', status: 'default' }],
    },
  ],
};

/** 3.25 (F-16): every node status and a collapse toggle in one frame. */
export const NodeStatuses: Story = {
  name: 'Node statuses (F-16)',
  args: {
    root: statusTree,
    direction: 'horizontal',
    autoFit: true,
    height: '360px',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Every node status and a collapse toggle (on "Standard" and "Gedämpft"). Node and toggle ' +
          'borders are UI boundaries and reach 3:1 on the surface since 3.25 (F-16): `default` and ' +
          '`muted` nodes and the toggle ring use `--color-field-border`, 4.83:1 light and 6.70:1 dark ' +
          '(4.39 / 5.69 against their own fill; neutral-300 was 1.47 / 2.28). `active` uses ' +
          '`--color-primary-600`, 5.77:1 light and 10.80:1 dark (primary-400 was 1.89 / 3.95). ' +
          '`success`, `warning` and `error` keep their status inks. `muted` stays apart from ' +
          '`default` by its fill and its tertiary label; a selected node keeps its 2.5 px ' +
          '`--color-primary-500` stroke. Tab shows a 2 px ring on the toolbar buttons (4.17 / 7.57).',
      },
    },
  },
};

export const AutoFitVertical: Story = {
  args: {
    root: broadTree,
    direction: 'vertical',
    autoFit: true,
    height: '400px',
  },
};

export const StaticOverview: Story = {
  args: {
    root: broadTree,
    direction: 'horizontal',
    autoFit: true,
    interactive: false,
    height: '360px',
  },
  parameters: {
    docs: {
      description: {
        story:
          '`autoFit` plus `interactive: false` — the everything-at-a-glance configuration. ' +
          'Drag-pan, wheel-zoom and the toolbar zoom buttons are gone, and the canvas no longer ' +
          'shows a grab cursor. Content interaction is untouched: nodes still select (watch ' +
          '`nodeSelect` in the Actions tab), collapse toggles still work, and the wheel is not ' +
          'swallowed, so the page behind the viewer scrolls normally.',
      },
    },
  },
};

export const StaticWithoutAutoFit: Story = {
  args: {
    root: simpleTree,
    direction: 'horizontal',
    interactive: false,
    height: '320px',
  },
  parameters: {
    docs: {
      description: {
        story:
          '`interactive: false` on its own pins the default viewport instead of fitting. Use it ' +
          'for a graph already known to fit the frame; anything larger is cropped, since there ' +
          'is no longer a way to pan to it.',
      },
    },
  },
};

// ── Layered (DAG) layout ─────────────────────────────────────────────────────

// A flat set wired only by `dependsOn`, handed over as an array: parallel starts,
// fan-in, fan-out and a long pole, which is the shape a real ordering problem has.
// Deliberately *not* in dependency order — a query result never is.
const stageGraph: DependencyNode[] = [
  { id: 'i', label: 'Item I', status: 'default', dependsOn: [{ id: 'f' }, { id: 'g' }] },
  { id: 'c', label: 'Item C', status: 'success' },
  { id: 'g', label: 'Item G', status: 'default', dependsOn: [{ id: 'd' }] },
  { id: 'a', label: 'Item A', status: 'success' },
  { id: 'f', label: 'Item F', status: 'active', dependsOn: [{ id: 'd' }, { id: 'e' }] },
  { id: 'j', label: 'Item J', status: 'default', dependsOn: [{ id: 'h' }, { id: 'i' }] },
  { id: 'd', label: 'Item D', status: 'success', dependsOn: [{ id: 'a' }, { id: 'b' }] },
  { id: 'h', label: 'Item H', status: 'warning', dependsOn: [{ id: 'e' }] },
  { id: 'b', label: 'Item B', status: 'success' },
  { id: 'e', label: 'Item E', status: 'active', dependsOn: [{ id: 'c' }] },
];

export const LayeredLayout: Story = {
  name: 'Layered — Order of Work',
  args: {
    root: stageGraph,
    layout: 'layered',
    direction: 'horizontal',
    showEdgeLabels: false,
    height: '360px',
  },
  parameters: {
    docs: {
      description: {
        story:
          '`layout="layered"` places each node past everything it depends on, transitively, so ' +
          'left-to-right reads as an order of work. Items A, B and C depend on nothing and start ' +
          'the first layer; an item with several predecessors clears the deepest of them rather ' +
          'than sitting beside it. Every `dependsOn` link is drawn — nothing is discarded to fit ' +
          'a single-parent hierarchy — and the layers are reordered to untangle the edges ' +
          'between them. Note the input array is in arbitrary order: the layout comes from the ' +
          'graph, not from the order it arrived in.',
      },
    },
  },
};

export const LayeredVertical: Story = {
  name: 'Layered — Vertical',
  args: {
    root: stageGraph,
    layout: 'layered',
    direction: 'vertical',
    showEdgeLabels: false,
    height: '520px',
  },
  parameters: {
    docs: {
      description: {
        story: '`direction="vertical"` turns the layers into rows, running top to bottom.',
      },
    },
  },
};

export const LayeredFitWidth: Story = {
  name: 'Layered — Fit Width',
  args: {
    root: stageGraph,
    layout: 'layered',
    direction: 'horizontal',
    fitMode: 'fit-width',
    showEdgeLabels: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          '`fitMode="fit-width"` scales to the frame\'s width and lets the height follow the ' +
          'graph, so nodes keep a readable size and the *page* scrolls; past `minNodeSize` a ' +
          'graph wider than the frame scrolls sideways inside it (see *Phone Width*). `height` ' +
          'is not used in this mode. Compare with ' +
          '`fitMode="contain"`, which fits both axes and therefore shrinks a large graph until ' +
          'it fits vertically too; past roughly 20 nodes that is usually too small to read.',
      },
    },
  },
};

export const LayeredMinNodeSize: Story = {
  name: 'Layered — Minimum Node Size',
  args: {
    root: stageGraph,
    layout: 'layered',
    direction: 'horizontal',
    fitMode: 'contain',
    minNodeSize: 120,
    showEdgeLabels: false,
    height: '260px',
  },
  parameters: {
    docs: {
      description: {
        story:
          '`minNodeSize` is a floor on how far fitting may shrink the nodes, in px of node width ' +
          '(160px unscaled). Below it the fit stops scaling down and lets the graph overflow — ' +
          'which `fit-width` turns into sideways scrolling of the frame (see *Phone Width*), and ' +
          '`contain` (shown here) into clipping. Pair it with `fit-width`.',
      },
    },
  },
};

export const LayeredWithRelations: Story = {
  name: 'Layered — Relation Types',
  args: {
    root: [
      { id: 'p', label: 'Item P', status: 'success' },
      { id: 'q', label: 'Item Q', status: 'active', dependsOn: [{ id: 'p', relation: 'requires' }] },
      { id: 'r', label: 'Item R', status: 'warning', dependsOn: [{ id: 'p', relation: 'blocks' }] },
      {
        id: 's',
        label: 'Item S',
        dependsOn: [{ id: 'q', relation: 'references' }, { id: 'r', relation: 'requires' }],
      },
    ],
    layout: 'layered',
    direction: 'horizontal',
    height: '320px',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Relation colours, dash styles, edge labels and the legend work the same in the layered ' +
          'layout as in the tree one — the difference is only where the nodes land.',
      },
    },
  },
};

export const LayeredCycle: Story = {
  name: 'Layered — Cycle Tolerance',
  args: {
    root: [
      { id: 'u', label: 'Item U', status: 'active', dependsOn: [{ id: 'w' }] },
      { id: 'v', label: 'Item V', dependsOn: [{ id: 'u' }] },
      { id: 'w', label: 'Item W', dependsOn: [{ id: 'v' }] },
    ],
    layout: 'layered',
    direction: 'horizontal',
    showEdgeLabels: false,
    height: '260px',
  },
  parameters: {
    docs: {
      description: {
        story:
          'A cycle has no layering — some link in the loop has to point backwards. The layout ' +
          'picks those links, lays out everything else as a DAG, and draws the loop-closing one ' +
          'as a dashed return edge. Nothing is dropped and nothing hangs, so a graph that turns ' +
          'out to be cyclic still renders.',
      },
    },
  },
};

export const AllRelationTypes: Story = {
  args: {
    root: [
      { id: 'core', label: 'Core' },
      { id: 'api', label: 'API', dependsOn: [{ id: 'core', relation: 'depends' }] },
      { id: 'web', label: 'Web', dependsOn: [{ id: 'api', relation: 'uses' }] },
      { id: 'admin', label: 'Admin', dependsOn: [{ id: 'web', relation: 'extends' }] },
      { id: 'jobs', label: 'Jobs', dependsOn: [{ id: 'core', relation: 'requires' }] },
      { id: 'audit', label: 'Audit', dependsOn: [{ id: 'api', relation: 'implements' }] },
      { id: 'docs', label: 'Docs', dependsOn: [{ id: 'api', relation: 'references' }] },
      { id: 'legacy', label: 'Legacy', status: 'error', dependsOn: [{ id: 'jobs', relation: 'blocks' }] },
    ],
    layout: 'layered',
    direction: 'horizontal',
    height: '420px',
  },
  parameters: {
    docs: {
      description: {
        story:
          'All seven relation types in one graph, with their labels and the legend. Since 3.22.4 `uses` reads ' +
          '`--color-text-tertiary` and `extends` `--color-on-primary-subtle` (edge, arrow, label and legend), so ' +
          'their labels reach 4.5:1 in both themes (light `uses` was 1.47, `extends` 1.89) and their lines 3:1. ' +
          'The dash style and the label still tell the relations apart, not the colour alone.',
      },
    },
  },
};

// ── Phone width (3.27, request 042, F-20) ────────────────────────────────────

/**
 * An approval process of ten steps: a–c done, d–e running, h at risk.
 * `relationLabel` names the links (the legend's text); without it the legend reads "depends on".
 */
function approvalProcess(labels: readonly string[], relationLabel?: string): DependencyNode[] {
  const statuses: DependencyNode['status'][] = ['success', 'success', 'success', 'active', 'active', 'default', 'default', 'warning', 'default', 'default'];
  const after: Record<string, string[]> = { d: ['a', 'b'], e: ['c'], f: ['d', 'e'], g: ['f'], h: ['f'], i: ['g', 'h'], j: ['i'] };
  return 'abcdefghij'.split('').map((id, i) => ({
    id,
    label: labels[i],
    status: statuses[i],
    ...(after[id] ? { dependsOn: after[id].map((dep) => (relationLabel ? { id: dep, relationLabel } : { id: dep })) } : {}),
  }));
}

const approvalEn = approvalProcess([
  'Capture request', 'Upload receipts', 'Assign cost centre', 'Check documents', 'Budget check',
  'Approval by the cost centre owner', 'Prepare booking', 'Release payment', 'Export to accounting', 'Archive',
]);

const approvalDe = approvalProcess([
  'Antrag erfassen', 'Belege hochladen', 'Kostenstelle zuordnen', 'Unterlagen prüfen', 'Budgetprüfung',
  'Freigabe durch Kostenstellenverantwortliche', 'Buchung vorbereiten', 'Zahlung freigeben', 'Export an die Finanzbuchhaltung', 'Archivieren',
], 'hängt ab von');

export const PhoneWidth: Story = {
  name: 'Phone Width',
  args: {
    root: approvalEn,
    layout: 'layered',
    direction: 'vertical',
    fitMode: 'fit-width',
    minNodeSize: 200,
    showEdgeLabels: false,
    height: '480px',
  },
  parameters: {
    docs: {
      description: {
        story:
          '3.27 (F-20): the phone recipe, `fitMode="fit-width"` with `minNodeSize` 200 (and ' +
          '`direction="vertical"` for a process). At 360 px the frame can\'t hold the widest layer at ' +
          'that size, so the fit stops there (223 px nodes drawn 200 px wide, scale 0.90: labels 10.8 px, ' +
          'borders 1.35 px; `autoFit` alone drew 5.7 px labels and 0.7 px borders), pins the graph to ' +
          'the start and lets the canvas scroll sideways: touch, Shift + wheel, or the arrow keys once ' +
          'it is focused. While it scrolls, the canvas is a tab stop after the toolbar, a ' +
          '`role="region"` named by `regionLabel`, with a 2 px inset ring. From 1024 px the same graph ' +
          'fits at 100 %, centred, with no scrolling and no region. The page scrolls vertically as ' +
          'before; `height` is not used.',
      },
    },
  },
};

export const PhoneWidthDe: Story = {
  name: 'Phone Width (German)',
  args: {
    root: approvalDe,
    layout: 'layered',
    direction: 'vertical',
    fitMode: 'fit-width',
    minNodeSize: 200,
    showEdgeLabels: false,
    height: '480px',
    regionLabel: 'Freigabeprozess',
    zoomInLabel: 'Vergrößern',
    zoomOutLabel: 'Verkleinern',
    resetZoomLabel: 'Zurücksetzen',
    depthLabel: 'Tiefe:',
    childrenLabel: 'Untergeordnet:',
    dependsOnLabel: 'Hängt ab von:',
    dependenciesLabel: 'Abhängigkeiten:',
  },
  parameters: {
    docs: {
      description: {
        story:
          '3.27 (F-20): *Phone Width* in German, with `regionLabel` "Freigabeprozess" and every ' +
          'built-in text set in German. The long labels wrap to two lines inside their nodes (no ' +
          'ellipsis); the nodes are drawn 200 px wide at 360 px (scale 0.83: labels 10 px, borders ' +
          '1.25 px) and the canvas scrolls sideways, as in *Phone Width*.',
      },
    },
  },
};
