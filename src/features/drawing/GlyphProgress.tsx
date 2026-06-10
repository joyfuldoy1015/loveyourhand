'use client';

import { motion } from 'framer-motion';
import type { Glyph } from '@/types';

interface Props {
  glyphs: Glyph[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

const GROUP_LABELS: Record<string, string> = {
  uppercase:     'ABC',
  lowercase:     'abc',
  number:        '123',
  symbol:        '!?.',
  'jamo-initial': '초성',
  'jamo-vowel':   '중성',
  'jamo-final':   '종성',
  hiragana:      'ひらがな',
  katakana:      'カタカナ',
};

export function GlyphProgress({ glyphs, currentIndex, onSelect }: Props) {
  const isSmartMode   = glyphs.some((g) => g.isDerived);
  const keyGlyphs     = isSmartMode ? glyphs.filter((g) => !g.isDerived) : glyphs;
  const keyCompleted  = keyGlyphs.filter((g) => g.isComplete).length;
  const derivedDone   = isSmartMode ? glyphs.filter((g) => g.isDerived && g.isComplete).length : 0;
  const completed     = isSmartMode ? keyCompleted : glyphs.filter((g) => g.isComplete).length;
  const pct           = Math.round((completed / (keyGlyphs.length || 1)) * 100);

  // Group glyphs
  const grouped = glyphs.reduce<Record<string, { glyph: Glyph; index: number }[]>>(
    (acc, glyph, index) => {
      const key = glyph.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push({ glyph, index });
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 bg-[#EAEAEA] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#1A1A1A] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-[10px] font-medium tabular-nums text-[#6B6B6B] text-right whitespace-nowrap">
          {isSmartMode
            ? <>{completed}/{keyGlyphs.length} <span className="text-[#9B59B6]">+{derivedDone}</span></>
            : `${completed}/${glyphs.length}`}
        </span>
      </div>

      {/* Glyph grid */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {Object.entries(grouped).map(([type, items]) => (
          <div key={type}>
            <p className="text-[9px] font-medium tracking-widest uppercase text-[#ABABAB] mb-1.5">
              {GROUP_LABELS[type] ?? type}
            </p>
            <div className="flex flex-wrap gap-1">
              {items.map(({ glyph, index }) => (
                <motion.button
                  key={glyph.id}
                  onClick={() => !glyph.isDerived && onSelect(index)}
                  whileTap={{ scale: glyph.isDerived ? 1 : 0.9 }}
                  className={`w-7 h-7 rounded-md text-[11px] font-medium transition-colors flex items-center justify-center ${
                    index === currentIndex
                      ? 'bg-[#1A1A1A] text-[#FAFAF8]'
                      : glyph.isComplete && !glyph.isDerived
                      ? 'bg-[#E8F5E9] text-[#2E7D32]'
                      : glyph.isComplete && glyph.isDerived
                      ? 'bg-[#EDE7F6] text-[#7B1FA2]'
                      : 'bg-[#F5F5F3] text-[#9B9B9B] hover:bg-[#EAEAEA] hover:text-[#1A1A1A]'
                  }`}
                >
                  {glyph.character}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
