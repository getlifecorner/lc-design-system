#!/usr/bin/env node
/**
 * Consumer check for the Angular majors the package claims in its peer range.
 *
 * Angular libraries ship partial-compilation output: the consumer's own
 * compiler links every declaration and compiles the templates. A build made
 * with a newer Angular is therefore only proven to work in an older major by
 * doing exactly that. For every entry of the matrix this script creates an
 * app from ./template, installs the packed library with strict peer
 * resolution, runs `ng build` (AOT, strictTemplates, static prerender — which
 * also executes every rendered component on the server) and checks the
 * prerendered HTML.
 *
 * The app has two route sets: `''` imports everything from the primary entry
 * (as consumers did before 3.5), `/tt` imports the F1 set from the secondary
 * entries only (3.5, request 001). The build keeps Angular's defaults (the
 * existing consumers); tools/compat/check-trusted-types.mjs builds the app
 * once more with life-os's settings (`csp` configuration) and opens the `/tt`
 * pages in a browser under a Trusted Types CSP.
 *
 * Prerequisite: `npx nx build angular-ui-kit` (reads dist/libs/angular-ui-kit).
 *
 * `--measure` also builds tools/compat/bundle (the F1 shell, Angular 22)
 * against 3.5.1 and this build and checks the initial-JS savings of request
 * 002 (AS-17 icons, AS-18 deferred side navigation), and a lazy lc-code-block
 * against 3.6.0 (request 003, AS-20); see bundle-size.mjs.
 *
 * Usage: node tools/compat/check-angular-majors.mjs [--only=21.0,22] [--keep]
 *          [--legacy-peer-deps] [--work=<dir>] [--measure]
 *          [--code-before=<npm version | kit .tgz>]  (the kit of the code-block "before" build; default 3.6.0)
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inlineIconsModule } from './inline-icons.mjs';
import { kb, measureBundles } from './bundle-size.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v ?? true];
  }),
);
const ROOT = resolve(args.root ?? join(HERE, '../..'));
const DIST = join(ROOT, 'dist/libs/angular-ui-kit');
const TEMPLATE = join(HERE, 'template');

/** Lowest and newest release line of each major the peer range claims. */
const MATRIX = [
  { name: '21.0', angular: '~21.0.0', typescript: '~5.9.2' },
  { name: '21', angular: '^21.0.0', typescript: '~5.9.2' },
  { name: '22.0', angular: '~22.0.0', typescript: '~6.0.2' },
  { name: '22', angular: '^22.0.0', typescript: '~6.0.2' },
];

/** The sidenav's `<nav>` on `/tt`: exactly one aria-current link, the `/tt` one, painted current too (AC-24). */
function oneCurrentSidenavLink(html) {
  const nav = html.match(/<nav(?=[^>]*class="lc-sidenav__nav)[^>]*>([^]*?)<\/nav>/)?.[1] ?? '';
  const current = [...nav.matchAll(/<a\b[^>]*aria-current="page"[^>]*>/g)].map((m) => m[0]);
  return current.length === 1 && /href="\/tt"/.test(current[0]) && /lc-sidenav__nav-item--active/.test(current[0]);
}

/** Every inline icon on `/tt/icons` is prerendered as one decorated `<svg>` (AC-10 a, before JS). */
function everyInlineIconPrerendered(html) {
  const icons = [...html.matchAll(/<lc-icon[^>]*data-icon="[^"]+"[^>]*>([^]*?)<\/lc-icon>/g)];
  return icons.length > 100 && icons.every(([, inner]) => (inner.match(/<svg\b(?=[^>]*width="24px")(?=[^>]*role="img")[^>]*>/g) ?? []).length === 1);
}

/**
 * The prerendered text of a code block on `/tt/code` (3.6.1, AS-20): its
 * lines with the line numbers, tags and comments dropped and the entities
 * decoded. Each line ends with the template's line feed.
 */
function prerenderedCode(html, id) {
  const code = html.match(new RegExp(`<lc-code-block[^>]*\\bid="${id}"[^]*?<code[^>]*>([^]*?)</code>`))?.[1];
  if (code === undefined) return null;
  return code
    .replace(/<span[^>]*class="code-block__line-number"[^>]*>[^<]*<\/span>/g, '')
    .replace(/<!--[^]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, String.fromCharCode(160))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
}

/** `/tt/code`: every block's prerendered text is its source, an empty line U+00A0 (AC-11). */
function codeBlocksPrerendered(html) {
  const sources = {
    'tt-code-ts': ["const greeting = 'Hallo';", '', 'export function greet(name: string): string {', '  return greeting + ", " + name; // Gruß', '}'],
    'tt-code-html': ['<a href="x">&amp; "q"</a>'],
    'tt-code-bash': ['npm install @lifecorner/angular-ui-kit', '', 'npm test'],
  };
  return Object.entries(sources).every(([id, lines]) =>
    prerenderedCode(html, id) === lines.map((l) => `${l || String.fromCharCode(160)}\n`).join(''));
}

/** The opening tag of a code block's body on `/tt/code` (3.7, AS-21). */
function codeBlockBody(html, id) {
  return html.match(new RegExp(`<lc-code-block[^>]*\\bid="${id}"[^]*?(<div[^>]*class="code-block__body"[^>]*>)`))?.[1] ?? '';
}

/** `/tt/code`: every body is a named region and a tab stop before JS: `regionLabel`, else the language (AC-9). */
function codeBlockRegions(html) {
  const names = { 'tt-code-ts': 'Beispielcode', 'tt-code-html': 'html', 'tt-code-bash': 'bash' };
  return Object.entries(names).every(([id, name]) => {
    const tag = codeBlockBody(html, id);
    return /\btabindex="0"/.test(tag) && /\brole="region"/.test(tag) && tag.includes(`aria-label="${name}"`);
  });
}

/**
 * `lc-character` in the horizon's figure slot on the home page (3.8, G-4):
 * decorative, both drawings as `<img>` from the logo base path, before JS.
 */
function characterPrerendered(html) {
  const host = html.match(/<lc-character(?=[^>]*id="compat-character")[^>]*>[^]*?<\/lc-character>/)?.[0];
  if (!host) return false;
  const tag = host.slice(0, host.indexOf('>') + 1);
  const imgs = [...host.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  return /aria-hidden="true"/.test(tag) && !/\brole=/.test(tag)
    && /class="[^"]*\blc-character--64\b/.test(tag) && /class="[^"]*\blc-horizon__figure\b/.test(tag)
    && imgs.length === 2
    && /src="\/compat-logo\/character\/hello-light\.svg"/.test(imgs[0]) && /src="\/compat-logo\/character\/hello-dark\.svg"/.test(imgs[1])
    && imgs.every((img) => emptyAttr('alt').test(img) && /aria-hidden="true"/.test(img) && /width="100"/.test(img) && /height="100"/.test(img));
}

/**
 * `<img shell-horizon-figure>` in lc-app-shell's horizon on the home page
 * (3.9, AS-29): projected as the only element of the aria-hidden horizon,
 * before JS.
 */
function shellFigurePrerendered(html) {
  const shell = html.match(/<lc-app-shell(?=[^>]*id="compat-shell-39")[^>]*>[^]*?<\/lc-app-shell>/)?.[0];
  const horizon = shell?.match(/<div(?=[^>]*class="lc-app-shell__horizon lc-horizon")[^>]*>((?:<!--[^]*?-->|\s)*<img\b[^>]*>(?:<!--[^]*?-->|\s)*)<\/div>/);
  if (!horizon) return false;
  const tag = horizon[0].slice(0, horizon[0].indexOf('>') + 1);
  const img = horizon[1].match(/<img\b[^>]*>/)[0];
  return /aria-hidden="true"/.test(tag) && /id="compat-shell-figure"/.test(img)
    && emptyAttr('shell-horizon-figure').test(img) && emptyAttr('alt').test(img);
}

/**
 * 3.11.1 (G-37): every prerendered `<lc-icon>` of a page but the custom-colour
 * control `#compat-color` writes no `style=` on its host, container or
 * `<svg>`, so a `style-src 'self'` CSP blocks nothing. At least `min` icons,
 * and one whose opening tag has each of `required` (`id="…"`, `name="…"`), so
 * a page that lost its icons doesn't pass.
 */
function iconsWithoutStyle(html, min, required = []) {
  const icons = [...html.matchAll(/<lc-icon\b[^>]*>[^]*?<\/lc-icon>/g)]
    .map(([icon]) => ({ icon, tag: icon.slice(0, icon.indexOf('>') + 1) }))
    .filter(({ tag }) => !/\sid="compat-color"/.test(tag));
  return icons.length >= min
    && required.every((attr) => icons.some(({ tag }) => tag.includes(` ${attr}`)))
    && icons.every(({ icon }) => !/\sstyle=/.test(icon));
}

/**
 * 3.11.2 (G-38 to G-40): the `<img>` tags inside the first element `re`
 * matches; every one must carry each attribute of `attrs` (`width="48"`), and
 * there must be `count` of them (or at least one when `count` is omitted).
 */
function imagesCarry(html, re, attrs, count) {
  const el = html.match(re)?.[0];
  const imgs = el ? [...el.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]) : [];
  return (count === undefined ? imgs.length > 0 : imgs.length === count)
    && imgs.every((img) => attrs.every((attr) => img.includes(` ${attr}`)));
}

/**
 * An attribute with the empty value, in both serialisations of the same DOM:
 * `alt=""` (Angular 22.2's prerender) and a bare `alt` (21.x and 22.0, whose
 * critical-CSS pass, Beasties 0.4.2 with dom-serializer 2, writes empty
 * attributes without a value). Browsers parse both as the empty value.
 * A value (`alt="x"`) or a longer name (`data-alt`) doesn't match.
 */
function emptyAttr(name) {
  return new RegExp(`\\s${name}(?:="")?(?=[\\s/>])`);
}

/**
 * What the prerendered pages must contain (rendered on the server, no JS):
 * `[label, RegExp | (html) => boolean, page]`, page `index.html` unless named.
 */
const EXPECT_IN_HTML = [
  ['header', /<header[^>]*class="lc-header/],
  ['primary lg button', /class="btn btn-primary[^"]*btn-lg/],
  ['markdown link', /<a href="https:\/\/example\.org"/],
  ['table row', /Internet/],
  ['footer', /<footer[^>]*role="contentinfo"/],
  ['chart svg', /<svg[^>]*role="img"/],
  // 3.2 features, rendered on the server (no JavaScript needed)
  ['a[lcButton] link', /<a(?=[^>]*href="\/de\/neuigkeiten")(?=[^>]*class="[^"]*\bbtn-primary\b)(?=[^>]*class="[^"]*\bbtn-lg\b)[^>]*>/],
  ['language link', /<a(?=[^>]*hreflang="en")(?=[^>]*lang="en")(?=[^>]*class="[^"]*btn-ghost)[^>]*>/],
  ['header nav', /<nav[^>]*aria-label="Hauptnavigation"/],
  ['current page', /<a(?=[^>]*aria-current="page")[^>]*href="\/de\/sicherheit"/],
  ['plain home link', /<a(?=[^>]*href="\/de\/")(?=[^>]*class="lc-header__logo")[^>]*>/],
  ['footer heading level', /<h2[^>]*class="footer__section-title"/],
  ['footer nav', /<nav[^>]*aria-label="Fußzeile"/],
  // 3.3 features, rendered on the server
  ['provider button', /<button(?=[^>]*type="submit")(?=[^>]*class="[^"]*\blc-provider-button--google\b)[^>]*>/],
  ['radio group legend', /<fieldset[^>]*class="lc-radio-group"[^]*?<legend[^>]*>\s*Rolle/],
  ['copy field', /class="lc-copy-field\b/],
  ['bottom nav current item', /<nav(?=[^>]*aria-label="Hauptnavigation unten")(?=[^>]*class="[^"]*lc-bottom-nav--floating)[^>]*>[^]*?aria-current="page"/],
  ['app page aside', /<main[^>]*id="shell-main"[^]*?<\/main>\s*<aside(?=[^>]*aria-label="Mitglieder")[^>]*>/],
  ['shell horizon', /class="lc-app-shell__horizon lc-horizon"/],
  ['page header overline', /class="[^"]*lc-overline[^"]*"[^>]*>\s*Montag, 12\. Oktober/],
  // 3.5 (request 001)
  ['app page busy (AS-12)', /<main(?=[^>]*id="shell-main")(?=[^>]*aria-busy="true")[^>]*>/],
  ['inline icon decorated (AS-14)', /<div[^>]*class="icon-container icon-md icon-outline"[^>]*><svg(?=[^>]*width="24px")(?=[^>]*height="24px")(?=[^>]*role="img")[^>]*>/],
  ['tt: page busy before JS (AS-12)', /<main(?=[^>]*id="tt-main")(?=[^>]*aria-busy="true")[^>]*>/, 'tt/index.html'],
  ['tt: one current sidenav link (AS-16)', oneCurrentSidenavLink, 'tt/index.html'],
  ['tt: logo base path from the primary entry (AS-15)', /<lc-logo[^>]*id="tt-logo"[^]*?src="\/compat-logo\/lifecorner-/, 'tt/index.html'],
  ['tt: every inline icon prerendered (AS-14)', everyInlineIconPrerendered, 'tt/icons/index.html'],
  ['tt: one IconComponent class across entries (AS-15)', /id="tt-primary-icon"[^>]*data-same-class="true"|data-same-class="true"[^>]*id="tt-primary-icon"/, 'tt/icons/index.html'],
  ['tt: fetched icons stay empty on the server', /<lc-icon[^>]*id="tt-anchor"[^>]*><div[^>]*class="icon-container[^"]*"[^>]*><\/div>/, 'tt/fetched/index.html'],
  // 3.5.1: this build keeps Angular's defaults (22: incremental hydration's
  // event-dispatch script; 21: critical-CSS `onload`); the csp build is below.
  ["Angular's default inline scripts (not the csp settings)", (html) => html.includes('</html>') && !noInlineScript(html), 'tt/index.html'],
  // 3.6 (request 002), on the home page (probe-36.ts)
  ['registered glyph, decorated (AS-17)', /<lc-icon[^>]*id="compat-registered"[^>]*><div[^>]*class="icon-container[^"]*\bicon-solid\b[^"]*"[^>]*><svg(?=[^>]*width="24px")(?=[^>]*role="img")(?=[^>]*aria-label="Start")[^>]*><path d="M11\.47 3\.841/],
  // (Angular may write a [class] string's classes in another order: lookaheads.)
  ['sidenav placeholder: inert, hidden, the docked rail (AS-18)', /<lc-sidenav-placeholder(?=[^>]*id="compat-sidenav-placeholder")(?=[^>]*aria-hidden="true")(?=[^>]*\binert\b)(?=[^>]*class="[^"]*\blc-sidenav-container--docked\b)[^>]*>[^]*?<div(?=[^>]*class="lc-sidenav(?=[^"]*\blc-sidenav--docked\b)(?=[^"]*\blc-sidenav--open\b)[^"]*")(?=[^>]*style="width: 240px;?")[^>]*>/],
  ['inline link in running text (AS-19)', /<a(?=[^>]*href="\/de\/datenschutz")(?=[^>]*class="[^"]*\bbtn-link\b)(?=[^>]*class="[^"]*\bbtn-inline\b)[^>]*>/],
  // 3.6.1 (request 003): lc-code-block's tokens are elements, written by the server
  ['tt: code-block token spans (AS-20)', /class="code-block__line-content"[^>]*>(?:<!--[^]*?-->)*<span[^>]*class="token-keyword"[^>]*>const<\/span>/, 'tt/code/index.html'],
  ['tt: code-block markup in the source is text (AS-20)', /<span[^>]*class="token-tag"[^>]*>&lt;a<\/span>/, 'tt/code/index.html'],
  ['tt: code-block text equals the source (AS-20)', codeBlocksPrerendered, 'tt/code/index.html'],
  // 3.7 (request 004): the scroll body is a named region and a tab stop before JS
  ['tt: code-block body is a named, focusable region (AS-21)', codeBlockRegions, 'tt/code/index.html'],
  // 3.8 (request 005): Edu prerenders as plain <img> in a box the component style sizes
  ['character: decorative, in the horizon slot, files from the logo base path (G-4)', characterPrerendered],
  ['character: the on-dark drawing alone, named (G-4)', /<lc-character(?=[^>]*id="compat-character-dark")(?=[^>]*role="img")(?=[^>]*aria-label="Edu winkt")(?=[^>]*class="[^"]*\blc-character--96\b)(?![^>]*aria-hidden)[^>]*>(?:<!--[^]*?-->|\s)*<img(?=[^>]*src="\/compat-logo\/character\/hello-dark\.svg")[^>]*>(?:<!--[^]*?-->|\s)*<\/lc-character>/],
  ['character: the box is square and sized by CSS (G-4)', /--_lc-character-size:\s*64px;[^}]*aspect-ratio:\s*1\b/],
  // 3.9 (request 006), on the home page (probe-39.ts)
  ['shell figure: a direct child of the aria-hidden horizon (AS-29)', shellFigurePrerendered],
  ['page header secondary at h2 (AS-25)', /<lc-page-header(?=[^>]*id="compat-secondary")(?=[^>]*class="[^"]*\blc-page-header--size-secondary\b)[^>]*>[^]*?<h2[^>]*class="lc-page-header__title"[^>]*>\s*Back in a few minutes/],
  ['flush link (AS-26)', /<a(?=[^>]*id="compat-flush")(?=[^>]*class="[^"]*\bbtn-flush\b)(?=[^>]*class="[^"]*\bbtn-link\b)(?=[^>]*class="[^"]*\bbtn-lg\b)[^>]*>/],
  // 3.10 (request 008), on the home page (probe-310.ts)
  ['textarea name and value before JS (G-CF1)', /<textarea(?=[^>]*\sname="message")(?=[^>]*\srequired(?:=""|[\s>]))[^>]*>\n\nErste Zeile\nZweite Zeile: &lt;b&gt; &amp; "zitiert"\n&lt;\/textarea&gt;&lt;p&gt;x&lt;\/p&gt;\n<\/textarea>/],
  ['textarea without name and value unchanged (AC-9)', /<textarea _ngcontent-[^\s=>]+(?:="")? class="lc-textarea lc-textarea--md lc-textarea--outline" id="lc-textarea-\d+" placeholder(?:="")? rows="3"(?: jsaction="input:;blur:;")?><\/textarea>/],
  ['input value before JS (G-CF2)', /<input(?=[^>]*\sname="email")(?=[^>]*\stype="email")(?=[^>]*\svalue="a@b\.de")[^>]*>/],
  ['input value escaped (G-CF2)', /<input(?=[^>]*\sname="name")(?=[^>]*\svalue="Anna &quot;Ann&quot; &amp; Co")[^>]*>/],
  // 3.10.1 (request 009): the header's end content is one group, after the nav;
  // the shell's clearance holds 112 px before JS and the server writes no bar height
  ['header end group after the nav (AS-31)', /<nav[^>]*aria-label="Hauptnavigation"[^]*?<div[^>]*class="lc-header__end"[^>]*>(?:<!--[^]*?-->|\s)*<a(?=[^>]*hreflang="en")[^>]*>/],
  ['shell clearance fallback before JS (AS-31)', /--_clearance:\s*var\(\s*--lc-app-shell-bottom-clearance,\s*max\(\s*calc\(112px \+ env\(safe-area-inset-bottom,\s*0px\)\)\s*,\s*calc\(var\(--_lc-app-shell-bar,\s*72px\) \+ 40px/, 'tt/index.html'],
  ['no bar height written on the server (AS-31)', (html) => html.includes('lc-bottom-nav--floating') && !/style="[^"]*--_lc-app-shell-bar/.test(html), 'tt/index.html'],
  // 3.11 (request 010): the badge's wrap class is in the server HTML, so the
  // label wraps before JS (SI-15); the rules themselves are plain CSS
  ['badge wrap class before JS (SI-15)', /<span(?=[^>]*class="[^"]*\blc-badge--wrap\b)[^>]*>(?:<!--[^]*?-->|\s)*Geschlossene Beta, nur mit Einladung/],
  // 3.11.1 (request 011): lc-icon writes no style attribute for the default
  // colour (G-37); the size is the icon-<size> class, the svg keeps width/height
  ['lc-icon: no style attribute, the registered glyph and the plain icon (G-37)', (html) => iconsWithoutStyle(html, 3, ['id="compat-registered"', 'name="check"'])],
  ['tt: lc-icon without style, decorative and labelled (G-37)', (html) => iconsWithoutStyle(html, 2, ['name="clock"', 'name="shield-check"']), 'tt/index.html'],
  ['tt: lc-icon without style, the bundled set (G-37)', (html) => iconsWithoutStyle(html, 101), 'tt/icons/index.html'],
  ['lc-icon: the size is the class, no inline size (G-37)', /<lc-icon(?=[^>]*\sid="compat-registered")[^>]*><div(?=[^>]*class="[^"]*\bicon-md\b)(?![^>]*\sstyle=)[^>]*><svg(?=[^>]*\swidth="24px")(?=[^>]*\sheight="24px")(?![^>]*\sstyle=)[^>]*>/],
  ['lc-icon: a custom colour is the svg\'s inline colour, and only there (G-37 control)', /<lc-icon(?=[^>]*\sid="compat-color")(?![^>]*\sstyle=)[^>]*><div(?![^>]*\sstyle=)[^>]*><svg(?=[^>]*\sstyle="color: var\(--color-primary-500\);?")[^>]*>/],
  // 3.11.2 (request 012): intrinsic size and lazy loading before JS (probe-3112.ts)
  ['logo: both built-in lockup images 485 × 100 (G-38)', (html) => imagesCarry(html, /<lc-logo(?=[^>]*\sid="compat-logo")[^>]*>[^]*?<\/lc-logo>/, ['width="485"', 'height="100"'], 2)],
  ['header logo: the emblem at md is 48 × 48 (G-38)', (html) => imagesCarry(html, /<a(?=[^>]*class="lc-header__logo")[^>]*>[^]*?<\/a>/, ['width="48"', 'height="48"'])],
  ['avatar image: lg 48 × 48, lazy (G-40)', (html) => imagesCarry(html, /<lc-avatar(?=[^>]*\sid="compat-avatar")[^>]*>[^]*?<\/lc-avatar>/, ['width="48"', 'height="48"', 'loading="lazy"', 'src="/compat-logo/character/hello-light.svg"'], 1)],
  ['character: both drawings lazy (G-39)', (html) => imagesCarry(html, /<lc-character(?=[^>]*\sid="compat-character-lazy")[^>]*>[^]*?<\/lc-character>/, ['loading="lazy"', 'width="100"', 'height="100"'], 2)],
  // 3.11.4 (request 014): the avatar trigger's name holds the initials it shows
  // (WCAG 2.5.3), already in the prerendered page (tt-shell.ts)
  ['tt: avatar trigger named with its initials (AS-33)', /<button(?=[^>]*lc-header__profile-trigger--avatar)(?=[^>]*aria-label="Menü für Johanna Apfelbaum, JA")[^>]*>/, 'tt/index.html'],
  // 3.12 (request 016): the contact form after a 422, before JS (probe-312.ts)
  ['controlId: input, label and quiet error (G-CF4, G-CF7)', (html) => /<label(?=[^>]*\sid="contact-email-label")(?=[^>]*\sfor="contact-email")[^>]*>/.test(html)
    && /<input(?=[^>]*\sid="contact-email")(?=[^>]*\saria-describedby="contact-email-error")(?=[^>]*\saria-invalid="true")[^>]*>/.test(html)
    && /<p(?=[^>]*\sid="contact-email-error")(?![^>]*\srole=)[^>]*>/.test(html)],
  ['controlId: textarea, label and quiet error (G-CF4, G-CF7)', (html) => /<label(?=[^>]*\sfor="contact-message")[^>]*>/.test(html)
    && /<textarea(?=[^>]*\sid="contact-message")(?=[^>]*\saria-describedby="contact-message-error")[^>]*>/.test(html)
    && /<span(?=[^>]*\sid="contact-message-error")(?![^>]*\srole=)[^>]*>/.test(html)],
  ['422 form: the summary is the only alert (G-CF7)', (html) => (html.match(/<form[^>]*id="compat-contact-422"[^]*?<\/form>/)?.[0].match(/\srole="alert"/g) ?? []).length === 1],
  ['generated lc-input ids have no random part (G-CF4)', (html) => {
    const ids = [...html.matchAll(/\s(?:id|for)="lc-input-([^"]*)"/g)].map((m) => m[1]);
    return ids.length >= 3 && ids.every((id) => /^\d+(?:-label|-error|-helper)?$/.test(id));
  }],
  ['alert text link in the action slot, styled before JS (G-CF8)', (html) => /<div[^>]*class="lc-alert__action"[^>]*>(?:<!--[^]*?-->|\s)*<a(?=[^>]*\sslot="action")(?=[^>]*\shref="mailto:kontakt@beispiel\.example")[^>]*>/.test(html)
    && /\.lc-alert__action\s*>\s*a:where\(:not\(\.btn\)\)\s*\{[^}]*min-height:\s*var\(--size-min-touch-height\)/.test(html)],
];

/**
 * The entry that is built once more with the `csp` configuration (life-os's
 * settings) for check-trusted-types.mjs; `withNoIncrementalHydration` needs 22.
 */
const CSP_ENTRY = '22';
const CSP_PAGES = ['tt/index.html', 'tt/household/index.html', 'tt/icons/index.html', 'tt/fetched/index.html', 'tt/code/index.html'];

/** Nothing `script-src 'self'` blocks: no inline script (JSON data blocks aside), no inline event handler. */
function noInlineScript(html) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map((m) => m[1]);
  return html.includes('</html>') && scripts.every((a) => /\bsrc=/.test(a) || /type="application\/json"/.test(a)) && !/<[a-z][^>]*\son[a-z]+=/i.test(html);
}

function run(cmd, cmdArgs, cwd) {
  const res = spawnSync(cmd, cmdArgs, { cwd, encoding: 'utf8', env: { ...process.env, NG_CLI_ANALYTICS: 'false', CI: '1' } });
  return { code: res.status, out: `${res.stdout ?? ''}${res.stderr ?? ''}` };
}

if (!existsSync(join(DIST, 'package.json'))) {
  console.error(`No build in ${DIST}. Run \`npx nx build angular-ui-kit\` first.`);
  process.exit(2);
}

const work = args.work ? resolve(args.work) : mkdtempSync(join(tmpdir(), 'lc-compat-'));
mkdirSync(work, { recursive: true });
const pkg = JSON.parse(readFileSync(join(DIST, 'package.json'), 'utf8'));
execFileSync('npm', ['pack', DIST, '--pack-destination', work, '--silent'], { stdio: 'ignore' });
const tarball = join(work, readdirSync(work).find((f) => f.endsWith('.tgz')));
console.log(`${pkg.name}@${pkg.version}  peer @angular/core ${pkg.peerDependencies['@angular/core']}`);

const only = typeof args.only === 'string' ? args.only.split(',') : null;
const results = [];
for (const entry of MATRIX.filter((m) => !only || only.includes(m.name))) {
  const dir = join(work, `app-${entry.name}`);
  rmSync(dir, { recursive: true, force: true });
  cpSync(TEMPLATE, dir, { recursive: true });
  writeFileSync(join(dir, 'src/app/tt/inline-icons.ts'), inlineIconsModule(ROOT));
  const a = entry.angular;
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify(
      {
        name: `lc-compat-${entry.name}`,
        private: true,
        dependencies: {
          '@angular/cdk': a,
          '@angular/common': a,
          '@angular/compiler': a,
          '@angular/core': a,
          '@angular/forms': a,
          '@angular/platform-browser': a,
          '@angular/platform-server': a,
          '@angular/router': a,
          '@angular/ssr': a,
          '@lifecorner/angular-ui-kit': `file:${tarball}`,
          mermaid: '^11.0.0',
          rxjs: '~7.8.0',
          tslib: '^2.3.0',
        },
        devDependencies: {
          '@angular/build': a,
          '@angular/cli': a,
          '@angular/compiler-cli': a,
          '@types/node': '^24.0.0',
          typescript: entry.typescript,
        },
      },
      null,
      2,
    ),
  );

  const installArgs = ['install', '--no-audit', '--no-fund', '--loglevel=error'];
  if (args['legacy-peer-deps']) installArgs.push('--legacy-peer-deps');
  const install = run('npm', installArgs, dir);
  const versions = install.code === 0
    ? ['@angular/core', '@angular/cdk', 'typescript'].map((p) => `${p}@${JSON.parse(readFileSync(join(dir, 'node_modules', p, 'package.json'), 'utf8')).version}`).join(' ')
    : '';
  const result = { name: entry.name, versions, install: install.code === 0, build: false, checks: [], warnings: [] };
  if (!result.install) {
    result.error = install.out.split('\n').filter((l) => /ERESOLVE|peer|error/i.test(l)).slice(0, 8).join('\n');
    results.push(result);
    continue;
  }

  const build = run('npx', ['ng', 'build'], dir);
  writeFileSync(join(dir, 'build.log'), build.out);
  result.build = build.code === 0;
  // mermaid's own CommonJS dependencies warn in every app that installs it;
  // they say nothing about this package and are only counted.
  const lines = build.out.split('\n').map((l) => l.trim());
  const cjs = lines.filter((l) => /is not ESM/.test(l) && /mermaid/.test(l)).length;
  result.warnings = lines.filter(
    (l) => /warning|depends upon a library published using Angular/i.test(l) && !(/is not ESM/.test(l) && /mermaid/.test(l)),
  );
  if (cjs) result.warnings.push(`(${cjs} CommonJS warnings from mermaid's dependencies not shown)`);
  if (!result.build) {
    result.error = build.out.split('\n').filter((l) => /error|✘/i.test(l)).slice(0, 15).join('\n');
    results.push(result);
    continue;
  }
  const pages = new Map();
  const page = (name, out = 'compat') => {
    const file = join(dir, `dist/${out}/browser`, name);
    if (!pages.has(file)) pages.set(file, existsSync(file) ? readFileSync(file, 'utf8') : '');
    return pages.get(file);
  };
  for (const [label, test, name = 'index.html'] of EXPECT_IN_HTML) {
    const html = page(name);
    result.checks.push([label, typeof test === 'function' ? test(html) : test.test(html)]);
  }
  // 3.8 (request 005, G-4): the pose files through the app's `assets` config and
  // the package's `exports`, and the string entry in plain Node (no Angular).
  result.checks.push(['character: the assets config copied the pose files (G-4)', existsSync(join(dir, 'dist/compat/browser/compat-logo/character/hello-light.svg'))]);
  const node = run(process.execPath, ['--input-type=module', '-e', `
    import { createRequire } from 'node:module';
    import { readFileSync } from 'node:fs';
    const file = createRequire(process.cwd() + '/').resolve('@lifecorner/angular-ui-kit/assets/character/hello-light.svg');
    const { CHARACTER_SVG_HELLO, CHARACTER_POSES } = await import('@lifecorner/angular-ui-kit/character-svg');
    console.log(JSON.stringify({ head: CHARACTER_SVG_HELLO.light.slice(0, 4), poses: CHARACTER_POSES.length, same: readFileSync(file, 'utf8') === CHARACTER_SVG_HELLO.light }));`], dir);
  const svg = (() => { try { return JSON.parse(node.out.trim().split('\n').pop()); } catch { return {}; } })();
  result.checks.push(['character: the file resolves through exports and equals the string, imported in plain Node (G-4)', node.code === 0 && svg.head === '<svg' && svg.poses === 14 && svg.same === true]);
  if (entry.name === CSP_ENTRY) {
    const csp = run('npx', ['ng', 'build', '--configuration=production,csp'], dir);
    writeFileSync(join(dir, 'build-csp.log'), csp.out);
    result.checks.push(['csp build: /tt pages without inline script', csp.code === 0 && CSP_PAGES.every((name) => noInlineScript(page(name, 'compat-csp')))]);
  }
  results.push(result);
}

let measured = null;
if (args.measure) {
  console.log('\nMeasuring the F1 shell (tools/compat/bundle) against 3.5.1, and a lazy code block against 3.6.0 …');
  try {
    const before = args['code-before'];
    const codeBefore = typeof before === 'string' ? (before.endsWith('.tgz') ? `file:${resolve(before)}` : before) : undefined;
    measured = measureBundles({ work, tarball, run, codeBefore });
  } catch (error) {
    measured = { error: String(error.stack ?? error) };
  }
}

let failed = false;
for (const r of results) {
  const checks = r.checks.map(([l, ok]) => `${ok ? 'ok' : 'MISSING'} ${l}`).join(', ');
  const ok = r.install && r.build && r.checks.every(([, v]) => v);
  failed ||= !ok;
  console.log(`\n[${ok ? 'PASS' : 'FAIL'}] Angular ${r.name}  ${r.versions}`);
  console.log(`  install: ${r.install ? 'ok' : 'FAILED'}  build+prerender: ${r.build ? 'ok' : 'FAILED'}`);
  if (checks) console.log(`  prerendered HTML: ${checks}`);
  if (r.warnings.length) console.log(`  warnings:\n    ${r.warnings.join('\n    ')}`);
  if (r.error) console.log(`  ${r.error.replace(/\n/g, '\n  ')}`);
}
if (measured?.error) {
  failed = true;
  console.log(`\n[FAIL] bundle measurement\n  ${measured.error.replace(/\n/g, '\n  ')}`);
} else if (measured) {
  const ok = measured.checks.every(([, v]) => v);
  failed ||= !ok;
  console.log(`\n[${ok ? 'PASS' : 'FAIL'}] bundle measurement (initial JS; kB = 1000 bytes, gzip -9)`);
  for (const [label, r] of measured.rows) console.log(`  ${label.padEnd(34)} ${kb(r.raw).padStart(10)} raw ${kb(r.gzip).padStart(9)} gzip  (${r.lazyFiles} lazy files)`);
  for (const [label, ok, detail] of measured.checks) console.log(`  ${ok ? 'ok' : 'FAIL'} ${label}${detail ? `: ${detail}` : ''}`);
}
console.log(`\nWork dir: ${work}`);
if (!args.keep && !args.work && !failed) rmSync(work, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
