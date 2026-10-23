import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HeaderComponent } from './header.component';
import { type AxeOutcome as Outcome, LABEL_IN_NAME as RULE, audit, axe, computedName, installFakeCanvas, outcome, violations } from '../../testing/axe-jsdom';

/**
 * Request 014 (AS-33, AC-2, AC-3, AC-4, AC-6): the header audited with
 * axe-core 4.14 (devDependency) on the WCAG 2.0–2.2 A/AA tags, both account
 * triggers, EN and DE names, menu closed and open. Request 015 adds the
 * context button. The helpers (fake canvas, audit without the layout rules)
 * are shared in `src/testing/axe-jsdom.ts`.
 */

describe('HeaderComponent — axe-core 4.14 (AS-33)', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let restoreCanvas: () => void;

  beforeAll(() => {
    restoreCanvas = installFakeCanvas();
  });

  afterAll(() => {
    restoreCanvas();
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

  // Request 015 (AC-1, AC-2, AC-5 … AC-8): the context button. jsdom ignores
  // media queries, so the label and name count as visible (the strict case;
  // below 640 px the button is display: none in a browser).
  describe('context button', () => {
    function context(root: HTMLElement): HTMLButtonElement {
      const button = root.querySelector<HTMLButtonElement>('button.lc-header__context-info');
      if (!button) throw new Error('no context button rendered');
      return button;
    }

    /** design.md §4: inputs, the computed name, the rule's result. */
    const contextRows: readonly { case: string; contextName: string; contextLabel?: string; label?: string; name: string }[] = [
      { case: 'EN', contextName: 'Acme Corp', contextLabel: 'Tenant', name: 'Context info, Tenant Acme Corp' },
      { case: 'EN, without a label', contextName: 'Acme Corp', name: 'Context info, Acme Corp' },
      { case: 'DE', contextName: 'Familie F.', label: 'Haushalt', name: 'Haushalt, Familie F.' },
      { case: 'DE with a label', contextName: 'Familie F.', contextLabel: 'Haushalt', label: 'Kontext', name: 'Kontext, Haushalt Familie F.' },
      {
        case: 'long DE',
        contextName: 'Wohngemeinschaft Kieselbacher-Morgentau-Straße 12',
        contextLabel: 'Haushalt',
        label: 'Kontext',
        name: 'Kontext, Haushalt Wohngemeinschaft Kieselbacher-Morgentau-Straße 12',
      },
      // The label already holds the visible text: nothing is appended.
      { case: 'label holds the text', contextName: 'Acme Corp', contextLabel: 'Tenant', label: 'Tenant Acme Corp', name: 'Tenant Acme Corp' },
    ];

    describe.each(contextRows)('$case', (row) => {
      it(`is named "${row.name}" and passes ${RULE}, no violations`, async () => {
        const root = await render({
          contextName: row.contextName,
          ...(row.contextLabel === undefined ? {} : { contextLabel: row.contextLabel }),
          ...(row.label === undefined ? {} : { contextAriaLabel: row.label }),
        });
        const button = context(root);
        expect(computedName(root, button)).toBe(row.name);
        // AC-5: the consumer's label stays the prefix.
        expect(button.getAttribute('aria-label')?.startsWith(row.label ?? 'Context info')).toBe(true);
        // AC-6: the visible name appears exactly once.
        expect(button.getAttribute('aria-label')?.split(row.contextName).length).toBe(2);
        const results = await audit(root);
        expect(violations(results)).toEqual([]);
        expect(outcome(results, RULE)).toBe('pass');
      });
    });

    it('reads "Tenant Acme Corp" as words: a real space between label and name', async () => {
      const root = await render({ contextName: 'Acme Corp', contextLabel: 'Tenant' });
      expect(context(root).textContent?.replace(/\s+/g, ' ').trim()).toBe('Tenant Acme Corp');
    });

    it('keeps the tooltip on the name, not on the button (AC-8: no description repeating the name)', async () => {
      const root = await render({ contextName: 'Acme Corp', contextLabel: 'Tenant' });
      expect(context(root).hasAttribute('title')).toBe(false);
      expect(root.querySelector('.lc-header__context-name')?.getAttribute('title')).toBe('Acme Corp');
    });

    it('follows a new contextName in the same change detection pass (AC-7)', async () => {
      const root = await render({ contextName: 'Acme Corp', contextLabel: 'Tenant' });
      fixture.componentRef.setInput('contextName', 'Globex');
      fixture.detectChanges();
      expect(context(root).getAttribute('aria-label')).toBe('Context info, Tenant Globex');
    });

    it('fails label-content-name-mismatch with the pre-3.11.5 name (negative control, AC-2)', async () => {
      const root = await render({ contextName: 'Acme Corp', contextLabel: 'Tenant' });
      context(root).setAttribute('aria-label', 'Context info');
      const results = await audit(root);
      expect(outcome(results, RULE)).toBe('violation');
      expect(results.violations.map((v) => v.id)).toEqual([RULE]);
      expect(document.querySelector(String(results.violations[0]?.nodes[0]?.target[0]))).toBe(context(root));
    });
  });
});
