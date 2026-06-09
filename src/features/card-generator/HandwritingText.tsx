'use client';

import type { Glyph } from '@/types';
import { TARGET } from '@/lib/normalizer';

interface Props {
  text: string;
  glyphs: Glyph[];
  fontSize: number;       // em size in pixels
  lineHeight?: number;
  color?: string;
  maxWidth?: number;
}

// Render handwriting as SVG paths, with fallback to text for undrawn glyphs.
// Coordinate system: normalized glyph paths are in 0-100 units;
// we scale by (fontSize / TARGET.size).
export function HandwritingText({
  text, glyphs, fontSize, lineHeight = 1.5, color = '#1A1A1A', maxWidth,
}: Props) {
  const glyphMap = new Map(glyphs.map((g) => [g.character, g]));
  const scale = fontSize / TARGET.size;
  const lineH = fontSize * lineHeight;

  // Split text into lines (respects \n)
  const rawLines = text.replace(/\r\n/g, '\n').split('\n');

  // Word-wrap if maxWidth given
  const lines: string[] = [];
  for (const raw of rawLines) {
    if (!maxWidth) { lines.push(raw); continue; }
    const words = raw.split(' ');
    let cur = '';
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      const testW = estimateWidth(test, glyphMap, scale);
      if (testW > maxWidth && cur) { lines.push(cur); cur = w; }
      else cur = test;
    }
    lines.push(cur);
  }

  const totalH = lines.length * lineH;
  // viewBox: wide enough, tall enough
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
        const yBase = li * lineH + fontSize; // baseline y for this line
        let xCursor = 0;

        return (
          <g key={li}>
            {[...line].map((char, ci) => {
              if (char === ' ') {
                xCursor += fontSize * 0.35;
                return null;
              }

              const glyph = glyphMap.get(char);
              const advW = (glyph?.boundingBox
                ? (glyph.boundingBox.width + TARGET.padding * 2) * scale
                : fontSize * 0.6);

              const el = glyph?.normalizedPath ? (
                <g
                  key={`${li}-${ci}`}
                  transform={`translate(${xCursor}, ${yBase - fontSize})`}
                >
                  {glyph.normalizedPath.split('M').filter(Boolean).map((seg, si) => (
                    <path
                      key={si}
                      d={`M${seg}`}
                      fill="none"
                      stroke={color}
                      strokeWidth={Math.max(2, fontSize * 0.042)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      transform={`scale(${scale})`}
                    />
                  ))}
                </g>
              ) : (
                // Fallback: draw char as text (uses system font)
                <text
                  key={`${li}-${ci}`}
                  x={xCursor}
                  y={yBase}
                  fontSize={fontSize}
                  fontFamily="'Georgia', serif"
                  fill={`${color}40`}
                  letterSpacing="0"
                >
                  {char}
                </text>
              );

              xCursor += advW + fontSize * 0.04;
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
    const g = glyphMap.get(ch);
    w += g?.boundingBox
      ? (g.boundingBox.width + TARGET.padding * 2) * scale
      : fontSize * 0.6;
    w += fontSize * 0.04;
  }
  return w;
}
