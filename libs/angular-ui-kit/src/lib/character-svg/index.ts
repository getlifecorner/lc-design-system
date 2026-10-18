/**
 * Public API of the secondary entry `@lifecorner/angular-ui-kit/character-svg`
 * (3.8, gap G-4): Edu's poses as SVG strings, for inlining at build time (a
 * static page, a prerender step, a script). Plain TypeScript without Angular,
 * so Node imports it as it is.
 *
 * Each string equals its file in the package's `assets/character/` folder.
 * Every pose is a plain object literal, so a bundler keeps only the ones an
 * app imports (`CHARACTER_SVG_COMFORTS`); `CHARACTER_SVG` holds all 14.
 */
export * from './character-svg.types';
export * from './character-svg.data';
