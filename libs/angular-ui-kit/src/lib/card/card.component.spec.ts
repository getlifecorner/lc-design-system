import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent, CardHeadingLevel, CardVariant } from './card.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { compile } from 'sass';
import { join } from 'path';
import { LABEL_IN_NAME, axe, installFakeCanvas, outcome } from '../../testing/axe-jsdom';

@Component({
  selector: 'lc-test-wrapper',
  standalone: true,
  imports: [CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <lc-card
      [variant]="variant"
      [padding]="padding"
      [borderRadius]="borderRadius"
      [clickable]="clickable"
      [selected]="selected"
      [ariaLabel]="ariaLabel"
      (cardClick)="onCardClick($event)"
    >
      <ng-content></ng-content>
    </lc-card>
  `,
})
class TestWrapperComponent {
  variant: CardVariant = 'elevated';
  padding: 'none' | 'xs' | 'sm' | 'md' | 'lg' = 'md';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  clickable = false;
  selected = false;
  ariaLabel?: string;
  clickCount = 0;

  onCardClick(_event: MouseEvent): void {
    this.clickCount++;
  }
}

describe('CardComponent', () => {
  let component: TestWrapperComponent;
  let fixture: ComponentFixture<TestWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestWrapperComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestWrapperComponent);
    component = fixture.componentInstance;
    // Don't call detectChanges() here - let each test control it
  });

  function getCardElement(): HTMLElement {
    const element = fixture.nativeElement.querySelector('.card');
    if (!element) {
      throw new Error('Card element not found');
    }
    return element as HTMLElement;
  }

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Variants', () => {
    it('should apply elevated variant by default', () => {
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-elevated')).toBe(true);
    });

    it('should apply outlined variant when specified', () => {
      component.variant = 'outlined';
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-outlined')).toBe(true);
      expect(cardElement.classList.contains('card-elevated')).toBe(false);
    });

    it('should apply flat variant when specified', () => {
      component.variant = 'flat';
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-flat')).toBe(true);
      expect(cardElement.classList.contains('card-elevated')).toBe(false);
    });
  });

  describe('Padding', () => {
    it('should apply md padding by default', () => {
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-padding-md')).toBe(true);
    });

    it('should apply none padding when specified', () => {
      component.padding = 'none';
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-padding-none')).toBe(true);
    });

    it('should apply xs padding when specified', () => {
      component.padding = 'xs';
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-padding-xs')).toBe(true);
    });

    it('should apply sm padding when specified', () => {
      component.padding = 'sm';
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-padding-sm')).toBe(true);
    });

    it('should apply lg padding when specified', () => {
      component.padding = 'lg';
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-padding-lg')).toBe(true);
    });
  });

  describe('Border Radius', () => {
    it('should apply md border radius by default', () => {
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-radius-md')).toBe(true);
    });

    it('should apply none border radius when specified', () => {
      component.borderRadius = 'none';
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-radius-none')).toBe(true);
    });

    it('should apply sm border radius when specified', () => {
      component.borderRadius = 'sm';
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-radius-sm')).toBe(true);
    });

    it('should apply lg border radius when specified', () => {
      component.borderRadius = 'lg';
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-radius-lg')).toBe(true);
    });

    it('should apply full border radius when specified', () => {
      component.borderRadius = 'full';
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-radius-full')).toBe(true);
    });
  });

  describe('Clickable State', () => {
    it('should not be clickable by default', () => {
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-clickable')).toBe(false);
    });

    it('should apply clickable class when clickable is true', () => {
      component.clickable = true;
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-clickable')).toBe(true);
    });

    it('should emit cardClick event when clickable card is clicked', () => {
      component.clickable = true;
      fixture.detectChanges();

      const cardElement = getCardElement();
      cardElement.click();
      fixture.detectChanges();

      expect(component.clickCount).toBe(1);
    });

    it('should not emit cardClick event when non-clickable card is clicked', () => {
      component.clickable = false;
      fixture.detectChanges();

      const cardElement = getCardElement();
      cardElement.click();
      fixture.detectChanges();

      expect(component.clickCount).toBe(0);
    });

    it('should have pointer cursor when clickable', () => {
      component.clickable = true;
      fixture.detectChanges();
      const cardElement = getCardElement();
      // Check for the clickable class which applies cursor: pointer in SCSS
      expect(cardElement.classList.contains('card-clickable')).toBe(true);
    });
  });

  describe('Selected State', () => {
    it('should not be selected by default', () => {
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-selected')).toBe(false);
    });

    it('should apply selected class when selected is true', () => {
      component.selected = true;
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-selected')).toBe(true);
    });

    it('should work with clickable state', () => {
      component.clickable = true;
      component.selected = true;
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-clickable')).toBe(true);
      expect(cardElement.classList.contains('card-selected')).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should apply aria-label when provided', () => {
      component.ariaLabel = 'Card description';
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.getAttribute('aria-label')).toBe('Card description');
    });

    it('should not have aria-label by default', () => {
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.getAttribute('aria-label')).toBeNull();
    });

    it('should have role="article" for semantic HTML', () => {
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.getAttribute('role')).toBe('article');
    });

    it('should have role="button" when clickable', () => {
      component.clickable = true;
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.getAttribute('role')).toBe('button');
    });

    it('should have tabindex="0" when clickable', () => {
      component.clickable = true;
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.getAttribute('tabindex')).toBe('0');
    });

    it('should not have tabindex when not clickable', () => {
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.getAttribute('tabindex')).toBeNull();
    });

    it('should emit click on Enter key when clickable', () => {
      component.clickable = true;
      fixture.detectChanges();

      const cardElement = getCardElement();
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      cardElement.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.clickCount).toBe(1);
    });

    it('should emit click on Space key when clickable', () => {
      component.clickable = true;
      fixture.detectChanges();

      const cardElement = getCardElement();
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
      cardElement.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.clickCount).toBe(1);
    });

    it('should not emit click on other keys when clickable', () => {
      component.clickable = true;
      fixture.detectChanges();

      const cardElement = getCardElement();
      const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
      cardElement.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.clickCount).toBe(0);
    });
  });

  describe('Content Projection', () => {
    it('should project default content', () => {
      const testFixture = TestBed.createComponent(TestWrapperComponent);
      testFixture.nativeElement.querySelector('lc-card').innerHTML = '<p>Test content</p>';
      testFixture.detectChanges();

      expect(testFixture.nativeElement.textContent).toContain('Test content');
    });

    it('should support header slot projection', () => {
      const testFixture = TestBed.createComponent(TestWrapperComponent);
      testFixture.nativeElement.querySelector('lc-card').innerHTML =
        '<div class="card-header">Header</div>';
      testFixture.detectChanges();

      const header = testFixture.nativeElement.querySelector('.card-header');
      expect(header).toBeTruthy();
    });

    it('should support content slot projection', () => {
      const testFixture = TestBed.createComponent(TestWrapperComponent);
      testFixture.nativeElement.querySelector('lc-card').innerHTML =
        '<div class="card-content">Content</div>';
      testFixture.detectChanges();

      const content = testFixture.nativeElement.querySelector('.card-content');
      expect(content).toBeTruthy();
    });

    it('should support footer slot projection', () => {
      const testFixture = TestBed.createComponent(TestWrapperComponent);
      testFixture.nativeElement.querySelector('lc-card').innerHTML =
        '<div class="card-footer">Footer</div>';
      testFixture.detectChanges();

      const footer = testFixture.nativeElement.querySelector('.card-footer');
      expect(footer).toBeTruthy();
    });
  });

  describe('Component Initialization', () => {
    it('should have default values on initialization', () => {
      fixture.detectChanges();
      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-elevated')).toBe(true);
      expect(cardElement.classList.contains('card-padding-md')).toBe(true);
      expect(cardElement.classList.contains('card-radius-md')).toBe(true);
      expect(cardElement.classList.contains('card-clickable')).toBe(false);
      expect(cardElement.classList.contains('card-selected')).toBe(false);
    });

    it('should accept all inputs via wrapper', () => {
      component.variant = 'outlined';
      component.padding = 'lg';
      component.borderRadius = 'lg';
      component.clickable = true;
      component.selected = true;
      component.ariaLabel = 'Test label';
      fixture.detectChanges();

      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-outlined')).toBe(true);
      expect(cardElement.classList.contains('card-padding-lg')).toBe(true);
      expect(cardElement.classList.contains('card-radius-lg')).toBe(true);
      expect(cardElement.classList.contains('card-clickable')).toBe(true);
      expect(cardElement.classList.contains('card-selected')).toBe(true);
      expect(cardElement.getAttribute('aria-label')).toBe('Test label');
    });
  });

  describe('Class Combinations', () => {
    it('should combine variant, padding, and radius classes', () => {
      component.variant = 'outlined';
      component.padding = 'lg';
      component.borderRadius = 'sm';
      fixture.detectChanges();

      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-outlined')).toBe(true);
      expect(cardElement.classList.contains('card-padding-lg')).toBe(true);
      expect(cardElement.classList.contains('card-radius-sm')).toBe(true);
    });

    it('should combine clickable and selected classes', () => {
      component.clickable = true;
      component.selected = true;
      fixture.detectChanges();

      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card-clickable')).toBe(true);
      expect(cardElement.classList.contains('card-selected')).toBe(true);
    });

    it('should apply all classes together', () => {
      component.variant = 'flat';
      component.padding = 'xs';
      component.borderRadius = 'full';
      component.clickable = true;
      component.selected = true;
      fixture.detectChanges();

      const cardElement = getCardElement();
      expect(cardElement.classList.contains('card')).toBe(true);
      expect(cardElement.classList.contains('card-flat')).toBe(true);
      expect(cardElement.classList.contains('card-padding-xs')).toBe(true);
      expect(cardElement.classList.contains('card-radius-full')).toBe(true);
      expect(cardElement.classList.contains('card-clickable')).toBe(true);
      expect(cardElement.classList.contains('card-selected')).toBe(true);
    });
  });

  describe('Icon size', () => {
    let iconFixture: ComponentFixture<CardComponent>;

    beforeEach(() => {
      iconFixture = TestBed.createComponent(CardComponent);
      iconFixture.componentRef.setInput('title', 'Section');
      iconFixture.componentRef.setInput('icon', 'settings');
    });

    it('applies the md tile size by default', () => {
      iconFixture.detectChanges();
      const tile = iconFixture.nativeElement.querySelector('.card__icon');
      expect(tile.classList).toContain('card__icon--size-md');
    });

    it('applies the sm tile size when iconSize="sm"', () => {
      iconFixture.componentRef.setInput('iconSize', 'sm');
      iconFixture.detectChanges();
      const tile = iconFixture.nativeElement.querySelector('.card__icon');
      expect(tile.classList).toContain('card__icon--size-sm');
    });
  });

  describe('card-badge slot', () => {
    it('projects a badge into the title row and hides the empty slot otherwise', async () => {
      @Component({
        standalone: true,
        imports: [CardComponent],
        template: `
          <lc-card title="With slot"><span card-badge class="probe">Ready</span></lc-card>
          <lc-card title="No slot"></lc-card>
        `,
      })
      class BadgeSlotHost {}

      const f = TestBed.createComponent(BadgeSlotHost);
      f.detectChanges();
      const cards = f.nativeElement.querySelectorAll('lc-card');
      expect(cards[0].querySelector('.card__title-row .probe')?.textContent).toContain('Ready');
      expect(cards[1].querySelector('.card__badge-slot')?.textContent?.trim()).toBe('');
    });
  });

  describe('3.3: Weite cards (LK-9, LK-10) and heading level (G-9)', () => {
    it('applies the xl radius (24 px)', () => {
      component.borderRadius = 'xl';
      fixture.detectChanges();
      expect(getCardElement().classList).toContain('card-radius-xl');
    });

    it.each<CardVariant>(['raised', 'dashed'])('applies the %s variant', (variant) => {
      component.variant = variant;
      fixture.detectChanges();
      expect(getCardElement().classList).toContain(`card-${variant}`);
    });

    it('never makes the dashed tile interactive, even when clickable is set', () => {
      component.variant = 'dashed';
      component.clickable = true;
      component.selected = true;
      fixture.detectChanges();
      const el = getCardElement();
      expect(el.getAttribute('role')).toBe('article');
      expect(el.getAttribute('tabindex')).toBeNull();
      expect(el.classList).not.toContain('card-clickable');
      expect(el.classList).not.toContain('card-selected');

      el.click();
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(component.clickCount).toBe(0);
    });

    it.each<[CardHeadingLevel, string]>([
      [2, 'H2'],
      [3, 'H3'],
      [4, 'H4'],
      [5, 'H5'],
      [6, 'H6'],
    ])('renders the title as heading level %s', (level, tag) => {
      const f = TestBed.createComponent(CardComponent);
      f.componentRef.setInput('title', 'Abschnitt');
      f.componentRef.setInput('headingLevel', level);
      f.detectChanges();
      const title = f.nativeElement.querySelector('.card__title') as HTMLElement;
      expect(title.tagName).toBe(tag);
      expect(title.textContent?.trim()).toBe('Abschnitt');
    });

    it('keeps h3 as the default heading level', () => {
      const f = TestBed.createComponent(CardComponent);
      f.componentRef.setInput('title', 'Abschnitt');
      f.detectChanges();
      expect(f.nativeElement.querySelector('.card__title').tagName).toBe('H3');
    });

    describe('stylesheet', () => {
      // jsdom applies no stylesheets: read the contract from the compiled CSS.
      const css = compile(join(__dirname, 'card.component.scss'), {
        loadPaths: [join(__dirname, '../../styles')],
      }).css;
      const rule = (selector: string): string => {
        const start = css.indexOf(`${selector} {`);
        expect(start).toBeGreaterThan(-1);
        return css.slice(start, css.indexOf('}', start));
      };

      it('gives xl a 24 px radius', () => {
        expect(rule('.card-radius-xl')).toMatch(/border-radius:\s*var\(--border-radius-xl, 1\.5rem\)/);
      });

      it('draws the outlined card with the hairline border and no shadow', () => {
        const outlined = rule('.card-outlined');
        expect(outlined).toMatch(/border:\s*1px solid var\(--color-border\)/);
        expect(outlined).not.toMatch(/box-shadow/);
      });

      it('draws the raised card with the auth shadow and no gradient', () => {
        const raised = rule('.card-raised');
        expect(raised).toMatch(/box-shadow:\s*var\(--shadow-auth-card/);
        expect(raised).toMatch(/background-image:\s*none/);
      });

      it('draws the dashed tile on the muted-tile tokens in secondary ink', () => {
        const dashed = rule('.card-dashed');
        expect(dashed).toMatch(/background-color:\s*var\(--color-muted-tile,/);
        expect(dashed).toMatch(/border:\s*1px dashed var\(--color-muted-tile-border,/);
        expect(dashed).toMatch(/color:\s*var\(--color-text-secondary\)/);
        expect(css).toMatch(/\.card-dashed lc-icon\s*{[^}]*--color-muted-tile-icon/);
      });
    });
  });

  /**
   * 3.38 (request 058, follow-up 057-s1, design §3): one-space text nodes
   * between the card's parts (title, projected badge, badge, subtitle,
   * header action, `[card-header]`, body, footer), so its text has word breaks
   * (textContent, accessible names, copied text). Each sits between flex
   * items and renders nothing; the look is proven by the story shots.
   */
  describe('3.38: word breaks between the parts (request 058, AC-1, AC-2, AC-4)', () => {
    type Mode = 'plain' | 'collapsible' | 'link';

    @Component({
      standalone: true,
      imports: [CardComponent],
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
        @for (mode of modes; track mode) {
          <lc-card
            lang="de"
            title="Regeln"
            badge="3"
            subtitle="Fassung 1"
            [collapsible]="mode === 'collapsible'"
            [href]="mode === 'link' ? '#regeln' : undefined"
          >
            <span card-badge>Neu</span>
            <span card-header-action>Bearbeiten</span>
            <div card-header>Kopf</div>
            <p>aus USM übernommen 1</p>
            <div card-footer>Stand heute</div>
          </lc-card>
        }
      `,
    })
    class PartsHost {
      readonly modes: Mode[] = ['plain', 'collapsible', 'link'];
    }

    const normalised = (el: Element) => (el.textContent ?? '').replace(/\s+/g, ' ').trim();

    it.each<[Mode, number]>([
      ['plain', 0],
      ['collapsible', 1],
      ['link', 2],
    ])('AC-1: the %s card reads „Regeln Neu 3 Fassung 1 Bearbeiten Kopf aus USM übernommen 1 Stand heute“', (_mode, index) => {
      const f = TestBed.createComponent(PartsHost);
      f.detectChanges();
      const card = (f.nativeElement as HTMLElement).querySelectorAll('lc-card')[index];
      expect(normalised(card)).toBe('Regeln Neu 3 Fassung 1 Bearbeiten Kopf aus USM übernommen 1 Stand heute');
      // Plain spaces only, and none inside the title, the toggle or the link.
      expect(card.textContent).not.toContain(String.fromCharCode(0xa0));
      expect(card.querySelector('.card__title')?.textContent).toBe('Regeln');
      f.destroy();
    });

    it('AC-4: the toggle and the link keep their names; the badge slot stays empty-able', () => {
      const f = TestBed.createComponent(PartsHost);
      f.detectChanges();
      const [, collapsible, link] = Array.from((f.nativeElement as HTMLElement).querySelectorAll('lc-card'));
      expect(collapsible.querySelector('.card__toggle')?.textContent).toBe('Regeln');
      expect(link.querySelector('a.card__link')?.textContent).toBe('Regeln');
      f.destroy();

      const bare = TestBed.createComponent(CardComponent);
      bare.componentRef.setInput('title', 'Ohne Abzeichen');
      bare.detectChanges();
      // The separators sit outside the slot, so `:empty` still hides it.
      expect((bare.nativeElement as HTMLElement).querySelector('.card__badge-slot')?.childNodes.length).toBe(0);
      bare.destroy();
    });

    it('the separators are seven text nodes of one space, all between flex items', () => {
      const f = TestBed.createComponent(PartsHost);
      f.detectChanges();
      const card = (f.nativeElement as HTMLElement).querySelector('lc-card') as HTMLElement;
      const spaces: string[] = [];
      const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!(n.textContent ?? '').trim()) spaces.push(`${(n.parentElement as Element).className.split(' ')[0]}:${JSON.stringify(n.textContent)}`);
      }
      expect(spaces).toEqual([
        'card__title-row:" "', // S1 title ↔ projected badge
        'card__title-row:" "', // S2 projected badge ↔ badge
        'card__title-row:" "', // S3 badge ↔ subtitle
        'card__header:" "', // S4 subtitle ↔ header action
        'card:" "', // S5 head ↔ [card-header]
        'card:" "', // S6 [card-header] ↔ body
        'card:" "', // S7 body ↔ footer
      ]);
      f.destroy();
    });

    it('a card without a title has only the spaces around the body', () => {
      const f = TestBed.createComponent(CardComponent);
      f.detectChanges();
      const card = (f.nativeElement as HTMLElement).querySelector('.card') as HTMLElement;
      const texts = Array.from(card.childNodes).filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent);
      expect(texts).toEqual([' ', ' ']);
      f.destroy();
    });

    describe('AC-2: a clickable card named by its visible text', () => {
      let restoreCanvas: () => void;
      beforeAll(() => (restoreCanvas = installFakeCanvas()));
      afterAll(() => restoreCanvas());

      @Component({
        standalone: true,
        imports: [CardComponent],
        changeDetection: ChangeDetectionStrategy.OnPush,
        template: `
          <lc-card lang="de" variant="outlined" [clickable]="true" title="Regeln" badge="3" badgeVariant="primary"
            ariaLabel="Regeln 3 aus USM übernommen 1 im Modul gepflegt 2">
            <dl><div><dt>aus USM übernommen</dt>&ngsp;<dd>1</dd></div>&ngsp;<div><dt>im Modul gepflegt</dt>&ngsp;<dd>2</dd></div></dl>
          </lc-card>
        `,
      })
      class NamedHost {}

      const run = (root: Element) => axe.run(root, { runOnly: [LABEL_IN_NAME, 'nested-interactive'] });

      it('passes label-content-name-mismatch and nested-interactive', async () => {
        const f = TestBed.createComponent(NamedHost);
        f.detectChanges();
        const card = (f.nativeElement as HTMLElement).querySelector('[role="button"]') as HTMLElement;
        expect(normalised(card)).toBe('Regeln 3 aus USM übernommen 1 im Modul gepflegt 2');
        const results = await run(f.nativeElement as Element);
        expect(outcome(results, LABEL_IN_NAME)).toBe('pass');
        expect(outcome(results, 'nested-interactive')).toBe('pass');
        f.destroy();
      });

      it('negative control: without the separators (3.37) title and body run together and the rule fails', async () => {
        const f = TestBed.createComponent(NamedHost);
        f.detectChanges();
        const card = (f.nativeElement as HTMLElement).querySelector('[role="button"]') as HTMLElement;
        const blanks: Text[] = [];
        const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          if (!(n.textContent ?? '').trim() && (n.parentElement as Element).className.startsWith('card')) blanks.push(n as Text);
        }
        blanks.forEach((n) => n.remove());
        expect(card.textContent).toMatch(/^Regeln3aus USM/);
        expect(outcome(await run(f.nativeElement as Element), LABEL_IN_NAME)).toBe('violation');
        f.destroy();
      });
    });
  });
});

