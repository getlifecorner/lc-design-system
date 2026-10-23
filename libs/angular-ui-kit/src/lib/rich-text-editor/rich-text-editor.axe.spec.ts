import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RichTextEditorComponent, ToolbarAction } from './rich-text-editor.component';
import { type AxeOutcome, LABEL_IN_NAME as RULE, audit, computedName, installFakeCanvas, outcome, outcomeFor, violations } from '../../testing/axe-jsdom';

/**
 * Request 015 (AS-33, AC-1, AC-2, AC-5, AC-8): the toolbar buttons under
 * axe-core 4.14. A label with letters or digits that the title lacks is
 * appended ("Heading 1, H1"); symbol labels keep the title, and axe leaves
 * them undecided (single letters, punctuation, emoji: "incomplete").
 */
describe('RichTextEditorComponent — axe-core 4.14 (AS-33)', () => {
  let fixture: ComponentFixture<RichTextEditorComponent>;
  let restoreCanvas: () => void;

  beforeAll(() => {
    restoreCanvas = installFakeCanvas();
  });

  afterAll(() => {
    restoreCanvas();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [RichTextEditorComponent] }).compileComponents();
  });

  async function render(inputs: Record<string, unknown> = {}): Promise<HTMLElement> {
    fixture = TestBed.createComponent(RichTextEditorComponent);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const buttons = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLButtonElement>('.lc-rich-text-editor__toolbar-btn'));

  /** design.md §4, the default toolbar in order: visible label, name, the rule's result. */
  const EN: readonly [ToolbarAction, string, string, AxeOutcome | 'not violation'][] = [
    ['bold', 'B', 'Bold', 'incomplete'],
    ['italic', 'I', 'Italic', 'incomplete'],
    ['underline', 'U', 'Underline', 'incomplete'],
    ['strikethrough', 'S', 'Strikethrough', 'incomplete'],
    ['h1', 'H1', 'Heading 1, H1', 'pass'],
    ['h2', 'H2', 'Heading 2, H2', 'pass'],
    ['h3', 'H3', 'Heading 3, H3', 'pass'],
    ['ul', '•', 'Unordered List', 'not violation'],
    ['ol', '1.', 'Ordered List, 1.', 'pass'],
    ['blockquote', '"', 'Blockquote', 'not violation'],
    ['code', '<>', 'Inline Code', 'not violation'],
    ['codeblock', '{ }', 'Code Block', 'not violation'],
    ['link', '🔗', 'Insert Link', 'not violation'],
    ['hr', '—', 'Horizontal Rule', 'not violation'],
  ];

  it('names the default toolbar as designed (EN), title equal to the name', async () => {
    const root = await render();
    const toolbar = buttons(root);
    expect(toolbar.map((b) => b.textContent?.trim())).toEqual(EN.map((r) => r[1]));
    expect(toolbar.map((b) => computedName(root, b))).toEqual(EN.map((r) => r[2]));
    // AC-8: the tooltip is the name, so there is no description repeating it.
    for (const b of toolbar) expect(b.title).toBe(b.getAttribute('aria-label'));
    const results = await audit(root);
    expect(violations(results)).toEqual([]);
    toolbar.forEach((b, i) => {
      const expected = EN[i]?.[3];
      if (expected === 'not violation') expect(outcomeFor(results, RULE, b)).not.toBe('violation');
      else expect(outcomeFor(results, RULE, b)).toBe(expected);
    });
  });

  it('appends the label to German titles and keeps them as the prefix (DE, AC-5)', async () => {
    const root = await render({
      toolbar: { actions: ['bold', 'h1', 'h2', 'ul', 'ol'] },
      actionTitles: { bold: 'Fett', h1: 'Überschrift 1', h2: 'Überschrift 2', ul: 'Aufzählung', ol: 'Nummerierte Liste' },
    });
    const toolbar = buttons(root);
    expect(toolbar.map((b) => computedName(root, b))).toEqual(['Fett', 'Überschrift 1, H1', 'Überschrift 2, H2', 'Aufzählung', 'Nummerierte Liste, 1.']);
    const results = await audit(root);
    expect(violations(results)).toEqual([]);
    expect(outcomeFor(results, RULE, toolbar[1] as Element)).toBe('pass');
    expect(outcomeFor(results, RULE, toolbar[4] as Element)).toBe('pass');
  });

  it('keeps a title that already contains the label', async () => {
    const root = await render({ toolbar: { actions: ['h1'] }, actionTitles: { h1: 'H1 heading' } });
    expect(buttons(root)[0]?.getAttribute('aria-label')).toBe('H1 heading');
  });

  it('fails label-content-name-mismatch with the pre-3.11.5 names (negative control, AC-2)', async () => {
    const root = await render({ toolbar: { actions: ['h1', 'ol'] } });
    const [h1, ol] = buttons(root);
    if (!h1 || !ol) throw new Error('no toolbar buttons');
    h1.setAttribute('aria-label', 'Heading 1');
    ol.setAttribute('aria-label', 'Ordered List');
    const results = await audit(root);
    expect(outcome(results, RULE)).toBe('violation');
    expect(results.violations.map((v) => v.id)).toEqual([RULE]);
    expect(outcomeFor(results, RULE, h1)).toBe('violation');
    expect(outcomeFor(results, RULE, ol)).toBe('violation');
  });
});
