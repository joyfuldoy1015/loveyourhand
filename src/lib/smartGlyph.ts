import type { Glyph } from '@/types';

// ─── Derivation rules ─────────────────────────────────────────────
// All 26 uppercase are derived from their lowercase counterparts (copy).
// 'b' is derived from 'd' (horizontal flip: x' = 100-x).
// 'u' is derived from 'n' (vertical flip around xHeight y=44: y' = 88-y).

export type GlyphTransform = 'copy' | 'flip_h' | 'flip_v';

export interface DerivationRule {
  source: string;
  transform: GlyphTransform;
}

export const DERIVATION_MAP_EN: Record<string, DerivationRule> = {
  // Lowercase flips
  b: { source: 'd', transform: 'flip_h' },
  u: { source: 'n', transform: 'flip_v' },
  // Uppercase from lowercase
  A: { source: 'a', transform: 'copy' },
  B: { source: 'b', transform: 'copy' },
  C: { source: 'c', transform: 'copy' },
  D: { source: 'd', transform: 'copy' },
  E: { source: 'e', transform: 'copy' },
  F: { source: 'f', transform: 'copy' },
  G: { source: 'g', transform: 'copy' },
  H: { source: 'h', transform: 'copy' },
  I: { source: 'i', transform: 'copy' },
  J: { source: 'j', transform: 'copy' },
  K: { source: 'k', transform: 'copy' },
  L: { source: 'l', transform: 'copy' },
  M: { source: 'm', transform: 'copy' },
  N: { source: 'n', transform: 'copy' },
  O: { source: 'o', transform: 'copy' },
  P: { source: 'p', transform: 'copy' },
  Q: { source: 'q', transform: 'copy' },
  R: { source: 'r', transform: 'copy' },
  S: { source: 's', transform: 'copy' },
  T: { source: 't', transform: 'copy' },
  U: { source: 'u', transform: 'copy' },
  V: { source: 'v', transform: 'copy' },
  W: { source: 'w', transform: 'copy' },
  X: { source: 'x', transform: 'copy' },
  Y: { source: 'y', transform: 'copy' },
  Z: { source: 'z', transform: 'copy' },
};

// Per-language derivation maps
const DERIVATION_MAPS: Partial<Record<string, Record<string, DerivationRule>>> = {
  en: DERIVATION_MAP_EN,
};

// ─── SVG path transformation ──────────────────────────────────────
// Paths from catmullRomPath contain only M, L, C commands in 0-100 space.
// Even-indexed params are x coords; odd-indexed are y coords.

const CMD_PARAM_COUNT: Record<string, number> = { M: 2, L: 2, C: 6 };

function transformPath(
  path: string,
  xFn: (x: number) => number,
  yFn: (y: number) => number,
): string {
  const out: string[] = [];
  let i = 0;

  const skip = () => {
    while (i < path.length && (path[i] === ',' || path[i] === ' ')) i++;
  };

  const readNum = (): number => {
    skip();
    let s = '';
    if (path[i] === '-') s += path[i++];
    while (i < path.length && (path[i] === '.' || (path[i] >= '0' && path[i] <= '9')))
      s += path[i++];
    return parseFloat(s) || 0;
  };

  const fmt = (n: number) => {
    const r = Math.round(n * 100) / 100;
    return r % 1 === 0 ? String(r) : r.toFixed(2);
  };

  while (i < path.length) {
    skip();
    if (i >= path.length) break;
    const ch = path[i];
    if (/[MLCZmlcz]/.test(ch)) {
      i++;
      const cmd = ch.toUpperCase();
      if (cmd === 'Z') { out.push('Z'); continue; }
      const n = CMD_PARAM_COUNT[cmd] ?? 0;
      const nums: string[] = [];
      for (let p = 0; p < n; p++) {
        const v = readNum();
        nums.push(p % 2 === 0 ? fmt(xFn(v)) : fmt(yFn(v)));
      }
      out.push(`${ch}${nums.join(',')}`);
    } else {
      i++;
    }
  }

  return out.join('');
}

// Horizontal flip: mirror around x=50 in 0-100 space
function flipH(path: string): string {
  return transformPath(path, x => 100 - x, y => y);
}

// Vertical flip around xHeight midpoint y=44: y' = 88 - y
// Maps baseline (y=76) → top (y=12) and vice versa, keeping x-height center fixed.
function flipV(path: string): string {
  return transformPath(path, x => x, y => 88 - y);
}

function applyTransform(sourcePath: string, transform: GlyphTransform): string {
  if (transform === 'flip_h') return flipH(sourcePath);
  if (transform === 'flip_v') return flipV(sourcePath);
  return sourcePath;
}

// ─── Core derivation function ─────────────────────────────────────

export function deriveGlyphs(glyphs: Glyph[], language: string): Glyph[] {
  const rules = DERIVATION_MAPS[language];
  if (!rules) return glyphs;

  // Snapshot of the ORIGINAL glyphs before this derivation pass.
  // We resolve chains (e.g. B←b←d) by looking up the chain in rules.
  const byChar = new Map(glyphs.map(g => [g.character, g]));

  const resolvePath = (char: string): string | undefined => {
    const g = byChar.get(char);
    if (g?.normalizedPath && (g.isComplete && !g.isDerived)) return g.normalizedPath;
    if (g?.normalizedPath && g.isDerived) {
      // Already derived in a previous call — use it if available
      return g.normalizedPath;
    }
    // Try resolving via the chain
    const rule = rules[char];
    if (!rule) return undefined;
    const srcPath = resolvePath(rule.source);
    if (!srcPath) return undefined;
    return applyTransform(srcPath, rule.transform);
  };

  return glyphs.map(glyph => {
    const rule = rules[glyph.character];
    if (!rule) return glyph; // not a derived character

    // Don't overwrite manually drawn glyphs
    if (glyph.isComplete && !glyph.isDerived) return glyph;

    const sourcePath = resolvePath(rule.source);
    if (!sourcePath) return glyph; // source not drawn yet

    const derivedPath = applyTransform(sourcePath, rule.transform);
    const sourceGlyph = byChar.get(rule.source);

    return {
      ...glyph,
      normalizedPath: derivedPath,
      boundingBox: sourceGlyph?.boundingBox,
      isComplete: true,
      isDerived: true,
    };
  });
}

// ─── Helpers ──────────────────────────────────────────────────────

export function isDerivedChar(char: string, language: string): boolean {
  const rules = DERIVATION_MAPS[language];
  return rules ? char in rules : false;
}

export function getKeyGlyphCount(language: string, totalCount: number): number {
  const rules = DERIVATION_MAPS[language];
  if (!rules) return totalCount;
  return totalCount - Object.keys(rules).length;
}

export function hasSmartModeSupport(language: string): boolean {
  return language in DERIVATION_MAPS;
}
