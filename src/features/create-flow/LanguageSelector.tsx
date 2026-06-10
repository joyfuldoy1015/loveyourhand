'use client';

import { motion } from 'framer-motion';
import type { FontLanguage } from '@/types';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { hasSmartModeSupport, getKeyGlyphCount } from '@/lib/smartGlyph';

const OPTIONS: { value: FontLanguage; label: string; sub: string; count: number }[] = [
  { value: 'en',    label: 'English',          sub: 'A–Z · a–z · 0–9 · symbols', count: 77  },
  { value: 'ko',    label: 'Korean',           sub: '초성 · 중성 · 종성 jamo',       count: 67  },
  { value: 'ja',    label: 'Japanese',         sub: 'ひらがな · カタカナ',            count: 92  },
  { value: 'mixed', label: 'English + Korean', sub: 'Complete glyph set',         count: 144 },
];

interface Props {
  selected: FontLanguage;
  onSelect: (lang: FontLanguage) => void;
  onStart: () => void;
  smartMode: boolean;
  onSmartMode: (v: boolean) => void;
}

export function LanguageSelector({ selected, onSelect, onStart, smartMode, onSmartMode }: Props) {
  const supportsSmartMode = hasSmartModeSupport(selected);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-lg mx-auto w-full px-4"
    >
      <motion.div variants={staggerItem} className="text-center mb-10">
        <p className="text-label text-[#6B6B6B] mb-3">Step 1 of 2</p>
        <h1 className="text-headline font-normal">Choose your language</h1>
        <p className="text-body text-[#6B6B6B] mt-3">
          You&apos;ll draw each letter one by one.
        </p>
      </motion.div>

      <motion.div variants={staggerItem} className="space-y-3 mb-6">
        {OPTIONS.map((opt) => {
          const displayCount = (opt.value === selected && smartMode && supportsSmartMode)
            ? getKeyGlyphCount(opt.value, opt.count)
            : opt.count;
          const countLabel = (opt.value === selected && smartMode && supportsSmartMode)
            ? `~${displayCount} glyphs`
            : `~${opt.count} glyphs`;

          return (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(opt.value)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                selected === opt.value
                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#FAFAF8]'
                  : 'border-[#EAEAEA] bg-white hover:border-[#ABABAB] text-[#1A1A1A]'
              }`}
            >
              <div>
                <p className="font-medium text-sm">{opt.label}</p>
                <p className={`text-xs mt-0.5 ${selected === opt.value ? 'text-[#ABABAB]' : 'text-[#6B6B6B]'}`}>
                  {opt.sub}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-medium tracking-wider ${
                  selected === opt.value ? 'text-[#6B6B6B]' : 'text-[#ABABAB]'
                }`}>
                  {countLabel}
                </span>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                  selected === opt.value
                    ? 'border-[#FAFAF8] bg-[#FAFAF8]'
                    : 'border-[#EAEAEA]'
                }`}>
                  {selected === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Smart Glyph Mode toggle — only shown for languages that support it */}
      {supportsSmartMode && (
        <motion.div
          variants={staggerItem}
          className="mb-6 p-4 rounded-2xl border border-[#EAEAEA] bg-[#FAFAF8]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">Smart Glyph Mode</p>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Draw ~{getKeyGlyphCount(selected, OPTIONS.find(o => o.value === selected)?.count ?? 77)} key glyphs.
                Uppercase letters are auto-generated from your style.
              </p>
            </div>
            <button
              onClick={() => onSmartMode(!smartMode)}
              className={`relative w-10 h-6 rounded-full flex-shrink-0 transition-colors ${
                smartMode ? 'bg-[#1A1A1A]' : 'bg-[#EAEAEA]'
              }`}
              aria-pressed={smartMode}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  smartMode ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </motion.div>
      )}

      <motion.div variants={staggerItem}>
        <button
          onClick={onStart}
          className="w-full h-12 rounded-full bg-[#1A1A1A] text-[#FAFAF8] text-sm font-medium hover:bg-[#2D2D2D] transition-colors"
        >
          Start Drawing
        </button>
        <p className="text-center text-[11px] text-[#ABABAB] mt-3">
          You can skip glyphs and come back later.
        </p>
      </motion.div>
    </motion.div>
  );
}
