import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepperComponent, StepperStep } from './stepper.component';
import { LABEL_IN_NAME as RULE, audit, computedName, installFakeCanvas, outcome, outcomeFor, violations } from '../../testing/axe-jsdom';

/**
 * Request 015 (AS-33, AC-1, AC-2, AC-5 … AC-8): the step buttons under
 * axe-core 4.14. The visible text is the title, then the description and the
 * optional label (the number is generated content); the name is the filled
 * `stepAriaLabel`, then the same parts, so it contains the visible text.
 */
describe('StepperComponent — axe-core 4.14 (AS-33)', () => {
  let fixture: ComponentFixture<StepperComponent>;
  let restoreCanvas: () => void;

  beforeAll(() => {
    restoreCanvas = installFakeCanvas();
  });

  afterAll(() => {
    restoreCanvas();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StepperComponent] }).compileComponents();
  });

  async function render(inputs: Record<string, unknown>): Promise<HTMLElement> {
    fixture = TestBed.createComponent(StepperComponent);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const buttons = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLButtonElement>('button.lc-stepper__step'));

  const LONG_DE = 'Bitte geben Sie Ihre vollständige Anschrift ein';

  /** design.md §4 and the stories: inputs, every step's computed name. */
  const rows: readonly { case: string; inputs: Record<string, unknown>; names: string[] }[] = [
    {
      case: 'EN (Default story)',
      inputs: {
        steps: [
          { label: 'Account', description: 'Create your account' },
          { label: 'Profile', description: 'Set up your profile' },
          { label: 'Review', description: 'Review and confirm' },
        ],
        activeStep: 1,
      },
      names: ['Step 1 of 3: Account, Create your account', 'Step 2 of 3: Profile, Set up your profile', 'Step 3 of 3: Review, Review and confirm'],
    },
    {
      case: 'EN optional step, no descriptions',
      inputs: { steps: [{ label: 'Basic Info' }, { label: 'Photo Upload', optional: true }, { label: 'Preferences' }, { label: 'Done' }], activeStep: 1 },
      names: ['Step 1 of 4: Basic Info', 'Step 2 of 4: Photo Upload, Optional', 'Step 3 of 4: Preferences', 'Step 4 of 4: Done'],
    },
    {
      case: 'EN description and optional',
      inputs: { steps: [{ label: 'Profile', description: 'Set up your profile', optional: true }, { label: 'Done' }], linear: false },
      names: ['Step 1 of 2: Profile, Set up your profile, Optional', 'Step 2 of 2: Done'],
    },
    {
      case: 'DE, long description (Localized story)',
      inputs: {
        steps: [{ label: 'Konto' }, { label: 'Persönliche Angaben', description: LONG_DE }, { label: 'Foto', optional: true }, { label: 'Bestätigung' }],
        activeStep: 1,
        orientation: 'vertical',
        stepAriaLabel: 'Schritt {n} von {m}: {label}',
        optionalLabel: 'Optionaler Schritt',
      },
      names: [
        'Schritt 1 von 4: Konto',
        `Schritt 2 von 4: Persönliche Angaben, ${LONG_DE}`,
        'Schritt 3 von 4: Foto, Optionaler Schritt',
        'Schritt 4 von 4: Bestätigung',
      ],
    },
    {
      // Safety net: a template without {label} at the end gets the label after it.
      case: 'custom template without {label} last',
      inputs: { steps: [{ label: 'Profile', description: 'Set up your profile' }], stepAriaLabel: '{label} ({n}/{m})' },
      names: ['Profile (1/1), Profile, Set up your profile'],
    },
  ];

  describe.each(rows)('$case', (row) => {
    it('names every step as designed, and no step violates the rule', async () => {
      const root = await render(row.inputs);
      const steps = buttons(root);
      expect(steps.map((b) => computedName(root, b))).toEqual(row.names);
      const results = await audit(root);
      expect(violations(results)).toEqual([]);
      for (const step of steps) expect(outcomeFor(results, RULE, step)).not.toBe('violation');
      // Enabled steps are decided, and pass.
      for (const step of steps.filter((b) => !b.disabled)) expect(outcomeFor(results, RULE, step)).toBe('pass');
    });
  });

  it('keeps the consumer template as the prefix (AC-5)', async () => {
    const root = await render(rows[3]?.inputs ?? {});
    buttons(root).forEach((b, i) => expect(b.getAttribute('aria-label')?.startsWith(`Schritt ${i + 1} von 4: `)).toBe(true));
  });

  it('puts a long description in once, complete (AC-6)', async () => {
    const root = await render(rows[3]?.inputs ?? {});
    expect(buttons(root)[1]?.getAttribute('aria-label')?.split(LONG_DE).length).toBe(2);
  });

  it('shows the number as generated content and the parts as words', async () => {
    const root = await render(rows[0]?.inputs ?? {});
    const step = buttons(root)[2];
    const number = step?.querySelector('.lc-stepper__number');
    expect(number?.getAttribute('data-step')).toBe('3');
    expect(number?.textContent).toBe('');
    expect(step?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Review Review and confirm');
  });

  it('has no aria-describedby: the description is in the name (AC-8)', async () => {
    const root = await render(rows[0]?.inputs ?? {});
    for (const b of buttons(root)) expect(b.hasAttribute('aria-describedby')).toBe(false);
  });

  it('follows new steps in the same change detection pass (AC-7)', async () => {
    const root = await render(rows[0]?.inputs ?? {});
    const steps: StepperStep[] = [{ label: 'Profil', description: 'Profil anlegen' }, { label: 'Fertig' }];
    fixture.componentRef.setInput('steps', steps);
    fixture.detectChanges();
    expect(buttons(root).map((b) => b.getAttribute('aria-label'))).toEqual(['Step 1 of 2: Profil, Profil anlegen', 'Step 2 of 2: Fertig']);
  });

  it('fails label-content-name-mismatch with the pre-3.11.5 name (negative control, AC-2)', async () => {
    const root = await render(rows[0]?.inputs ?? {});
    const step = buttons(root)[1];
    if (!step) throw new Error('no second step');
    step.setAttribute('aria-label', 'Step 2 of 3: Profile');
    const results = await audit(root);
    expect(outcome(results, RULE)).toBe('violation');
    expect(results.violations.map((v) => v.id)).toEqual([RULE]);
    expect(outcomeFor(results, RULE, step)).toBe('violation');
  });
});
