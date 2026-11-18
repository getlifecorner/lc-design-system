import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TimelineComponent, type TimelineItem } from '@lifecorner/angular-ui-kit/timeline';

/**
 * 3.46 (request 066, AC-13), rendered on the server: a horizontal timeline
 * that would overflow a phone is measured only in the browser, so the server
 * renders its list without a tab stop, a name or the scroll class, and the
 * German `scrollLabel` compiles under strictTemplates. The description list's
 * item icon is in probe-336.ts. Secondary entries only.
 */
@Component({
  selector: 'lc-compat-346',
  imports: [TimelineComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div lang="de">
      <lc-timeline id="compat-timeline-346" orientation="horizontal" scrollLabel="Zeitleiste" [items]="steps" />
    </div>
  `,
})
export class Probe346 {
  protected readonly steps: TimelineItem[] = [
    { title: 'Antrag', description: 'Eingereicht', color: 'success' },
    { title: 'Prüfung', description: 'Fachbereich', color: 'success' },
    { title: 'Freigabe', description: 'Controlling', color: 'primary' },
    { title: 'Auszahlung', description: 'Buchhaltung', color: 'neutral' },
  ];
}
