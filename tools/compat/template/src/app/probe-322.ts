import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideLcIcons } from '@lifecorner/angular-ui-kit/icon';
import { SearchInputComponent } from '@lifecorner/angular-ui-kit/search-input';

/**
 * 3.22 (request 030, life-os BA-6), rendered on the server: an app that
 * registers no icons and sets `unregistered: 'placeholder'` (life-os's
 * setting). lc-search-input registers its magnifier (`ICON_SEARCH`) itself, so
 * the glyph is in the prerendered HTML, not the placeholder. Secondary entries only.
 */
@Component({
  selector: 'lc-compat-322',
  imports: [SearchInputComponent],
  providers: [provideLcIcons([], { unregistered: 'placeholder' })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-search-input id="compat-search-322" lang="de" placeholder="Bank, BIC oder Ort suchen …" ariaLabel="Banken durchsuchen" />
  `,
})
export class Probe322 {}
