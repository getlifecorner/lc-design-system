import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AvatarComponent } from '@lifecorner/angular-ui-kit/avatar';
import { SidenavComponent } from '@lifecorner/angular-ui-kit/sidenav';
import { TableComponent, type TableAction, type TableColumn } from '@lifecorner/angular-ui-kit/table';
import { TabComponent, TabsComponent } from '@lifecorner/angular-ui-kit/tabs';
import type { NavigationItem } from '@lifecorner/angular-ui-kit/models';

/**
 * 3.48 (request 068), rendered on the server: a square avatar (usm-x row
 * 65), an actions head named for screen readers only (finance-intelligence
 * row 7), a sidenav action with its popup state (backlog 067-n4), and named
 * tabs with a hint and a reason tab, whose panel reads the padding hook
 * (usm-x rows 49, 50, 52, 69). Secondary entries only.
 */
@Component({
  selector: 'lc-compat-348',
  imports: [AvatarComponent, SidenavComponent, TableComponent, TabsComponent, TabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de">
      <div id="compat-avatar-348"><lc-avatar shape="square" name="Ticket 4711" size="md" /></div>
      <div id="compat-table-348">
        <lc-table caption="Offene Positionen" [columns]="columns" [data]="rows" [actions]="actions" actionsLabel="Aktionen" [showActionsLabel]="false" actionsWidth="240px" />
      </div>
      <div id="compat-sidenav-348" style="display: flex; height: 240px;">
        <lc-sidenav mode="docked" [isOpen]="true" width="240px" [mobileBreakpoint]="0" [items]="items" ariaLabel="Ordner 348" expandedActionId="compat-348-inbox" />
      </div>
      <div id="compat-tabs-348" style="--lc-tabs-panel-padding: 0;">
        <lc-tabs ariaLabel="Facetten">
          <lc-tab label="Ticket" hint="12 Status" badge="3 Treffer">Ticket</lc-tab>
          <lc-tab label="Workflow" [disabled]="true" disabledReason="Wird im Rich Client bearbeitet">Workflow</lc-tab>
        </lc-tabs>
      </div>
    </div>
  `,
})
export class Probe348 {
  protected readonly columns: TableColumn[] = [{ key: 'position', label: 'Position' }];
  protected readonly rows = [{ id: 1, position: 'Lizenz' }];
  protected readonly actions: TableAction[] = [{ key: 'explain', label: 'Erklären' }];
  protected readonly items: NavigationItem[] = [
    { id: 'compat-348-inbox', icon: 'file', label: 'Eingang', route: '/compat-348/eingang', displayOrder: 1, action: { icon: 'dots', ariaLabel: 'Aktionen für Eingang', hasPopup: 'menu' } },
    { id: 'compat-348-drafts', icon: 'file', label: 'Entwürfe', route: '/compat-348/entwuerfe', displayOrder: 2, action: { icon: 'dots', ariaLabel: 'Aktionen für Entwürfe', hasPopup: 'menu' } },
  ];
}
