/**
 * SVG path builders shared by the line-shaped charts (line, area, sparkline).
 */

export interface ChartPoint {
  x: number;
  y: number;
}

/**
 * Dash pattern of a dashed series (3.43, request 063): dashes 3 × and gaps
 * 2 × the stroke width, so `6 4` at the default 2 px.
 */
export function chartDashArray(strokeWidth: number): string {
  return `${3 * strokeWidth} ${2 * strokeWidth}`;
}

/**
 * Dash pattern of a dotted series (3.45, request 065): zero-length dashes
 * every 2 × the stroke width; with round caps each is a dot of the stroke
 * width's diameter, so `0 4` at the default 2 px.
 */
export function chartDotArray(strokeWidth: number): string {
  return `0 ${2 * strokeWidth}`;
}

/** `M x,y L x,y …` polyline through the points; '' for fewer than two points. */
export function linearPath(points: readonly ChartPoint[]): string {
  if (points.length < 2) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
}

/**
 * Smooth cubic path through the points (Catmull-Rom → Bézier approximation);
 * '' for fewer than two points.
 */
export function smoothPath(points: readonly ChartPoint[]): string {
  if (points.length < 2) return '';
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}
