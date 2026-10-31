import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { ListComponent, ListItem, ListLinkClickEvent } from './list.component';
import { audit, installFakeCanvas, violations } from '../../testing/axe-jsdom';

/**
 * 3.16 (TD-4, request 022): `ListItem.href` renders the row as a real link;
 * `linkClick` hands plain clicks to the consumer's router.
 */
const MOCK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0"/></svg>';

const accounts: ListItem[] = [
  { id: 'a1', label: 'Girokonto', subtitle: 'ING · •••• 4821', avatar: 'JA', metadata: '2.418,36 €', href: '/finances/accounts/a1' },
  { id: 'a2', label: 'Tagesgeld', subtitle: 'DKB', badge: 'nur für dich', href: '/finances/accounts/a2' },
];

describe('ListComponent link rows (3.16, TD-4)', () => {
  let fixture: ComponentFixture<ListComponent>;
  let httpMock: HttpTestingController;
  let warn: jest.SpyInstance;
  let restoreCanvas: () => void;

  beforeAll(() => (restoreCanvas = installFakeCanvas()));
  afterAll(() => restoreCanvas());

  beforeEach(async () => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    await TestBed.configureTestingModule({
      imports: [ListComponent],
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(ListComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    for (const req of httpMock.match(() => true)) if (!req.cancelled) req.flush(MOCK_SVG);
    httpMock.verify();
    warn.mockRestore();
  });

  const render = (items: ListItem[], inputs: Record<string, unknown> = {}) => {
    fixture.componentRef.setInput('items', items);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };
  const links = (el: HTMLElement) => [...el.querySelectorAll<HTMLAnchorElement>('a.lc-list__item')];
  const record = () => {
    const events: ListLinkClickEvent[] = [];
    const items: ListItem[] = [];
    fixture.componentInstance.linkClick.subscribe((e) => events.push(e));
    fixture.componentInstance.itemClick.subscribe((i) => items.push(i));
    return { events, items };
  };
  /** A click that jsdom would follow: the test stops navigation after the kit saw it. */
  const click = (target: Element, init: MouseEventInit = {}) => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
    let preventedByKit = false;
    const spy = (e: Event) => {
      preventedByKit = e.defaultPrevented;
      e.preventDefault();
    };
    document.addEventListener('click', spy, { once: true });
    target.dispatchEvent(event);
    document.removeEventListener('click', spy);
    return { event, preventedByKit };
  };

  it('renders each href row as an <a href> inside a listitem, with the row contents inside the link (AC-19)', () => {
    const el = render(accounts);
    const [first, second] = links(el);
    expect(links(el)).toHaveLength(2);
    expect(first.getAttribute('href')).toBe('/finances/accounts/a1');
    expect(first.className).toBe('lc-list__item lc-list__item--link');
    expect(first.parentElement?.getAttribute('role')).toBe('listitem');
    expect(first.parentElement?.classList).toContain('lc-list__item-wrapper');
    expect(first.parentElement?.parentElement?.getAttribute('role')).toBe('list');
    expect(first.hasAttribute('role')).toBe(false);
    expect(first.hasAttribute('tabindex')).toBe(false);
    for (const part of ['.lc-list__avatar', '.lc-list__label', '.lc-list__subtitle', '.lc-list__metadata']) {
      expect(first.querySelector(part)).not.toBeNull();
    }
    expect(second.querySelector('.lc-list__badge')?.textContent).toBe('nur für dich');
  });

  it('emits linkClick for a plain click and never prevents the default (AC-20)', () => {
    const el = render(accounts);
    const { events, items } = record();
    const { event, preventedByKit } = click(links(el)[0].querySelector('.lc-list__label') as Element);
    expect(events).toHaveLength(1);
    expect(events[0].item).toBe(accounts[0]);
    expect(events[0].event).toBe(event);
    expect(preventedByKit).toBe(false);
    expect(items).toEqual([]);
  });

  it('lets the consumer prevent the full page load from linkClick (router route)', () => {
    const el = render(accounts);
    fixture.componentInstance.linkClick.subscribe(({ event }) => event.preventDefault());
    const { preventedByKit } = click(links(el)[1]);
    expect(preventedByKit).toBe(true);
  });

  it.each([
    ['Ctrl', { ctrlKey: true }],
    ['Cmd', { metaKey: true }],
    ['Shift', { shiftKey: true }],
    ['Alt', { altKey: true }],
    ['the middle button', { button: 1 }],
  ])('does not emit linkClick for a click with %s, and leaves the default alone (AC-20)', (_label, init) => {
    const el = render(accounts);
    const { events } = record();
    const { preventedByKit } = click(links(el)[0], init);
    expect(events).toEqual([]);
    expect(preventedByKit).toBe(false);
  });

  it('renders a link row also in a clickable list, without itemClick', () => {
    const el = render(accounts, { clickable: true });
    const { events, items } = record();
    expect(links(el)).toHaveLength(2);
    expect(el.querySelector('[role="button"]')).toBeNull();
    click(links(el)[0]);
    expect(events).toHaveLength(1);
    expect(items).toEqual([]);
  });

  it('drops the action of an href row and warns in dev mode (AC-21)', () => {
    const el = render([{ ...accounts[0], action: 'Entfernen' }]);
    expect(el.querySelector('a button, a lc-button, .lc-list__action-area')).toBeNull();
    expect(warn).toHaveBeenCalledWith('[lc-list] item "Girokonto" has href and action: the action is not rendered inside a link');
  });

  it('renders a disabled href row as the plain disabled row: no link, not focusable (AC-21)', () => {
    const el = render([{ ...accounts[0], disabled: true, action: 'Entfernen' }, accounts[1]]);
    expect(links(el)).toHaveLength(1);
    const row = el.querySelector('.lc-list__item--disabled') as HTMLElement;
    expect(row.tagName).toBe('DIV');
    expect(row.getAttribute('aria-disabled')).toBe('true');
    expect(row.getAttribute('role')).toBe('listitem');
    expect(row.hasAttribute('href')).toBe(false);
    expect(row.hasAttribute('tabindex')).toBe(false);
    expect(warn).not.toHaveBeenCalled();
  });

  it('renders a disabled href row in a clickable list as the disabled button row (tabindex -1)', () => {
    const el = render([{ ...accounts[0], disabled: true }], { clickable: true });
    expect(links(el)).toEqual([]);
    const row = el.querySelector('.lc-list__item--disabled') as HTMLElement;
    expect(row.getAttribute('role')).toBe('button');
    expect(row.getAttribute('tabindex')).toBe('-1');
  });

  it('has no axe violations with link rows, a disabled row and no nested control (AC-21)', async () => {
    const el = render([...accounts, { id: 'a3', label: 'Depot', href: '/finances/accounts/a3', disabled: true }]);
    document.body.appendChild(el);
    try {
      const results = await audit(el);
      expect(violations(results)).toEqual([]);
      // The link names and the list structure were checked and passed.
      expect(results.passes.map((r) => r.id)).toEqual(expect.arrayContaining(['link-name', 'aria-required-children', 'aria-required-parent']));
      expect(document.querySelectorAll('a.lc-list__item a, a.lc-list__item button, a.lc-list__item input')).toHaveLength(0);
    } finally {
      el.remove();
    }
  });

  it('keeps the 3.15 DOM of rows without href (AC-22)', () => {
    const el = render([{ id: 'p', label: 'Plain', action: 'Entfernen' }]);
    const row = el.querySelector('.lc-list__item') as HTMLElement;
    expect(row.tagName).toBe('DIV');
    expect(row.getAttributeNames().sort()).toEqual(['class', 'role']);
    expect(row.className).toBe('lc-list__item');
    expect(el.querySelector('a')).toBeNull();
    expect(row.querySelector('.lc-list__action-area')).not.toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('ListComponent link row styles (3.16, TD-4)', () => {
  const css = compile(resolve(__dirname, 'list.component.scss')).css;
  const rule = (selector: string) => {
    const at = css.indexOf(`\n${selector} {`);
    expect(at).toBeGreaterThan(-1);
    return css.slice(at, css.indexOf('}', at));
  };

  it('gives link rows the 44 px minimum, inherited colour and no underline (AC-19)', () => {
    const link = rule('.lc-list__item--link');
    expect(link).toContain('min-height: var(--size-min-touch-height, 2.75rem)');
    expect(link).toContain('color: inherit');
    expect(link).toContain('text-decoration: none');
    expect(rule('.lc-list__item--link:hover')).toContain('background-color: var(--color-surface-hover)');
    expect(rule('.lc-list__item--link:active')).toContain('background-color: var(--color-surface-sunken)');
  });

  it('draws the row focus ring as a Highlight outline in forced colours', () => {
    expect(css).toMatch(/@media \(forced-colors: active\) \{\s*\.lc-list__item:focus-visible \{\s*outline: 2px solid Highlight;/);
  });

  it('gives card link rows the clickable card hover', () => {
    expect(css).toMatch(/\.lc-list--card \.lc-list__item--link:hover:not\(\.lc-list__item--disabled\) \{[^}]*box-shadow: var\(--elevation-1\)/);
  });
});
