'use client';

import { motion } from 'framer-motion';
import type { Glyph } from '@/types';
import { TARGET } from '@/lib/normalizer';

interface Props {
  glyphs: Glyph[];
  onSelect?: (glyph: Glyph) => void;
}

const CELL_SIZE = 64; // display size in px per glyph cell
const SCALE = CELL_SIZE / TARGET.size;

export function GlyphShowcase({ glyphs, onSelect }: Props) {
  const drawn   = glyphs.filter((g) => g.isComplete);
  const undrawn = glyphs.filter((g) => !g.isComplete);

  if (drawn.length === 0) {
    return (
      <p className="text-sm text-[#ABABAB] text-center py-8">
        No glyphs drawn yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <GlyphGrid label={`Drawn (${drawn.length})`} glyphs={drawn} onSelect={onSelect} />
      {undrawn.length > 0 && (
        <GlyphGrid label={`Not drawn (${undrawn.length})`} glyphs={undrawn} onSelect={onSelect} muted />
      )}
    </div>
  );
}

interface GridProps {
  label:    string;
  glyphs:   Glyph[];
  onSelect?: (glyph: Glyph) => void;
  muted?:   boolean;
}

function GlyphGrid({ label, glyphs, onSelect, muted }: GridProps) {
  return (
    <div>
      <p className="text-[10px] font-medium tracking-widest uppercase text-[#6B6B6B] mb-3">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {glyphs.map((glyph, i) => (
          <GlyphCell
            key={glyph.id}
            glyph={glyph}
            index={i}
            muted={muted}
            onClick={onSelect ? () => onSelect(glyph) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

interface CellProps {
  glyph:   Glyph;
  index:   number;
  muted?:  boolean;
  onClick?: () => void;
}

function GlyphCell({ glyph, index, muted, onClick }: CellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: muted ? 0.35 : 1, scale: 1 }}
      transition={{ delay: index * 0.018, duration: 0.2 }}
      onClick={onClick}
      title={`U+${glyph.unicode.toString(16).toUpperCase().padStart(4, '0')} · ${glyph.character}`}
      className={`relative flex items-center justify-center rounded-xl border bg-white overflow-hidden
        ${onClick ? 'cursor-pointer hover:border-[#1A1A1A] transition-colors' : ''}
        ${muted ? 'border-[#EAEAEA]' : 'border-[#EAEAEA] hover:border-[#ABABAB]'}`}
      style={{ width: CELL_SIZE + 8, height: CELL_SIZE + 8 }}
    >
      {glyph.isComplete && glyph.normalizedPath ? (
        <svg
          width={CELL_SIZE}
          height={CELL_SIZE}
          viewBox={`0 0 ${TARGET.size} ${TARGET.size}`}
          fill="none"
        >
          {glyph.normalizedPath.split(/(?=M)/).filter(Boolean).map((d, si) => (
            <path
              key={si}
              d={d.trim()}
              stroke="#1A1A1A"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
        </svg>
      ) : (
        <span className="text-lg text-[#ABABAB]" style={{ fontFamily: 'serif' }}>
          {glyph.character}
        </span>
      )}
      <span className="absolute bottom-0.5 right-1 text-[8px] text-[#ABABAB] leading-none">
        {glyph.character}
      </span>
    </motion.div>
  );
}
