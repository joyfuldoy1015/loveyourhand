/**
 * Font Generator
 *
 * Orchestrates TTF generation from a UserFont:
 *   drawn strokes → stroke expansion → OT paths → Font → ArrayBuffer
 *
 * Coordinate system:
 *   unitsPerEm = 1000
 *   ascender   = 800  (OT y; cap-height is at 640)
 *   descender  = -200 (OT y; drawn descender is at -140)
 *   baseline   = 0    (maps to norm y = 76)
 */

import { Font, Glyph as OtGlyph, Path } from 'opentype.js';
import type { Glyph, UserFont } from '@/types';
import { normalizeGlyphStrokes } from '@/lib/normalizer';
import { expandStrokeToOutlineSvg } from '@/lib/strokeExpansion';
import { mergeSvgPathsToOtPath, toOtX, OT_SCALE } from '@/lib/svgToOpentype';

// ─── Constants ────────────────────────────────────────────────────

const UPM       = 1000;
const ASCENDER  = 800;
const DESCENDER = -200;

// Stroke half-width in normalized units.
// 3.5 norm units → 35 OT units → ~5px at 72px CSS font-size.
const HALF_WIDTH = 3.5;

// Side bearing added on each side of the glyph bounding box.
const SIDE_BEARING = 8; // normalized units

// ─── .notdef glyph ────────────────────────────────────────────────
// A simple bordered rectangle representing an unknown character.

function makeNotdefGlyph(): OtGlyph {
  const path = new Path();
  const margin = 50;
  const w = 500, h = 700;
  const t = 60; // border thickness in OT units

  // Outer rect
  path.moveTo(margin, -DESCENDER);
  path.lineTo(margin + w, -DESCENDER);
  path.lineTo(margin + w, -DESCENDER + h);
  path.lineTo(margin, -DESCENDER + h);
  path.close();

  // Inner rect (counter-clockwise for "cut-out" effect in non-zero winding)
  path.moveTo(margin + t, -DESCENDER + t);
  path.lineTo(margin + t, -DESCENDER + h - t);
  path.lineTo(margin + w - t, -DESCENDER + h - t);
  path.lineTo(margin + w - t, -DESCENDER + t);
  path.close();

  return new OtGlyph({
    name: '.notdef',
    advanceWidth: margin * 2 + w,
    path,
  });
}

// ─── Space glyph ──────────────────────────────────────────────────

function makeSpaceGlyph(): OtGlyph {
  return new OtGlyph({
    name: 'space',
    unicode: 0x0020,
    advanceWidth: 250,
    path: new Path(),
  });
}

// ─── Build one OT glyph from a drawn Glyph ────────────────────────

function buildOtGlyph(glyph: Glyph): OtGlyph | null {
  if (!glyph.isComplete || glyph.strokes.length === 0) return null;

  // Normalize raw strokes to 0-100 coordinate space.
  // canvasSize=500 is safe — normalization is scale-independent for multi-point strokes.
  const norm = normalizeGlyphStrokes(glyph.strokes, 500);
  if (norm.strokes.length === 0) return null;

  // Expand each stroke to a filled SVG outline and collect path strings
  const outlinePaths = norm.strokes
    .filter((s) => s.points.length > 0)
    .map((s) => expandStrokeToOutlineSvg(s.points, HALF_WIDTH));

  if (outlinePaths.length === 0) return null;

  // Convert all outline paths to a single merged OT path
  const otPath = mergeSvgPathsToOtPath(outlinePaths);

  // Compute advance width from normalized bounding box
  const bb = norm.boundingBox;
  const advanceWidth = Math.round(
    toOtX(bb.x + bb.width) + SIDE_BEARING * OT_SCALE,
  );

  return new OtGlyph({
    name: glyphName(glyph),
    unicode: glyph.unicode,
    advanceWidth: Math.max(100, advanceWidth),
    path: otPath,
  });
}

function glyphName(g: Glyph): string {
  const code = g.unicode.toString(16).padStart(4, '0');
  // Use standard Adobe glyph names for ASCII
  if (g.unicode >= 0x41 && g.unicode <= 0x5A) return g.character; // A-Z
  if (g.unicode >= 0x61 && g.unicode <= 0x7A) return g.character; // a-z
  if (g.unicode >= 0x30 && g.unicode <= 0x39) return `uni${code}`; // 0-9
  return `uni${code}`;
}

// ─── Public: generate TTF from a UserFont ─────────────────────────

export interface GenerateResult {
  buffer: ArrayBuffer;
  glyphCount: number;
}

export async function generateTtf(userFont: UserFont): Promise<GenerateResult> {
  const glyphs: OtGlyph[] = [
    makeNotdefGlyph(),
    makeSpaceGlyph(),
  ];

  let glyphCount = 0;
  for (const g of userFont.glyphs) {
    const otGlyph = buildOtGlyph(g);
    if (otGlyph) {
      glyphs.push(otGlyph);
      glyphCount++;
    }
  }

  const font = new Font({
    familyName:  userFont.name || 'Loveyourhand',
    styleName:   'Regular',
    unitsPerEm:  UPM,
    ascender:    ASCENDER,
    descender:   DESCENDER,
    glyphs,
  });

  const buffer = font.toArrayBuffer();
  return { buffer, glyphCount };
}

// ─── Public: generate TTF and store in font ───────────────────────

export async function generateAndStoreTtf(
  userFont: UserFont,
): Promise<{ font: UserFont; glyphCount: number }> {
  const { buffer, glyphCount } = await generateTtf(userFont);
  return {
    font: { ...userFont, ttfBuffer: buffer },
    glyphCount,
  };
}
