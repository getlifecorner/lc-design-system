import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { resolve } from 'path';
import { compile } from 'sass';
import { CardComponent } from './card.component';

/**
 * Request 071 (3.50, usm-x row 86, AC-18): `headerActionWrap` lets the head
 * wrap, so `[card-header-action]` takes a line of its own under the title
 * when the title would get less than `--lc-card-header-title-min` (12rem).
 * CSS only (prerendered HTML holds); the default renders as before. The
 * 390 / 1280 px geometry is measured on the story *Header Action Wrap*.
 */
@Component({
  imports: [CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-card title="Objekttypen" badge="128" [headerActionWrap]="wrap()" [collapsible]="collapsible()">
      <input card-header-action type="search" aria-label="Suchen" placeholder="Suchen …" style="width: 220px" />
      <p>Inhalt</p>
    </lc-card>
  `,
})
class HostComponent {
  readonly wrap = signal(false);
  readonly collapsible = signal(false);
}

describe('lc-card headerActionWrap (3.50)', () => {
  const css = '\n' + compile(resolve(__dirname, 'card.component.scss'), { loadPaths: [resolve(__dirname, '../../styles')] }).css;
  const rule = (selector: string) => {
    const start = css.indexOf(`\n${selector} {`);
    expect([selector, start > -1]).toEqual([selector, true]);
    return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start)).trim().replace(/\s+/g, ' ');
  };

  function render(wrap: boolean, collapsible = false) {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.wrap.set(wrap);
    fixture.componentInstance.collapsible.set(collapsible);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.card') as HTMLElement;
  }

  // jsdom lists a `[class]` binding's classes sorted, so compare the sets.
  const classes = (el: HTMLElement) => [...el.classList].sort();

  it('default: the card keeps its old class list', () => {
    expect(classes(render(false))).toEqual(['card', 'card-elevated', 'card-padding-md', 'card-radius-md']);
  });

  it('on: adds card-header-wrap; the head DOM is unchanged', () => {
    const plain = render(false).querySelector('.card__header')?.outerHTML;
    const card = render(true);
    expect(classes(card)).toEqual(['card', 'card-elevated', 'card-header-wrap', 'card-padding-md', 'card-radius-md']);
    expect(card.querySelector('.card__header')?.outerHTML).toBe(plain);
    expect(card.querySelector('.card__header-action > input[type="search"]')).not.toBeNull();
  });

  it('on a collapsible card: both classes; the chevron stays after the action', () => {
    const card = render(true, true);
    expect(classes(card)).toEqual(['card', 'card-collapsible', 'card-elevated', 'card-header-wrap', 'card-padding-md', 'card-radius-md']);
    const head = card.querySelector('.card__header') as HTMLElement;
    const kids = Array.from(head.children).map((c) => c.classList[0]);
    expect(kids.slice(-2)).toEqual(['card__header-action', 'card__chevron']);
  });

  it('CSS: the head wraps with a 12 px row gap', () => {
    expect(rule('.card-header-wrap .card__header')).toBe('flex-wrap: wrap; row-gap: var(--spacing-3);');
  });

  it('CSS: the title column asks for the hook (12rem) and takes the free room', () => {
    expect(rule('.card-header-wrap .card__header-left')).toBe('flex: 1000000 1 var(--lc-card-header-title-min, 12rem);');
  });

  it('CSS: the action may shrink and fills its own line', () => {
    expect(rule('.card-header-wrap .card__header-action')).toBe('flex: 1 1 auto; min-width: 0; max-width: 100%;');
  });

  it('CSS: the default head and action rules keep their values', () => {
    expect(css).toMatch(/\n\.card__header \{\s*display: flex;\s*align-items: flex-start;\s*justify-content: space-between;/);
    expect(css).toMatch(/\n\.card__header-action \{\s*flex-shrink: 0;\s*display: flex;/);
    expect(css).toMatch(/\n\.card__header-left \{\s*flex: 1;\s*min-width: 0;\s*\}/);
  });
});
