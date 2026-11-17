import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computeAccessibleDescription, computeAccessibleName } from 'dom-accessibility-api';
import {
  TimelineComponent,
  TimelineHeadingLevel,
  TimelineItem,
  TimelineItemClickEvent,
  TimelineOrientation,
} from './timeline.component';
import { resolve } from 'path';
import { compile } from 'sass';
import { audit, violations } from '../../testing/axe-jsdom';

const ITEMS: TimelineItem[] = [
  { id: 'a', title: 'Antrag eingereicht', description: 'Von M. Weber', timestamp: '09:12' },
  { id: 'b', title: 'Geprüft', timestamp: '10:40' },
  { id: 'c', title: '', ariaLabel: 'Kommentar ohne Titel', description: 'Bitte Beleg nachreichen' },
  { id: 'd', title: '', description: 'Nur eine Beschreibung', timestamp: '12:00' },
];

@Component({
  standalone: true,
  imports: [TimelineComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-timeline
      [items]="items()"
      [selectable]="selectable()"
      [headingLevel]="headingLevel()"
      [orientation]="orientation()"
      [(selectedId)]="selectedId"
      (itemClick)="clicks.push($event)"
    />
  `,
})
class Host {
  readonly items = signal<TimelineItem[]>(ITEMS);
  readonly selectable = signal(true);
  readonly headingLevel = signal<TimelineHeadingLevel | undefined>(3);
  readonly orientation = signal<TimelineOrientation>('vertical');
  readonly selectedId = signal<string | null>(null);
  readonly clicks: TimelineItemClickEvent[] = [];
}

/** Request 065 (usm-x row 36): selectable items and untitled entries (AC-19 … AC-21). */
describe('lc-timeline selectable items (3.45)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const buttons = (): HTMLButtonElement[] => Array.from(fixture.nativeElement.querySelectorAll('.timeline__button'));
  const items = (): HTMLLIElement[] => Array.from(fixture.nativeElement.querySelectorAll('li'));
  const key = (el: HTMLElement, k: string): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
    el.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  describe('AC-19: untitled entries', () => {
    it('renders no title element for title ""', () => {
      host.selectable.set(false);
      fixture.detectChanges();
      for (const level of [undefined, 3] as const) {
        host.headingLevel.set(level);
        fixture.detectChanges();
        expect(items()[2].querySelector('.timeline__title')).toBeNull();
        expect(items()[0].querySelector('.timeline__title')?.textContent?.trim()).toBe('Antrag eingereicht');
      }
    });

    it('names a selectable untitled item by ariaLabel, else description, else timestamp', () => {
      const [a, , c, d] = buttons();
      expect(computeAccessibleName(a)).toBe('Antrag eingereicht');
      expect(computeAccessibleDescription(a)).toBe('Von M. Weber 09:12');
      expect(computeAccessibleName(c)).toBe('Kommentar ohne Titel');
      expect(computeAccessibleDescription(c)).toBe('Bitte Beleg nachreichen');
      expect(computeAccessibleName(d)).toBe('Nur eine Beschreibung');
      expect(computeAccessibleDescription(d)).toBe('12:00');
      expect(c.closest('h3')).toBeNull();
      expect(a.closest('h3.timeline__title')).not.toBeNull();
    });
  });

  describe('AC-20: selection and keys', () => {
    it('has one tab stop, the first item until one is selected', () => {
      expect(buttons().map((b) => b.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1']);
      host.selectedId.set('b');
      fixture.detectChanges();
      expect(buttons().map((b) => b.getAttribute('tabindex'))).toEqual(['-1', '0', '-1', '-1']);
      expect(buttons()[1].getAttribute('aria-current')).toBe('true');
      expect(items()[1].classList).toContain('timeline__item--selected');
    });

    it('emits itemClick with item and index and selects on click (Enter/Space are native button clicks)', () => {
      buttons()[2].click();
      fixture.detectChanges();
      expect(host.clicks.map((e) => [e.item.id, e.index])).toEqual([['c', 2]]);
      expect(host.selectedId()).toBe('c');
      expect(buttons()[2].getAttribute('aria-current')).toBe('true');
      expect(buttons()[0].hasAttribute('aria-current')).toBe(false);
    });

    it('moves the focus with the arrow keys of both axes, Home and End', () => {
      buttons()[0].focus();
      expect(key(buttons()[0], 'ArrowDown').defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(buttons()[1]);
      key(buttons()[1], 'ArrowRight');
      expect(document.activeElement).toBe(buttons()[2]);
      key(buttons()[2], 'ArrowLeft');
      expect(document.activeElement).toBe(buttons()[1]);
      key(buttons()[1], 'End');
      expect(document.activeElement).toBe(buttons()[3]);
      expect(buttons()[3].getAttribute('tabindex')).toBe('0');
      key(buttons()[3], 'ArrowDown');
      expect(document.activeElement).toBe(buttons()[3]);
      key(buttons()[3], 'Home');
      expect(document.activeElement).toBe(buttons()[0]);
      expect(host.clicks).toEqual([]);
    });

    it('works the same horizontally', () => {
      host.orientation.set('horizontal');
      fixture.detectChanges();
      buttons()[0].focus();
      key(buttons()[0], 'ArrowRight');
      expect(document.activeElement).toBe(buttons()[1]);
    });

    it('scrolls the focused item into view, nearest on both axes (review r3 M6)', () => {
      // Chromium's focus() left a partly visible button 60 px past the
      // horizontal scroller's edge. jsdom has no scrollIntoView: spy on it.
      const targets: Element[] = [];
      const spy = jest.fn(function (this: Element) {
        targets.push(this);
      });
      Element.prototype.scrollIntoView = spy;
      try {
        host.orientation.set('horizontal');
        fixture.detectChanges();
        buttons()[0].focus();
        key(buttons()[0], 'ArrowRight');
        key(buttons()[1], 'End');
        key(buttons()[3], 'Home');
        expect(targets).toEqual([items()[0], items()[1], items()[3], items()[0]]);
        expect(spy.mock.calls.every(([options]) => JSON.stringify(options) === '{"block":"nearest","inline":"nearest"}')).toBe(true);
        expect(host.clicks).toEqual([]);
      } finally {
        delete (Element.prototype as Partial<Element>).scrollIntoView;
      }
    });

    it('focuses without scrollIntoView (jsdom, older engines)', () => {
      expect('scrollIntoView' in Element.prototype).toBe(false);
      expect(() => buttons()[1].focus()).not.toThrow();
      expect(document.activeElement).toBe(buttons()[1]);
    });

    it('has no axe violations, with headings and without', async () => {
      host.selectedId.set('a');
      fixture.detectChanges();
      expect(violations(await audit(fixture.nativeElement))).toEqual([]);
      host.headingLevel.set(undefined);
      fixture.detectChanges();
      expect(violations(await audit(fixture.nativeElement))).toEqual([]);
    });
  });

  describe('AC-21: defaults render as before', () => {
    it('adds no button, id, class or attribute when not selectable', () => {
      host.selectable.set(false);
      host.headingLevel.set(undefined);
      host.items.set(ITEMS.slice(0, 2));
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;
      expect(root.querySelector('.timeline__button')).toBeNull();
      expect(root.querySelector('ol')?.className).toBe('timeline timeline--vertical');
      expect(items().map((li) => li.className)).toEqual(['timeline__item', 'timeline__item timeline__item--last']);
      expect(root.querySelectorAll('[id]').length).toBe(0);
      expect(root.querySelectorAll('[tabindex], [aria-current]').length).toBe(0);
      expect(items()[0].querySelector('p.timeline__title')?.textContent).toBe(' Antrag eingereicht ');
    });
  });
});

describe('lc-timeline tone markers (3.45, review r1 S3, WCAG 1.4.11)', () => {
  // The `-default` fills had 2.72 (success) / 2.26 (warning) on the page in
  // light; the text inks have 5.30 / 6.03 (4.55 / 5.18 on the selected fill).
  const css = compile(resolve(__dirname, 'timeline.component.scss')).css.replace(/\s+/g, ' ');

  it.each([
    ['success', 'var(--color-text-success)'],
    ['warning', 'var(--color-text-warning)'],
  ])('%s marker ring, dot and icon use %s', (tone, ink) => {
    expect(css).toContain(`.timeline__marker--${tone} { border: 2px solid ${ink}; }`);
    expect(css).toContain(`.timeline__marker--${tone} .timeline__dot { background-color: ${ink}; }`);
    expect(css).toContain(`.timeline__marker--${tone} .timeline__icon { color: ${ink}; }`);
  });
});

describe('lc-timeline selectable list padding (3.45, review r2 M5, WCAG 1.4.11)', () => {
  // The item box (button::before) sits 4 px out at the block sides and 8 px
  // (vertical) / 4 px (horizontal) at the inline sides. The horizontal <ol>
  // scrolls (overflow-x: auto) and clipped that outset: 0 of the 3 px bar and
  // 0 px of the ring at the top and bottom were visible. The list now pads by
  // exactly the outset, so every box lies inside it.
  const css = compile(resolve(__dirname, 'timeline.component.scss')).css.replace(/\s+/g, ' ');

  it('pads the selectable list by the vertical box outset (4 px block, 8 px inline)', () => {
    expect(css).toContain('.timeline__button::before, .timeline__button::after { content: ""; position: absolute; inset: -0.25rem -0.5rem');
    expect(css).toContain('.timeline--selectable { padding: 0.25rem 0.5rem; }');
  });

  it('pads the horizontal selectable list by the horizontal box outset (4 px all round)', () => {
    expect(css).toContain('.timeline--horizontal .timeline__button::before, .timeline--horizontal .timeline__button::after { inset: -0.25rem 1.75rem -0.25rem -0.25rem; }');
    expect(css).toContain('.timeline--selectable.timeline--horizontal { padding: 0.25rem; }');
  });

  it('keeps the list unpadded when not selectable (default rendering)', () => {
    expect(css).toContain('.timeline { margin: 0; padding: 0; list-style: none; }');
    // Only the selectable list rules pad the <ol>; the class is set only when selectable (AC-21 above).
    const listPadding = [...css.matchAll(/([^{}]+)\{ padding: [^;]+; \}/g)].map(([, sel]) => sel.trim());
    expect(listPadding).toEqual(['.timeline--selectable', '.timeline--selectable.timeline--horizontal']);
  });

  it('keeps the box outset as scroll margin of a selectable item, so a focused item scrolls fully into view (review r3 M6)', () => {
    expect(css).toContain('.timeline--selectable .timeline__item { --_lc-tl-gap: 1.5rem; isolation: isolate; scroll-margin: 0.25rem 0.5rem; }');
    expect(css).toContain('.timeline--selectable.timeline--horizontal .timeline__item { scroll-margin: 0.25rem; }');
    const scrollMargins = [...css.matchAll(/([^{}]+)\{[^}]*scroll-margin/g)].map(([, sel]) => sel.trim());
    expect(scrollMargins).toEqual(['.timeline--selectable .timeline__item', '.timeline--selectable.timeline--horizontal .timeline__item']);
  });
});
