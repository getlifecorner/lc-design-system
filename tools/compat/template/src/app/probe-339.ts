import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DeviceFrameComponent } from '@lifecorner/angular-ui-kit/device-frame';
import { PictureComponent, type PictureSource } from '@lifecorner/angular-ui-kit/picture';

/**
 * 3.39 (request 059, life-os website-screenshots G-SS1, G-SS2), rendered on
 * the server: the frame with its notch and size classes, and a picture with
 * a dark source, so both pictures, the sources and the reserved size are in
 * the HTML before JS (059 AC-8, AC-9b). The required `src`, `alt`, `width`
 * and `height` compile under strictTemplates (AC-10). Secondary entries only.
 */
@Component({
  selector: 'lc-compat-339',
  imports: [DeviceFrameComponent, PictureComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-device-frame id="compat-device-frame" notch>
      <lc-picture id="compat-picture" src="/compat-logo/character/hello-light.svg" alt="Edu" width="100" height="100" [sources]="dark" />
    </lc-device-frame>
  `,
})
export class Probe339 {
  protected readonly dark: PictureSource[] = [{ srcset: '/compat-logo/character/hello-dark.svg', type: 'image/svg+xml', theme: 'dark' }];
}
