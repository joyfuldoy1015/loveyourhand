'use client';

import type { Glyph } from '@/types';
import { TARGET } from '@/lib/normalizer';
import { decomposeSyllable, CHOSEONG, JUNGSEONG, JONGSEONG } from '@/lib/koreanComposer';

interface Props {
  text: string;
  glyphs: Glyph[];
  fontSize: number;
  lineHeight?: number;
  color?: string;
  maxWidth?: number;
}

// ─── Syllable block layout ────────────────────────────────────────
// Each region is expressed in 0–1 relative to the syllable em box.

interface Region { rx: number; ry: number; rw: number; rh: number; }

interface SyllableLayout {
  cho:   Region;
  jung:  Region;
  jong?: Region;
}

// Vertical vowels: initial consonant sits left, vowel sits right.
// Indices into JUNGSEONG: ㅏ0 ㅐ1 ㅑ2 ㅒ3 ㅓ4 ㅔ5 ㅕ6 ㅖ7 ㅣ20
const VERTICAL_VOWEL = new Set([0, 1, 2, 3, 4, 5, 6, 7, 20]);

function getSyllableLayout(jungIdx: number, hasJong: boolean): SyllableLayout {
  const vert = VERTICAL_VOWEL.has(jungIdx);
  if (vert && !hasJong) return {
    cho:  { rx: 0,    ry: 0,    rw: 0.45, rh: 1.0  },
    jung: { rx: 0.45, ry: 0,    rw: 0.55, rh: 1.0  },
  };
  if (vert && hasJong) return {
    cho:  { rx: 0,    ry: 0,    rw: 0.45, rh: 0.65 },
    jung: { rx: 0.45, ry: 0,    rw: 0.55, rh: 0.65 },
    jong: { rx: 0,    ry: 0.65, rw: 1.0,  rh: 0.35 },
  };
  if (!vert && !hasJong) return {
    cho:  { rx: 0, ry: 0,    rw: 1.0, rh: 0.55 },
    jung: { rx: 0, ry: 0.55, rw: 1.0, rh: 0.45 },
  };
  // horizontal vowel + jongseong
  return {
    cho:  { rx: 0, ry: 0,    rw: 1.0, rh: 0.40 },
    jung: { rx: 0, ry: 0.40, rw: 1.0, rh: 0.30 },
    jong: { rx: 0, ry: 0.70, rw: 1.0, rh: 0.30 },
  };
}

// ─── Per-jamo path renderer ───────────────────────────────────────

function renderJamo(
  glyph: Glyph | undefined,
  region: Region,
  xCursor: number,
  yBase: number,
  fontSize: number,
  baseScale: number,
  color: string,
  key: string,
) {
  if (!glyph?.normalizedPath) return null;
  const tx = xCursor + region.rx * fontSize;
  const ty = yBase - fontSize + region.ry * fontSize;
  const sx = region.rw * baseScale;
  const sy = region.rh * baseScale;
  // Compensate strokeWidth for the sub-region scaling so lines stay consistent
  const sw = Math.max(2, fontSize * 0.068) / Math.min(region.rw, region.rh);
  return (
    <g key={key} transform={`translate(${f(tx)}, ${f(ty)})`}>
      {glyph.normalizedPath.split('M').filter(Boolean).map((seg, si) => (
        <path
          key={si}
          d={`M${seg}`}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`scale(${f(sx)}, ${f(sy)})`}
        />
      ))}
    </g>
  );
}

const f = (n: number) => Math.round(n * 100) / 100;

// ─── Main component ───────────────────────────────────────────────

export function HandwritingText({
  text, glyphs, fontSize, lineHeight = 1.5, color = '#1A1A1A', maxWidth,
}: Props) {
  const glyphMap = new Map(glyphs.map((g) => [g.character, g]));
  const scale = fontSize / TARGET.size;
  const lineH = fontSize * lineHeight;

  const rawLines = text.replace(/\r\n/g, '\n').split('\n');

  // Break a word that is itself wider than maxWidth into character-level chunks
  const breakWord = (word: string): string[] => {
    if (!maxWidth || estimateWidth(word, glyphMap, scale) <= maxWidth) return [word];
    const chunks: string[] = [];
    let chunk = '';
    for (const ch of word) {
      const test = chunk + ch;
      if (estimateWidth(test, glyphMap, scale) > maxWidth && chunk) {
        chunks.push(chunk);
        chunk = ch;
      } else {
        chunk = test;
      }
    }
    if (chunk) chunks.push(chunk);
    return chunks;
  };

  const lines: string[] = [];
  for (const raw of rawLines) {
    if (!maxWidth) { lines.push(raw); continue; }
    const words = raw.split(' ');
    let cur = '';
    for (const w of words) {
      for (const part of breakWord(w)) {
        const test = cur ? `${cur} ${part}` : part;
        if (estimateWidth(test, glyphMap, scale) > maxWidth && cur) {
          lines.push(cur); cur = part;
        } else {
          cur = test;
        }
      }
    }
    lines.push(cur);
  }

  const totalH = lines.length * lineH;
  const totalW = maxWidth ?? Math.max(
    ...lines.map((l) => estimateWidth(l, glyphMap, scale))
  );

  return (
    <svg
      width={totalW}
      height={totalH}
      viewBox={`0 0 ${totalW} ${totalH}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      {lines.map((line, li) => {
        const yBase = li * lineH + fontSize;
        let xCursor = 0;

        return (
          <g key={li}>
            {[...line].map((char, ci) => {
              if (char === ' ') {
                xCursor += fontSize * 0.35;
                return null;
              }

              const cp = char.codePointAt(0)!;
              const isSyllable = cp >= 0xAC00 && cp <= 0xD7A3;

              // ── Korean syllable block ──────────────────────────
              if (isSyllable) {
                const block = decomposeSyllable(cp)!;
                const layout = getSyllableLayout(block.jungseong, block.jongseong > 0);

                const choChar  = CHOSEONG[block.choseong];
                const jungChar = JUNGSEONG[block.jungseong];
                const jongChar = block.jongseong > 0 ? JONGSEONG[block.jongseong - 1] : null;

                const choGlyph  = glyphMap.get(choChar);
                const jungGlyph = glyphMap.get(jungChar);
                const jongGlyph = jongChar ? glyphMap.get(jongChar) : undefined;

                const hasDrawn = choGlyph?.normalizedPath || jungGlyph?.normalizedPath;
                const advW = fontSize;

                const el = hasDrawn ? (
                  <g key={`${li}-${ci}`}>
                    {renderJamo(choGlyph,  layout.cho,  xCursor, yBase, fontSize, scale, color, `cho-${li}-${ci}`)}
                    {renderJamo(jungGlyph, layout.jung, xCursor, yBase, fontSize, scale, color, `jung-${li}-${ci}`)}
                    {layout.jong && renderJamo(jongGlyph, layout.jong, xCursor, yBase, fontSize, scale, color, `jong-${li}-${ci}`)}
                  </g>
                ) : (
                  <text
                    key={`${li}-${ci}`}
                    x={xCursor}
                    y={yBase}
                    fontSize={fontSize * 0.85}
                    fontFamily="'Georgia', 'Times New Roman', serif"
                    fontWeight="400"
                    fill={color}
                  >
                    {char}
                  </text>
                );

                xCursor += advW + fontSize * 0.04;
                return el;
              }

              // ── Latin / other glyph ────────────────────────────
              const glyph = glyphMap.get(char);
              const bboxX = glyph?.boundingBox?.x ?? 0;
              // Pin the left edge of the glyph's strokes to xCursor by offsetting
              // the translate by -bboxX*scale. This makes every glyph start its
              // visible strokes exactly at xCursor regardless of where they sit in
              // the 0–100 normalized space.
              const advW = glyph?.boundingBox
                ? glyph.boundingBox.width * scale + fontSize * 0.05
                : fontSize * 0.55;

              const el = glyph?.normalizedPath ? (
                <g
                  key={`${li}-${ci}`}
                  transform={`translate(${f(xCursor - bboxX * scale)}, ${f(yBase - fontSize)})`}
                >
                  {glyph.normalizedPath.split('M').filter(Boolean).map((seg, si) => (
                    <path
                      key={si}
                      d={`M${seg}`}
                      fill="none"
                      stroke={color}
                      strokeWidth={Math.max(3, fontSize * 0.09)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      transform={`scale(${scale})`}
                    />
                  ))}
                </g>
              ) : (
                <text
                  key={`${li}-${ci}`}
                  x={xCursor}
                  y={yBase}
                  fontSize={fontSize}
                  fontFamily="var(--font-nunito), 'Arial Rounded MT Bold', Arial, sans-serif"
                  fontWeight="600"
                  fill={color}
                >
                  {char}
                </text>
              );

              xCursor += advW;
              return el;
            })}
          </g>
        );
      })}
    </svg>
  );
}

function estimateWidth(
  text: string,
  glyphMap: Map<string, Glyph>,
  scale: number,
): number {
  const fontSize = scale * TARGET.size;
  let w = 0;
  for (const ch of text) {
    if (ch === ' ') { w += fontSize * 0.35; continue; }
    const cp = ch.codePointAt(0)!;
    if (cp >= 0xAC00 && cp <= 0xD7A3) {
      // Precomposed syllable: full em width
      w += fontSize + fontSize * 0.04;
      continue;
    }
    const g = glyphMap.get(ch);
    w += g?.boundingBox
      ? g.boundingBox.width * scale + fontSize * 0.05
      : fontSize * 0.55;
  }
  return w;
}
