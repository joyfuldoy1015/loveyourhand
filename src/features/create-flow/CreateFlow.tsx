'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';
import type { FontLanguage, UserFont, Glyph } from '@/types';
import { getGlyphsForLanguage } from '@/lib/glyphs';
import { fontRepo } from '@/lib/db';
import { normalizeGlyphStrokes } from '@/lib/normalizer';
import { deriveGlyphs, isDerivedChar } from '@/lib/smartGlyph';
import { LanguageSelector } from './LanguageSelector';
import { DrawingView } from '@/features/drawing/DrawingView';
import { analytics } from '@/lib/analytics';

type FlowStep = 'loading' | 'language' | 'drawing';

const DEFAULT_METADATA = {
  unitsPerEm: 1000, ascender: 800, descender: -200, capHeight: 700, xHeight: 500,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildFont(language: FontLanguage, smartMode: boolean): UserFont {
  const glyphDefs = getGlyphsForLanguage(language);

  const makeGlyph = (char: string, unicode: number, type: Glyph['type'], derived: boolean): Glyph => ({
    id: nanoid(),
    character: char,
    unicode,
    type,
    strokes: [],
    isComplete: false,
    isDerived: derived,
  });

  if (smartMode) {
    // Key glyphs (drawable) go first — shuffled.
    // Derived glyphs go after — not shown in the drawing queue.
    const keyDefs  = glyphDefs.filter(d => !isDerivedChar(d.character, language));
    const derivedDefs = glyphDefs.filter(d =>  isDerivedChar(d.character, language));
    const keyGlyphs     = shuffle(keyDefs.map(d => makeGlyph(d.character, d.unicode, d.type, false)));
    const derivedGlyphs = derivedDefs.map(d => makeGlyph(d.character, d.unicode, d.type, true));
    return {
      id: nanoid(),
      name: `My Font ${new Date().toLocaleDateString('ko-KR')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      language,
      glyphs: [...keyGlyphs, ...derivedGlyphs],
      metadata: DEFAULT_METADATA,
      isSmartMode: true,
    };
  }

  const glyphs: Glyph[] = shuffle(
    glyphDefs.map((def) => makeGlyph(def.character, def.unicode, def.type, false))
  );
  return {
    id: nanoid(),
    name: `My Font ${new Date().toLocaleDateString('ko-KR')}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language,
    glyphs,
    metadata: DEFAULT_METADATA,
  };
}

export function CreateFlow() {
  const searchParams = useSearchParams();
  const fontId       = searchParams.get('fontId');

  const [step, setStep]         = useState<FlowStep>(fontId ? 'loading' : 'language');
  const [language, setLanguage] = useState<FontLanguage>('en');
  const [font, setFont]         = useState<UserFont | null>(null);

  // If fontId is in URL, load existing font and jump straight to drawing
  useEffect(() => {
    if (!fontId) return;
    fontRepo.getById(fontId).then((existing) => {
      if (existing) {
        // Re-compute normalizedPath from stored strokes so any font drawn under a
        // different normalization algorithm gets corrected automatically on load.
        const glyphs = existing.glyphs.map((g) => {
          if (!g.isComplete || !g.strokes.length || g.isDerived) return g;
          const n = normalizeGlyphStrokes(g.strokes);
          return { ...g, normalizedPath: n.svgPaths.join(' '), boundingBox: n.boundingBox };
        });
        setFont({ ...existing, glyphs });
        setStep('drawing');
      } else {
        setStep('language');
      }
    });
  }, [fontId]);

  const handleStart = useCallback(() => {
    const newFont = buildFont(language, false);
    setFont(newFont);
    setStep('drawing');
    analytics.startCreation(language);
  }, [language]);

  const handleFontUpdate = useCallback((updated: UserFont) => {
    if (updated.isSmartMode) {
      // Re-derive after every glyph commit so derived glyphs update reactively.
      const withDerived = { ...updated, glyphs: deriveGlyphs(updated.glyphs, updated.language) };
      setFont(withDerived);
    } else {
      setFont(updated);
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-16">
      <AnimatePresence mode="wait">

        {step === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-6 h-6 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6B6B6B]">Loading your font…</p>
          </motion.div>
        )}

        {step === 'language' && (
          <motion.div
            key="language"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <LanguageSelector
              selected={language}
              onSelect={setLanguage}
              onStart={handleStart}
            />
          </motion.div>
        )}

        {step === 'drawing' && font && (
          <motion.div
            key="drawing"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            <DrawingView font={font} onFontUpdate={handleFontUpdate} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
