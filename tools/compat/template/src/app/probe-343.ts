import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent, provideLcIcons } from '@lifecorner/angular-ui-kit/icon';
import { ICON_HOME } from '@lifecorner/angular-ui-kit/icons';
import { TableComponent, type TableColumn } from '@lifecorner/angular-ui-kit/table';
import { TextareaComponent } from '@lifecorner/angular-ui-kit/textarea';

/**
 * 3.43 (request 063, AC-33), rendered on the server: a lazy tree row
 * (`hasChildrenKey`, kosten row 1) with its collapsed chevron, a one-line
 * textarea without a footer (usm-x row 6) and an icon drawn at 18 px through
 * `--lc-icon-size` from a class (usm-x row 18; no style attribute).
 * Secondary entries only.
 */
@Component({
  selector: 'lc-compat-343',
  imports: [TableComponent, TextareaComponent, IconComponent],
  providers: [provideLcIcons([ICON_HOME])],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .compat-dense-icon {
        --lc-icon-size: 18px;
      }
    `,
  ],
  template: `
    <div id="compat-table-343">
      <lc-table caption="Budgets mit Planposten" size="sm" [columns]="columns" [data]="budgets"
        idKey="id" parentKey="parentId" treeColumn="name" hasChildrenKey="hasPlanItems" />
    </div>
    <div id="compat-textarea-343">
      <lc-textarea label="Nachricht" placeholder="Nachricht schreiben …" [rows]="1" [autoResize]="true" [maxRows]="5" />
    </div>
    <div id="compat-icon-343">
      <lc-icon class="compat-dense-icon" name="home" size="sm" [decorative]="true" />
    </div>
  `,
})
export class Probe343 {
  protected readonly columns: TableColumn[] = [
    { key: 'name', label: 'Budget' },
    { key: 'plan', label: 'Plan (€)', align: 'end' },
  ];
  protected readonly budgets = [
    { id: 'b1', parentId: '', name: 'IT-Betrieb', plan: '120.000', hasPlanItems: true },
    { id: 'b2', parentId: '', name: 'Beratung', plan: '20.000', hasPlanItems: false },
  ];
}
