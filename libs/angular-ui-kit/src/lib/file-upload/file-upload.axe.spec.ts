import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { FileUploadComponent } from './file-upload.component';
import { LABEL_IN_NAME as RULE, audit, computedName, installFakeCanvas, outcome, outcomeFor, violations } from '../../testing/axe-jsdom';

/**
 * Request 015 (AS-33, AC-1, AC-2, AC-5, AC-7): the drop zone
 * (`role="button"`) under axe-core 4.14, named `hint`, then the accepted and
 * max lines it shows.
 *
 * `nested-interactive` (the hidden file input inside the drop zone) existed at
 * 3.11.4 (3 stories in the 1280 px sweep, design.md §9 AC-4) and is out of
 * scope: it is the only violation these audits leave out.
 */
const PRE_EXISTING = ['nested-interactive'];

describe('FileUploadComponent — axe-core 4.14 (AS-33)', () => {
  let fixture: ComponentFixture<FileUploadComponent>;
  let restoreCanvas: () => void;

  beforeAll(() => {
    restoreCanvas = installFakeCanvas();
  });

  afterAll(() => {
    restoreCanvas();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUploadComponent],
      providers: [provideHttpClient(withXhr())],
    }).compileComponents();
  });

  async function render(inputs: Record<string, unknown>): Promise<HTMLElement> {
    fixture = TestBed.createComponent(FileUploadComponent);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const zone = (root: HTMLElement) => root.querySelector<HTMLElement>('.file-upload[role="button"]') as HTMLElement;

  const DE = {
    hint: 'Dateien hierher ziehen oder zum Auswählen klicken',
    acceptedLabel: 'Erlaubt:',
    maxSizeLabel: 'Max.:',
    accept: '.pdf',
    maxSizeBytes: 10 * 1024 * 1024,
  };

  /** design.md §4: inputs, the drop zone's computed name. */
  const rows: readonly { case: string; inputs: Record<string, unknown>; name: string }[] = [
    { case: 'EN defaults (unchanged)', inputs: {}, name: 'Drag & drop files here, or click to browse' },
    {
      case: 'EN with restrictions (story)',
      inputs: { hint: 'Upload your documents (PDF, PNG, JPG)', accept: '.pdf,.png,.jpg,.jpeg', maxSizeBytes: 5 * 1024 * 1024 },
      name: 'Upload your documents (PDF, PNG, JPG), Accepted: .pdf,.png,.jpg,.jpeg, Max: 5.0 MB',
    },
    { case: 'EN, accept only', inputs: { hint: 'Upload a profile picture', accept: 'image/*' }, name: 'Upload a profile picture, Accepted: image/*' },
    { case: 'DE', inputs: DE, name: 'Dateien hierher ziehen oder zum Auswählen klicken, Erlaubt: .pdf, Max.: 10.0 MB' },
  ];

  describe.each(rows)('$case', (row) => {
    it(`is named "${row.name}" and passes ${RULE}`, async () => {
      const root = await render(row.inputs);
      expect(computedName(root, zone(root))).toBe(row.name);
      // AC-5: the hint stays the prefix.
      expect(zone(root).getAttribute('aria-label')?.startsWith(String(row.inputs['hint'] ?? 'Drag & drop'))).toBe(true);
      const results = await audit(root);
      expect(violations(results, PRE_EXISTING)).toEqual([]);
      expect(outcomeFor(results, RULE, zone(root))).toBe('pass');
    });
  });

  it('reads the lines as words: a real space between them', async () => {
    const root = await render(DE);
    expect(zone(root).textContent?.replace(/\s+/g, ' ').trim()).toBe('Dateien hierher ziehen oder zum Auswählen klicken Erlaubt: .pdf Max.: 10.0 MB');
  });

  it('follows accept and maxSizeBytes in the same change detection pass (AC-7)', async () => {
    const root = await render({ hint: 'Upload a profile picture' });
    expect(zone(root).getAttribute('aria-label')).toBe('Upload a profile picture');
    fixture.componentRef.setInput('accept', '.png');
    fixture.componentRef.setInput('maxSizeBytes', 2048);
    fixture.detectChanges();
    expect(zone(root).getAttribute('aria-label')).toBe('Upload a profile picture, Accepted: .png, Max: 2.0 KB');
  });

  it('fails label-content-name-mismatch with the pre-3.11.5 name (negative control, AC-2)', async () => {
    const root = await render(DE);
    zone(root).setAttribute('aria-label', DE.hint);
    const results = await audit(root);
    expect(outcome(results, RULE)).toBe('violation');
    expect(results.violations.map((v) => v.id).filter((id) => !PRE_EXISTING.includes(id))).toEqual([RULE]);
    expect(outcomeFor(results, RULE, zone(root))).toBe('violation');
  });
});
