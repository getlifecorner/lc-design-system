import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CharacterComponent } from '@lifecorner/angular-ui-kit/character';

/**
 * 3.8 (request 005, G-4), rendered on the server: Edu in the horizon's figure
 * slot (decorative, the base path from LC_LOGO_BASE_PATH provided through the
 * primary entry) and on a dark surface with a name. Secondary entry only.
 */
@Component({
  selector: 'lc-compat-38',
  imports: [CharacterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lc-horizon" aria-hidden="true">
      <lc-character id="compat-character" class="lc-horizon__figure" pose="hello" />
    </div>
    <lc-character id="compat-character-dark" pose="hello" colorMode="dark" size="96" ariaLabel="Edu winkt" />
  `,
})
export class Probe38 {}
