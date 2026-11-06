import { ApplicationRef, ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { InteractivityChecker } from '@angular/cdk/a11y';
import { ModalComponent } from './modal.component';
import { OverlayStackService } from '../internal/overlay/overlay-stack.service';

/**
 * 3.34 (request 054, monatsstand row 1, AC-1 to AC-4): `returnFocusTo` gives
 * the focus to the named element after the dialog closed. The tests start
 * with `body` active, as after a WebKit tap, which doesn't focus the button.
 */
@Component({
  standalone: true,
  imports: [ModalComponent],
  template: `
    <button type="button" class="opener">Öffnen</button>
    <button type="button" class="target">Monatsstand wählen</button>
    <lc-modal [(open)]="open" [returnFocusTo]="target()">
      <div slot="body"><input class="inside" /></div>
    </lc-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly open = signal(false);
  readonly target = signal<HTMLElement | null>(null);
  readonly modal = viewChild.required(ModalComponent);
}

/** An outer modal holding the trigger of an inner one. */
@Component({
  standalone: true,
  imports: [ModalComponent],
  template: `
    <lc-modal [(open)]="outerOpen">
      <div slot="body"><button type="button" class="inner-trigger">Fassung umbenennen</button></div>
    </lc-modal>
    <lc-modal [(open)]="innerOpen" [returnFocusTo]="target()">
      <div slot="body"><input class="inside" /></div>
    </lc-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class NestedHost {
  readonly outerOpen = signal(false);
  readonly innerOpen = signal(false);
  readonly target = signal<HTMLElement | null>(null);
}

// jsdom has no layout, so the CDK would consider nothing tabbable.
const TABBABLE = 'button, input, [tabindex]';

describe('ModalComponent — returnFocusTo (3.34, request 054)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const el = <T extends HTMLElement>(selector: string) => document.querySelector(selector) as T;
  const extras: HTMLElement[] = [];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Host, NestedHost],
      providers: [
        {
          provide: InteractivityChecker,
          useValue: { isFocusable: (e: Element) => e.matches(TABBABLE), isTabbable: (e: Element) => e.matches(TABBABLE) },
        },
      ],
    });
  });

  afterEach(() => {
    extras.splice(0).forEach((e) => e.remove());
    (document.activeElement as HTMLElement | null)?.blur();
  });

  async function settle(f: ComponentFixture<unknown> = fixture) {
    f.detectChanges();
    await f.whenStable();
  }

  /** Renders the host and opens the modal with `body` active (the WebKit tap). */
  async function openWithBodyActive(target: HTMLElement | null | 'target' = 'target') {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await settle();
    host.target.set(target === 'target' ? el('.target') : target);
    (document.activeElement as HTMLElement | null)?.blur();
    expect(document.activeElement).toBe(document.body);
    host.open.set(true);
    await settle();
    expect(el('.lc-modal').contains(document.activeElement)).toBe(true);
  }

  describe('AC-1, AC-2: every close path gives the focus to the element', () => {
    const paths: Array<[string, () => void]> = [
      ['the close button', () => el<HTMLButtonElement>('.lc-modal__close').click()],
      ['Escape', () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))],
      ['the backdrop', () => el<HTMLElement>('.lc-modal-backdrop').click()],
      ['[(open)] set to false by the page', () => host.open.set(false)],
      ['closeModal()', () => host.modal().closeModal()],
    ];

    it.each(paths)('%s', async (_name, close) => {
      await openWithBodyActive();
      close();
      await settle();
      expect(document.querySelector('.lc-modal')).toBeNull();
      expect(host.open()).toBe(false);
      expect(document.activeElement).toBe(el('.target'));
    });

    it('setInput("open", false) on the modal itself', async () => {
      const target = document.createElement('button');
      document.body.appendChild(target);
      extras.push(target);
      const modalFixture = TestBed.createComponent(ModalComponent);
      modalFixture.componentRef.setInput('returnFocusTo', target);
      await settle(modalFixture);
      modalFixture.componentRef.setInput('open', true);
      await settle(modalFixture);
      expect(document.activeElement).not.toBe(target);
      modalFixture.componentRef.setInput('open', false);
      await settle(modalFixture);
      expect(document.activeElement).toBe(target);
    });

    it('destroying an open modal (as ConfirmService does) still returns the focus', async () => {
      await openWithBodyActive();
      fixture.destroy();
      TestBed.inject(ApplicationRef).tick();
      expect(document.activeElement).toBe(el('.target'));
    });

    it('works again on the next open and close', async () => {
      await openWithBodyActive();
      host.open.set(false);
      await settle();
      (document.activeElement as HTMLElement).blur();
      host.open.set(true);
      await settle();
      expect(el('.lc-modal').contains(document.activeElement)).toBe(true);
      host.modal().closeModal();
      await settle();
      expect(document.activeElement).toBe(el('.target'));
    });
  });

  describe('AC-3: an element that is gone or cannot take focus', () => {
    it('never connected: no throw, the captured element keeps the focus', async () => {
      const gone = document.createElement('button');
      await openWithBodyActive(gone);
      host.open.set(false);
      await settle();
      expect(document.activeElement).toBe(document.body); // captured: body, as before
    });

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
      await settle();
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
      host.modal().closeModal();
      await settle();
      expect(document.activeElement).toBe(el('.opener'));
    });

    it('a plain element that cannot take focus hands nothing on (only custom elements do)', async () => {
      const div = document.createElement('div');
      div.appendChild(document.createElement('button'));
      document.body.appendChild(div);
      extras.push(div);
      await openWithBodyActive(div);
      host.modal().closeModal();
      await settle();
      expect(document.activeElement).toBe(document.body);
    });
  });

  describe('custom-element hosts (D-1)', () => {
    it('an <x-trigger> host hands the focus to its first focusable descendant', async () => {
      const trigger = document.createElement('x-trigger');
      const disabled = document.createElement('button');
      disabled.disabled = true;
      const inner = document.createElement('button');
      inner.className = 'inner';
      trigger.append(disabled, inner);
      document.body.appendChild(trigger);
      extras.push(trigger);
      await openWithBodyActive(trigger);
      host.modal().closeModal();
      await settle();
      expect(document.activeElement).toBe(inner);
    });

    it('a focusable custom element keeps the focus itself', async () => {
      const trigger = document.createElement('x-trigger');
      trigger.tabIndex = 0;
      trigger.appendChild(document.createElement('button'));
      document.body.appendChild(trigger);
      extras.push(trigger);
      await openWithBodyActive(trigger);
      host.modal().closeModal();
      await settle();
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe('AC-4: unset, nothing changes', () => {
    it('null: the captured element gets the focus (body after a WebKit tap)', async () => {
      await openWithBodyActive(null);
      host.modal().closeModal();
      await settle();
      expect(document.activeElement).toBe(document.body);
    });

    it('null: a focused opener gets it back, as in 3.33', async () => {
      fixture = TestBed.createComponent(Host);
      host = fixture.componentInstance;
      await settle();
      el<HTMLButtonElement>('.opener').focus();
      host.open.set(true);
      await settle();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle();
      expect(document.activeElement).toBe(el('.opener'));
    });

    it('changing the input does not re-run the open effect (one push, no extra remove)', async () => {
      const stack = TestBed.inject(OverlayStackService);
      const push = jest.spyOn(stack, 'push');
      const remove = jest.spyOn(stack, 'remove');
      await openWithBodyActive();
      expect(push).toHaveBeenCalledTimes(1);
      host.target.set(el('.opener'));
      await settle();
      host.target.set(el('.target'));
      await settle();
      expect(push).toHaveBeenCalledTimes(1);
      host.open.set(false);
      await settle();
      const removes = remove.mock.calls.length;
      host.target.set(el('.opener'));
      await settle();
      expect(remove).toHaveBeenCalledTimes(removes);
      expect(push).toHaveBeenCalledTimes(1);
    });
  });

  describe('state guards', () => {
    it('reopened before the render: the hook does nothing', async () => {
      await openWithBodyActive();
      const modal = host.modal() as unknown as { hideModal(): void; showModal(): void };
      modal.hideModal();
      modal.showModal();
      TestBed.inject(ApplicationRef).tick();
      expect(el('.lc-modal').contains(document.activeElement)).toBe(true);
    });

    it('a trigger inside an outer open modal gets the focus back', async () => {
      const nested = TestBed.createComponent(NestedHost);
      await settle(nested);
      nested.componentInstance.outerOpen.set(true);
      await settle(nested);
      const trigger = el<HTMLButtonElement>('.inner-trigger');
      nested.componentInstance.target.set(trigger);
      (document.activeElement as HTMLElement).blur();
      nested.componentInstance.innerOpen.set(true);
      await settle(nested);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle(nested);
      expect(nested.componentInstance.innerOpen()).toBe(false);
      expect(nested.componentInstance.outerOpen()).toBe(true);
      expect(document.activeElement).toBe(trigger);
    });
  });
});
