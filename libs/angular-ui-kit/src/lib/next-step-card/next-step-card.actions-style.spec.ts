import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, isDevMode } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import {
  NextStepCardActionSize,
  NextStepCardActionsLayout,
  NextStepCardActionsStyle,
  NextStepCardComponent,
} from './next-step-card.component';

/**
 * 3.16 (BA-5, request 022): `actionsStyle="equal"`, two answers of the same
 * weight for the one-time health question „Gesundheitsbuchungen teilen?“.
 */
@Component({
  standalone: true,
  imports: [NextStepCardComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-next-step-card
      tone="primary"
      icon="shield-lock"
      cardTitle="Gesundheitsbuchungen teilen?"
      [actionsStyle]="actionsStyle"
      [actionsLayout]="actionsLayout"
      [actionSize]="actionSize"
      [primaryLabel]="primaryLabel"
      [secondaryLabel]="secondaryLabel"
      [primaryLoading]="primaryLoading"
      [primaryDisabled]="primaryDisabled"
      primaryDisabledReason="Erst die Verbindung prüfen"
      [announce]="announce"
      (primaryClick)="primaryClicks = primaryClicks + 1"
      (secondaryClick)="secondaryClicks = secondaryClicks + 1"
    />
  `,
})
class EqualHostComponent {
  actionsStyle: NextStepCardActionsStyle = 'equal';
  actionsLayout: NextStepCardActionsLayout = 'inline';
  actionSize: NextStepCardActionSize = 'lg';
  primaryLabel: string | undefined = 'Ja, teilen';
  secondaryLabel: string | undefined = 'Nein, nicht teilen';
  primaryLoading = false;
  primaryDisabled = false;
  announce = false;
  primaryClicks = 0;
  secondaryClicks = 0;
}

describe('NextStepCardComponent actionsStyle (3.16, BA-5)', () => {
  let fixture: ComponentFixture<EqualHostComponent>;
  let host: EqualHostComponent;
  let warn: jest.SpyInstance;

  const actions = () => fixture.nativeElement.querySelector('.lc-next-step-card__actions') as HTMLElement;
  const buttons = () => [...actions().querySelectorAll<HTMLButtonElement>('lc-button > button')];

  beforeEach(async () => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    await TestBed.configureTestingModule({
      imports: [EqualHostComponent],
      providers: [provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(EqualHostComponent);
    host = fixture.componentInstance;
  });

  afterEach(() => warn.mockRestore());

  it('renders both answers as outline buttons in the primary tone at the same size, primary first (AC-15)', () => {
    fixture.detectChanges();
    const [first, second] = buttons();
    expect(buttons()).toHaveLength(2);
    expect(first.textContent?.trim()).toBe('Ja, teilen');
    expect(second.textContent?.trim()).toBe('Nein, nicht teilen');
    for (const b of [first, second]) {
      expect(b.classList).toContain('btn-outline');
      expect(b.classList).toContain('btn-tone-primary');
      expect(b.classList).toContain('btn-lg');
      expect(b.classList).not.toContain('btn-primary');
      expect(b.classList).not.toContain('btn-ghost');
    }
    expect([...first.classList].sort()).toEqual([...second.classList].sort());
  });

  it('renders no chevron on the secondary answer', () => {
    fixture.detectChanges();
    expect(actions().querySelector('lc-icon[name="chevron-right"], lc-icon')).toBeNull();
  });

  it('keeps firing primaryClick and secondaryClick (AC-15)', () => {
    fixture.detectChanges();
    buttons()[0].click();
    buttons()[1].click();
    buttons()[1].click();
    expect(host.primaryClicks).toBe(1);
    expect(host.secondaryClicks).toBe(2);
  });

  it('keeps primaryDisabled with its reason on the primary answer (AC-15)', () => {
    host.primaryDisabled = true;
    fixture.detectChanges();
    const [first, second] = buttons();
    expect(first.disabled).toBe(true);
    expect(first.getAttribute('title')).toBe('Erst die Verbindung prüfen');
    expect(second.disabled).toBe(false);
  });

  it('keeps primaryLoading on the primary answer (AC-15)', () => {
    host.primaryLoading = true;
    fixture.detectChanges();
    expect(buttons()[0].getAttribute('aria-busy')).toBe('true');
    expect(buttons()[1].getAttribute('aria-busy')).toBe('false');
  });

  it('keeps announce on the title (AC-15)', () => {
    host.announce = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lc-next-step-card__title')?.getAttribute('aria-live')).toBe('polite');
  });

  it('keeps the order with actionsLayout="stacked"', () => {
    host.actionsLayout = 'stacked';
    fixture.detectChanges();
    expect(buttons().map((b) => b.textContent?.trim())).toEqual(['Ja, teilen', 'Nein, nicht teilen']);
    expect(fixture.nativeElement.querySelector('.lc-next-step-card')?.classList).toContain('lc-next-step-card--actions-stacked');
  });

  it('renders a single answer when only one label is set', () => {
    host.secondaryLabel = undefined;
    fixture.detectChanges();
    expect(buttons().map((b) => b.textContent?.trim())).toEqual(['Ja, teilen']);
  });

  it('warns in dev mode when the answers are below 44 px (actionSize ≠ lg)', () => {
    host.actionSize = 'sm';
    fixture.detectChanges();
    expect(isDevMode()).toBe(true);
    expect(warn).toHaveBeenCalledWith('[lc-next-step-card] actionsStyle="equal" needs actionSize="lg" (44 px)');
  });

  it('does not warn with actionSize="lg"', () => {
    fixture.detectChanges();
    expect(warn).not.toHaveBeenCalled();
  });

  // AC-16: `default` renders the 3.15 actions (an unbound input: the existing
  // NextStepCardComponent specs, unchanged).
  it('renders the 3.15 actions for actionsStyle="default"', () => {
    host.actionsStyle = 'default';
    host.actionSize = 'sm';
    fixture.detectChanges();
    const hosts = [...actions().querySelectorAll('lc-button')];
    const [first, second] = buttons();
    // Secondary (ghost, chevron) first, primary (filled) last.
    expect(first.textContent?.trim()).toBe('Nein, nicht teilen');
    expect(first.classList).toContain('btn-ghost');
    expect(hosts[0].querySelector('lc-icon[name="chevron-right"]')).not.toBeNull();
    expect(second.textContent?.trim()).toBe('Ja, teilen');
    expect(second.classList).toContain('btn-primary');
    expect(second.classList).not.toContain('btn-outline');
    expect(warn).not.toHaveBeenCalled();
  });
});
