import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'sass';
import { audit, violations } from '../../testing/axe-jsdom';
import { CheckboxComponent } from './checkbox.component';
import { CheckboxGroupComponent } from './checkbox-group.component';

/** Request 062: read-only (usm-x 10), disabled checked (061-s1), border (061-s3), indent and lg row (061-n1/n2). */

@Component({
  imports: [CheckboxComponent, ReactiveFormsModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-checkbox
      label="Freigabe"
      [readonly]="readonly()"
      [disabled]="disabled()"
      [(checked)]="checked"
      [(indeterminate)]="indeterminate"
      (checkedChange)="changes.push($event)"
    />
    <lc-checkbox label="Formular" [readonly]="readonly()" [formControl]="control" />
    <lc-checkbox label="Modell" [readonly]="readonly()" [(ngModel)]="model" />
  `,
})
class HostComponent {
  readonly readonly = signal(true);
  readonly disabled = signal(false);
  readonly checked = signal(true);
  readonly indeterminate = signal(false);
  readonly control = new FormControl(true, { nonNullable: true });
  model = false;
  readonly changes: boolean[] = [];
}

@Component({
  imports: [CheckboxGroupComponent, CheckboxComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <lc-checkbox-group legend="Rollen" [readonly]="groupReadonly()" [(value)]="value" (valueChange)="changes.push($event)">
      <lc-checkbox value="lesen" label="Lesen" />
      <lc-checkbox value="bearbeiten" label="Bearbeiten" />
      <lc-checkbox value="verwalten" label="Verwalten" [readonly]="itemReadonly()" />
    </lc-checkbox-group>
  `,
})
class GroupHostComponent {
  readonly groupReadonly = signal(true);
  readonly itemReadonly = signal(false);
  readonly value = signal<string[]>(['lesen', 'bearbeiten']);
  readonly changes: string[][] = [];
}

const SCSS = readFileSync(resolve(__dirname, 'checkbox.component.scss'), 'utf-8');

describe('lc-checkbox request 062', () => {
  describe('readonly (AC-3)', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    const inputs = () =>
      Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('input')) as HTMLInputElement[];
    const labels = () =>
      Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('label')) as HTMLLabelElement[];

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
      fixture = TestBed.createComponent(HostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    });

    it('click (also on the label) and Space change nothing and emit nothing', () => {
      const [box] = inputs();
      box.click();
      labels()[0].click();
      fixture.detectChanges();
      expect(box.checked).toBe(true);
      expect(host.checked()).toBe(true);
      expect(host.changes).toEqual([]);
    });

    it('keeps the indeterminate state', () => {
      host.indeterminate.set(true);
      fixture.detectChanges();
      const [box] = inputs();
      box.click();
      fixture.detectChanges();
      expect(box.indeterminate).toBe(true);
      expect(host.indeterminate()).toBe(true);
      expect(host.changes).toEqual([]);
    });

    it('writes nothing to a form control or ngModel', async () => {
      const [, formBox, modelBox] = inputs();
      formBox.click();
      modelBox.click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(host.control.value).toBe(true);
      expect(formBox.checked).toBe(true);
      expect(host.model).toBe(false);
      expect(modelBox.checked).toBe(false);
    });

    it('stays focusable with aria-readonly="true", not disabled, not dimmed', () => {
      const [box] = inputs();
      expect(box.getAttribute('aria-readonly')).toBe('true');
      expect(box.tabIndex).toBe(0);
      expect(box.disabled).toBe(false);
      expect(box.hasAttribute('aria-disabled')).toBe(false);
      expect(labels()[0].classList).toContain('checkbox-readonly');
      expect(labels()[0].classList).not.toContain('checkbox-disabled');
      box.focus();
      expect(document.activeElement).toBe(box);
    });

    it('disabled wins: no aria-readonly, no readonly class', () => {
      host.disabled.set(true);
      fixture.detectChanges();
      const [box] = inputs();
      expect(box.hasAttribute('aria-readonly')).toBe(false);
      expect(labels()[0].classList).not.toContain('checkbox-readonly');
      expect(labels()[0].classList).toContain('checkbox-disabled');
    });

    it('toggles again once readonly is off', () => {
      host.readonly.set(false);
      fixture.detectChanges();
      const [box] = inputs();
      expect(box.hasAttribute('aria-readonly')).toBe(false);
      box.click();
      fixture.detectChanges();
      expect(host.checked()).toBe(false);
      expect(host.changes).toEqual([false]);
    });

    it('axe has no violations', async () => {
      expect(violations(await audit(fixture.nativeElement as HTMLElement))).toEqual([]);
    });
  });

  describe('readonly in lc-checkbox-group (AC-3)', () => {
    let fixture: ComponentFixture<GroupHostComponent>;
    let host: GroupHostComponent;
    const inputs = () =>
      Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('input')) as HTMLInputElement[];
    const render = () => {
      fixture.detectChanges();
      fixture.detectChanges();
    };

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [GroupHostComponent] }).compileComponents();
      fixture = TestBed.createComponent(GroupHostComponent);
      host = fixture.componentInstance;
      render();
    });

    it('the group flag makes every checkbox read-only; the value does not change', () => {
      expect(inputs().every((i) => i.getAttribute('aria-readonly') === 'true')).toBe(true);
      inputs().forEach((i) => i.click());
      render();
      expect(host.value()).toEqual(['lesen', 'bearbeiten']);
      expect(host.changes).toEqual([]);
      expect(inputs().map((i) => i.checked)).toEqual([true, true, false]);
      const fieldset = (fixture.nativeElement as HTMLElement).querySelector('fieldset') as HTMLFieldSetElement;
      expect(fieldset.hasAttribute('aria-readonly')).toBe(false);
      expect(fieldset.disabled).toBe(false);
    });

    it('per item: only the read-only checkbox is locked', () => {
      host.groupReadonly.set(false);
      host.itemReadonly.set(true);
      render();
      expect(inputs().map((i) => i.getAttribute('aria-readonly'))).toEqual([null, null, 'true']);
      inputs()[2].click();
      render();
      expect(host.value()).toEqual(['lesen', 'bearbeiten']);
      inputs()[0].click();
      render();
      expect(host.value()).toEqual(['bearbeiten']);
    });

    it('axe has no violations', async () => {
      expect(violations(await audit(fixture.nativeElement as HTMLElement))).toEqual([]);
    });
  });

  describe('defaults and styles', () => {
    it('a default checkbox renders no readonly attribute or class (unchanged default)', async () => {
      await TestBed.configureTestingModule({ imports: [CheckboxComponent] }).compileComponents();
      const fixture = TestBed.createComponent(CheckboxComponent);
      fixture.componentRef.setInput('id', 'cb');
      fixture.detectChanges();
      const label = (fixture.nativeElement as HTMLElement).querySelector('label') as HTMLLabelElement;
      const box = label.querySelector('input') as HTMLInputElement;
      expect(label.className).toBe('checkbox-label checkbox-md');
      expect(box.getAttributeNames()).toEqual([
        'type',
        'role',
        'class',
        'id',
        'tabindex',
      ]);
    });

    it('AC-1: a disabled checked or indeterminate box keeps the fill (text .5, box .75)', () => {
      const rule = SCSS.match(
        /&\.checkbox-disabled\.checkbox-checked,\s*&\.checkbox-disabled\.checkbox-indeterminate \{([^]*?)\n {2}\}/,
      );
      expect(rule).not.toBeNull();
      const body = (rule as RegExpMatchArray)[1];
      expect(body).toMatch(/^\s*opacity: 1;/);
      expect(body).toMatch(/\.checkbox-label-text \{\s*opacity: 0\.5;\s*\}/);
      expect(body).toMatch(
        /\.checkbox-box \{\s*background-color: var\(--color-primary-fill\);\s*border-color: var\(--color-primary-fill\);\s*opacity: 0\.75;\s*\}/,
      );
    });

    it('AC-2: the box border is --color-field-border; the error border --color-error-600', () => {
      expect(SCSS).toMatch(/\.checkbox-box \{[^}]*border: 2px solid var\(--color-field-border\);/);
      expect(SCSS).not.toMatch(/var\(--color-neutral-400\)/);
      expect(SCSS).not.toMatch(/var\(--color-error\)/);
      expect(SCSS).toMatch(/\.checkbox-error & \{\s*border-color: var\(--color-error-600\);/);
    });

    it('AC-3: read-only = muted box, field border, check in the text colour; no hover', () => {
      expect(SCSS).toMatch(
        /&\.checkbox-readonly \{\s*cursor: default;\s*\.checkbox-box \{\s*background-color: var\(--color-surface-muted\);\s*border-color: var\(--color-field-border\);\s*\}\s*\.checkbox-icon \{\s*color: var\(--color-text-primary\);/,
      );
      expect(SCSS).toMatch(/&:hover:not\(\.checkbox-disabled\)[^{]*:not\(\.checkbox-readonly\) \{/);
    });

    it('AC-4: every size sets --checkbox-size on the label and its following siblings', () => {
      for (const [size, rem] of [
        ['xs', '1rem'],
        ['sm', '1.125rem'],
        ['md', '1.25rem'],
        ['lg', '1.5rem'],
      ]) {
        expect(SCSS).toMatch(
          new RegExp(`\\.checkbox-${size},\\s*\\.checkbox-${size} ~ \\* \\{\\s*--checkbox-size: ${rem.replace('.', '\\.')};`),
        );
      }
    });

    it('AC-5: an lg row is 44 px alone and in a group', () => {
      expect(SCSS).toMatch(/\.checkbox-lg \{[^}]*min-height: 2\.75rem;/);
      expect(SCSS).not.toMatch(/\.checkbox-in-group/);
    });

    it('AC-22 (r1): forced colours draw the check in CanvasText, GrayText when disabled, readonly included', () => {
      const css = compile(resolve(__dirname, 'checkbox.component.scss')).css;
      const media = css.indexOf('@media (forced-colors: active)');
      const forced = css.slice(media);
      expect(forced).toMatch(
        /\.checkbox-label \.checkbox-icon,\s*\.checkbox-label\.checkbox-readonly \.checkbox-icon \{\s*color: CanvasText;\s*forced-color-adjust: none;\s*\}\s*\.checkbox-label\.checkbox-disabled \.checkbox-icon \{\s*color: GrayText;\s*\}/,
      );
      // Same (0,3,0) weight as the read-only ink: the forced rule must come later.
      expect(css.indexOf('.checkbox-label.checkbox-readonly .checkbox-icon {')).toBeGreaterThan(-1);
      expect(media).toBeGreaterThan(css.indexOf('.checkbox-label.checkbox-readonly .checkbox-icon {'));
    });
  });
});
