import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  let buttonElement: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    buttonElement = fixture.debugElement.query(By.css('button')).nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Variants', () => {
    it('should render primary variant by default', () => {
      expect(buttonElement.classList).toContain('btn-primary');
    });

    it('should render secondary variant', () => {
      fixture.componentRef.setInput('variant', 'secondary');
      fixture.detectChanges();
      expect(buttonElement.classList).toContain('btn-secondary');
    });

    it('should render outline variant', () => {
      fixture.componentRef.setInput('variant', 'outline');
      fixture.detectChanges();
      expect(buttonElement.classList).toContain('btn-outline');
    });

    it('should render ghost variant', () => {
      fixture.componentRef.setInput('variant', 'ghost');
      fixture.detectChanges();
      expect(buttonElement.classList).toContain('btn-ghost');
    });

    it('should render link variant', () => {
      fixture.componentRef.setInput('variant', 'link');
      fixture.detectChanges();
      expect(buttonElement.classList).toContain('btn-link');
    });

    it('should render danger variant', () => {
      fixture.componentRef.setInput('variant', 'danger');
      fixture.detectChanges();
      expect(buttonElement.classList).toContain('btn-danger');
    });

    // 3.13 (G-WL1): the same list as a[lcButton] (button-link.component.spec.ts).
    it.each(['primary', 'secondary', 'outline', 'ghost', 'link', 'danger', 'warning', 'info', 'inverse'])(
      'sets exactly one variant class for %s',
      (variant) => {
        fixture.componentRef.setInput('variant', variant);
        fixture.detectChanges();
        const variantClasses = [...buttonElement.classList].filter((c) =>
          /^btn-(primary|secondary|outline|ghost|link|danger|warning|info|inverse)$/.test(c),
        );
        expect(variantClasses).toEqual([`btn-${variant}`]);
      },
    );

    it('the default button has exactly the classes of 3.12', () => {
      expect([...buttonElement.classList]).toEqual(['btn', 'btn-primary', 'btn-md']);
    });
  });

  describe('Sizes', () => {
    it('should render md size by default', () => {
      expect(buttonElement.classList).toContain('btn-md');
    });

    it('should render xs size', () => {
      fixture.componentRef.setInput('size', 'xs');
      fixture.detectChanges();
      expect(buttonElement.classList).toContain('btn-xs');
    });

    it('should render sm size', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(buttonElement.classList).toContain('btn-sm');
    });

    it('should render lg size', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(buttonElement.classList).toContain('btn-lg');
    });
  });

  describe('States', () => {
    it('should be enabled by default', () => {
      expect(buttonElement.disabled).toBe(false);
    });

    it('should be disabled when disabled prop is true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(buttonElement.disabled).toBe(true);
    });

    it('should not emit click event when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      let clicked = false;
      component.clicked.subscribe(() => (clicked = true));

      buttonElement.click();
      expect(clicked).toBe(false);
    });

    it('should show loading state', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('.loading-spinner'));
      expect(spinner).toBeTruthy();
    });

    // 3.17 (request 021, AC-5): `loading` no longer sets the native `disabled`,
    // so a focused button keeps focus; it is aria-disabled and ignores clicks
    // (see button.loading.spec.ts). Was: "should be disabled when loading".
    it('is aria-disabled, not disabled, when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expect(buttonElement.disabled).toBe(false);
      expect(buttonElement.hasAttribute('disabled')).toBe(false);
      expect(buttonElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should not emit click event when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      let clicked = false;
      component.clicked.subscribe(() => (clicked = true));

      buttonElement.click();
      expect(clicked).toBe(false);
    });
  });

  describe('Tooltip (title / disabledReason)', () => {
    it('should have no title attribute by default', () => {
      expect(buttonElement.hasAttribute('title')).toBe(false);
    });

    it('should apply title input as title attribute', () => {
      fixture.componentRef.setInput('title', 'Save the record');
      fixture.detectChanges();
      expect(buttonElement.getAttribute('title')).toBe('Save the record');
    });

    it('should show disabledReason as title while disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.componentRef.setInput('disabledReason', 'Missing permissions');
      fixture.detectChanges();
      expect(buttonElement.getAttribute('title')).toBe('Missing permissions');
    });

    it('should prefer disabledReason over title while disabled', () => {
      fixture.componentRef.setInput('title', 'Save the record');
      fixture.componentRef.setInput('disabled', true);
      fixture.componentRef.setInput('disabledReason', 'Missing permissions');
      fixture.detectChanges();
      expect(buttonElement.getAttribute('title')).toBe('Missing permissions');
    });

    it('should not show disabledReason while enabled', () => {
      fixture.componentRef.setInput('disabledReason', 'Missing permissions');
      fixture.detectChanges();
      expect(buttonElement.hasAttribute('title')).toBe(false);
    });

    it('should show disabledReason while loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.componentRef.setInput('disabledReason', 'Request in flight');
      fixture.detectChanges();
      expect(buttonElement.getAttribute('title')).toBe('Request in flight');
    });

    it('should keep pointer events on the disabled button so the tooltip can appear', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(getComputedStyle(buttonElement).pointerEvents).not.toBe('none');
    });
  });

  describe('Inline', () => {
    it('should not be inline by default', () => {
      expect(buttonElement.classList.contains('btn-inline')).toBe(false);
    });

    it('should apply btn-inline class when inline', () => {
      fixture.componentRef.setInput('inline', true);
      fixture.detectChanges();
      expect(buttonElement.classList.contains('btn-inline')).toBe(true);
    });
  });

  describe('Full Width', () => {
    it('should not be full width by default', () => {
      expect(buttonElement.classList).not.toContain('btn-full-width');
    });

    it('should be full width when fullWidth is true', () => {
      fixture.componentRef.setInput('fullWidth', true);
      fixture.detectChanges();
      expect(buttonElement.classList).toContain('btn-full-width');
    });
  });

  describe('Type Attribute', () => {
    it('should be button type by default', () => {
      expect(buttonElement.type).toBe('button');
    });

    it('should be submit type when specified', () => {
      fixture.componentRef.setInput('type', 'submit');
      fixture.detectChanges();
      expect(buttonElement.type).toBe('submit');
    });

    it('should be reset type when specified', () => {
      fixture.componentRef.setInput('type', 'reset');
      fixture.detectChanges();
      expect(buttonElement.type).toBe('reset');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label when provided', () => {
      fixture.componentRef.setInput('ariaLabel', 'Submit form');
      fixture.detectChanges();
      expect(buttonElement.getAttribute('aria-label')).toBe('Submit form');
    });

    it('should have aria-disabled when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(buttonElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should have aria-busy when loading', () => {
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();
      expect(buttonElement.getAttribute('aria-busy')).toBe('true');
    });
  });

  describe('Events', () => {
    it('should emit click event when clicked', () => {
      let clicked = false;
      component.clicked.subscribe(() => (clicked = true));

      buttonElement.click();
      expect(clicked).toBe(true);
    });

    it('should emit focus event when focused', () => {
      let focused = false;
      component.focused.subscribe(() => (focused = true));

      buttonElement.dispatchEvent(new FocusEvent('focus'));
      expect(focused).toBe(true);
    });

    it('should emit blur event when blurred', () => {
      let blurred = false;
      component.blurred.subscribe(() => (blurred = true));

      buttonElement.dispatchEvent(new FocusEvent('blur'));
      expect(blurred).toBe(true);
    });
  });

  describe('Methods', () => {
    it('should focus button when focus() is called', () => {
      const focusSpy = jest.spyOn(buttonElement, 'focus');
      component.focus();
      expect(focusSpy).toHaveBeenCalled();
    });

    it('should blur button when blur() is called', () => {
      const blurSpy = jest.spyOn(buttonElement, 'blur');
      component.blur();
      expect(blurSpy).toHaveBeenCalled();
    });
  });

  describe('Content Projection', () => {
    it('should project button text content', () => {
      @Component({
        selector: 'lc-test-host',
        standalone: true,
        imports: [ButtonComponent],
        template: '<lc-button>Click me</lc-button>',
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class TestHostComponent {}

      const hostFixture = TestBed.createComponent(TestHostComponent);
      hostFixture.detectChanges();
      const btn = hostFixture.debugElement.query(By.css('button')).nativeElement;

      expect(btn.textContent?.trim()).toBe('Click me');
    });
  });
});
