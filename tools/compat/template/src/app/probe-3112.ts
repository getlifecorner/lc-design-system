import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AvatarComponent } from '@lifecorner/angular-ui-kit/avatar';
import { CharacterComponent } from '@lifecorner/angular-ui-kit/character';

/**
 * 3.11.2 (request 012, G-39 and G-40), rendered on the server: an avatar image
 * with its size's width/height and `loading="lazy"`, and Edu with both
 * drawings lazy (a figure below the fold). Secondary entries only.
 */
@Component({
  selector: 'lc-compat-3112',
  imports: [AvatarComponent, CharacterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-avatar id="compat-avatar" src="/compat-logo/character/hello-light.svg" alt="Edu" size="lg" loading="lazy" />
    <lc-character id="compat-character-lazy" pose="hello" loading="lazy" />
  `,
})
export class Probe3112 {}
