'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { UserFont } from '@/types';
import { fontRepo } from '@/lib/db';
import { analytics } from '@/lib/analytics';
import { Header } from '@/components/layout';
import { staggerContainer, staggerItem } from '@/lib/animations';

export function FontLibraryClient() {
  const router  = useRouter();
  const [fonts, setFonts]         = useState<UserFont[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const all = await fontRepo.getAll();
    setFonts(all);
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (font: UserFont) => {
    if (!confirm(`Delete "${font.name}"? This cannot be undone.`)) return;
    setDeleting(font.id);
    await fontRepo.delete(font.id);
    analytics.fontDeleted();
    await load();
    setDeleting(null);
  };

  return (
    <>
      <Header minimal />
      <main className="flex-1 pt-16">
        <div className="max-w-3xl mx-auto px-4 py-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end justify-between mb-8"
          >
            <div>
              <p className="text-[10px] font-medium tracking-widest uppercase text-[#6B6B6B] mb-1">
                Your Fonts
              </p>
              <h1 className="text-headline font-normal">Font Library</h1>
            </div>
            <button
              onClick={() => router.push('/create')}
              className="h-9 px-5 rounded-full bg-[#1A1A1A] text-[#FAFAF8] text-xs font-medium"
            >
              + New Font
            </button>
          </motion.div>

          {/* Content */}
          {isLoading ? (
            <FontListSkeleton />
          ) : fonts.length === 0 ? (
            <EmptyFontLibrary onStart={() => router.push('/create')} />
          ) : (
            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <AnimatePresence>
                {fonts.map((font) => (
                  <motion.li
                    key={font.id}
                    variants={staggerItem}
                    exit={{ opacity: 0, x: -20 }}
                    layout
                  >
                    <FontCard
                      font={font}
                      isDeleting={deleting === font.id}
                      onEdit={() => router.push(`/create?fontId=${font.id}`)}
                      onPreview={() => router.push(`/preview?fontId=${font.id}`)}
                      onCard={() => router.push(`/card?fontId=${font.id}`)}
                      onDelete={() => handleDelete(font)}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </div>
      </main>
    </>
  );
}

// ─── Font Card ────────────────────────────────────────────────────

interface FontCardProps {
  font:       UserFont;
  isDeleting: boolean;
  onEdit:     () => void;
  onPreview:  () => void;
  onCard:     () => void;
  onDelete:   () => void;
}

function FontCard({ font, isDeleting, onEdit, onPreview, onCard, onDelete }: FontCardProps) {
  const drawnCount = font.glyphs.filter((g) => g.isComplete).length;
  const total      = font.glyphs.length;
  const pct        = total > 0 ? Math.round((drawnCount / total) * 100) : 0;
  const displayName = font.name || 'Untitled font';

  return (
    <div
      className={`rounded-2xl border border-[#EAEAEA] bg-white p-5 transition-opacity
        ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}
    >
      {/* Top row: thumbnail + info */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#FAFAF8] border border-[#EAEAEA] flex items-center justify-center shrink-0 text-xl font-medium text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>
          Aa
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-medium text-[#1A1A1A] truncate">{displayName}</p>
            <span className="text-[10px] font-medium tracking-wider uppercase text-[#ABABAB] border border-[#EAEAEA] rounded-full px-2 py-0.5 shrink-0">
              {font.language.toUpperCase()}
            </span>
          </div>
          <p className="text-[11px] text-[#6B6B6B] whitespace-nowrap">
            {drawnCount}/{total} glyphs · {formatDate(font.updatedAt)}
          </p>

          <div className="mt-2.5 h-1 bg-[#F0F0EE] rounded-full overflow-hidden w-full max-w-[180px]">
            <div
              className="h-full bg-[#1A1A1A] rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action row — below info, full width */}
      <div className="mt-4 pt-3 border-t border-[#F5F5F3] flex items-center gap-1.5">
        <ActionBtn label="Edit"    onClick={onEdit} />
        <ActionBtn label="Preview" onClick={onPreview} />
        <ActionBtn label="Card"    onClick={onCard} />
        <div className="flex-1" />
        <ActionBtn label="Delete"  onClick={onDelete} danger />
      </div>
    </div>
  );
}

function ActionBtn({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`h-7 px-3 rounded-full text-[11px] font-medium transition-colors border
        ${danger
          ? 'border-transparent text-[#ABABAB] hover:text-red-500 hover:border-red-200'
          : 'border-[#EAEAEA] text-[#6B6B6B] hover:text-[#1A1A1A] hover:border-[#1A1A1A]'
        }`}
    >
      {label}
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────

function EmptyFontLibrary({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#F5F5F3] border border-[#EAEAEA] flex items-center justify-center text-3xl mb-6">
        ✍️
      </div>
      <p className="text-[10px] font-medium tracking-widest uppercase text-[#ABABAB] mb-3">
        No fonts yet
      </p>
      <p className="text-sm text-[#6B6B6B] mb-8 max-w-xs">
        Start drawing your handwriting to create your first personal font.
      </p>
      <button
        onClick={onStart}
        className="h-10 px-8 rounded-full bg-[#1A1A1A] text-[#FAFAF8] text-sm font-medium"
      >
        Start Drawing
      </button>
    </motion.div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────

function FontListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-[#EAEAEA] bg-white p-5 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F0F0EE]" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3.5 bg-[#F0F0EE] rounded w-32" />
              <div className="h-3 bg-[#F0F0EE] rounded w-48" />
              <div className="h-1 bg-[#F0F0EE] rounded w-40 mt-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Utils ────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
