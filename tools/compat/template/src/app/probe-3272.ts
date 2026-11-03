import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RichTextEditorComponent } from '@lifecorner/angular-ui-kit/rich-text-editor';

/**
 * 3.27.2 (request 044, F-29), rendered on the server: the three mode buttons
 * carry `aria-pressed` before JS, "true" on the active (default rich) mode and
 * "false" on the other two. German labels. Secondary entry only.
 */
@Component({
  selector: 'lc-compat-3272',
  imports: [RichTextEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-rich-text-editor
      id="compat-rte-3272"
      lang="de"
      [toolbar]="{ actions: ['bold', 'italic'] }"
      [minHeight]="80"
      placeholder="Notiz schreiben …"
      richModeLabel="Formatiert"
      richModeTitle="Formatierter Text"
      markdownModeLabel="Markdown"
      splitModeLabel="Geteilt"
      splitModeTitle="Geteilte Ansicht"
      markdownEditorAriaLabel="Markdown-Editor"
      wordsLabel="Wörter"
      charactersLabel="Zeichen"
    />
  `,
})
export class Probe3272 {}
