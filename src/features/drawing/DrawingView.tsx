'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { Stroke, UserFont } from '@/types';
import { normalizeGlyphStrokes } from '@/lib/normalizer';
import { fontRepo, sessionRepo } from '@/lib/db';

import { DrawingCanvas } from './DrawingCanvas';
import { DrawingToolbar } from './DrawingToolbar';
import { GlyphNav } from './GlyphNav';
import { GlyphProgress } from './GlyphProgress';

interface Props {
  font: UserFont;
  onFontUpdate: (font: UserFont) => void;
}

const CANVAS_DESKTOP = 500;
const CANVAS_MOBILE  = 340;
const SAVE_INTERVAL  = 5000;

export function DrawingView({ font, onFontUpdate }: Props) {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [strokes, setStrokes]           = useState<Stroke[]>([]);
  const [undoStack, setUndoStack]       = useState<Stroke[][]>([]);
  const [redoStack, setRedoStack]       = useState<Stroke[][]>([]);
  const [penSize, setPenSize]           = useState(6);
  const [canvasSize, setCanvasSize]     = useState(CANVAS_DESKTOP);
  const [showProgress, setShowProgress] = useState(true);
  const [isSaving, setIsSaving]         = useState(false);
  const [isCreating, setIsCreating]     = useState(false);

  const fontRef     = useRef<UserFont>(font);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { fontRef.current = font; }, [font]);

  // ── Responsive canvas ──────────────────────────────────────────
  useEffect(() => {
    const check = () => setCanvasSize(window.innerWidth < 600 ? CANVAS_MOBILE : CANVAS_DESKTOP);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── Load strokes for current glyph ────────────────────────────
  // Depend on font.id (not the full font object) so that stroke commits
  // don't reset the undo stack — only glyph navigation or font switch does.
  useEffect(() => {
    const glyph = font.glyphs[currentIndex];
    if (!glyph) return;
    setStrokes(glyph.strokes ?? []);
    setUndoStack([]);
    setRedoStack([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, font.id]);

  // ── Auto-save every 5 seconds ─────────────────────────────────
  useEffect(() => {
    saveTimerRef.current = setInterval(async () => {
      await persistFont(fontRef.current);
    }, SAVE_INTERVAL);
    return () => { if (saveTimerRef.current) clearInterval(saveTimerRef.current); };
  }, []);

  const persistFont = async (f: UserFont) => {
    setIsSaving(true);
    try {
      await fontRepo.save({ ...f, updatedAt: new Date().toISOString() });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Commit current strokes to font glyph ──────────────────────
  const commitCurrentGlyph = useCallback((newStrokes: Stroke[]): UserFont => {
    const normalized = normalizeGlyphStrokes(newStrokes, canvasSize);
    const updatedGlyphs = fontRef.current.glyphs.map((g, i) => {
      if (i !== currentIndex) return g;
      return {
        ...g,
        strokes: newStrokes,
        normalizedPath: normalized.svgPaths.join(' '),
        boundingBox: normalized.boundingBox,
        isComplete: newStrokes.length > 0,
        drawnAt: new Date().toISOString(),
      };
    });
    const updated: UserFont = {
      ...fontRef.current,
      glyphs: updatedGlyphs,
      updatedAt: new Date().toISOString(),
    };
    fontRef.current = updated;
    onFontUpdate(updated);
    return updated;
  }, [currentIndex, canvasSize, onFontUpdate]);

  // ── Strokes change ────────────────────────────────────────────
  const handleStrokesChange = useCallback((newStrokes: Stroke[]) => {
    setUndoStack((u) => [...u, strokes]);
    setRedoStack([]);
    setStrokes(newStrokes);
    commitCurrentGlyph(newStrokes);
  }, [strokes, commitCurrentGlyph]);

  // ── Undo / Redo / Clear ───────────────────────────────────────
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((r) => [...r, strokes]);
    setStrokes(prev);
    setUndoStack((u) => u.slice(0, -1));
    commitCurrentGlyph(prev);
  }, [strokes, undoStack, commitCurrentGlyph]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((u) => [...u, strokes]);
    setStrokes(next);
    setRedoStack((r) => r.slice(0, -1));
    commitCurrentGlyph(next);
  }, [strokes, redoStack, commitCurrentGlyph]);

  const handleClear = useCallback(() => {
    setUndoStack((u) => [...u, strokes]);
    setRedoStack([]);
    setStrokes([]);
    commitCurrentGlyph([]);
  }, [strokes, commitCurrentGlyph]);

  // ── Navigation ────────────────────────────────────────────────
  // In Smart Mode the drawing queue is only the non-derived (key) glyphs,
  // which are always placed first in font.glyphs by buildFont.
  const keyGlyphCount = font.isSmartMode
    ? font.glyphs.filter((g) => !g.isDerived).length
    : font.glyphs.length;

  const goTo = (idx: number) => {
    setCurrentIndex(idx);
  };

  const handleNext = () => {
    if (currentIndex < keyGlyphCount - 1) goTo(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) goTo(currentIndex - 1);
  };

  const handleFinish = async () => {
    setIsCreating(true);
    const updated = commitCurrentGlyph(strokes);
    await persistFont(updated);
    await sessionRepo.save({
      id: updated.id,
      fontId: updated.id,
      currentGlyphIndex: currentIndex,
      glyphOrder: updated.glyphs.map((g) => g.id),
      savedAt: new Date().toISOString(),
    });
    // Hold the animation for at least 1.8s before navigating
    await new Promise((r) => setTimeout(r, 1800));
    router.push(`/card?fontId=${updated.id}`);
  };

  const currentGlyph = font.glyphs[currentIndex];
  if (!currentGlyph) return null;

  if (isCreating) {
    const drawnGlyphs = font.glyphs.filter((g) => g.isComplete && !g.isDerived).slice(0, 8);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAFAF8]"
      >
        {/* Floating glyph previews */}
        <div className="flex items-end gap-3 mb-10 h-16">
          {drawnGlyphs.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
            >
              <svg
                width={36}
                height={36}
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                {g.normalizedPath?.split('M').filter(Boolean).map((seg, si) => (
                  <path
                    key={si}
                    d={`M${seg}`}
                    fill="none"
                    stroke="#1A1A1A"
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
              </svg>
            </motion.div>
          ))}
        </div>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-base font-medium text-[#1A1A1A] tracking-wide text-center"
        >
          Creating your card
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-sm text-[#ABABAB] mt-1.5 text-center"
        >
          Turning your handwriting into something beautiful
        </motion.p>

        {/* Dot animation */}
        <div className="flex gap-1.5 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  const completedCount = font.glyphs.filter((g) => g.isComplete).length;
  const drawnCount     = font.isSmartMode
    ? font.glyphs.filter((g) => g.isComplete && !g.isDerived).length
    : completedCount;
  const derivedCount   = font.isSmartMode
    ? font.glyphs.filter((g) => g.isComplete && g.isDerived).length
    : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full max-w-5xl mx-auto px-4">

      {/* ── Left: canvas area ──────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 w-full lg:w-auto">

        {/* Character label */}
        <div className="flex items-center gap-3">
          <motion.div
            key={currentGlyph.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1A1A1A] text-[#FAFAF8] text-xl font-medium"
          >
            {currentGlyph.character}
          </motion.div>
          <div>
            <p className="text-[10px] font-medium tracking-widest uppercase text-[#6B6B6B]">
              Draw this character
            </p>
            <p className="text-xs text-[#ABABAB]">
              Trace within the guide lines
            </p>
          </div>

          {/* Skip to random undrawn glyph */}
          <button
            onClick={() => {
              const undrawn = font.glyphs
                .map((g, i) => ({ g, i }))
                .filter(({ g, i }) => !g.isComplete && i !== currentIndex && !g.isDerived);
              if (undrawn.length === 0) return;
              const pick = undrawn[Math.floor(Math.random() * undrawn.length)];
              goTo(pick.i);
            }}
            title="Skip to a random undrawn letter"
            className="ml-auto w-8 h-8 rounded-full border border-[#EAEAEA] text-[#ABABAB] hover:text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors flex items-center justify-center text-base"
          >
            ↪
          </button>
        </div>

        {/* Canvas wrapper */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentGlyph.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="rounded-[20px] overflow-hidden border border-[#EAEAEA]"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
          >
            <DrawingCanvas
              width={canvasSize}
              height={canvasSize}
              strokes={strokes}
              strokeWidth={penSize}
              ghostChar={currentGlyph.character}
              showGuides={true}
              onStrokesChange={handleStrokesChange}
            />
          </motion.div>
        </AnimatePresence>

        {/* Toolbar */}
        <div
          className="w-full rounded-2xl border border-[#EAEAEA] bg-white px-3 py-2.5"
          style={{ width: canvasSize }}
        >
          <DrawingToolbar
            penSize={penSize}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            canClear={strokes.length > 0}
            onPenSize={setPenSize}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
          />
        </div>

        {/* Navigation */}
        <div className="w-full" style={{ width: canvasSize }}>
          <GlyphNav
            glyph={currentGlyph}
            index={currentIndex}
            total={keyGlyphCount}
            canPrev={currentIndex > 0}
            canNext={currentIndex < keyGlyphCount - 1}
            onPrev={handlePrev}
            onNext={handleNext}
            onFinish={handleFinish}
          />
        </div>

        {/* Save indicator */}
        <p className="text-[10px] text-[#ABABAB]">
          {isSaving ? 'Saving…' : font.isSmartMode
            ? `${drawnCount} drawn · ${derivedCount} auto-generated · auto-saved`
            : `${completedCount} glyphs drawn · auto-saved`}
        </p>
      </div>

      {/* ── Right: progress panel ──────────────────────────────── */}
      <div className="w-full lg:w-64 xl:w-72">
        <button
          className="flex items-center justify-between w-full mb-3 lg:cursor-default"
          onClick={() => setShowProgress((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium tracking-widest uppercase text-[#6B6B6B]">
              Progress
            </span>
            {font.isSmartMode && (
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[#EDE7F6] text-[#7B1FA2] tracking-wide">
                Smart
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#ABABAB] lg:hidden">
            {showProgress ? 'Hide' : 'Show'}
          </span>
        </button>

        <div className={`${showProgress ? 'block' : 'hidden'} lg:block`}>
          <GlyphProgress
            glyphs={font.glyphs}
            currentIndex={currentIndex}
            onSelect={goTo}
          />
        </div>

        {/* Quick-access shortcuts */}
        {completedCount >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-2xl border border-[#EAEAEA] bg-[#FAFAF8] space-y-2"
          >
            <p className="text-xs text-[#1A1A1A] font-medium mb-1">
              {completedCount} glyphs drawn
            </p>
            <p className="text-[11px] text-[#6B6B6B] mb-3">
              You can create a card or preview your font now.
            </p>
            <button
              onClick={handleFinish}
              className="w-full h-8 rounded-full bg-[#1A1A1A] text-[#FAFAF8] text-xs font-medium"
            >
              Create Card →
            </button>
            <button
              onClick={() => router.push(`/preview?fontId=${font.id}`)}
              className="w-full h-8 rounded-full border border-[#EAEAEA] text-[#1A1A1A] text-xs font-medium"
            >
              Preview Font →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
