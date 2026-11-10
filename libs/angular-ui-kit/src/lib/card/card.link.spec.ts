import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideRouter, Router, type Params } from '@angular/router';
import { compile } from 'sass';
import { join } from 'path';
import { CardComponent, CardHeadingLevel, CardVariant } from './card.component';
import { audit, axe, computedName, violations } from '../../testing/axe-jsdom';

/**
 * Request 037 (3.24, quellen row 1): the link mode of `lc-card`. `href` or
 * `route` (+ `queryParams`) make the built-in title an `<a>` inside its
 * heading; the anchor's ::after covers the card (design 037 §1–§3).
 */
@Component({
  standalone: true,
  imports: [CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-card
      [title]="title()"
      [variant]="variant()"
      [headingLevel]="headingLevel()"
      [clickable]="clickable()"
      [selected]="selected()"
      [ariaLabel]="ariaLabel()"
      [href]="href()"
      [route]="route()"
      [queryParams]="queryParams()"
      (cardClick)="clicks = clicks + 1"
    >
      <p class="body">Geladen</p>
      <button type="button" class="action">Aktion</button>
    </lc-card>
  `,
})
class HostComponent {
  readonly title = signal<string | undefined>('SAP-Ist');
  readonly variant = signal<CardVariant>('outlined');
  readonly headingLevel = signal<CardHeadingLevel>(3);
  readonly clickable = signal(false);
  readonly selected = signal(false);
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly href = signal<string | undefined>(undefined);
  readonly route = signal<string | readonly unknown[] | null | undefined>(undefined);
  readonly queryParams = signal<Params | null | undefined>(undefined);
  clicks = 0;
}

/**
 * The host's DOM without Angular's scoping attributes and comment anchors,
 * class tokens sorted (Angular's styling may apply them in another order).
 */
function plain(el: Element): string {
  const clone = el.cloneNode(true) as Element;
  const walk = (node: Node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.COMMENT_NODE) child.remove();
      else if (child instanceof Element) {
        for (const a of [...child.attributes]) if (/^_ng(content|host)-/.test(a.name)) child.removeAttribute(a.name);
        const classes = child.getAttribute('class');
        if (classes) child.setAttribute('class', classes.split(/\s+/).sort().join(' '));
        walk(child);
      }
    }
  };
  walk(clone);
  return clone.innerHTML;
}

function roleOf(root: Element, el: Element): string | null {
  axe.setup(root);
  try {
    return axe.commons.aria.getRole(el);
  } finally {
    axe.teardown();
  }
}

describe('lc-card link mode (3.24, request 037)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let warn: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => warn.mockRestore());

  const card = () => fixture.nativeElement.querySelector('.card') as HTMLElement;
  const link = () => fixture.nativeElement.querySelector('a.card__link') as HTMLAnchorElement | null;

  describe('AC-1: a real <a href>', () => {
    it('renders href as h3.card__title > a.card__link', () => {
      host.href.set('/datenbasis/quellen/sap-ist');
      fixture.detectChanges();
      const a = fixture.nativeElement.querySelector('h3.card__title > a.card__link') as HTMLAnchorElement;
      expect(a.getAttribute('href')).toBe('/datenbasis/quellen/sap-ist');
      expect(a.textContent).toBe('SAP-Ist');
      expect(fixture.nativeElement.querySelectorAll('a')).toHaveLength(1);
    });

    it('renders route + queryParams through the router', () => {
      host.route.set('/quellen/usm');
      host.queryParams.set({ ansicht: 'laeufe' });
      fixture.detectChanges();
      expect(link()?.getAttribute('href')).toBe('/quellen/usm?ansicht=laeufe');
      host.route.set(['/quellen', 'sap-ist']);
      host.queryParams.set(null);
      fixture.detectChanges();
      expect(link()?.getAttribute('href')).toBe('/quellen/sap-ist');
    });

    it('lets href win over route, with a dev-mode warning', () => {
      host.href.set('/a');
      host.route.set('/b');
      fixture.detectChanges();
      expect(link()?.getAttribute('href')).toBe('/a');
      expect(warn).toHaveBeenCalledWith('[lc-card] href and route are both set: href wins');
    });

    it.each<[string, Partial<Record<'href' | 'route', unknown>>]>([
      ['neither', {}],
      ['href ""', { href: '' }],
      ['route ""', { route: '' }],
      ['route null', { route: null }],
    ])('renders no link with %s', (_, inputs) => {
      if ('href' in inputs) host.href.set(inputs.href as string);
      if ('route' in inputs) host.route.set(inputs.route as null);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('a.card__link')).toBeNull();
      expect(card().classList).not.toContain('card-linked');
      expect(fixture.nativeElement.querySelector('h3.card__title')?.textContent).toBe('SAP-Ist');
    });

    it('never links the dashed tile (AC-5)', () => {
      host.variant.set('dashed');
      host.href.set('/x');
      host.route.set('/y');
      fixture.detectChanges();
      expect(link()).toBeNull();
      expect(card().classList).not.toContain('card-linked');
      expect(card().getAttribute('role')).toBe('article');
      expect(warn).not.toHaveBeenCalled();
    });
  });

  describe('AC-2: heading and link in the accessibility tree', () => {
    it.each<[CardHeadingLevel, string]>([
      [2, 'H2'],
      [3, 'H3'],
      [4, 'H4'],
      [5, 'H5'],
      [6, 'H6'],
    ])('keeps heading level %s around the link', (level, tag) => {
      host.headingLevel.set(level);
      host.href.set('/x');
      fixture.detectChanges();
      const a = link() as HTMLAnchorElement;
      expect(a.parentElement?.tagName).toBe(tag);
      expect(a.parentElement?.classList).toContain('card__title');
    });

    it('exposes heading "SAP-Ist" (h2) and link "SAP-Ist"; the card is an article, not a button', () => {
      host.headingLevel.set(2);
      host.clickable.set(true);
      host.href.set('/x');
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      const heading = root.querySelector('h2') as HTMLElement;
      const a = link() as HTMLAnchorElement;
      expect(roleOf(root, heading)).toBe('heading');
      expect(computedName(root, heading)).toBe('SAP-Ist');
      expect(roleOf(root, a)).toBe('link');
      expect(computedName(root, a)).toBe('SAP-Ist');
      expect(a.hasAttribute('aria-label')).toBe(false);
      expect(card().getAttribute('role')).toBe('article');
      expect(card().hasAttribute('tabindex')).toBe(false);
      expect(card().hasAttribute('aria-label')).toBe(false);
      expect(card().classList).toContain('card-linked');
      expect(card().classList).not.toContain('card-clickable');
    });

    it('puts ariaLabel on the anchor, not on the card', () => {
      host.ariaLabel.set('SAP-Ist, geladen');
      host.route.set('/x');
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      expect(link()?.getAttribute('aria-label')).toBe('SAP-Ist, geladen');
      expect(computedName(root, link() as HTMLElement)).toBe('SAP-Ist, geladen');
      expect(card().hasAttribute('aria-label')).toBe(false);
    });

    it('keeps the selected look on a link card', () => {
      host.selected.set(true);
      host.href.set('/x');
      fixture.detectChanges();
      expect(card().classList).toContain('card-selected');
      expect(card().classList).toContain('card-linked');
    });

    it('renders a bare anchor named by ariaLabel when there is no title', () => {
      host.title.set(undefined);
      host.ariaLabel.set('Quelle öffnen');
      host.href.set('/x');
      fixture.detectChanges();
      const a = link() as HTMLAnchorElement;
      expect(card().firstElementChild).toBe(a);
      expect(a.classList).toContain('card__link--bare');
      expect(a.textContent).toBe('');
      expect(a.getAttribute('aria-label')).toBe('Quelle öffnen');
      expect(fixture.nativeElement.querySelector('.card__title')).toBeNull();
      expect(warn).not.toHaveBeenCalled();
    });

    it('warns in dev mode when a link card has neither title nor ariaLabel', () => {
      host.title.set(undefined);
      host.route.set('/x');
      fixture.detectChanges();
      TestBed.flushEffects();
      expect(warn).toHaveBeenCalledWith('[lc-card] a link card without title needs an ariaLabel to name its link');
    });

    it('passes axe (link-name, nested-interactive, heading roles) with a projected button', async () => {
      host.headingLevel.set(2);
      host.href.set('/x');
      fixture.detectChanges();
      const results = await audit(fixture.nativeElement as HTMLElement);
      expect(violations(results, ['landmark-one-main', 'page-has-heading-one', 'region'])).toEqual([]);
      expect(results.passes.some((r) => r.id === 'link-name')).toBe(true);
    });
  });

  describe('AC-3: one navigation, the link\'s own', () => {
    it('never emits cardClick or prevents a click or Enter on an href card', () => {
      host.clickable.set(true);
      host.href.set('#/quellen/usm');
      fixture.detectChanges();
      const a = link() as HTMLAnchorElement;
      const click = new MouseEvent('click', { bubbles: true, cancelable: true });
      a.dispatchEvent(click);
      const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      a.dispatchEvent(enter);
      const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      a.dispatchEvent(space);
      expect(host.clicks).toBe(0);
      expect(click.defaultPrevented).toBe(false);
      expect(enter.defaultPrevented).toBe(false);
      expect(space.defaultPrevented).toBe(false);
    });

    it('navigates once through the router on a plain click of a route card', () => {
      const navigate = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      host.clickable.set(true);
      host.route.set('/quellen/usm');
      host.queryParams.set({ ansicht: 'laeufe' });
      fixture.detectChanges();
      const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
      (link() as HTMLAnchorElement).dispatchEvent(click);
      expect(navigate).toHaveBeenCalledTimes(1);
      expect(String(navigate.mock.calls[0][0])).toBe('/quellen/usm?ansicht=laeufe');
      expect(click.defaultPrevented).toBe(true);
      expect(host.clicks).toBe(0);
    });

    it.each<[string, MouseEventInit]>([
      ['Ctrl', { ctrlKey: true }],
      ['Cmd', { metaKey: true }],
      ['Shift', { shiftKey: true }],
      ['middle button', { button: 1 }],
    ])('leaves a %s click on a route card to the browser', (_, init) => {
      const navigate = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
      host.route.set('/quellen/usm');
      fixture.detectChanges();
      const click = new MouseEvent('click', { bubbles: true, cancelable: true, ...init });
      (link() as HTMLAnchorElement).dispatchEvent(click);
      expect(navigate).not.toHaveBeenCalled();
      expect(click.defaultPrevented).toBe(false);
      expect(host.clicks).toBe(0);
    });

    it('still emits cardClick on a clickable card without a link', () => {
      host.clickable.set(true);
      fixture.detectChanges();
      card().click();
      card().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(host.clicks).toBe(2);
    });
  });

  describe('AC-11: default rendering unchanged', () => {
    // The 3.23.1 template rendered side by side with this one over 86 input
    // combinations gave the same DOM (build 037); these two pin it.
    // 3.38 (request 058, 057-s1, AC-1): the one-space text nodes between the
    // card's parts are new (word breaks in the card's text; they render
    // nothing); without them the markup is the 3.23.1 one, element for element.
    const titled =
      '<div class="card card-outlined card-padding-md card-radius-md" role="article">' +
      '<div class="card__header"><div class="card__header-left"><div class="card__title-row">' +
      '<h3 class="card__title">SAP-Ist</h3><span class="card__badge-slot"></span></div></div>' +
      '<div class="card__header-action"></div></div>' +
      '<div class="card__body"><p class="body">Geladen</p><button type="button" class="action">Aktion</button></div></div>';
    const withSpaces = (html: string) =>
      html
        .replace('</h3><span class="card__badge-slot"></span></div>', '</h3> <span class="card__badge-slot"></span> </div>')
        .replace('</div><div class="card__header-action">', '</div> <div class="card__header-action">')
        .replace('</div></div><div class="card__body">', '</div></div>  <div class="card__body">')
        .replace(/<\/div><\/div>$/, '</div> </div>');

    it('renders a titled card as in 3.23.1', () => {
      fixture.detectChanges();
      const html = plain(fixture.nativeElement.querySelector('lc-card'));
      expect(html).toBe(withSpaces(titled));
      expect(html.replace(/> +</g, '><')).toBe(titled);
    });

    it('renders a clickable, selected, labelled card as in 3.23.1', () => {
      host.clickable.set(true);
      host.selected.set(true);
      host.ariaLabel.set('Karte');
      fixture.detectChanges();
      const html = plain(fixture.nativeElement.querySelector('lc-card'));
      const labelled = titled.replace(
        '<div class="card card-outlined card-padding-md card-radius-md" role="article">',
        '<div class="card card-clickable card-outlined card-padding-md card-radius-md card-selected" role="button" aria-label="Karte" tabindex="0">',
      );
      expect(html).toBe(withSpaces(labelled));
      expect(html.replace(/> +</g, '><')).toBe(labelled);
    });
  });

  describe('stylesheet (AC-4, AC-5)', () => {
    // jsdom applies no stylesheets: read the contract from the compiled CSS.
    const css = compile(join(__dirname, 'card.component.scss'), {
      loadPaths: [join(__dirname, '../../styles')],
    }).css;
    /** Start of the rule for `selector` (a list as `a, b`, any whitespace after the comma). */
    const at = (selector: string): number => {
      const source = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/, /g, ',\\s*');
      return css.search(new RegExp(`(^|\\n)${source} \\{`));
    };
    const body = (selector: string): string => {
      const start = at(selector);
      expect(start).toBeGreaterThan(-1);
      return css.slice(start, css.indexOf('}', start));
    };

    it('gives a link card the clickable hover, press and cursor (one rule each)', () => {
      expect(body('.card-clickable, .card-linked')).toMatch(/cursor:\s*pointer;\s*user-select:\s*none/);
      expect(body('.card-clickable:hover, .card-linked:hover')).toMatch(
        /background-color:\s*var\(--color-surface-hover\);\s*border-color:\s*var\(--color-border-strong\)/,
      );
      expect(body('.card-clickable:active, .card-linked:active')).toMatch(/transform:\s*scale\(0\.98\)/);
    });

    it('keeps the hover rule before .card-selected, as in 3.23.1', () => {
      expect(at('.card-clickable:hover, .card-linked:hover')).toBeLessThan(at('.card-selected'));
    });

    it('draws the focus-ring values on the card when its anchor has focus', () => {
      expect(body('.card-clickable:focus-visible')).toMatch(/outline:\s*2px solid var\(--color-primary-500\);\s*outline-offset:\s*2px/);
      expect(body('.card-linked:has(.card__link:focus-visible)')).toMatch(
        /outline:\s*2px solid var\(--color-primary-500\);\s*outline-offset:\s*2px/,
      );
      expect(body('.card-linked')).toMatch(/isolation:\s*isolate/);
    });

    it('draws the link card ring in Highlight in forced colours, as a focused clickable card (C-1)', () => {
      expect(css).toMatch(
        /@media \(forced-colors: active\) \{\s*\.card-linked:has\(\.card__link:focus-visible\) \{\s*outline-color:\s*Highlight;\s*\}/,
      );
    });

    it('draws no UA underline, colour or ring on the anchor and covers the card with its ::after', () => {
      const anchor = body('.card__link');
      expect(anchor).toMatch(/color:\s*inherit/);
      expect(anchor).toMatch(/text-decoration:\s*none/);
      expect(anchor).toMatch(/outline:\s*none/);
      expect(body('.card__link::after')).toMatch(/content:\s*"";\s*position:\s*absolute;\s*inset:\s*0;\s*z-index:\s*1/);
    });

    it('lifts projected controls above the overlay at (0,1,0), below their own position rules (C-2)', () => {
      expect(css).toMatch(
        /:host ::ng-deep :where\(\.card-linked :is\(a\[href\], button, input, select, textarea, summary, \[tabindex\]\):not\(\.card__link\)\) \{\s*position:\s*relative;\s*z-index:\s*2;/,
      );
    });

    it('hyphenates long title words in the page language (12 4 3)', () => {
      expect(body('.card__title')).toMatch(/hyphens:\s*auto;\s*hyphenate-limit-chars:\s*12 4 3/);
    });
  });
});
