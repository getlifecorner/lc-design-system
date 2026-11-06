import { Component, signal, viewChild } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { NextStepCardComponent, type NextStepCardTitleTag, type NextStepCardTone } from './next-step-card.component';

/**
 * 3.33 (request 052, monatsstand row 1, AC-1 to AC-4): `focusTitle()` moves
 * focus to the title (`tabindex="-1"`), nothing changes until it is called.
 */
@Component({
  standalone: true,
  imports: [NextStepCardComponent],
  template: `
    <button type="button" id="before">Vorher</button>
    <lc-next-step-card
      [cardTitle]="title()"
      [titleTag]="tag()"
      [tone]="tone()"
      [announce]="announce()"
      message="September 2026 · Fassung 1 ist eingefroren."
      primaryLabel="Freigeben"
    >
      @if (extras()) {
        <span slot="blockers">Ein Beleg fehlt</span>
        <span slot="meta">Zuletzt geändert heute</span>
      }
    </lc-next-step-card>
  `,
})
class Host {
  readonly card = viewChild.required(NextStepCardComponent);
  readonly title = signal('Monatsstand eingefroren');
  readonly tag = signal<NextStepCardTitleTag>('div');
  readonly tone = signal<NextStepCardTone>('neutral');
  readonly announce = signal(false);
  readonly extras = signal(false);
}

describe('NextStepCardComponent — focusTitle() (3.33, request 052)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const title = () => (fixture.nativeElement as HTMLElement).querySelector('.lc-next-step-card__title') as HTMLElement;

  function create(patch: Partial<{ tag: NextStepCardTitleTag; tone: NextStepCardTone; announce: boolean; extras: boolean }> = {}) {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    if (patch.tag) host.tag.set(patch.tag);
    if (patch.tone) host.tone.set(patch.tone);
    if (patch.announce) host.announce.set(true);
    if (patch.extras) host.extras.set(true);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
  }

  afterEach(() => {
    (fixture?.nativeElement as HTMLElement | undefined)?.remove();
    fixture?.destroy();
  });

  it.each(['div', 'h2', 'h3'] as const)('AC-1: titleTag %s — focuses the title and gives it tabindex="-1"', (tag) => {
    create({ tag });
    expect(title().tagName.toLowerCase()).toBe(tag);
    expect(title().hasAttribute('tabindex')).toBe(false);
    host.card().focusTitle();
    expect(title().getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(title());
    expect(document.activeElement?.textContent?.trim()).toBe('Monatsstand eingefroren');
  });

  it('AC-2: without the call the title has no tabindex and its attributes are as before', () => {
    create();
    expect(title().getAttributeNames().filter((n) => !n.startsWith('_ng')).sort()).toEqual(['class']);
    expect(title().tabIndex).toBe(-1); // a div is not focusable: not in the Tab order
  });

  it('AC-2: with announce and an h2 the title keeps exactly class and aria-live', () => {
    create({ tag: 'h2', announce: true });
    expect(title().getAttributeNames().filter((n) => !n.startsWith('_ng')).sort()).toEqual(['aria-live', 'class']);
  });

  it('AC-2: after the call the title stays out of the Tab order (tabindex -1, not 0)', () => {
    create({ tag: 'h2' });
    host.card().focusTitle();
    expect(title().tabIndex).toBe(-1);
  });

  it.each(['neutral', 'primary', 'success', 'warning', 'info'] as const)('AC-3: tone %s, with announce, blockers and meta', (tone) => {
    create({ tone, announce: true, extras: true, tag: 'h2' });
    host.card().focusTitle();
    expect(document.activeElement).toBe(title());
    expect(title().getAttribute('aria-live')).toBe('polite');
    // The title still names the region.
    const region = (fixture.nativeElement as HTMLElement).querySelector('[role="region"]') as HTMLElement;
    expect(region.getAttribute('aria-label')).toBe('Monatsstand eingefroren');
  });

  it('AC-1: after a state change, focuses the new title (the call after render)', () => {
    create({ tag: 'h2' });
    host.title.set('Monatsstand freigegeben');
    host.tag.set('h3');
    fixture.detectChanges();
    host.card().focusTitle();
    expect(document.activeElement?.tagName).toBe('H3');
    expect(document.activeElement?.textContent?.trim()).toBe('Monatsstand freigegeben');
  });

  describe('AC-3: the ring (SCSS)', () => {
    const css = compile(resolve(__dirname, 'next-step-card.component.scss')).css;

    it('is a 2 px primary outline on :focus-visible only, offset 2 px (no layout shift)', () => {
      expect(css).toMatch(
        /\.lc-next-step-card__title:focus-visible \{\s*outline: 2px solid var\(--color-primary-500\);\s*outline-offset: 2px;\s*border-radius: var\(--border-radius-sm\);\s*\}/,
      );
      expect(css).not.toMatch(/\.lc-next-step-card__title:focus \{/);
    });

    it('is Highlight in forced colours', () => {
      expect(css).toMatch(/@media \(forced-colors: active\) \{\s*\.lc-next-step-card__title:focus-visible \{\s*outline-color: Highlight;\s*\}/);
    });
  });
});
