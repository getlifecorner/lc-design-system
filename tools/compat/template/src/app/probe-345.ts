import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommandPaletteComponent, type CommandPaletteGroup } from '@lifecorner/angular-ui-kit/command-palette';
import { PopoverComponent } from '@lifecorner/angular-ui-kit/popover';
import { SortableHeadComponent } from '@lifecorner/angular-ui-kit/table';
import { TimelineComponent, type TimelineItem } from '@lifecorner/angular-ui-kit/timeline';

/**
 * 3.45 (request 065, AC-13), rendered on the server: a closed
 * `lc-command-palette` renders nothing but its host (no `window` access); a
 * focus/hover popover renders its trigger and no panel; a selectable timeline
 * renders one button per item with one tab stop and `aria-current`, and an
 * untitled item without a title element; an app `<th lcSortableHead>` carries
 * `aria-sort`, its tab stop and the hidden state text. Secondary entries only.
 */
@Component({
  selector: 'lc-compat-345',
  imports: [CommandPaletteComponent, PopoverComponent, SortableHeadComponent, TimelineComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-command-palette id="compat-palette-345" [groups]="groups" shortcut="mod+k" />
    <lc-popover id="compat-popover-345" [trigger]="['hover', 'focus']" [openDelay]="300">
      <button popover-trigger type="button">Beziehung</button>
      <div popover-content>Kostenstelle 4711</div>
    </lc-popover>
    <lc-timeline id="compat-timeline-345" [items]="history" [selectable]="true" selectedId="h-2" [headingLevel]="3" />
    <table id="compat-table-345">
      <thead>
        <tr>
          <th lcSortableHead="name" sortDirection="asc" sortedAscendingLabel="aufsteigend sortiert">Name</th>
          <th lcSortableHead="amount" align="end">Betrag</th>
        </tr>
      </thead>
      <tbody><tr><td>Netz</td><td>214.300,00 €</td></tr></tbody>
    </table>
  `,
})
export class Probe345 {
  protected readonly groups: CommandPaletteGroup[] = [
    { id: 'pages', heading: 'Seiten', items: [{ id: 'kosten', label: 'Kostenstellen' }] },
  ];

  protected readonly history: TimelineItem[] = [
    { id: 'h-1', title: 'Antrag eingereicht', timestamp: '09:12' },
    { id: 'h-2', title: 'Schlüssel geändert', timestamp: '10:40' },
    { id: 'h-3', title: '', ariaLabel: 'Automatische Prüfung', description: 'Keine Auffälligkeiten.', timestamp: '11:05' },
  ];
}
