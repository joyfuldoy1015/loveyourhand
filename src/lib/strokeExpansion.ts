/**
 * Stroke Expansion Engine
 * Converts a handwriting stroke (Point[]) into a filled SVG outline
 * suitable for embedding in an OpenType font glyph.
 *
 * Pipeline:
 *   raw points → Catmull-Rom smooth sampling
 *   → compute per-point normals (offset paths)
 *   → closed outline: left side → end cap → right side reversed → start cap
 */

import type { Point } from '@/types';

const KAPPA            = 0.5523; // Cubic bezier approximation constant for a quarter-circle
const SAMPLES_PER_SEG  = 8;      // Catmull-Rom sampling density

// ─── Formatting helper ─────────────────────────────────────────────

const fmt = (n: number) => Math.round(n * 100) / 100;

// ─── Catmull-Rom sampling ──────────────────────────────────────────

function sampleCatmullRom(pts: Point[], density: number): Point[] {
  if (pts.length === 0) return [];
  if (pts.length === 1) return [{ ...pts[0] }];

  const result: Point[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];

    for (let j = 0; j < density; j++) {
      const t  = j / density;
      const t2 = t * t;
      const t3 = t2 * t;
      result.push({
        x: 0.5 * (2*p1.x + (-p0.x+p2.x)*t + (2*p0.x-5*p1.x+4*p2.x-p3.x)*t2 + (-p0.x+3*p1.x-3*p2.x+p3.x)*t3),
        y: 0.5 * (2*p1.y + (-p0.y+p2.y)*t + (2*p0.y-5*p1.y+4*p2.y-p3.y)*t2 + (-p0.y+3*p1.y-3*p2.y+p3.y)*t3),
      });
    }
  }
  result.push({ ...pts[pts.length - 1] });
  return result;
}

// ─── Offset paths from sampled stroke ─────────────────────────────

interface OffsetData {
  left:     Point[];
  right:    Point[];
  tangents: Point[];
}

function computeOffsets(sampled: Point[], hw: number): OffsetData {
  const left: Point[] = [], right: Point[] = [], tangents: Point[] = [];
  const n = sampled.length;

  for (let i = 0; i < n; i++) {
    let tx: number, ty: number;
    if (i === 0) {
      tx = sampled[1].x - sampled[0].x;
      ty = sampled[1].y - sampled[0].y;
    } else if (i === n - 1) {
      tx = sampled[i].x - sampled[i-1].x;
      ty = sampled[i].y - sampled[i-1].y;
    } else {
      tx = sampled[i+1].x - sampled[i-1].x;
      ty = sampled[i+1].y - sampled[i-1].y;
    }
    const len = Math.hypot(tx, ty);
    if (len < 1e-9) { tx = 1; ty = 0; } else { tx /= len; ty /= len; }
    tangents.push({ x: tx, y: ty });

    // normal = (-ty, tx) → "left" side of the stroke direction
    const nx = -ty, ny = tx;
    left.push({ x: sampled[i].x + nx * hw, y: sampled[i].y + ny * hw });
    right.push({ x: sampled[i].x - nx * hw, y: sampled[i].y - ny * hw });
  }
  return { left, right, tangents };
}

// ─── Semicircle cap (verified with concrete coordinates) ──────────
//
// Appends 2 cubic bezier curves forming a semicircle:
//   from `fromPt` → tip (= center + outTangent*r) → symmetric `toPt`
//
// Derivation verified: tangent = (1,0), normal = (0,1), r=1 gives the
// standard quarter-circle approximations (0,1)→(0.5523,1)→(1,0.5523)→(1,0)
// and (1,0)→(1,-0.5523)→(0.5523,-1)→(0,-1).

function appendSemicircle(
  parts: string[],
  center: Point,
  outTangent: Point, // unit tangent pointing OUT of the stroke end
  fromPt:    Point,  // left or right side of stroke at this end
  hw:        number, // half-width = circle radius
) {
  // Unit normal from center → fromPt
  const nx = (fromPt.x - center.x) / hw;
  const ny = (fromPt.y - center.y) / hw;

  // toPt is the mirror of fromPt through center
  const to = { x: center.x - nx * hw, y: center.y - ny * hw };

  // Tip of cap
  const tip = { x: center.x + outTangent.x * hw, y: center.y + outTangent.y * hw };

  // Arc 1: fromPt → tip
  const cp1 = { x: fromPt.x + outTangent.x * hw * KAPPA, y: fromPt.y + outTangent.y * hw * KAPPA };
  const cp2 = { x: tip.x + nx * hw * KAPPA,               y: tip.y + ny * hw * KAPPA };
  parts.push(`C${fmt(cp1.x)},${fmt(cp1.y)},${fmt(cp2.x)},${fmt(cp2.y)},${fmt(tip.x)},${fmt(tip.y)}`);

  // Arc 2: tip → toPt
  const cp3 = { x: tip.x - nx * hw * KAPPA,               y: tip.y - ny * hw * KAPPA };
  const cp4 = { x: to.x + outTangent.x * hw * KAPPA,      y: to.y + outTangent.y * hw * KAPPA };
  parts.push(`C${fmt(cp3.x)},${fmt(cp3.y)},${fmt(cp4.x)},${fmt(cp4.y)},${fmt(to.x)},${fmt(to.y)}`);
}

// ─── Circle path (single-point dot) ───────────────────────────────

function circleSvg(c: Point, r: number): string {
  const k = r * KAPPA;
  return [
    `M${fmt(c.x-r)},${fmt(c.y)}`,
    `C${fmt(c.x-r)},${fmt(c.y-k)},${fmt(c.x-k)},${fmt(c.y-r)},${fmt(c.x)},${fmt(c.y-r)}`,
    `C${fmt(c.x+k)},${fmt(c.y-r)},${fmt(c.x+r)},${fmt(c.y-k)},${fmt(c.x+r)},${fmt(c.y)}`,
    `C${fmt(c.x+r)},${fmt(c.y+k)},${fmt(c.x+k)},${fmt(c.y+r)},${fmt(c.x)},${fmt(c.y+r)}`,
    `C${fmt(c.x-k)},${fmt(c.y+r)},${fmt(c.x-r)},${fmt(c.y+k)},${fmt(c.x-r)},${fmt(c.y)}`,
    'Z',
  ].join('');
}

// ─── Build closed outline path ─────────────────────────────────────

function buildOutlinePath(
  left: Point[], right: Point[], sampled: Point[], tangents: Point[], hw: number,
): string {
  const n = left.length;
  if (n === 0) return '';
  const parts: string[] = [];

  // Start at left[0]
  parts.push(`M${fmt(left[0].x)},${fmt(left[0].y)}`);

  // Forward along left side
  for (let i = 1; i < n; i++) parts.push(`L${fmt(left[i].x)},${fmt(left[i].y)}`);

  // End cap: left[n-1] → right[n-1] curving around sampled[n-1]
  appendSemicircle(parts, sampled[n-1], tangents[n-1], left[n-1], hw);

  // Backward along right side
  for (let i = n - 2; i >= 0; i--) parts.push(`L${fmt(right[i].x)},${fmt(right[i].y)}`);

  // Start cap: right[0] → left[0] curving around sampled[0] in the -tangent direction
  const backTangent = { x: -tangents[0].x, y: -tangents[0].y };
  appendSemicircle(parts, sampled[0], backTangent, right[0], hw);

  parts.push('Z');
  return parts.join('');
}

// ─── Public API ────────────────────────────────────────────────────

/**
 * Expand a handwriting stroke into a filled SVG path outline.
 *
 * @param points       Normalized points (0–100 coordinate space)
 * @param halfWidth    Half of the desired stroke width in normalized units
 * @returns            Closed filled SVG path string
 */
export function expandStrokeToOutlineSvg(points: Point[], halfWidth: number): string {
  if (points.length === 0) return '';
  if (points.length === 1) return circleSvg(points[0], halfWidth);

  const sampled = sampleCatmullRom(points, SAMPLES_PER_SEG);
  const { left, right, tangents } = computeOffsets(sampled, halfWidth);
  return buildOutlinePath(left, right, sampled, tangents, halfWidth);
}
