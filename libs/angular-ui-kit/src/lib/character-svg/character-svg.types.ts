/** One of a pose's two drawings: `light` for light surfaces, `dark` for dark ones. */
export type CharacterDrawing = 'light' | 'dark';

/** A pose's two drawings as SVG markup, each equal to its file `<pose>-<drawing>.svg`. */
export interface CharacterSvgPair {
  readonly light: string;
  readonly dark: string;
}
