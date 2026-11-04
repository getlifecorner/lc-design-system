import { closestLang } from './content-lang';

/** Request 049 (048-f1, WCAG 3.1.2): the shared closest-`[lang]` lookup (design §1). */
describe('closestLang', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    root.innerHTML = '<section lang="de"><p><span id="inner"></span></p><b id="own" lang="fr-CH"></b><i id="empty" lang=""></i></section><em id="none"></em>';
    document.body.appendChild(root);
  });
  afterEach(() => root.remove());

  const el = (id: string) => root.querySelector<HTMLElement>(`#${id}`);

  it('returns the lang of the closest ancestor with one', () => {
    expect(closestLang(el('inner'))).toBe('de');
  });

  it('counts the element itself', () => {
    expect(closestLang(el('own'))).toBe('fr-CH');
  });

  it('takes the value as is: lang="" is the unknown language, not "none"', () => {
    expect(closestLang(el('empty'))).toBe('');
  });

  it('returns null when no element up to <html> has a lang', () => {
    expect(document.documentElement.hasAttribute('lang')).toBe(false);
    expect(closestLang(el('none'))).toBeNull();
  });

  it('counts <html lang>, as DOM inheritance does', () => {
    document.documentElement.setAttribute('lang', 'en');
    try {
      expect(closestLang(el('none'))).toBe('en');
    } finally {
      document.documentElement.removeAttribute('lang');
    }
  });

  it('returns null for a missing element or one without closest (server DOM)', () => {
    expect(closestLang(null)).toBeNull();
    expect(closestLang(undefined)).toBeNull();
    expect(closestLang({} as Element)).toBeNull();
  });
});
