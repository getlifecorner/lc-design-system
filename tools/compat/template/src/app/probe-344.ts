import { ChangeDetectionStrategy, Component } from '@angular/core';
import type { MenuItem } from '@lifecorner/angular-ui-kit/menu';
import { SplitButtonComponent } from '@lifecorner/angular-ui-kit/split-button';
import { TabComponent, TabsComponent } from '@lifecorner/angular-ui-kit/tabs';

/**
 * 3.44 (request 064, AC-29), rendered on the server: the split button's face
 * and caret with `aria-haspopup="menu"` and `aria-expanded` (usm-x row 30), and
 * `lc-tabs mode="links"`: `role="tab"` links, the current one
 * `aria-selected` with its `?tab=` href (usm-x row 11). Secondary entries only.
 */
@Component({
  selector: 'lc-compat-344',
  imports: [SplitButtonComponent, TabsComponent, TabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-split-button id="compat-split-344" size="sm" [items]="items" menuAriaLabel="Weitere Aktionen">Speichern</lc-split-button>
    <lc-tabs id="compat-tabs-344" mode="links" panelId="compat-tab-panel-344">
      <lc-tab label="Übersicht" tabId="compat-tab-uebersicht" route="." [queryParams]="{ tab: 'uebersicht' }" />
      <lc-tab label="Kostenstellen" tabId="compat-tab-kosten" route="." [queryParams]="{ tab: 'kosten' }" [current]="true" />
    </lc-tabs>
    <div role="tabpanel" id="compat-tab-panel-344" aria-labelledby="compat-tab-kosten">Kostenstellen</div>
  `,
})
export class Probe344 {
  protected readonly items: MenuItem[] = [
    { id: 'save-as', label: 'Speichern unter …' },
    { id: 'discard', label: 'Verwerfen', variant: 'danger' },
  ];
}
