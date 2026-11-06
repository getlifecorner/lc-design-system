import { ApplicationRef, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { InteractivityChecker } from '@angular/cdk/a11y';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmService } from './confirm.service';

/**
 * 3.34 (request 054, monatsstand row 1, AC-7): `returnFocusTo` is passed to
 * `lc-modal`; the focus returns after confirm, cancel, Escape and ×. The
 * tests start with `body` active, as after a WebKit tap.
 */
@Component({
  standalone: true,
  imports: [ConfirmDialogComponent],
  template: `
    <button type="button" class="trigger">Fassung löschen</button>
    <lc-confirm-dialog
      [open]="open()"
      variant="destructive"
      title="Fassung löschen?"
      message="August 2026 · Fassung 1 wird für alle gelöscht."
      confirmLabel="Löschen"
      cancelLabel="Abbrechen"
      closeAriaLabel="Schließen"
      [returnFocusTo]="target()"
      (confirmed)="open.set(false)"
      (cancelled)="open.set(false)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly open = signal(false);
  readonly target = signal<HTMLElement | null>(null);
}

const TABBABLE = 'button, input, [tabindex]';
const q = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T;
const footerButton = (label: string) =>
  Array.from(document.querySelectorAll<HTMLButtonElement>('.lc-confirm__footer button')).find((b) => b.textContent?.includes(label)) as HTMLButtonElement;
const escape = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

describe('ConfirmDialogComponent — returnFocusTo (3.34, request 054)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        provideRouter([]),
        {
          provide: InteractivityChecker,
          useValue: { isFocusable: (e: Element) => e.matches(TABBABLE), isTabbable: (e: Element) => e.matches(TABBABLE) },
        },
      ],
    });
  });

  afterEach(() => (document.activeElement as HTMLElement | null)?.blur());

  describe('the component', () => {
    let fixture: ComponentFixture<Host>;
    let host: Host;

    async function settle() {
      fixture.detectChanges();
      await fixture.whenStable();
    }

    async function open(withTarget = true) {
      fixture = TestBed.createComponent(Host);
      host = fixture.componentInstance;
      await settle();
      if (withTarget) host.target.set(q('.trigger'));
      (document.activeElement as HTMLElement | null)?.blur();
      host.open.set(true);
      await settle();
      expect(q('[role="dialog"]').contains(document.activeElement)).toBe(true);
    }

    const paths: Array<[string, () => void]> = [
      ['„Löschen“ (confirmed)', () => footerButton('Löschen').click()],
      ['„Abbrechen“ (cancelled)', () => footerButton('Abbrechen').click()],
      ['Escape', escape],
      ['× „Schließen“', () => q<HTMLButtonElement>('.lc-modal__close').click()],
    ];

    it.each(paths)('%s: the trigger gets the focus back', async (_name, close) => {
      await open();
      close();
      await settle();
      expect(document.querySelector('[role="dialog"]')).toBeNull();
      expect(document.activeElement).toBe(q('.trigger'));
    });

    it('unset: the captured element (body after a WebKit tap) gets it, as in 3.33', async () => {
      await open(false);
      footerButton('Abbrechen').click();
      await settle();
      expect(document.activeElement).toBe(document.body);
    });

    it('passes the input to its lc-modal', async () => {
      await open();
      const modal = fixture.debugElement.query((d) => d.name === 'lc-modal');
      expect(modal.componentInstance.returnFocusTo()).toBe(q('.trigger'));
    });
  });

  describe('ConfirmService (D-4)', () => {
    let trigger: HTMLButtonElement;

    beforeEach(() => {
      trigger = document.createElement('button');
      trigger.textContent = 'Fassung löschen';
      document.body.appendChild(trigger);
    });

    afterEach(() => trigger.remove());

    async function confirmWith(returnFocusTo: HTMLElement | undefined, close: () => void) {
      const appRef = TestBed.inject(ApplicationRef);
      const result = TestBed.inject(ConfirmService).confirm({
        title: 'Fassung löschen?',
        message: 'August 2026 · Fassung 1 wird für alle gelöscht.',
        confirmLabel: 'Löschen',
        cancelLabel: 'Abbrechen',
        returnFocusTo,
      });
      appRef.tick();
      await appRef.whenStable();
      expect(q('[role="dialog"]').contains(document.activeElement)).toBe(true);
      close();
      appRef.tick();
      await appRef.whenStable();
      expect(document.querySelector('[role="dialog"]')).toBeNull();
      return result;
    }

    it.each([
      ['„Löschen“', () => footerButton('Löschen').click(), true],
      ['„Abbrechen“', () => footerButton('Abbrechen').click(), false],
      ['Escape', escape, false],
    ] as const)('%s: the option gives the focus back to the trigger', async (_name, close, expected) => {
      await expect(confirmWith(trigger, close)).resolves.toBe(expected);
      expect(document.activeElement).toBe(trigger);
    });

    it('without the option the captured element keeps it, as in 3.33', async () => {
      await expect(confirmWith(undefined, () => footerButton('Abbrechen').click())).resolves.toBe(false);
      expect(document.activeElement).toBe(document.body);
    });
  });
});
