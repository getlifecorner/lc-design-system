import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FileUploadComponent } from '@lifecorner/angular-ui-kit/file-upload';

/**
 * 3.25.2 (request 040, 037 review finding 5), rendered on the server: the
 * native file input sits beside the `role="button"` drop zone, not inside it
 * (axe nested-interactive). The zone with its name, hint, accept and max lines
 * is in the HTML before JS. Secondary entry only.
 */
@Component({
  selector: 'lc-compat-3252',
  imports: [FileUploadComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-file-upload
      id="compat-upload-3252"
      lang="de"
      accept=".csv"
      [maxSizeBytes]="20971520"
      locale="de-DE"
      hint="CSV-Datei hierher ziehen oder zum Auswählen klicken"
      acceptedLabel="Erlaubt:"
      maxSizeLabel="Höchstens:"
    />
  `,
})
export class Probe3252 {}
