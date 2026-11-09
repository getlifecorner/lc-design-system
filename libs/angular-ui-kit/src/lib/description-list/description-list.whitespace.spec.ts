import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { CardComponent } from '@lifecorner/angular-ui-kit/card';
import { DescriptionListComponent, type DescriptionListItem } from './description-list.component';
import { LABEL_IN_NAME, axe, installFakeCanvas, outcome } from '../../testing/axe-jsdom';

/**
 * 3.37 (request 057, finance-intelligence regeln row 1, design D-4): spaces
 * between term, leader and value, after each row and after the hidden total
 * prefix, so the list's text has word breaks (textContent, accessible names,
 * copied text). They render nothing (flex rows, line starts, a 0 px span);
 * the look is proven by the story shots.
 */
@Component({
  standalone: true,
  imports: [DescriptionListComponent, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (inCard()) {
      <lc-card [clickable]="true" [ariaLabel]="cardLabel()">
        <lc-description-list [items]="items()" size="sm" />
      </lc-card>
    } @else {
      <lc-description-list [items]="items()" [clickable]="clickable()" [layout]="layout()" totalAriaLabel="Summe" />
    }
  `,
})
class Host {
  readonly items = signal<DescriptionListItem[]>([]);
  readonly clickable = signal(false);
  readonly layout = signal<'rows' | 'stacked'>('rows');
  readonly inCard = signal(false);
  readonly cardLabel = signal('');
}

const ways: DescriptionListItem[] = [
  { term: 'aus USM übernommen', value: '1' },
  { term: 'im Modul gepflegt', value: '2' },
];

describe('lc-description-list — word breaks in the text (3.37, request 057)', () => {
  let fixture: ComponentFixture<Host>;
  const host = () => fixture.componentInstance;
  const dl = () => (fixture.nativeElement as HTMLElement).querySelector('dl') as HTMLElement;
  /** The text as a reader of `textContent` gets it, runs of whitespace as one space. */
  const text = () => (dl().textContent ?? '').replace(/\s+/g, ' ').trim();
  const render = (items: DescriptionListItem[]) => {
    host().items.set(items);
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  describe('AC-11: „Term Value Term Value“', () => {
    it('plain rows (the regeln tile)', () => {
      render(ways);
      expect(text()).toBe('aus USM übernommen 1 im Modul gepflegt 2');
    });

    it.each(['rows', 'stacked'] as const)('%s layout, clickable', (layout) => {
      host().layout.set(layout);
      host().clickable.set(true);
      render(ways);
      expect(text()).toBe('aus USM übernommen 1 im Modul gepflegt 2');
    });

    it('a badge alone and a badge after a value', () => {
      render([
        { term: 'Plan', value: '', badge: 'Entwurf', badgeVariant: 'warning' },
        { term: 'Fassung', value: '1', badge: 'Freigegeben', badgeVariant: 'success' },
      ]);
      expect(text()).toBe('Plan Entwurf Fassung 1 Freigegeben');
    });

    it('a suffix after plain text, a link, a time and a badge', () => {
      render([
        { term: 'Note', value: 'B', valueSuffix: 'gut' },
        { term: 'Beleg', value: 'Details', href: '#beleg', valueSuffix: 'ansehen' },
        { term: 'Letzter Lauf', value: 'heute 06:00', datetime: '2026-11-09T06:00:00+01:00', valueSuffix: '(automatisch)' },
        { term: 'Zustand', value: '', badge: 'Geladen', valueSuffix: 'vollständig' },
      ]);
      expect(text()).toBe(
        'Note B gut Beleg Details ansehen Letzter Lauf heute 06:00 (automatisch) Zustand Geladen vollständig',
      );
    });

    it('a total with its hidden prefix', () => {
      render([...ways, { term: 'Gesamt', value: '3', total: true }]);
      expect(text()).toBe('aus USM übernommen 1 im Modul gepflegt 2 Summe, Gesamt 3');
    });

    it('the separators are text nodes of one space, and the 0 px span only after a link, a time or a badge', () => {
      render([
        { term: 'Beleg', value: 'Details', href: '#beleg', valueSuffix: 'ansehen' },
        { term: 'Lauf', value: 'heute', datetime: '2026-11-09', valueSuffix: 'auto' },
        { term: 'Note', value: 'B', valueSuffix: 'gut' },
        { term: 'Zustand', value: '', badge: 'Geladen', valueSuffix: 'vollständig' },
      ]);
      const row = dl().querySelector('.lc-dl__row') as HTMLElement;
      const between = (a: Element, b: Element) => {
        const nodes: string[] = [];
        for (let n = a.nextSibling; n && n !== b; n = n.nextSibling) nodes.push(n.nodeType === 3 ? `text:${JSON.stringify(n.textContent)}` : n.nodeName);
        return nodes.filter((n) => n !== 'text:""' && !n.startsWith('#comment'));
      };
      const dt = row.querySelector('dt') as Element;
      const leader = row.querySelector('.lc-dl__leader') as Element;
      const dd = row.querySelector('dd') as Element;
      expect(between(dt, leader)).toEqual(['text:" "']);
      expect(between(leader, dd)).toEqual(['text:" "']);
      expect(row.nextSibling?.textContent).toBe(' ');
      const seps = Array.from(dl().querySelectorAll('.lc-dl__sep'));
      expect(seps.map((s) => s.textContent)).toEqual([' ', ' ', ' ']);
      expect(seps.map((s) => s.previousElementSibling?.nodeName)).toEqual(['A', 'TIME', 'LC-BADGE']);
      expect(seps.every((s) => s.nextElementSibling?.className === 'lc-dl__value-suffix')).toBe(true);
      // A badge's text starts with a space; at the start of its flex box it renders nothing.
      expect(dl().querySelector('lc-badge')?.textContent).toBe(' Geladen');
    });

    it('the 0 px separator: font-size 0, appended after the 3.36 rules', () => {
      const css = compile(resolve(__dirname, 'description-list.component.scss')).css;
      expect(css).toMatch(/\n\.lc-dl__sep \{\s*font-size: 0;\s*\}\s*$/);
    });
  });

  describe('AC-12: a labelled clickable card holding a list', () => {
    let restoreCanvas: () => void;
    beforeAll(() => (restoreCanvas = installFakeCanvas()));
    afterAll(() => restoreCanvas());

    const run = (root: Element) => axe.run(root, { runOnly: [LABEL_IN_NAME] });

    it('ariaLabel = the visible text passes label-content-name-mismatch', async () => {
      host().inCard.set(true);
      host().cardLabel.set('aus USM übernommen 1 im Modul gepflegt 2');
      render(ways);
      await fixture.whenStable();
      const card = (fixture.nativeElement as HTMLElement).querySelector('[role="button"]') as HTMLElement;
      expect(card.getAttribute('aria-label')).toBe('aus USM übernommen 1 im Modul gepflegt 2');
      expect(outcome(await run(card.parentElement as Element), LABEL_IN_NAME)).toBe('pass');
    });

    it('negative control: the 3.36 text without spaces fails', async () => {
      host().inCard.set(true);
      host().cardLabel.set('aus USM übernommen 1 im Modul gepflegt 2');
      render(ways);
      await fixture.whenStable();
      const card = (fixture.nativeElement as HTMLElement).querySelector('[role="button"]') as HTMLElement;
      // Drop the separators again, as 3.36 rendered the list.
      const walker = document.createTreeWalker(dl(), NodeFilter.SHOW_TEXT);
      const blanks: Text[] = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) if (!(n.textContent ?? '').trim()) blanks.push(n as Text);
      blanks.forEach((n) => n.remove());
      for (const dd of Array.from(dl().querySelectorAll('dd'))) dd.textContent = (dd.textContent ?? '').trim();
      expect(dl().textContent).toBe('aus USM übernommen1im Modul gepflegt2');
      expect(outcome(await run(card.parentElement as Element), LABEL_IN_NAME)).toBe('violation');
    });
  });
});
