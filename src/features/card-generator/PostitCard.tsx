'use client';

import { forwardRef } from 'react';
import type { PostitColor } from '@/types';
import type { Glyph } from '@/types';
import { HandwritingText } from './HandwritingText';

const COLOR_MAP: Record<PostitColor, { bg: string; shadow: string; tape: string }> = {
  yellow: { bg: '#FFF3A3', shadow: '#e6da92', tape: '#f0e980' },
  pink:   { bg: '#FFD6E0', shadow: '#e0b8c7', tape: '#f7c0cc' },
  blue:   { bg: '#C8E6FF', shadow: '#a8c5e8', tape: '#b0d5f5' },
  white:  { bg: '#FFFFFF', shadow: '#dedede', tape: '#ebebeb' },
  cream:  { bg: '#FAF0E6', shadow: '#e0d6ca', tape: '#f0e4d4' },
};

export const CARD_SIZE = 1200;

interface Props {
  text: string;
  color: PostitColor;
  glyphs: Glyph[];
  fontSize?: number;
  lineHeight?: number;
  padding?: number;
  template?: 'postit' | 'note' | 'polaroid';
  isExport?: boolean;
}

export const PostitCard = forwardRef<HTMLDivElement, Props>(
  ({
    text, color, glyphs,
    fontSize = 72,
    lineHeight = 1.55,
    padding = 96,
    template = 'postit',
    isExport = false,
  }, ref) => {
    const { bg, shadow, tape } = COLOR_MAP[color];
    const size = CARD_SIZE;
    const contentW = size - padding * 2;

    return (
      <div
        ref={ref}
        style={{
          width: size,
          height: size,
          backgroundColor: bg,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Georgia, serif',
          boxSizing: 'border-box',
        }}
      >
        {/* Tape strip (postit) */}
        {template === 'postit' && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 160,
              height: 36,
              backgroundColor: tape,
              opacity: 0.8,
            }}
          />
        )}

        {/* Paper shadow (bottom edge) */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: shadow,
            opacity: 0.4,
          }}
        />

        {/* Notebook lines for 'note' template */}
        {template === 'note' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: padding + i * (fontSize * lineHeight),
                  height: 1,
                  backgroundColor: 'rgba(0,0,0,0.07)',
                }}
              />
            ))}
          </div>
        )}

        {/* Polaroid frame */}
        {template === 'polaroid' && (
          <div
            style={{
              position: 'absolute',
              inset: 24,
              border: '2px solid rgba(0,0,0,0.06)',
              borderRadius: 4,
            }}
          />
        )}

        {/* Main handwriting text */}
        <div
          style={{
            position: 'absolute',
            left: padding,
            top: padding,
            width: contentW,
          }}
        >
          <HandwritingText
            text={text}
            glyphs={glyphs}
            fontSize={fontSize}
            lineHeight={lineHeight}
            color="#1A1A1A"
            maxWidth={contentW}
          />
        </div>

        {/* Watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            right: 40,
            opacity: 0.18,
            fontFamily: 'Georgia, serif',
            fontSize: 22,
            color: '#1A1A1A',
            letterSpacing: '0.04em',
            lineHeight: 1.4,
            textAlign: 'right',
          }}
        >
          <div>made with loveyourhand</div>
          <div style={{ fontSize: 18 }}>loveyourhand.app</div>
        </div>
      </div>
    );
  }
);

PostitCard.displayName = 'PostitCard';
