import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import {
  CHARACTER_POSES,
  CHARACTER_SVG,
  CHARACTER_SVG_COMFORTS,
  CHARACTER_SVG_HELLO,
  CHARACTER_SVG_SHOWS_THE_WAY,
  type CharacterPose,
} from '@lifecorner/angular-ui-kit/character-svg';

/**
 * Edu's files and strings (3.8, gap G-4): AC-1, AC-2 and AC-4 of request 005.
 * The dark rule below is the design's table (design 005 §5), written again
 * here on purpose: scripts/generate-character-assets.mjs writes the files,
 * this spec checks them against the table, and the four drawn dark files
 * prove the table.
 */
const ASSETS = resolve(__dirname, '../../assets/character');
const SVG_ENTRY = resolve(__dirname, '../character-svg');

const REQUIRED: CharacterPose[] = ['hello', 'shows-the-way', 'happy', 'welcomes-member', 'resting', 'in-his-corner', 'comforts', 'all-done', 'calm'];
const LATER: CharacterPose[] = ['connects', 'discovered', 'thinking', 'connection-paused', 'see-you'];
const DRAWN_DARK: CharacterPose[] = ['hello', 'shows-the-way', 'happy', 'calm'];

const file = (name: string) => readFileSync(join(ASSETS, name), 'utf-8');

/** One tag's dark attributes from its light ones (design 005 §5, rows 1 to 12). */
function darkTag(tag: string): string {
  const attrs = Object.fromEntries([...tag.matchAll(/\s([a-zA-Z][\w-]*)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
  const { fill, stroke, opacity } = attrs;
  const out: Record<string, string> = {};
  const strokes: Record<string, string> = { '#1a6a79': '#84c7d4', '#84c7d4': '#4f9aaa', '#cfe0e4': '#2a4250', '#d3e2e6': '#2a4250' };
  if (stroke !== undefined && strokes[stroke]) out['stroke'] = strokes[stroke];
  if (fill === '#1a6a79') out['fill'] = '#84c7d4';
  if (fill === '#ffffff' && opacity === '0.14') out['opacity'] = '0.22';
  if (fill === '#ffffff' && opacity === undefined && stroke === '#1a6a79') out['fill'] = '#0a121b';
  if (fill === '#84c7d4' && opacity === '0.55') out['fill'] = '#1a6a79';
  if (fill === '#84c7d4' && opacity === undefined && stroke !== '#1a6a79') out['fill'] = '#4f9aaa';
  if (fill === '#e9f1f3') out['fill'] = '#13222e';
  let result = tag;
  for (const [name, value] of Object.entries(out)) result = result.replace(new RegExp(`(\\s${name}=")[^"]*"`), `$1${value}"`);
  return result;
}

const applyRule = (light: string) => light.replace(/<[a-z][^>]*>/g, darkTag);

describe('Edu: files (AC-1)', () => {
  const files = readdirSync(ASSETS).sort();

  it('ships the 9 required and the 5 later poses, light and dark: 28 files, nothing else', () => {
    expect(CHARACTER_POSES).toEqual([...REQUIRED, ...LATER]);
    expect(files).toEqual(CHARACTER_POSES.flatMap((p) => [`${p}-dark.svg`, `${p}-light.svg`]).sort());
    for (const out of ['peeks-around-corner', 'amazed', 'looks-ahead']) expect(files.join()).not.toContain(out);
  });

  it.each(CHARACTER_POSES.flatMap((p) => [`${p}-light.svg`, `${p}-dark.svg`]))('%s is a safe, still 100 × 100 drawing of at most 30 KB', (name) => {
    const svg = file(name);
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="100" height="100" viewBox="0 0 100 100">/);
    expect(svg.endsWith('</svg>\n')).toBe(true);
    expect(svg).not.toMatch(/<script|<style|<text|<animate|<set\b|<foreignObject|\shref=|xlink:|\son[a-z]+=|url\(|style=/i);
    expect(svg).not.toMatch(/animation|transition/i);
    expect(statSync(join(ASSETS, name)).size).toBeLessThanOrEqual(30 * 1024);
    // Colours are lower-case hex.
    expect(svg).not.toMatch(/#[0-9a-f]*[A-F][0-9a-fA-F]*"/);
  });
});

describe('Edu: dark drawings (AC-2)', () => {
  it.each(DRAWN_DARK)('the rule reproduces the drawn dark %s byte for byte (the proof of the rule)', (pose) => {
    expect(applyRule(file(`${pose}-light.svg`))).toBe(file(`${pose}-dark.svg`));
  });

  it.each(CHARACTER_POSES.filter((p) => !DRAWN_DARK.includes(p)))('dark %s is its light drawing with the rule applied', (pose) => {
    const light = file(`${pose}-light.svg`);
    const dark = file(`${pose}-dark.svg`);
    expect(dark).toBe(applyRule(light));
    expect(dark).not.toBe(light);
  });

  it('uses only the colours of the rule', () => {
    const light = new Set(CHARACTER_POSES.flatMap((p) => file(`${p}-light.svg`).match(/#[0-9a-f]{6}/g) ?? []));
    const dark = new Set(CHARACTER_POSES.flatMap((p) => file(`${p}-dark.svg`).match(/#[0-9a-f]{6}/g) ?? []));
    expect([...light].sort()).toEqual(['#0c1722', '#1a6a79', '#84c7d4', '#cfe0e4', '#e8b04a', '#ffffff']);
    expect([...dark].sort()).toEqual(['#0a121b', '#0c1722', '#1a6a79', '#2a4250', '#4f9aaa', '#84c7d4', '#e8b04a', '#ffffff']);
  });
});

describe('Edu: SVG strings (AC-4)', () => {
  it.each(CHARACTER_POSES)('CHARACTER_SVG[%s] equals its two files, trailing newline included', (pose) => {
    expect(CHARACTER_SVG[pose].light).toBe(file(`${pose}-light.svg`));
    expect(CHARACTER_SVG[pose].dark).toBe(file(`${pose}-dark.svg`));
  });

  it('has one constant per pose, the same object as in CHARACTER_SVG', () => {
    expect(Object.keys(CHARACTER_SVG)).toEqual([...CHARACTER_POSES]);
    expect(CHARACTER_SVG.hello).toBe(CHARACTER_SVG_HELLO);
    expect(CHARACTER_SVG['shows-the-way']).toBe(CHARACTER_SVG_SHOWS_THE_WAY);
    expect(CHARACTER_SVG.comforts).toBe(CHARACTER_SVG_COMFORTS);
    expect(CHARACTER_SVG_HELLO.light.slice(0, 4)).toBe('<svg');
  });

  it('is plain TypeScript: imports nothing from Angular or another entry, and freezes nothing (tree-shaking)', () => {
    for (const name of readdirSync(SVG_ENTRY)) {
      const src = readFileSync(join(SVG_ENTRY, name), 'utf-8');
      expect(src).not.toMatch(/from '@angular|from '@lifecorner|Object\.freeze|\brequire\(/);
    }
  });

  it('keeps the strings out of lc-character: its entry only re-exports the pose type', () => {
    const src = readFileSync(resolve(__dirname, 'character.component.ts'), 'utf-8');
    const fromSvg = [...src.matchAll(/^(.*)from '@lifecorner\/angular-ui-kit\/character-svg';$/gm)].map((m) => m[1]);
    expect(fromSvg).toEqual(['import type { CharacterPose } ', 'export type { CharacterPose } ']);
  });

  it('is not imported by lc-header, lc-logo or lc-empty-state (AC-5)', () => {
    for (const entry of ['header', 'logo', 'empty-state']) {
      const dir = resolve(__dirname, '..', entry);
      for (const name of readdirSync(dir).filter((n) => n.endsWith('.ts') && !/\.(spec|stories)\.ts$/.test(n))) {
        expect(readFileSync(join(dir, name), 'utf-8')).not.toMatch(/angular-ui-kit\/character/);
      }
    }
  });
});
