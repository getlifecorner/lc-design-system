import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppPageComponent } from '@lifecorner/angular-ui-kit/app-shell';

/**
 * 3.28 (request 045), rendered on the server: lc-app-page's reserved right
 * column (AS-35: an empty aria-hidden div with the aside's class, no
 * landmark) and the wide page (AS-36: the column's grid, a `[page-wide]`
 * child, no column element). Classes and static CSS only, so the layout is
 * final before JS. Secondary entry only.
 */
@Component({
  selector: 'lc-compat-328',
  imports: [AppPageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-app-page id="compat-page-328-reserved" mainId="compat-main-328-reserved" [reserveAside]="true">
      <p>Haushalt</p>
    </lc-app-page>
    <lc-app-page id="compat-page-328-wide" mainId="compat-main-328-wide" [reserveAside]="true" contentWidth="wide">
      <p>Konten</p>
      <div page-wide id="compat-wide-328">Tabelle</div>
    </lc-app-page>
  `,
})
export class Probe328 {}
