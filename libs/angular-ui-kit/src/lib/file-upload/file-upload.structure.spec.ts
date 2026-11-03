import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { resolve } from 'path';
import { compile } from 'sass';
import { FileUploadComponent, FileUploadFile } from './file-upload.component';

/**
 * Request 040 (3.25.2, design 040 §2, §9): the native file input sits beside
 * the `role="button"` zone instead of inside it (axe `nested-interactive`).
 * The zone keeps its role, name, tab stop, ring, click, key and drag handling.
 * Jest loads no component styles, so the compiled SCSS goes into the document
 * where a test reads computed styles (`visibility`, `pointer-events`).
 */
const COMPONENT_CSS = '\n' + compile(resolve(__dirname, 'file-upload.component.scss')).css;

@Component({
  standalone: true,
  imports: [FileUploadComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form>
      <lc-file-upload
        [disabled]="disabled()"
        [multiple]="multiple()"
        [accept]="accept()"
        [maxSizeBytes]="maxSizeBytes()"
        (filesSelected)="selected.push($event)"
      />
    </form>
  `,
})
class HostComponent {
  readonly disabled = signal(false);
  readonly multiple = signal(true);
  readonly accept = signal('');
  readonly maxSizeBytes = signal(0);
  readonly selected: FileUploadFile[][] = [];
}

/** A focusable or interactive element (design 040 §9 AC-3). */
const INTERACTIVE = 'a[href],button,input,select,textarea,[tabindex],[role=button]';
const FORM_CONTROL = 'a[href],button,input,select,textarea';

/** Interactive elements inside `root` that have an interactive ancestor inside `root`. */
function nested(root: HTMLElement): string[] {
  return [...root.querySelectorAll<HTMLElement>(INTERACTIVE)]
    .filter((el) => {
      const outer = el.parentElement?.closest(INTERACTIVE);
      return !!outer && root.contains(outer);
    })
    .map((el) => `${el.tagName.toLowerCase()}.${el.className}`);
}

/** `aria-hidden="true"` elements that are focusable, a form control or hold one. */
function hiddenFocusables(root: HTMLElement): Element[] {
  return [...root.querySelectorAll('[aria-hidden="true"]')].filter(
    (el) => el.hasAttribute('tabindex') || el.matches(FORM_CONTROL) || !!el.querySelector(`${FORM_CONTROL},[tabindex]`),
  );
}

/** Elements Tab reaches, in DOM order (enabled, tabIndex ≥ 0, rendered and visible). */
function tabStops(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(`${FORM_CONTROL},[tabindex]`)].filter((el) => {
    const style = getComputedStyle(el);
    return !(el as HTMLButtonElement).disabled && el.tabIndex >= 0 && style.visibility !== 'hidden' && style.display !== 'none';
  });
}

/** A file of `size` bytes without allocating them. */
function file(name: string, size = 10): File {
  const f = new File(['x'], name);
  Object.defineProperty(f, 'size', { value: size });
  return f;
}

describe('lc-file-upload structure: input beside the zone (3.25.2, request 040)', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let style: HTMLStyleElement;

  beforeAll(() => {
    style = document.head.appendChild(document.createElement('style'));
    style.textContent = COMPONENT_CSS;
  });

  afterAll(() => style.remove());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideHttpClient(withXhr())],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const root = () => fixture.nativeElement.querySelector('lc-file-upload') as HTMLElement;
  const zone = () => root().querySelector('.file-upload') as HTMLElement;
  const input = () => root().querySelector('input[type="file"]') as HTMLInputElement;
  const removeButtons = () => [...root().querySelectorAll<HTMLButtonElement>('.file-upload__file-remove')];
  /** jsdom has no DragEvent: a plain drag event with a `dataTransfer`. */
  const drag = (type: string, target: Element, ...files: File[]) => {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', { value: { files } });
    target.dispatchEvent(event);
    fixture.detectChanges();
  };
  const key = (k: string, repeat = false) => {
    const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, repeat });
    zone().dispatchEvent(event);
    return event;
  };
  /** Counts `input.click()` calls; calls through, so a click bubbling back into the zone would count twice. */
  const spyOpen = () => jest.spyOn(input(), 'click');
  const withFiles = () => drag('drop', zone(), file('a.csv'), file('b.csv'));
  const setDisabled = (value: boolean) => {
    host.disabled.set(value);
    fixture.detectChanges();
  };

  describe('DOM (AC-3)', () => {
    it('renders the input first, then the zone, as siblings in the host', () => {
      expect([...root().children].map((el) => `${el.tagName.toLowerCase()}.${el.className}`)).toEqual([
        'input.file-upload__input',
        'div.file-upload',
      ]);
      expect(zone().contains(input())).toBe(false);
    });

    it.each<[string, boolean, boolean]>([
      ['enabled, no files', false, false],
      ['enabled, with files', false, true],
      ['disabled, no files', true, false],
      ['disabled, with files', true, true],
    ])('nests no interactive element and hides no focusable one: %s', (_, disabled, files) => {
      if (files) withFiles();
      setDisabled(disabled);
      expect(removeButtons().length).toBe(files ? 2 : 0);
      expect(nested(root())).toEqual([]);
      expect(hiddenFocusables(root())).toEqual([]);
    });

    it('finds a control placed inside the zone (negative control)', () => {
      zone().appendChild(document.createElement('button'));
      expect(nested(root())).toEqual(['button.']);
    });

    it('hides the input with visibility: hidden and keeps its other declarations', () => {
      const rule = COMPONENT_CSS.match(/\n\.file-upload__input \{([^}]*)\}/)?.[1].replace(/\s+/g, ' ').trim();
      expect(rule).toBe('position: absolute; width: 0; height: 0; overflow: hidden; opacity: 0; visibility: hidden;');
      expect(getComputedStyle(input()).visibility).toBe('hidden');
    });

    it('lets pointer events through the content to the zone (no dragleave over the children)', () => {
      expect(getComputedStyle(root().querySelector('.file-upload__content') as HTMLElement).pointerEvents).toBe('none');
    });
  });

  describe('keyboard (AC-4)', () => {
    it('has one tab stop for the zone, then one per remove button', () => {
      expect(tabStops(root())).toEqual([zone()]);
      withFiles();
      expect(tabStops(root())).toEqual([zone(), ...removeButtons()]);
    });

    it.each(['Enter', ' '])('opens the picker once on "%s" and prevents the default (no page scroll)', (k) => {
      const open = spyOpen();
      const event = key(k);
      expect(open).toHaveBeenCalledTimes(1);
      expect(event.defaultPrevented).toBe(true);
    });

    it.each(['Enter', ' '])('ignores an auto-repeated "%s"', (k) => {
      const open = spyOpen();
      const event = key(k, true);
      expect(open).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('click (AC-5)', () => {
    it.each(['.file-upload', '.file-upload__content', '.file-upload__icon', '.file-upload__hint'])(
      'opens the picker once on a click on %s',
      (selector) => {
        const open = spyOpen();
        (root().querySelector(selector) as HTMLElement).click();
        expect(open).toHaveBeenCalledTimes(1);
      },
    );

    it('opens the picker once on a click on an accepted line', () => {
      host.accept.set('.csv');
      host.maxSizeBytes.set(1024);
      fixture.detectChanges();
      const lines = [...root().querySelectorAll<HTMLElement>('.file-upload__accept')];
      expect(lines.length).toBe(2);
      const open = spyOpen();
      lines.forEach((line) => line.click());
      expect(open).toHaveBeenCalledTimes(2);
    });

    it('does not open the picker on a click on a remove button', () => {
      withFiles();
      const open = spyOpen();
      removeButtons()[0].click();
      fixture.detectChanges();
      expect(open).not.toHaveBeenCalled();
      expect(host.selected.at(-1)?.map((f) => f.name)).toEqual(['b.csv']);
    });
  });

  describe('drag and drop (AC-6)', () => {
    it('sets the drag-over class on dragover, clears it on dragleave and adds dropped files', () => {
      drag('dragover', zone());
      expect(zone().classList).toContain('file-upload--drag-over');
      drag('dragleave', zone());
      expect(zone().classList).not.toContain('file-upload--drag-over');
      drag('dragover', zone());
      drag('drop', zone(), file('ist.csv'));
      expect(zone().classList).not.toContain('file-upload--drag-over');
      expect(host.selected.at(-1)?.map((f) => f.name)).toEqual(['ist.csv']);
    });
  });

  describe('disabled (AC-8)', () => {
    it('keeps the enabled zone in the tab order with aria-disabled="false"', () => {
      expect(zone().getAttribute('tabindex')).toBe('0');
      expect(zone().getAttribute('aria-disabled')).toBe('false');
      expect(input().disabled).toBe(false);
    });

    it('takes the zone out of the tab order and opens nothing', () => {
      setDisabled(true);
      expect(zone().getAttribute('role')).toBe('button');
      expect(zone().hasAttribute('tabindex')).toBe(false);
      expect(zone().getAttribute('aria-disabled')).toBe('true');
      expect(input().disabled).toBe(true);
      expect(tabStops(root())).toEqual([]);
      const open = spyOpen();
      key('Enter');
      key(' ');
      zone().click();
      expect(open).not.toHaveBeenCalled();
      setDisabled(false);
      expect(zone().getAttribute('tabindex')).toBe('0');
    });
  });

  describe('form (AC-16)', () => {
    it('keeps the input in the wrapping form, without a name and without a form entry', () => {
      const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
      expect(input().form).toBe(form);
      expect(input().name).toBe('');
      expect([...new FormData(form).keys()]).toEqual([]);
    });

    it('reads files after a pick and resets the value for the next pick', () => {
      Object.defineProperty(input(), 'files', { value: [file('ist.csv')], configurable: true });
      input().dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(host.selected.at(-1)?.map((f) => f.name)).toEqual(['ist.csv']);
      expect(input().value).toBe('');
    });
  });
});

describe('lc-file-upload default rendering (3.25.2, request 040)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadComponent],
      providers: [provideHttpClient(withXhr())],
    }).compileComponents();
  });

  it('renders the default zone as 3.25.1 did, without the input inside', () => {
    const fixture = TestBed.createComponent(FileUploadComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const zoneEl = el.querySelector('.file-upload') as HTMLElement;
    const attrs = Object.fromEntries(zoneEl.getAttributeNames().filter((n) => !n.startsWith('_ng')).map((n) => [n, zoneEl.getAttribute(n)]));
    expect(attrs).toEqual({
      role: 'button',
      class: 'file-upload',
      tabindex: '0',
      'aria-label': 'Drag & drop files here, or click to browse',
      'aria-disabled': 'false',
    });
    const content = zoneEl.innerHTML.replace(/ _ng(content|host)-[a-z0-9-]+=""/g, '').replace(/<!--[\s\S]*?-->/g, '');
    // The zone's children as rendered by 3.25.1 after its input (one-off comparison, build.md 040).
    expect(content).toBe(
      '<div class="file-upload__content"><lc-icon name="cloud-arrow-up" class="file-upload__icon">' +
        '<div class="icon-container icon-md icon-outline"></div></lc-icon>' +
        '<p class="file-upload__hint">Drag &amp; drop files here, or click to browse</p></div>',
    );
  });
});
