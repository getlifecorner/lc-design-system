import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TooltipDirective } from './tooltip.directive';

/**
 * 3.31 (request 050, follow-up 049-f1, WCAG 3.1.2 Language of Parts): the
 * tooltip renders in a CDK overlay under `<body>`, outside the host's `lang`,
 * so the tooltip element (the `aria-describedby` target) takes the host's
 * closest `[lang]`, read at every show. Design 050 §1, §9; AC-3.
 */
@Component({
  standalone: true,
  imports: [TooltipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrapper" [attr.lang]="lang()">
      <button type="button" lcTooltip="Änderungen speichern, bevor du die Seite verlässt">Speichern</button>
    </div>
  `,
})
class Host {
  readonly lang = signal<string | null>(null);
}

const attributeNames = (el: Element): string =>
  el
    .getAttributeNames()
    .filter((n) => !n.startsWith('_ng'))
    .sort()
    .join(' ');

describe('lcTooltip 3.31 tooltip language (request 050)', () => {
  let fixture: ComponentFixture<Host>;
  let directive: TooltipDirective;
  let button: HTMLButtonElement;

  const create = (lang: string | null = null) => {
    TestBed.configureTestingModule({ imports: [Host] });
    fixture = TestBed.createComponent(Host);
    fixture.componentInstance.lang.set(lang);
    fixture.detectChanges();
    const debug = fixture.debugElement.query(By.directive(TooltipDirective));
    directive = debug.injector.get(TooltipDirective);
    button = debug.nativeElement as HTMLButtonElement;
  };
  /** The element the host's aria-describedby points at. */
  const described = (): HTMLElement | null => {
    const id = button.getAttribute('aria-describedby');
    return id ? document.getElementById(id) : null;
  };

  afterEach(() => {
    directive?.hide();
    fixture?.destroy();
  });

  it('the test page has no <html lang>', () => {
    expect(document.documentElement.hasAttribute('lang')).toBe(false);
  });

  describe('AC-3: the closest [lang] of the host', () => {
    it('gives the shown tooltip element lang="de"', () => {
      create('de');
      directive.show();
      const tooltip = described();
      expect(tooltip?.getAttribute('role')).toBe('tooltip');
      expect(tooltip?.closest('.cdk-overlay-pane')).not.toBeNull();
      expect(tooltip?.getAttribute('lang')).toBe('de');
    });

    it('sets lang on show by mouse too', () => {
      create('de');
      button.dispatchEvent(new MouseEvent('mouseenter'));
      expect(described()?.getAttribute('lang')).toBe('de');
    });

    it('takes a region subtag as it is (fr-CH)', () => {
      create('fr-CH');
      directive.show();
      expect(described()?.closest('[lang]')?.getAttribute('lang')).toBe('fr-CH');
    });

    it('adds lang and nothing else to the tooltip attributes', () => {
      create('de');
      directive.show();
      expect(attributeNames(described() as HTMLElement)).toBe('class id lang role');
    });

    it('reads the host lang again at the next show', () => {
      create('de');
      directive.show();
      directive.hide();
      fixture.componentInstance.lang.set('fr');
      fixture.detectChanges();
      directive.show();
      expect(described()?.getAttribute('lang')).toBe('fr');
    });
  });

  describe('AC-3: no ancestor lang, hide', () => {
    it('adds no lang attribute when there is none', () => {
      create();
      directive.show();
      expect(described()).not.toBeNull();
      expect(described()?.hasAttribute('lang')).toBe(false);
      expect(attributeNames(described() as HTMLElement)).toBe('class id role');
    });

    it('removes the element, and with it the lang, on hide', () => {
      create('de');
      directive.show();
      const id = directive.tooltipId;
      expect(document.getElementById(id)?.getAttribute('lang')).toBe('de');
      directive.hide();
      expect(document.getElementById(id)).toBeNull();
      expect(document.querySelectorAll('.lc-tooltip[lang]')).toHaveLength(0);
    });

    it('leaves the host without a lang attribute', () => {
      create('de');
      directive.show();
      expect(button.hasAttribute('lang')).toBe(false);
    });
  });
});
