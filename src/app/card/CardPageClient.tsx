'use client';

import { useRef, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { UserFont, PostitColor } from '@/types';
import { fontRepo } from '@/lib/db';
import { CardEditor } from '@/features/card-generator/CardEditor';
import { PostitCard } from '@/features/card-generator/PostitCard';
import { CardExporter } from '@/features/card-generator/CardExporter';
import { Header } from '@/components/layout';
import { Button } from '@/components/ui';

const PREVIEW_SCALE = 0.35;

export function CardPageClient() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const cardRef      = useRef<HTMLDivElement>(null);

  const [font, setFont]             = useState<UserFont | null>(null);
  const [isLoading, setIsLoading]   = useState(true);

  // Card config state
  const [text, setText]             = useState('Handmade in a machine-made world.');
  const [color, setColor]           = useState<PostitColor>('yellow');
  const [fontSize, setFontSize]     = useState(72);
  const [lineHeight, setLineHeight] = useState(1.55);
  const [padding, setPadding]       = useState(96);
  const [template, setTemplate]     = useState<'postit' | 'note' | 'polaroid'>('postit');
  const [contentMode, setContentMode] = useState<'preset' | 'custom'>('preset');

  // Load font and set language-appropriate initial text
  useEffect(() => {
    const FIRST_PRESET: Record<string, string> = {
      en:    'Handmade in a machine-made world.',
      ko:    '내 손글씨',
      ja:    'てのきせき',
      mixed: 'Handmade in a machine-made world.',
    };
    const fontId = searchParams.get('fontId');
    setIsLoading(true);
    const apply = (f: UserFont | undefined) => {
      const resolved = f ?? null;
      setFont(resolved);
      if (resolved) setText(FIRST_PRESET[resolved.language] ?? FIRST_PRESET.en);
      setIsLoading(false);
    };
    if (fontId) {
      fontRepo.getById(fontId).then(apply);
    } else {
      fontRepo.getLatest().then(apply);
    }
  }, [searchParams]);

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

  const glyphs = font?.glyphs ?? [];
  const drawnCount = glyphs.filter((g) => g.isComplete).length;

  return (
    <>
      <Header minimal />
      <main className="flex-1 pt-16">
        <div className="max-w-6xl mx-auto px-4 py-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className="text-label text-[#6B6B6B] mb-1">Step 2 of 2</p>
            <h1 className="text-headline font-normal">Create your card</h1>
            {drawnCount > 0 ? (
              <p className="text-sm text-[#6B6B6B] mt-1">
                Using {drawnCount} handwritten glyphs from your font.
                {drawnCount < 10 && (
                  <button
                    onClick={() => router.push(`/create?fontId=${font?.id ?? ''}`)}
                    className="ml-2 underline underline-offset-2"
                  >
                    Draw more letters →
                  </button>
                )}
              </p>
            ) : (
              <p className="text-sm text-[#ABABAB] mt-1">
                No glyphs drawn yet — text will show as placeholder.{' '}
                <button
                  onClick={() => router.push('/create')}
                  className="underline underline-offset-2 text-[#6B6B6B]"
                >
                  Draw letters first →
                </button>
              </p>
            )}
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Preview ──────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex-1 flex flex-col items-center gap-6"
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  width:  1200 * PREVIEW_SCALE,
                  height: 1200 * PREVIEW_SCALE,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    transform: `scale(${PREVIEW_SCALE})`,
                    transformOrigin: 'top left',
                    width: 1200,
                    height: 1200,
                  }}
                >
                  <PostitCard
                    ref={cardRef}
                    text={text}
                    color={color}
                    glyphs={glyphs}
                    fontSize={fontSize}
                    lineHeight={lineHeight}
                    padding={padding}
                    template={template}
                  />
                </div>
              </div>

              {/* Export */}
              <div className="w-full max-w-xs">
                <CardExporter cardRef={cardRef} filename="loveyourhand-card" />
              </div>
            </motion.div>

            {/* ── Editor ───────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="w-full lg:w-80 shrink-0"
            >
              <div className="rounded-2xl border border-[#EAEAEA] bg-white p-5">
                <CardEditor
                  text={text}
                  color={color}
                  fontSize={fontSize}
                  lineHeight={lineHeight}
                  padding={padding}
                  template={template}
                  contentMode={contentMode}
                  language={font?.language}
                  onText={setText}
                  onColor={setColor}
                  onFontSize={setFontSize}
                  onLineHeight={setLineHeight}
                  onPadding={setPadding}
                  onTemplate={setTemplate}
                  onContentMode={setContentMode}
                />
              </div>

              {/* Back to drawing */}
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(font ? `/create?fontId=${font.id}` : '/create')}
                >
                  ← Back to Drawing
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
