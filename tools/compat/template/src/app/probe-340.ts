import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AreaMapComponent, type AreaMapGroup } from '@lifecorner/angular-ui-kit/area-map';
import { HeroComponent } from '@lifecorner/angular-ui-kit/hero';

/**
 * 3.40 (request 060, life-os website-home-vision G-HV2), rendered on the
 * server: an area map in a hero's media slot. The named list, the anchor and
 * row classes and the `aria-hidden` lines are in the HTML before JS, with no
 * inline style (060 AC-5). The required `groups` and `layerTitle` compile
 * under strictTemplates. Secondary entries only.
 */
@Component({
  selector: 'lc-compat-340',
  imports: [HeroComponent, AreaMapComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-hero id="compat-hero-340" title="Bereiche" [headingLevel]="2">
      <lc-area-map
        hero-media
        id="compat-area-map"
        [groups]="groups"
        layerTitle="Verbunden, für dich und KI nutzbar"
        layerText="Jede Angabe mit Quelle."
        ariaLabel="Bereiche und ihr Stand"
      />
    </lc-hero>
  `,
})
export class Probe340 {
  protected readonly groups: AreaMapGroup[] = [
    { status: 'Als Nächstes', statusVariant: 'primary', areas: ['Verträge und Versicherungen', 'Haushaltsbudget'] },
    { status: 'Gebaut', statusVariant: 'success', chipVariant: 'default', areas: ['Konten'] },
    { status: 'Später', placement: 'below', areas: ['Gesundheit, Fitness, Ernährung', 'Und mehr'] },
  ];
}
