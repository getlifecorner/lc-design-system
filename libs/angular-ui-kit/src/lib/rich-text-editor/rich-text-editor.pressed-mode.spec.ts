import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { compile } from 'sass';
import { resolve } from 'path';
import { RichTextEditorComponent, RichTextEditorMode } from './rich-text-editor.component';

/**
 * Request 044 (3.27.2, F-29): the three mode buttons tell which mode is on
 * through `aria-pressed` (WCAG 4.1.2), and forced colours, which remove the
 * pressed fill, underline the pressed one instead (WCAG 1.4.1, design 044 D-2).
 */
@Component({
  standalone: true,
  imports: [RichTextEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-rich-text-editor
      [mode]="mode()"
      [richModeLabel]="labels().rich"
      [richModeTitle]="labels().richTitle"
      [markdownModeLabel]="labels().markdown"
      [markdownModeTitle]="labels().markdownTitle"
      [splitModeLabel]="labels().split"
      [splitModeTitle]="labels().splitTitle"
    />
  `,
})
class ModeHost {
  readonly mode = signal<RichTextEditorMode>('rich');
  readonly labels = signal({
    rich: 'Rich',
    richTitle: 'Rich Text',
    markdown: 'MD',
    markdownTitle: 'Markdown',
    split: 'Split',
    splitTitle: 'Split View',
  });
}

const ORDER: RichTextEditorMode[] = ['rich', 'markdown', 'split'];
const pattern = (mode: RichTextEditorMode) => ORDER.map((m) => String(m === mode));

describe('RichTextEditorComponent pressed mode (request 044, F-29)', () => {
  let fixture: ComponentFixture<ModeHost>;
  const buttons = () => [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.lc-rich-text-editor__mode-btn')];
  const pressed = () => buttons().map((b) => b.getAttribute('aria-pressed'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ModeHost] }).compileComponents();
    fixture = TestBed.createComponent(ModeHost);
    fixture.detectChanges();
  });

  it.each(ORDER)('AC-4: mode "%s" presses exactly its own button', (mode) => {
    fixture.componentInstance.mode.set(mode);
    fixture.detectChanges();
    expect(pressed()).toEqual(pattern(mode));
    expect(pressed().filter((p) => p === 'true')).toHaveLength(1);
  });

  it.each(ORDER.map((mode, i) => [mode, i] as const))('AC-4: a click on "%s" moves the pressed state to it', (mode, i) => {
    const start = ORDER[(i + 1) % 3];
    fixture.componentInstance.mode.set(start);
    fixture.detectChanges();
    expect(pressed()).toEqual(pattern(start));
    buttons()[i].click();
    fixture.detectChanges();
    expect(pressed()).toEqual(pattern(mode));
  });

  it('AC-4: the pressed state follows .active (the normal-colours fill) on every switch', () => {
    for (const i of [1, 2, 0, 2, 1]) {
      buttons()[i].click();
      fixture.detectChanges();
      expect(buttons().map((b) => String(b.classList.contains('active')))).toEqual(pressed());
    }
  });

  it('AC-4, AC-5: native type="button" buttons, so Enter and Space activate them (a click) as before', () => {
    for (const b of buttons()) {
      expect([b.tagName, b.getAttribute('type'), b.type]).toEqual(['BUTTON', 'button', 'button']);
    }
  });

  it('AC-5: the default labels and titles are unchanged; aria-pressed is the only new attribute', () => {
    expect(buttons().map((b) => [b.textContent?.trim(), b.getAttribute('title')])).toEqual([
      ['Rich', 'Rich Text'],
      ['MD', 'Markdown'],
      ['Split', 'Split View'],
    ]);
    for (const b of buttons()) {
      expect(b.getAttributeNames().filter((n) => !n.startsWith('_ng')).sort()).toEqual(['aria-pressed', 'class', 'title', 'type']);
      expect(b.hasAttribute('aria-label')).toBe(false);
    }
  });

  it('AC-5: German labels and titles name the buttons; the pressed state is independent of the text', () => {
    fixture.componentInstance.labels.set({
      rich: 'Formatiert',
      richTitle: 'Formatierter Text',
      markdown: 'Markdown',
      markdownTitle: 'Markdown',
      split: 'Geteilt',
      splitTitle: 'Geteilte Ansicht',
    });
    fixture.componentInstance.mode.set('split');
    fixture.detectChanges();
    expect(buttons().map((b) => [b.textContent?.trim(), b.getAttribute('title'), b.getAttribute('aria-pressed')])).toEqual([
      ['Formatiert', 'Formatierter Text', 'false'],
      ['Markdown', 'Markdown', 'false'],
      ['Geteilt', 'Geteilte Ansicht', 'true'],
    ]);
  });

  describe('styles (AC-6, AC-7)', () => {
    const css = compile(resolve(__dirname, 'rich-text-editor.component.scss')).css;
    const forcedBlock = /@media \(forced-colors: active\) \{((?:[^{}]*\{[^{}]*\})*)\s*\}/g;
    const rulesOf = (text: string) =>
      [...text.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
        selectors: m[1].split(/,(?![^(]*\))/).map((s) => s.trim()),
        body: m[2],
      }));
    const decls = (body: string): Record<string, string> =>
      Object.fromEntries([...body.matchAll(/([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].replace(/\s+/g, ' ').trim()]));
    const forced = [...css.matchAll(forcedBlock)].map((m) => m[1]).join('\n');
    const PRESSED = '.lc-rich-text-editor__mode-btn[aria-pressed=true]';

    it('AC-6: forced colours underline the pressed mode in Highlight, 2 px, 4 px below the text', () => {
      const rules = rulesOf(forced).filter((r) => r.selectors.includes(PRESSED));
      expect(rules).toHaveLength(1);
      expect(decls(rules[0].body)).toEqual({
        'text-decoration-line': 'underline',
        'text-decoration-thickness': '2px',
        'text-underline-offset': '4px',
        'text-decoration-color': 'Highlight',
      });
    });

    it('AC-6: the mark changes no box (no border, padding, outline or size) and the focus ring stays Highlight', () => {
      expect(forced).not.toMatch(/aria-pressed[^{]*\{[^}]*(border|padding|outline|width|height|margin)/);
      const ring = rulesOf(forced).find((r) => r.selectors.includes('.lc-rich-text-editor__mode-btn:focus-visible'));
      expect(decls(ring?.body ?? '')).toEqual({ 'outline-color': 'Highlight' });
    });

    it('AC-7: outside forced colours nothing keys on aria-pressed; the pressed look is still the .active fill pair', () => {
      const normal = css.replace(forcedBlock, '');
      expect(normal).not.toContain('aria-pressed');
      const active = rulesOf(normal).filter((r) => r.selectors.includes('.lc-rich-text-editor__mode-btn.active'));
      expect(Object.assign({}, ...active.map((r) => decls(r.body)))).toEqual({
        'background-color': 'var(--color-primary-fill)',
        color: 'var(--color-on-primary)',
      });
    });
  });
});
