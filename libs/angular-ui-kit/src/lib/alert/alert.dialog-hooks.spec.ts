import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { join } from 'path';
import { compile } from 'sass';
import { audit, violations } from '../../testing/axe-jsdom';
import { AlertComponent, type AlertRole, type AlertVariant } from './alert.component';

/**
 * Request 063 (usm-x rows 7 and 8, design §2/§6/§9): `role="alertdialog"`
 * with focus handling, and the colour hooks --lc-alert-bg/-border/-fg/-icon.
 */
@Component({
  imports: [AlertComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" id="opener">Fenster schließen</button>
    <button type="button" id="elsewhere">Anderswo</button>
    @if (open()) {
      <lc-alert
        [role]="role()"
        variant="warning"
        [title]="title()"
        ariaLabel="Frage"
        actionsLayout="stacked"
        [dismissible]="true"
        closeAriaLabel="Schließen"
        [(visible)]="visible"
      >
        Das Fenster hat ungespeicherte Änderungen.
        <button slot="action" type="button" id="cancel">Abbrechen</button>
      </lc-alert>
    }
  `,
})
class DialogHostComponent {
  readonly open = signal(false);
  readonly visible = signal(true);
  readonly role = signal<AlertRole | undefined>('alertdialog');
  readonly title = signal<string | undefined>('Ungespeicherte Änderungen');
}

describe('AlertComponent role and colour hooks (3.43, request 063)', () => {
  let fixture: ComponentFixture<DialogHostComponent>;
  let host: DialogHostComponent;
  const el = (): HTMLElement => fixture.nativeElement;
  const alert = () => el().querySelector('lc-alert') as HTMLElement;
  const byId = (id: string) => el().querySelector(`#${id}`) as HTMLElement;
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogHostComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(DialogHostComponent);
    host = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => fixture.nativeElement.remove());

  describe('AC-17: without role the computed role, as before', () => {
    it.each([
      ['info', 'status', 'polite'],
      ['success', 'status', 'polite'],
      ['warning', 'alert', 'assertive'],
      ['error', 'alert', 'assertive'],
    ] as [AlertVariant, string, string][])('%s → role %s, aria-live %s, nothing added', (variant, role, live) => {
      const single = TestBed.createComponent(AlertComponent);
      single.componentRef.setInput('variant', variant);
      single.componentRef.setInput('title', 'Titel');
      single.detectChanges();
      const node = single.nativeElement as HTMLElement;
      expect([node.getAttribute('role'), node.getAttribute('aria-live')]).toEqual([role, live]);
      // `id` and `ng-version` belong to the test's root element.
      const own = node.getAttributeNames().filter((n) => !n.startsWith('_ng') && n !== 'id' && n !== 'ng-version');
      expect(own.sort()).toEqual(['aria-live', 'class', 'role']);
      expect(node.querySelector('.lc-alert__title')?.hasAttribute('id')).toBe(false);
      expect(node.querySelector('.lc-alert__content')?.hasAttribute('id')).toBe(false);
      expect(single.componentInstance.role()).toBeUndefined();
    });

    it('an explicit alert or status sets its own live priority', () => {
      host.role.set('status');
      host.open.set(true);
      fixture.detectChanges();
      expect([alert().getAttribute('role'), alert().getAttribute('aria-live'), alert().hasAttribute('tabindex')]).toEqual([
        'status',
        'polite',
        false,
      ]);
      host.role.set('alert');
      fixture.detectChanges();
      expect([alert().getAttribute('role'), alert().getAttribute('aria-live')]).toEqual(['alert', 'assertive']);
    });
  });

  describe('AC-16: alertdialog', () => {
    it('is named by the title, described by the message, no live region, tabindex -1', () => {
      host.open.set(true);
      fixture.detectChanges();
      const node = alert();
      expect(node.getAttribute('role')).toBe('alertdialog');
      expect(node.hasAttribute('aria-live')).toBe(false);
      expect(node.hasAttribute('aria-modal')).toBe(false);
      expect(node.getAttribute('tabindex')).toBe('-1');
      const title = byId(node.getAttribute('aria-labelledby') as string);
      expect(title.classList.contains('lc-alert__title')).toBe(true);
      expect(title.textContent?.trim()).toBe('Ungespeicherte Änderungen');
      const message = byId(node.getAttribute('aria-describedby') as string);
      expect(message.classList.contains('lc-alert__content')).toBe(true);
      expect(message.textContent).toContain('ungespeicherte Änderungen');
    });

    it('without a title it keeps ariaLabel as its name', () => {
      host.title.set(undefined);
      host.open.set(true);
      fixture.detectChanges();
      expect(alert().hasAttribute('aria-labelledby')).toBe(false);
      expect(alert().getAttribute('aria-label')).toBe('Frage');
    });

    it('takes the focus when it shows and gives it back on dismiss', async () => {
      byId('opener').focus();
      host.open.set(true);
      await settle();
      expect(document.activeElement).toBe(alert());

      (alert().querySelector('.lc-alert__close') as HTMLButtonElement).focus();
      (alert().querySelector('.lc-alert__close') as HTMLButtonElement).click();
      await settle();
      expect(host.visible()).toBe(false);
      expect(document.activeElement).toBe(byId('opener'));
    });

    it('moves in again when shown again, and back when the page hides it', async () => {
      byId('opener').focus();
      host.open.set(true);
      await settle();
      host.visible.set(false);
      await settle();
      expect(document.activeElement).toBe(byId('opener'));
      host.visible.set(true);
      await settle();
      expect(document.activeElement).toBe(alert());
      byId('cancel').focus();
      host.visible.set(false);
      await settle();
      expect(document.activeElement).toBe(byId('opener'));
    });

    it('gives the focus back when it is destroyed', async () => {
      byId('opener').focus();
      host.open.set(true);
      await settle();
      byId('cancel').focus();
      host.open.set(false);
      await settle();
      expect(alert()).toBeNull();
      expect(document.activeElement).toBe(byId('opener'));
    });

    it('does not pull back a user who moved on', async () => {
      byId('opener').focus();
      host.open.set(true);
      await settle();
      byId('elsewhere').focus();
      host.visible.set(false);
      await settle();
      expect(document.activeElement).toBe(byId('elsewhere'));
    });

    it('axe: no violation', async () => {
      host.open.set(true);
      await settle();
      expect(violations(await audit(el()))).toEqual([]);
    });
  });

  describe('SCSS', () => {
    const css = compile(join(__dirname, 'alert.component.scss'), { loadPaths: [join(__dirname, '../../styles')] }).css;
    const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2].replace(/\s+/g, ' ').trim() }));
    const body = (selector: string) => {
      const found = rules.filter((r) => r.selector === selector);
      expect([selector, found.length]).toEqual([selector, 1]);
      return found[0].body;
    };
    const tints = {
      success: ['rgba(142, 164, 117, 0.12)', 'rgba(142, 164, 117, 0.4)'],
      error: ['rgba(157, 14, 14, 0.14)', 'rgba(157, 14, 14, 0.45)'],
      warning: ['rgba(225, 160, 64, 0.14)', 'rgba(225, 160, 64, 0.42)'],
      info: ['rgba(59, 101, 136, 0.16)', 'rgba(59, 101, 136, 0.42)'],
    };

    it('AC-18: each variant reads the hooks with the 3.42 values as fallbacks', () => {
      for (const [variant, [bg, border]] of Object.entries(tints)) {
        expect(body(`.lc-alert--${variant}`)).toBe(
          `background-color: var(--lc-alert-bg, ${bg}); border-color: var(--lc-alert-border, ${border}); color: var(--lc-alert-fg, var(--color-text-primary));`,
        );
        expect(body(`.lc-alert--${variant} .lc-alert__icon`)).toBe(
          `color: var(--lc-alert-icon, var(--lc-alert-fg, var(--color-on-${variant}-subtle)));`,
        );
      }
    });

    it('AC-18: the kit never declares a public hook, so a value on an ancestor wins', () => {
      expect(css).not.toMatch(/--lc-alert-[\w-]+\s*:/);
    });

    it('AC-16: the alertdialog host shows the 2 px focus ring', () => {
      expect(body(".lc-alert[role=alertdialog]:focus-visible")).toBe('outline: 2px solid var(--color-primary-500); outline-offset: 2px;');
    });
  });
});
