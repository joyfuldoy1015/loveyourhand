/**
 * SVG Path → OpenType Path Converter
 *
 * Coordinate transform: normalized (0-100, y-down) → OT (0-1000, y-up)
 *   ot_x = norm_x × 10
 *   ot_y = 760 − norm_y × 10
 *
 * Verification:
 *   baseline (norm y=76)  → ot_y = 760 − 760 = 0     ✓
 *   ascender (norm y=12)  → ot_y = 760 − 120 = 640   ✓
 *   x-height (norm y=44)  → ot_y = 760 − 440 = 320   ✓
 *   descender (norm y=90) → ot_y = 760 − 900 = −140  ✓
 */

import { Path } from 'opentype.js';

export const OT_SCALE     = 10;   // normalized → OT scale factor
export const OT_BASELINE  = 760;  // OT y at normalized baseline (76 × 10)

// ─── Coordinate transform ──────────────────────────────────────────

export function toOtX(nx: number): number {
  return Math.round(nx * OT_SCALE);
}

export function toOtY(ny: number): number {
  return Math.round(OT_BASELINE - ny * OT_SCALE);
}

// ─── Minimal SVG path tokenizer ────────────────────────────────────
// Handles M, L, C, Z produced by strokeExpansion.ts and normalizer.ts

type SvgCmd = { cmd: 'M' | 'L' | 'C' | 'Z'; args: number[] };

function parseSvgPath(d: string): SvgCmd[] {
  const cmds: SvgCmd[] = [];
  // Split on command letters (keep the letter as part of the token)
  const tokens = d.match(/[MLCZ][^MLCZ]*/g);
  if (!tokens) return cmds;

  for (const token of tokens) {
    const letter = token[0] as SvgCmd['cmd'];
    const nums   = token.slice(1).match(/-?[\d.]+(?:e[+-]?\d+)?/gi);
    const args   = nums ? nums.map(Number) : [];
    cmds.push({ cmd: letter, args });
  }
  return cmds;
}

// ─── Build an opentype.Path from one SVG path string ──────────────

export function svgPathToOtPath(svgD: string): Path {
  const path = new Path();
  const cmds = parseSvgPath(svgD);

  for (const { cmd, args } of cmds) {
    switch (cmd) {
      case 'M':
        path.moveTo(toOtX(args[0]), toOtY(args[1]));
        break;
      case 'L':
        path.lineTo(toOtX(args[0]), toOtY(args[1]));
        break;
      case 'C':
        // C cp1x,cp1y,cp2x,cp2y,x,y
        path.curveTo(
          toOtX(args[0]), toOtY(args[1]),
          toOtX(args[2]), toOtY(args[3]),
          toOtX(args[4]), toOtY(args[5]),
        );
        break;
      case 'Z':
        path.close();
        break;
    }
  }
  return path;
}

// ─── Merge multiple SVG paths into one OT Path ────────────────────

export function mergeSvgPathsToOtPath(svgPaths: string[]): Path {
  const merged = new Path();
  for (const d of svgPaths) {
    const p = parseSvgPath(d);
    for (const { cmd, args } of p) {
      switch (cmd) {
        case 'M':
          merged.moveTo(toOtX(args[0]), toOtY(args[1]));
          break;
        case 'L':
          merged.lineTo(toOtX(args[0]), toOtY(args[1]));
          break;
        case 'C':
          merged.curveTo(
            toOtX(args[0]), toOtY(args[1]),
            toOtX(args[2]), toOtY(args[3]),
            toOtX(args[4]), toOtY(args[5]),
          );
          break;
        case 'Z':
          merged.close();
          break;
      }
    }
  }
  return merged;
}
