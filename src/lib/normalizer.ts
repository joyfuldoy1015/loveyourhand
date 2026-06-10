import type { Stroke, Point, BoundingBox } from '@/types';

// ─── Guide Proportions (canvas-relative) ─────────────────────────
// These define how the guide lines sit in the 0-1 canvas space.
export const GUIDE_RATIOS = {
  ascender:  0.12,
  capHeight: 0.22,
  xHeight:   0.44,
  baseline:  0.76,
  descender: 0.90,
} as const;

// ─── Target coordinate system ────────────────────────────────────
// All normalized glyphs live in a 0-100 square.
// y=0 is ascender, y=100 is below descender.
// baseline sits at y=76 (mirrors GUIDE_RATIOS.baseline * 100)
export const TARGET = {
  size:       100,
  padding:    8,
  baseline:   76,
  ascender:   12,
  xHeight:    44,
  descender:  90,
} as const;

// ─── Pre-smoothing helpers ────────────────────────────────────────

// Remove points that are too close together (mouse stutter / pause artifacts)
export function minDistanceFilter(points: Point[], minDist = 3): Point[] {
  if (points.length <= 2) return points;
  const out: Point[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = out[out.length - 1];
    if (Math.hypot(points[i].x - prev.x, points[i].y - prev.y) >= minDist) {
      out.push(points[i]);
    }
  }
  // Always keep the last point
  const last = points[points.length - 1];
  if (out[out.length - 1] !== last) out.push(last);
  return out;
}

// Laplacian smooth: moves each interior point toward the avg of its neighbors.
// Preserves endpoints. Run multiple passes for stronger effect.
export function smoothPoints(points: Point[], passes = 3): Point[] {
  if (points.length <= 2) return points;
  let pts = points;
  for (let pass = 0; pass < passes; pass++) {
    const next: Point[] = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      next.push({
        x: (pts[i - 1].x + 2 * pts[i].x + pts[i + 1].x) / 4,
        y: (pts[i - 1].y + 2 * pts[i].y + pts[i + 1].y) / 4,
      });
    }
    next.push(pts[pts.length - 1]);
    pts = next;
  }
  return pts;
}

// ─── Douglas-Peucker point reduction ─────────────────────────────

function perpDist(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / len;
}

export function douglasPeucker(points: Point[], epsilon: number): Point[] {
  if (points.length <= 2) return [...points];
  let maxDist = 0;
  let maxIdx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDist(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) { maxDist = d; maxIdx = i; }
  }
  if (maxDist > epsilon) {
    const left  = douglasPeucker(points.slice(0, maxIdx + 1), epsilon);
    const right = douglasPeucker(points.slice(maxIdx), epsilon);
    return [...left.slice(0, -1), ...right];
  }
  return [points[0], points[points.length - 1]];
}

// ─── Catmull-Rom → cubic Bezier SVG path ─────────────────────────

function catmullRomPath(pts: Point[], tension = 0.4): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;
  if (pts.length === 2) return `M${pts[0].x},${pts[0].y}L${pts[1].x},${pts[1].y}`;

  let d = `M${f(pts[0].x)},${f(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += `C${f(cp1x)},${f(cp1y)},${f(cp2x)},${f(cp2y)},${f(p2.x)},${f(p2.y)}`;
  }
  return d;
}

function f(n: number) { return Math.round(n * 100) / 100; }

// ─── Bounding Box ─────────────────────────────────────────────────

export function getBoundingBox(strokes: Stroke[]): BoundingBox {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  for (const s of strokes) {
    for (const p of s.points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }
  if (!isFinite(minX)) return { x: 0, y: 0, width: 0, height: 0 };
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// ─── Normalize result ─────────────────────────────────────────────

export interface NormalizedGlyph {
  strokes: Stroke[];
  svgPaths: string[];
  boundingBox: BoundingBox;
  advanceWidth: number;
}

// ─── Main normalization pipeline ──────────────────────────────────
//
// Strategy:
//  1. Reduce points (Douglas-Peucker, ε = 2px)
//  2. Compute bounding box
//  3. Scale so glyph height fills the ascender→baseline range in target coords
//  4. Center horizontally, baseline-align vertically
//  5. Convert to SVG paths (Catmull-Rom cubic bezier)

export function normalizeGlyphStrokes(
  rawStrokes: Stroke[],
  canvasSize: number = 500,
): NormalizedGlyph {
  const empty: NormalizedGlyph = {
    strokes: [],
    svgPaths: [],
    boundingBox: { x: 0, y: 0, width: 0, height: 0 },
    advanceWidth: TARGET.size,
  };

  const validStrokes = rawStrokes.filter((s) => s.points.length > 0);
  if (validStrokes.length === 0) return empty;

  // Step 1: pre-smooth then reduce
  // minDistanceFilter removes stutter clusters → smoothPoints removes jitter → D-P simplifies
  // 6 smoothing passes for iPad high-frequency input; ε=0.8 keeps enough curve-defining points
  const reduced = validStrokes.map((s) => ({
    ...s,
    points: douglasPeucker(smoothPoints(minDistanceFilter(s.points, 3), 6), 0.8),
  }));

  // Step 2: bounding box in canvas coordinates
  const rawBbox = getBoundingBox(reduced);
  if (rawBbox.width === 0 && rawBbox.height === 0) return empty;

  // Step 3: determine scale
  // Scale so the glyph fills the full ascender→baseline target range (64 units).
  // Using rawBbox.height as the source height ensures every glyph is rendered at
  // a consistent visual size regardless of how large or small it was drawn on canvas.
  const guideAscY  = canvasSize * GUIDE_RATIOS.ascender;
  const guideBaseY = canvasSize * GUIDE_RATIOS.baseline;
  const guideH     = guideBaseY - guideAscY;
  const targetH    = TARGET.baseline - TARGET.ascender;

  const usedH  = rawBbox.height === 0 ? guideH : rawBbox.height;
  const scaleY = targetH / usedH;
  const scaleX = scaleY; // uniform scale

  // Step 4: translate
  // y: pin the bottom of the glyph's bounding box to the target baseline.
  const dy = TARGET.baseline - (rawBbox.y + rawBbox.height) * scaleY;

  // x: center within target
  const scaledW = rawBbox.width * scaleX;
  const targetCenter = TARGET.size / 2;
  const dx = targetCenter - (rawBbox.x * scaleX + scaledW / 2);

  // Step 5: apply transform
  const normalized = reduced.map((s) => ({
    ...s,
    points: s.points.map((p) => ({
      x: f(p.x * scaleX + dx),
      y: f(p.y * scaleY + dy),
    })),
  }));

  const normBbox = getBoundingBox(normalized);

  // Step 6: SVG paths (Catmull-Rom)
  const svgPaths = normalized.map((s) => catmullRomPath(s.points));

  return {
    strokes: normalized,
    svgPaths,
    boundingBox: normBbox,
    advanceWidth: Math.max(20, Math.min(TARGET.size, normBbox.width + TARGET.padding * 2)),
  };
}

// ─── Canvas draw helpers (used by DrawingCanvas) ──────────────────

export function drawSmoothStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  lineWidth: number,
  color: string,
) {
  if (points.length === 0) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (points.length === 1) {
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  // Quadratic bezier through midpoints – classic smooth canvas technique
  for (let i = 0; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2;
    const my = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();
  ctx.restore();
}

export function drawGuides(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const lines: Array<{ y: number; dash: number[]; color: string }> = [
    { y: height * GUIDE_RATIOS.ascender,  dash: [4, 6], color: 'rgba(0,0,0,0.10)' },
    { y: height * GUIDE_RATIOS.xHeight,   dash: [4, 6], color: 'rgba(0,0,0,0.08)' },
    { y: height * GUIDE_RATIOS.baseline,  dash: [],     color: 'rgba(0,0,0,0.18)' },
    { y: height * GUIDE_RATIOS.descender, dash: [4, 6], color: 'rgba(0,0,0,0.08)' },
  ];
  for (const { y, dash, color } of lines) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
    ctx.restore();
  }
}
