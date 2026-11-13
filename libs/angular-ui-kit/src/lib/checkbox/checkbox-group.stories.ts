import type { Meta, StoryObj } from '@storybook/angular';
import { FormControl as NgFormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { expect, userEvent, within } from 'storybook/test';
import { CheckboxComponent } from './checkbox.component';
import { CheckboxGroupComponent } from './checkbox-group.component';

const CHILDREN = `
        <lc-checkbox value="administration" label="Administration" />
        <lc-checkbox value="controlling" label="Controlling" />
        <lc-checkbox value="cfo" label="CFO" />`;

const meta: Meta<CheckboxGroupComponent> = {
  title: 'Form/Checkbox Group',
  component: CheckboxGroupComponent,
  parameters: {
    docs: {
      description: {
        component: `
\`lc-checkbox-group\` — a multiple choice: a group of \`lc-checkbox\`es as a native \`<fieldset>\`
named by its \`<legend>\`, with one help text below the legend and one error below the checkboxes
(both linked by \`aria-describedby\`; the error is announced once). The group passes its \`size\`,
\`disabled\` and invalid state to every checkbox inside and holds the \`value\`s of the checked
ones: \`[(value)]\` or a form control on the group (\`[formControl]\`, \`formControlName\`, \`ngModel\`).

\`\`\`html
<lc-checkbox-group legend="Rollen" helpText="Mehrere Rollen sind möglich." [required]="true"
                   requiredAriaLabel="Pflichtfeld" [error]="rolesError" [(value)]="roles">
  <lc-checkbox value="administration" label="Administration" />
  <lc-checkbox value="controlling" label="Controlling" />
  <lc-checkbox value="cfo" label="CFO" />
</lc-checkbox-group>
\`\`\`

**Always set \`legend\`:** it is the group's name; hide it with \`legendHidden\`.

**Required stays on the group:** \`required\` puts \`*\` after the legend and adds
\`requiredAriaLabel\` to the group's name. The checkboxes stay optional, because a required
checkbox means "this box must be checked". Validate the value (e.g. \`Validators.required\`)
and set \`error\`. A checkbox's own \`required\` (e.g. "accept the terms") keeps its own \`*\`.

**Touch targets:** in a group, \`size="lg"\` rows are 44 px high and the whole row is the target;
rows sit 8 px apart. Smaller sizes still meet WCAG 2.5.8 (24 px) by spacing. A \`size\` bound on
a checkbox wins over the group's.
        `,
      },
    },
  },
  argTypes: {
    legend: {
      control: 'text',
      description: 'The group’s question, rendered as the `<legend>` (its accessible name)',
      table: { defaultValue: { summary: "''" } },
    },
    legendHidden: {
      control: 'boolean',
      description: 'Hides the legend visually; screen readers still read it',
      table: { defaultValue: { summary: 'false' } },
    },
    helpText: {
      control: 'text',
      description: 'Help for the whole group, below the legend; describes the group',
      table: { defaultValue: { summary: "''" } },
    },
    error: {
      control: 'text',
      description:
        'One error for the whole group, below the checkboxes: shown and announced once, describes the group and marks every checkbox invalid',
      table: { defaultValue: { summary: "''" } },
    },
    required: {
      control: 'boolean',
      description: 'The group needs an answer: `*` after the legend and `requiredAriaLabel` in its name; the checkboxes stay optional',
      table: { defaultValue: { summary: 'false' } },
    },
    requiredIndicator: {
      control: 'boolean',
      description: 'Shows the `*` marker (and its spoken label) after the legend of a required group',
      table: { defaultValue: { summary: 'true' } },
    },
    requiredAriaLabel: {
      control: 'text',
      description: 'Spoken label of the `*` marker',
      table: { defaultValue: { summary: 'required' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the fieldset and every checkbox in it',
      table: { defaultValue: { summary: 'false' } },
    },
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
      description: '`vertical` stacks the checkboxes; `horizontal` puts them in a row that wraps',
      table: { defaultValue: { summary: 'vertical' } },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Size of every checkbox in the group; a `size` bound on a checkbox wins. `lg` rows are 44 px touch targets',
      table: { defaultValue: { summary: 'md' } },
    },
    value: {
      control: 'object',
      description:
        'The `value`s of the checked checkboxes, in the order of the checkboxes (two-way bindable via [(value)], or a form control on the group)',
      table: { defaultValue: { summary: '[]' } },
    },
  },
  args: {
    legend: 'Rollen',
    legendHidden: false,
    helpText: 'Mehrere Rollen sind möglich.',
    error: '',
    required: false,
    requiredIndicator: true,
    requiredAriaLabel: 'Pflichtfeld',
    disabled: false,
    orientation: 'vertical',
    size: 'md',
    value: ['controlling'],
  },
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [CheckboxGroupComponent, CheckboxComponent] },
    template: `
      <lc-checkbox-group lang="de" [legend]="legend" [legendHidden]="legendHidden" [helpText]="helpText" [error]="error"
                         [required]="required" [requiredIndicator]="requiredIndicator"
                         [requiredAriaLabel]="requiredAriaLabel" [disabled]="disabled"
                         [orientation]="orientation" [size]="size" [(value)]="value">${CHILDREN}
      </lc-checkbox-group>
    `,
  }),
};

export default meta;
type Story = StoryObj<CheckboxGroupComponent>;

export const Default: Story = {
  parameters: {
    docs: { description: { story: 'The role choice of "Benutzer anlegen": three roles that combine, `md` at desktop width.' } },
  },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', { name: 'Rollen' });
    await expect(within(group).getAllByRole('checkbox')).toHaveLength(3);
  },
};

export const WithError: Story = {
  parameters: {
    docs: {
      description: {
        story: 'One message below the checkboxes, announced once; it describes the group and every checkbox is invalid.',
      },
    },
  },
  args: { required: true, error: 'Wählen Sie mindestens eine Rolle.', value: [] },
};

export const Required: Story = {
  parameters: {
    docs: { description: { story: '`*` after the legend; the group is named "Rollen Pflichtfeld". The checkboxes stay optional.' } },
  },
  args: { required: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('group', { name: 'Rollen Pflichtfeld' })).toBeTruthy();
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: ['administration'] },
};

export const Horizontal: Story = {
  parameters: {
    docs: { description: { story: 'One row from tablet width; at 360 px "CFO" wraps onto a second row.' } },
  },
  args: { orientation: 'horizontal' },
};

export const PhoneLarge: Story = {
  name: 'Phone (lg)',
  parameters: {
    docs: { description: { story: '`size="lg"` at 360 px: every row is a 44 px touch target, 8 px apart.' } },
  },
  args: { size: 'lg', required: true },
};

export const HiddenLegend: Story = {
  parameters: {
    docs: { description: { story: 'The legend is hidden visually (the help text moves to the top); the group keeps its name.' } },
  },
  args: { legendHidden: true },
};

export const FormControl: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'A `FormControl<string[]>` with `Validators.required` on the group; the error shows once the control is touched and empty. The value lists the checked roles in the order of the checkboxes.',
      },
    },
  },
  render: () => ({
    props: {
      control: new NgFormControl<string[]>(['controlling'], { nonNullable: true, validators: Validators.required }),
    },
    moduleMetadata: { imports: [CheckboxGroupComponent, CheckboxComponent, ReactiveFormsModule] },
    template: `
      <div lang="de">
        <lc-checkbox-group legend="Rollen" helpText="Mehrere Rollen sind möglich." [required]="true"
                           requiredAriaLabel="Pflichtfeld" [formControl]="control"
                           [error]="control.touched && control.invalid ? 'Wählen Sie mindestens eine Rolle.' : ''">${CHILDREN}
        </lc-checkbox-group>
        <p data-testid="value" style="margin: 16px 0 0; font-size: var(--font-size-sm); color: var(--color-text-secondary);">Wert: {{ control.value.join(', ') }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Administration' }));
    await expect(canvas.getByTestId('value')).toHaveTextContent('Wert: administration, controlling');
  },
};
