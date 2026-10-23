import { containsWords, labelWords, nameWithText } from './label-in-name';

/** Request 015 (AS-33): the shared Label in Name helper, rule by rule (design.md §2). */
describe('labelWords', () => {
  it('lower-cases, drops parentheticals and splits on everything but letters and digits', () => {
    expect(labelWords('Upload your documents (PDF, PNG, JPG)')).toEqual(['upload', 'your', 'documents']);
    expect(labelWords('Mo., 19. Oktober 2026')).toEqual(['mo', '19', 'oktober', '2026']);
    expect(labelWords('Step 2 of 3: Profile')).toEqual(['step', '2', 'of', '3', 'profile']);
    expect(labelWords('  ')).toEqual([]);
  });

  it('decomposes both sides alike, so umlauts compare equal', () => {
    expect(containsWords(labelWords('Menü für Johanna Müller'), labelWords('Johanna Müller'))).toBe(true);
  });
});

describe('containsWords', () => {
  it('needs one contiguous run of the words', () => {
    expect(containsWords(['heading', '1', 'h1'], ['h1'])).toBe(true);
    expect(containsWords(['tenant', 'acme', 'corp'], ['acme', 'corp'])).toBe(true);
    expect(containsWords(['acme', 'x', 'corp'], ['acme', 'corp'])).toBe(false);
    expect(containsWords(['acme'], [])).toBe(false);
  });
});

describe('nameWithText', () => {
  const rows: readonly { rule: string; label: string; text: string; name: string }[] = [
    // 1. Symbols and single non-digit characters keep the label.
    { rule: '1 symbol', label: 'Unordered List', text: '•', name: 'Unordered List' },
    { rule: '1 symbol', label: 'Code Block', text: '{ }', name: 'Code Block' },
    { rule: '1 emoji', label: 'Insert Link', text: '🔗', name: 'Insert Link' },
    { rule: '1 one letter', label: 'Bold', text: 'B', name: 'Bold' },
    { rule: '1 no text', label: 'Context info', text: '', name: 'Context info' },
    // 2. The label contains the text.
    { rule: '2 contained', label: 'Previous page', text: 'Previous', name: 'Previous page' },
    { rule: '2 contained, case', label: 'Menu for ACME', text: 'Acme', name: 'Menu for ACME' },
    // 3. An empty label.
    { rule: '3 empty label', label: '  ', text: 'Acme Corp', name: 'Acme Corp' },
    // 4. The text contains the label: no stutter.
    { rule: '4 text holds label', label: 'Photo 1', text: 'Photo 1 — Sample image from Picsum', name: 'Photo 1 — Sample image from Picsum' },
    // 5. Otherwise label, then text.
    { rule: '5 append', label: 'Heading 1', text: 'H1', name: 'Heading 1, H1' },
    { rule: '5 append, digit', label: 'Ordered List', text: '1.', name: 'Ordered List, 1.' },
    { rule: '5 append, one digit', label: 'Seite', text: '7', name: 'Seite, 7' },
    { rule: '5 append, DE', label: 'Vorherige Seite', text: 'Zurück', name: 'Vorherige Seite, Zurück' },
    { rule: '5 whitespace', label: ' Context info ', text: ' Tenant \n  Acme Corp ', name: 'Context info, Tenant Acme Corp' },
  ];

  it.each(rows)('rule $rule: "$label" + "$text" → "$name"', ({ label, text, name }) => {
    expect(nameWithText(label, text)).toBe(name);
  });

  it('puts long text in once, complete (AC-6)', () => {
    const caption = 'Blick vom Hochplateau über den nebligen Bodensee bei Sonnenaufgang';
    const name = nameWithText('Bild 3', caption);
    expect(name).toBe(`Bild 3, ${caption}`);
    expect(name.split(caption).length).toBe(2);
  });
});
