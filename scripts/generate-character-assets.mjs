#!/usr/bin/env node
/**
 * Generates Edu's rule-made dark drawings and the SVG string entry (3.8, gap G-4).
 *
 * Sources (copied once, unchanged, from life-os `docs/brand/character/`):
 *   - src/assets/character/<pose>-light.svg for the 14 poses below;
 *   - src/assets/character/<pose>-dark.svg for the 4 poses whose dark pair is drawn
 *     (hello, shows-the-way, happy, calm).
 *
 * Emits:
 *   - src/assets/character/<pose>-dark.svg for the other 10 poses: the light file
 *     with the dark rule applied (below; the brand README's table, read per tag);
 *   - src/lib/character-svg/character-svg.data.ts: `CharacterPose`,
 *     `CHARACTER_POSES`, one `CHARACTER_SVG_<POSE>` pair per pose and
 *     `CHARACTER_SVG`, each string equal to its file (trailing newline included).
 *     Plain object literals, no `Object.freeze`, so unused poses tree-shake away.
 *
 * The script fails on any colour, opacity or attribute that the rule doesn't
 * list, and when the rule doesn't reproduce a drawn dark file byte for byte.
 * Re-run after adding or replacing a drawing:
 *   node scripts/generate-character-assets.mjs
 *
 * character.assets.spec.ts fails if the committed output drifts from the files.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const ASSETS = join(ROOT, 'libs/angular-ui-kit/src/assets/character');
const DATA = join(ROOT, 'libs/angular-ui-kit/src/lib/character-svg/character-svg.data.ts');

/** The shipped poses, in the order of the docs: [id, German brand name, dark drawn]. */
const POSES = [
  ['hello', 'Hallo', true],
  ['shows-the-way', 'Zeigt den Weg', true],
  ['happy', 'Freut sich', true],
  ['welcomes-member', 'Begrüßt ein Mitglied', false],
  ['resting', 'Ruht sich aus', false],
  ['in-his-corner', 'Sitzt in seiner Ecke', false],
  ['comforts', 'Tröstet', false],
  ['all-done', 'Erledigt', false],
  ['calm', 'ruhig', true],
  ['connects', 'Verbindet', false],
  ['discovered', 'Hat etwas entdeckt', false],
  ['thinking', 'Denkt nach', false],
  ['connection-paused', 'Verbindung pausiert', false],
  ['see-you', 'Bis bald', false],
];

/** Attributes that never carry a colour; every other attribute is checked. */
const PLAIN = new Set([
  'xmlns', 'width', 'height', 'viewBox', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2',
  'points', 'transform', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray',
]);
const KEPT = new Set(['#0c1722', '#e8b04a', 'none']);

/**
 * The dark value of one tag's colour attributes (design 005 §5). Reads the
 * LIGHT attributes of the same tag; returns the replacements.
 */
function darkAttributes(attrs, where) {
  const { fill, stroke, opacity } = attrs;
  const out = {};
  for (const name of Object.keys(attrs)) {
    if (!PLAIN.has(name) && !['fill', 'stroke', 'opacity'].includes(name)) throw new Error(`${where}: unknown attribute ${name}`);
  }
  if (stroke !== undefined) {
    if (stroke === '#1a6a79') out.stroke = '#84c7d4';
    else if (stroke === '#84c7d4') out.stroke = '#4f9aaa';
    else if (stroke === '#cfe0e4' || stroke === '#d3e2e6') out.stroke = '#2a4250';
    else if (!KEPT.has(stroke)) throw new Error(`${where}: stroke ${stroke} is not in the rule`);
  }
  if (fill !== undefined) {
    if (fill === '#1a6a79') out.fill = '#84c7d4';
    else if (fill === '#ffffff') {
      if (opacity === '0.14') out.opacity = '0.22';
      else if (stroke === '#1a6a79') out.fill = '#0a121b';
    } else if (fill === '#84c7d4') {
      if (opacity === '0.55') out.fill = '#1a6a79';
      else if (stroke !== '#1a6a79') out.fill = '#4f9aaa';
    } else if (fill === '#e9f1f3') out.fill = '#13222e';
    else if (!KEPT.has(fill)) throw new Error(`${where}: fill ${fill} is not in the rule`);
  }
  if (opacity !== undefined) {
    const known = (opacity === '0.14' && fill === '#ffffff') || (opacity === '0.55' && fill === '#84c7d4');
    if (!known) throw new Error(`${where}: opacity ${opacity} on fill ${fill} is not in the rule`);
  }
  return out;
}

/** The light drawing with the dark rule applied, tag by tag; everything else byte for byte. */
function toDark(light, pose) {
  let tags = 0;
  const dark = light.replace(/<([a-z]+)((?:\s+[a-zA-Z][a-zA-Z0-9-]*="[^"]*")*)\s*\/?>/g, (tag, name, attrText) => {
    tags++;
    const attrs = Object.fromEntries([...attrText.matchAll(/([a-zA-Z][a-zA-Z0-9-]*)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    let result = tag;
    for (const [attr, value] of Object.entries(darkAttributes(attrs, `${pose}: <${name}>`))) {
      result = result.replace(new RegExp(`(\\s${attr}=")[^"]*(")`), `$1${value}$2`);
    }
    return result;
  });
  // Every opening tag must have been read; one the pattern skips would keep its light colours.
  if (tags !== (light.match(/<[a-z]/g) ?? []).length) throw new Error(`${pose}: a tag doesn't match the attribute pattern`);
  return dark;
}

const quote = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
const constName = (pose) => `CHARACTER_SVG_${pose.toUpperCase().replace(/-/g, '_')}`;

const pairs = [];
for (const [pose, , drawn] of POSES) {
  const light = readFileSync(join(ASSETS, `${pose}-light.svg`), 'utf-8');
  const ruled = toDark(light, pose);
  const darkFile = join(ASSETS, `${pose}-dark.svg`);
  if (drawn) {
    if (readFileSync(darkFile, 'utf-8') !== ruled) throw new Error(`${pose}: the rule doesn't reproduce the drawn dark file`);
  } else {
    writeFileSync(darkFile, ruled);
  }
  pairs.push([pose, light, ruled]);
}

const lines = [
  '// AUTO-GENERATED by scripts/generate-character-assets.mjs — do not edit by hand.',
  '// Regenerate with: node scripts/generate-character-assets.mjs',
  '',
  "import type { CharacterSvgPair } from './character-svg.types';",
  '',
  '/**',
  " * Edu's poses (3.8, gap G-4), in the order of the docs. `calm` is the neutral",
  ' * Edu; the post-only poses (peeks-around-corner, amazed, looks-ahead) are not shipped.',
  ' */',
  `export type CharacterPose =\n${POSES.map(([p]) => `  | '${p}'`).join('\n')};`,
  '',
  '/** Every shipped pose, in the order of the docs. */',
  `export const CHARACTER_POSES: readonly CharacterPose[] = [\n${POSES.map(([p]) => `  '${p}',`).join('\n')}\n];`,
  '',
];
for (const [pose, light, dark] of pairs) {
  const [, de, drawn] = POSES.find(([p]) => p === pose);
  lines.push(`/** ${pose} (${de}); dark ${drawn ? 'drawn' : 'by the rule'}. */`);
  lines.push(`export const ${constName(pose)}: CharacterSvgPair = {`);
  lines.push(`  light: ${quote(light)},`);
  lines.push(`  dark: ${quote(dark)},`);
  lines.push('};');
  lines.push('');
}
lines.push('/** Every pose\'s light and dark drawing, keyed by pose. */');
lines.push('export const CHARACTER_SVG: Readonly<Record<CharacterPose, CharacterSvgPair>> = {');
for (const [pose] of POSES) lines.push(`  ${/^[a-z]+$/.test(pose) ? pose : `'${pose}'`}: ${constName(pose)},`);
lines.push('};');
lines.push('');
writeFileSync(DATA, lines.join('\n'));
console.log(`${POSES.length} poses: ${POSES.filter(([, , d]) => !d).length} dark files by the rule, ${POSES.filter(([, , d]) => d).length} drawn ones reproduced; wrote ${DATA}`);
