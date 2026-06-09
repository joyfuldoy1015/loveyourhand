'use client';

import { motion } from 'framer-motion';
import type { Glyph } from '@/types';

interface Props {
  glyph: Glyph;
  index: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export function GlyphNav({ glyph, index, total, canPrev, canNext, onPrev, onNext, onFinish }: Props) {
  const isLast = index === total - 1;

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Prev */}
      <NavButton onClick={onPrev} disabled={!canPrev} dir="prev">
        <ChevronLeft />
        <span className="hidden sm:inline text-xs">Prev</span>
      </NavButton>

      {/* Center info */}
      <div className="flex flex-col items-center gap-0.5 text-center min-w-0">
        <span className="text-[10px] font-medium tracking-widest uppercase text-[#ABABAB]">
          {index + 1} / {total}
        </span>
        <span className="text-xs text-[#6B6B6B]">
          {glyph.isComplete ? '✓ drawn' : 'draw this'}
        </span>
      </div>

      {/* Next or Finish */}
      {isLast ? (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onFinish}
          className="flex items-center gap-1.5 px-4 h-9 rounded-full bg-[#1A1A1A] text-[#FAFAF8] text-xs font-medium"
        >
          Create Card
          <ArrowRight />
        </motion.button>
      ) : (
        <NavButton onClick={onNext} disabled={!canNext} dir="next">
          <span className="hidden sm:inline text-xs">Next</span>
          <ChevronRight />
        </NavButton>
      )}
    </div>
  );
}

function NavButton({
  children, onClick, disabled, dir,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  dir: 'prev' | 'next';
}) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 px-3 h-9 rounded-full border border-[#EAEAEA] text-sm transition-colors ${
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : 'hover:bg-[#F0F0EE] text-[#1A1A1A]'
      }`}
    >
      {children}
    </motion.button>
  );
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6H10M7 3L10 6L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
