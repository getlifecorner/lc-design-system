import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import * as axe from 'axe-core';
import { HeaderComponent } from './header.component';

/**
 * Request 014 (AS-33, AC-2, AC-3, AC-4, AC-6): the header audited with
 * axe-core 4.14 (devDependency) on the WCAG 2.0–2.2 A/AA tags, both account
 * triggers, EN and DE names, menu closed and open. `color-contrast` and
 * `target-size` need layout, which jsdom does not have: `story-shots --axe`
 * runs them in the browser, in light and dark, at 360 and 1280 px.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const RULE = 'label-content-name-mismatch';

type Outcome = 'violation' | 'pass' | 'incomplete' | 'inapplicable' | 'not run';

/**
 * jsdom has no 2D canvas, and axe's icon-ligature check (part of
 * `label-content-name-mismatch`) draws the visible text. Every glyph here is
 * 10 px wide and fully inked, so no text counts as an icon ligature and the
 * rule decides as in a browser with a text font.
 */
function fakeCanvasContext(canvas: HTMLCanvasElement): unknown {
  return {
    canvas,
    font: '',
    textAlign: 'left',
    textBaseline: 'top',
    measureText: (text: string) => ({ width: 10 * Array.from(text).length }),
    fillText: () => undefined,
    clearRect: () => undefined,
    getImageData: (_x: number, _y: number, width: number, height: number) => ({
      data: new Uint8ClampedArray(Math.max(1, Math.ceil(width) * Math.ceil(height)) * 4).fill(255),
    }),
  };
}

describe('HeaderComponent — axe-core 4.14 (AS-33)', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  const originalGetContext = HTMLCanvasElement.prototype.getContext;

  beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement) {
      return fakeCanvasContext(this);
    } as unknown as typeof originalGetContext;
  });

  afterAll(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), provideHttpClient(withXhr())],
    }).compileComponents();
  });

  /** A header with brand, hamburger and theme button, so their icons are audited too. */
  async function render(inputs: Record<string, unknown>): Promise<HTMLElement> {
    fixture = TestBed.createComponent(HeaderComponent);
    const all: Record<string, unknown> = { title: 'Produkt', titleTag: 'span', showHamburger: true, showThemeButton: true, ...inputs };
    for (const [name, value] of Object.entries(all)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  /** One axe run at a time (axe refuses parallel runs): every caller awaits it. */
  function audit(context: Element): Promise<axe.AxeResults> {
    return axe.run(context, {
      runOnly: { type: 'tag', values: TAGS },
      rules: { 'color-contrast': { enabled: false }, 'target-size': { enabled: false } },
    });
  }

  /** Violations as `rule: targets`, so a failure names what failed. */
  function violations(results: axe.AxeResults): string[] {
    return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
  }

  function outcome(results: axe.AxeResults, id: string): Outcome {
    if (results.violations.some((r) => r.id === id)) return 'violation';
    if (results.incomplete.some((r) => r.id === id)) return 'incomplete';
    if (results.passes.some((r) => r.id === id)) return 'pass';
    if (results.inapplicable.some((r) => r.id === id)) return 'inapplicable';
    return 'not run';
  }

  /** The accessible name as axe computes it (not just the attribute). */
  function computedName(root: HTMLElement, element: Element): string {
    axe.setup(root);
    try {
      return axe.commons.text.accessibleText(element);
    } finally {
      axe.teardown();
    }
  }

  function trigger(root: HTMLElement): HTMLButtonElement {
    const button = root.querySelector<HTMLButtonElement>('button.lc-header__profile-trigger');
    if (!button) throw new Error('no account trigger rendered');
    return button;
  }

  it('runs axe-core 4.14 with label-content-name-mismatch under wcag21a', () => {
    expect(axe.version).toMatch(/^4\.14\./);
    const rule = axe.getRules(['wcag21a']).find((r) => r.ruleId === RULE);
    expect(rule?.tags).toContain('wcag21a');
    expect(rule?.tags).not.toContain('experimental');
  });

  /** design.md §4: inputs, the avatar trigger's computed name, the rule's result. */
  const rows: readonly { case: string; userName: string; label?: string; src?: string; name: string; rule: Outcome }[] = [
    { case: 'EN', userName: 'Johanna Müller', label: 'Menu for Johanna Müller', name: 'Menu for Johanna Müller, JM', rule: 'pass' },
    { case: 'DE', userName: 'Johanna Müller', label: 'Menü für Johanna Müller', name: 'Menü für Johanna Müller, JM', rule: 'pass' },
    {
      case: 'long DE name',
      userName: 'Johanna-Friederike Apfelbaum-Kieselbacher-Morgentau',
      label: 'Menü für Johanna-Friederike Apfelbaum-Kieselbacher-Morgentau',
      name: 'Menü für Johanna-Friederike Apfelbaum-Kieselbacher-Morgentau, JA',
      rule: 'pass',
    },
    // A single letter is never decided by axe.
    { case: 'one word', userName: 'Johanna', label: 'Menü für Johanna', name: 'Menü für Johanna, J', rule: 'incomplete' },
    // "?" is punctuation: nothing appended, axe cannot decide.
    { case: 'no name', userName: '', name: 'Open user menu', rule: 'incomplete' },
    { case: 'no name, DE', userName: '', label: 'Benutzermenü öffnen', name: 'Benutzermenü öffnen', rule: 'incomplete' },
    // jsdom loads no image and fires no error: the photo stays, no visible text.
    { case: 'photo', userName: 'Tom Ek', label: 'Menü für Tom Ek', src: '/photos/tom.jpg', name: 'Menü für Tom Ek, TE', rule: 'inapplicable' },
    { case: 'label already holds them', userName: 'Al Lee', label: 'Menu for Al Lee', name: 'Menu for Al Lee', rule: 'pass' },
    { case: 'empty label', userName: 'Tom Ek', label: '', name: 'TE', rule: 'pass' },
  ];

  const inputsOf = (row: (typeof rows)[number]) => ({
    userName: row.userName,
    ...(row.label === undefined ? {} : { userMenuAriaLabel: row.label }),
    ...(row.src === undefined ? {} : { userAvatarSrc: row.src }),
  });

  describe.each(rows)('avatar trigger, $case', (row) => {
    it(`is named "${row.name}", ${row.rule} for ${RULE}, no violations`, async () => {
      const root = await render({ ...inputsOf(row), userMenuTrigger: 'avatar' });
      expect(computedName(root, trigger(root))).toBe(row.name);
      const results = await audit(root);
      expect(violations(results)).toEqual([]);
      expect(outcome(results, RULE)).toBe(row.rule);
    });
  });

  // An empty label left the icon trigger without a name before 3.11.4 as well
  // (button-name); that row is the consumer's error and not audited here.
  describe.each(rows.filter((row) => row.label !== ''))('icon trigger, $case', (row) => {
    it('keeps userMenuAriaLabel as its name, no violations', async () => {
      const root = await render(inputsOf(row));
      expect(trigger(root).classList).not.toContain('lc-header__profile-trigger--avatar');
      expect(computedName(root, trigger(root))).toBe(row.label ?? 'Open user menu');
      const results = await audit(root);
      expect(violations(results)).toEqual([]);
      expect(outcome(results, RULE)).toBe('inapplicable');
    });
  });

  it('avatar trigger, broken photo: the initials show under the same name, and pass (AC-4)', async () => {
    const root = await render({ userName: 'Tom Ek', userMenuAriaLabel: 'Menü für Tom Ek', userAvatarSrc: '/photos/broken.jpg', userMenuTrigger: 'avatar' });
    const photo = trigger(root).querySelector('img');
    expect(photo).toBeTruthy();
    photo?.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(trigger(root).querySelector('.lc-avatar__initials')?.textContent?.trim()).toBe('TE');
    expect(computedName(root, trigger(root))).toBe('Menü für Tom Ek, TE');
    const results = await audit(root);
    expect(violations(results)).toEqual([]);
    expect(outcome(results, RULE)).toBe('pass');
  });

  describe.each([
    { trigger: 'avatar', userMenuAriaLabel: 'Menü für Johanna Müller' },
    { trigger: 'icon', userMenuAriaLabel: 'Menu for Johanna Müller' },
  ])('$trigger trigger with the menu open', ({ trigger: kind, userMenuAriaLabel }) => {
    it('has no violations, the item icons included (svg-img-alt)', async () => {
      const root = await render({
        userName: 'Johanna Müller',
        userEmail: 'johanna@example.org',
        userMenuAriaLabel,
        userMenuTrigger: kind,
        profileLabel: 'Einstellungen',
        logoutLabel: 'Abmelden',
      });
      trigger(root).click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(root.querySelectorAll('[role="menuitem"] svg').length).toBe(2);
      const results = await audit(root);
      expect(violations(results)).toEqual([]);
      expect(outcome(results, 'svg-img-alt')).not.toBe('violation');
    });
  });

  it('fails label-content-name-mismatch with the pre-3.11.4 name (negative control, AC-2)', async () => {
    const root = await render({ userName: 'Johanna Müller', userMenuAriaLabel: 'Menü für Johanna Müller', userMenuTrigger: 'avatar' });
    trigger(root).setAttribute('aria-label', 'Menü für Johanna Müller');
    const results = await audit(root);
    expect(outcome(results, RULE)).toBe('violation');
    expect(results.violations.map((v) => v.id)).toEqual([RULE]);
    const nodes = results.violations[0]?.nodes ?? [];
    expect(nodes.length).toBe(1);
    expect(document.querySelector(String(nodes[0]?.target[0]))).toBe(trigger(root));
  });
});
