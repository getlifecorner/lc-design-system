import { ApplicationRef, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { InteractivityChecker } from '@angular/cdk/a11y';
import { DrawerComponent } from './drawer.component';

/**
 * 3.35 (request 055, 054-n3, AC-14): `returnFocusTo` gives the focus to the
 * named element once the drawer has slid out (250 ms). The tests start with
 * `body` active, as after a WebKit tap, which doesn't focus the button.
 */
@Component({
  standalone: true,
  imports: [DrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="opener">Öffnen</button>
    <button type="button" class="target">Filter</button>
    <lc-drawer [open]="open()" heading="Filter" [returnFocusTo]="target()" (closed)="open.set(false)">
      <button type="button" class="inside">Anwenden</button>
    </lc-drawer>
  `,
})
class Host {
  readonly open = signal(false);
  readonly target = signal<HTMLElement | null>(null);
}

// jsdom has no layout, so the CDK would consider nothing tabbable.
const TABBABLE = 'button, input, [tabindex]';

describe('DrawerComponent — returnFocusTo (3.35, request 055)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const el = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T;
  const extras: HTMLElement[] = [];

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        {
          provide: InteractivityChecker,
          useValue: { isFocusable: (e: Element) => e.matches(TABBABLE), isTabbable: (e: Element) => e.matches(TABBABLE) },
        },
      ],
    });
  });

  afterEach(() => {
    fixture?.destroy();
    jest.useRealTimers();
    extras.splice(0).forEach((e) => e.remove());
    (document.activeElement as HTMLElement | null)?.blur();
    document.body.style.overflow = '';
  });

  /** Renders and runs the after-render hooks (the focus trap's initial focus). */
  async function settle() {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
  }

  /** Lets the 250 ms slide-out end and renders, which runs the focus-return hook. */
  function slideOut(ms = 250) {
    fixture.detectChanges();
    jest.advanceTimersByTime(ms);
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
  }

  /** Renders the host and opens the drawer with `body` active (the WebKit tap). */
  async function openWithBodyActive(target: HTMLElement | null | 'target' = 'target') {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await settle();
    host.target.set(target === 'target' ? el('.target') : target);
    (document.activeElement as HTMLElement | null)?.blur();
    expect(document.activeElement).toBe(document.body);
    host.open.set(true);
    await settle();
    expect(el('.lc-drawer__panel').contains(document.activeElement)).toBe(true);
  }

  describe('every close path gives the focus to the element', () => {
    const paths: Array<[string, () => void]> = [
      ['the close button', () => el<HTMLButtonElement>('.lc-drawer__close').click()],
      ['Escape', () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))],
      ['the backdrop', () => el<HTMLElement>('.lc-drawer__overlay').click()],
      ['[open] set to false by the page', () => host.open.set(false)],
    ];

    it.each(paths)('%s', async (_name, close) => {
      await openWithBodyActive();
      close();
      slideOut();
      expect(document.querySelector('.lc-drawer')).toBeNull();
      expect(host.open()).toBe(false);
      expect(document.activeElement).toBe(el('.target'));
    });

    it('not before the slide-out has ended', async () => {
      await openWithBodyActive();
      host.open.set(false);
      slideOut(200);
      expect(document.querySelector('.lc-drawer')).not.toBeNull();
      expect(document.activeElement).not.toBe(el('.target'));
      slideOut(50);
      expect(document.activeElement).toBe(el('.target'));
    });

    it('destroying an open drawer still returns the focus', async () => {
      await openWithBodyActive();
      fixture.destroy();
      TestBed.inject(ApplicationRef).tick();
      expect(document.activeElement).toBe(el('.target'));
    });

    it('works again on the next open and close', async () => {
      await openWithBodyActive();
      host.open.set(false);
      slideOut();
      (document.activeElement as HTMLElement).blur();
      host.open.set(true);
      await settle();
      expect(el('.lc-drawer__panel').contains(document.activeElement)).toBe(true);
      el<HTMLButtonElement>('.lc-drawer__close').click();
      slideOut();
      expect(document.activeElement).toBe(el('.target'));
    });
  });

  describe('state guards', () => {
    it('reopened within the slide-out: nothing is scheduled, the focus stays in the panel', async () => {
      await openWithBodyActive();
      host.open.set(false);
      slideOut(100);
      host.open.set(true);
      fixture.detectChanges();
      slideOut(300);
      expect(document.querySelector('.lc-drawer__panel')).not.toBeNull();
      expect(el('.lc-drawer__panel').contains(document.activeElement)).toBe(true);
    });

    it('changing the input alone moves no focus', async () => {
      fixture = TestBed.createComponent(Host);
      host = fixture.componentInstance;
      await settle();
      el<HTMLButtonElement>('.opener').focus();
      host.target.set(el('.target'));
      slideOut();
      expect(document.activeElement).toBe(el('.opener'));
    });
  });

  describe('an element that is gone or cannot take focus', () => {
    it('removed while open: no throw, the captured opener gets the focus', async () => {
      fixture = TestBed.createComponent(Host);
      host = fixture.componentInstance;
      await settle();
      const doomed = document.createElement('button');
      document.body.appendChild(doomed);
      host.target.set(doomed);
      el<HTMLButtonElement>('.opener').focus();
      host.open.set(true);
      await settle();
      doomed.remove();
      host.open.set(false);
      slideOut();
      expect(document.activeElement).toBe(el('.opener'));
    });

    it('a disabled element: the captured opener keeps the focus', async () => {
      fixture = TestBed.createComponent(Host);
      host = fixture.componentInstance;
      await settle();
      el<HTMLButtonElement>('.target').disabled = true;
      host.target.set(el('.target'));
      el<HTMLButtonElement>('.opener').focus();
      host.open.set(true);
      await settle();
      host.open.set(false);
      slideOut();
      expect(document.activeElement).toBe(el('.opener'));
    });

    it('an <x-trigger> host hands the focus to its first focusable descendant', async () => {
      const trigger = document.createElement('x-trigger');
      const disabled = document.createElement('button');
      disabled.disabled = true;
      const inner = document.createElement('button');
      trigger.append(disabled, inner);
      document.body.appendChild(trigger);
      extras.push(trigger);
      await openWithBodyActive(trigger);
      el<HTMLButtonElement>('.lc-drawer__close').click();
      slideOut();
      expect(document.activeElement).toBe(inner);
    });
  });

  describe('unset, nothing changes (3.34)', () => {
    it('null: the captured element gets the focus (body after a WebKit tap)', async () => {
      await openWithBodyActive(null);
      el<HTMLButtonElement>('.lc-drawer__close').click();
      slideOut();
      expect(document.querySelector('.lc-drawer')).toBeNull();
      expect(document.activeElement).toBe(document.body);
    });

    it('null: a focused opener gets it back', async () => {
      fixture = TestBed.createComponent(Host);
      host = fixture.componentInstance;
      await settle();
      el<HTMLButtonElement>('.opener').focus();
      host.open.set(true);
      await settle();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      slideOut();
      expect(document.activeElement).toBe(el('.opener'));
    });

    it('the input renders nothing: the drawer DOM is the same with and without it', async () => {
      await openWithBodyActive(null);
      const strip = (html: string) => html.replace(/_ng(host|content)-[\w-]+(="")?/g, '');
      const without = strip(el('lc-drawer').outerHTML);
      host.target.set(el('.target'));
      fixture.detectChanges();
      expect(strip(el('lc-drawer').outerHTML)).toBe(without);
    });
  });
});
