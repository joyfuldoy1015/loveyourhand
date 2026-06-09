'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { UserFont } from '@/types';
import { fontRepo } from '@/lib/db';
import { generateAndStoreTtf } from '@/lib/fontGenerator';
import { analytics } from '@/lib/analytics';
import { GlyphShowcase } from './GlyphShowcase';
import { FontActions } from './FontActions';
import { Header } from '@/components/layout';

// ─── FontFace injection ───────────────────────────────────────────

async function injectFontFace(buffer: ArrayBuffer, family: string): Promise<void> {
  // Remove previous instance if re-generating
  const existing = Array.from(document.fonts).find(
    (f) => f.family === family,
  ) as FontFace | undefined;
  if (existing) document.fonts.delete(existing);

  const face = new FontFace(family, buffer);
  await face.load();
  document.fonts.add(face);
}

// ─── Preview sentences ────────────────────────────────────────────

const PREVIEW_LINES = [
  'Hello, world',
  'The quick brown fox jumps over the lazy dog',
  'abcdefghijklmnopqrstuvwxyz',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0123456789',
];

// ─── Component ────────────────────────────────────────────────────

export function FontPreviewClient() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [font, setFont]             = useState<UserFont | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fontFamily, setFontFamily] = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [glyphCount, setGlyphCount] = useState(0);
  const [previewSize, setPreviewSize] = useState(48);

  // Load font from IndexedDB
  useEffect(() => {
    const fontId = searchParams.get('fontId');
    setIsLoading(true);
    const loader = fontId ? fontRepo.getById(fontId) : fontRepo.getLatest();
    loader.then((f) => {
      setFont(f ?? null);
      setIsLoading(false);
      // If TTF was previously generated, inject it
      if (f?.ttfBuffer) {
        const family = `LYH_${f.id.slice(0, 8)}`;
        injectFontFace(f.ttfBuffer, family)
          .then(() => setFontFamily(family))
          .catch(console.error);
      }
    });
  }, [searchParams]);

  // Generate TTF
  const handleGenerate = useCallback(async () => {
    if (!font) return;
    setIsGenerating(true);
    setError(null);
    try {
      const { font: updated, glyphCount: count } = await generateAndStoreTtf(font);
      // Persist the updated font with ttfBuffer to IndexedDB
      await fontRepo.save(updated);
      setFont(updated);
      setGlyphCount(count);
      analytics.fontGenerated(count);

      // Inject into FontFace API
      const family = `LYH_${updated.id.slice(0, 8)}`;
      await injectFontFace(updated.ttfBuffer!, family);
      setFontFamily(family);
    } catch (err) {
      console.error('Font generation failed:', err);
      setError('Font generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [font]);

  if (isLoading) {
    return (
      <>
        <Header minimal />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-[#6B6B6B]">Loading your font...</p>
          </div>
        </main>
      </>
    );
  }

  if (!font) {
    return (
      <>
        <Header minimal />
        <main className="flex-1 pt-16 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-sm text-[#6B6B6B]">No font found.</p>
            <button
              onClick={() => router.push('/create')}
              className="text-sm underline underline-offset-2"
            >
              Start drawing →
            </button>
          </div>
        </main>
      </>
    );
  }

  const drawnCount = font.glyphs.filter((g) => g.isComplete).length;

  return (
    <>
      <Header minimal />
      <main className="flex-1 pt-16">
        <div className="max-w-5xl mx-auto px-4 py-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <p className="text-label text-[#6B6B6B] mb-1">Font Preview</p>
            <h1 className="text-headline font-normal">{font.name}</h1>
            <p className="text-sm text-[#6B6B6B] mt-1">
              {drawnCount} glyph{drawnCount !== 1 ? 's' : ''} drawn
              {font.ttfBuffer && ` · ${glyphCount || drawnCount} in font`}
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Left: preview + glyphs ──────────────────────────── */}
            <div className="flex-1 space-y-8">

              {/* Live preview */}
              {fontFamily ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-[#EAEAEA] bg-white p-6 space-y-4"
                >
                  {/* Size slider */}
                  <div className="flex items-center gap-4">
                    <p className="text-[10px] font-medium tracking-widest uppercase text-[#6B6B6B] shrink-0">
                      Preview
                    </p>
                    <input
                      type="range"
                      min={16}
                      max={120}
                      value={previewSize}
                      onChange={(e) => setPreviewSize(Number(e.target.value))}
                      className="flex-1 h-1 accent-[#1A1A1A]"
                    />
                    <span className="text-xs text-[#ABABAB] w-8 text-right">{previewSize}px</span>
                  </div>

                  {/* Preview text lines */}
                  <div className="space-y-3 overflow-hidden">
                    {PREVIEW_LINES.map((line) => (
                      <p
                        key={line}
                        className="text-[#1A1A1A] leading-tight break-all"
                        style={{ fontFamily: `"${fontFamily}", serif`, fontSize: previewSize }}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#EAEAEA] bg-[#FAFAF8] p-8 text-center">
                  <p className="text-sm text-[#ABABAB]">
                    Generate the font to see a live preview.
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Glyph grid */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-2xl border border-[#EAEAEA] bg-white p-6"
              >
                <GlyphShowcase glyphs={font.glyphs} />
              </motion.div>
            </div>

            {/* ── Right: actions ──────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full lg:w-72 shrink-0"
            >
              <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5 space-y-5">
                <div>
                  <p className="text-[10px] font-medium tracking-widest uppercase text-[#6B6B6B] mb-1">
                    Font File
                  </p>
                  <p className="text-xs text-[#ABABAB]">
                    Download a .ttf file you can install and use in any app.
                  </p>
                </div>

                <FontActions
                  fontId={font.id}
                  fontName={font.name}
                  ttfBuffer={font.ttfBuffer ?? null}
                  isGenerating={isGenerating}
                  onGenerate={handleGenerate}
                />
              </div>

              {/* Stats */}
              <div className="mt-4 rounded-2xl border border-[#EAEAEA] bg-white p-5 space-y-3">
                <p className="text-[10px] font-medium tracking-widest uppercase text-[#6B6B6B]">
                  Stats
                </p>
                <Stat label="Language" value={font.language.toUpperCase()} />
                <Stat label="Total glyphs" value={String(font.glyphs.length)} />
                <Stat label="Drawn" value={String(drawnCount)} />
                <Stat label="Remaining" value={String(font.glyphs.length - drawnCount)} />
                {font.ttfBuffer && (
                  <Stat
                    label="File size"
                    value={`${(font.ttfBuffer.byteLength / 1024).toFixed(1)} KB`}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#6B6B6B]">{label}</span>
      <span className="text-xs font-medium text-[#1A1A1A]">{value}</span>
    </div>
  );
}
