'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { fontRepo } from '@/lib/db';
import { analytics } from '@/lib/analytics';
import type { UserFont } from '@/types';

export function SessionRecoveryBanner() {
  const router = useRouter();
  const [font, setFont] = useState<UserFont | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fontRepo.getLatest().then((f) => {
      if (f && f.glyphs.some((g) => g.isComplete)) {
        setFont(f);
      }
    });
  }, []);

  const handleContinue = () => {
    if (!font) return;
    analytics.sessionRecovered(font.name);
    router.push(`/create?fontId=${font.id}`);
  };

  const drawnCount = font?.glyphs.filter((g) => g.isComplete).length ?? 0;

  return (
    <AnimatePresence>
      {font && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="fixed top-[60px] left-0 right-0 z-40 flex justify-center px-4 pointer-events-none"
        >
          <div
            className="pointer-events-auto flex items-center gap-4 bg-white border border-[#EAEAEA] rounded-2xl px-5 py-3 shadow-sm max-w-lg w-full"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
          >
            {/* Icon */}
            <div className="w-8 h-8 rounded-xl bg-[#FAFAF8] border border-[#EAEAEA] flex items-center justify-center shrink-0 text-base">
              ✍️
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#1A1A1A] truncate">
                Continue with &ldquo;{font.name}&rdquo;
              </p>
              <p className="text-[11px] text-[#6B6B6B]">
                {drawnCount} glyph{drawnCount !== 1 ? 's' : ''} drawn · last edited{' '}
                {formatRelative(font.updatedAt)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleContinue}
                className="h-7 px-4 rounded-full bg-[#1A1A1A] text-[#FAFAF8] text-xs font-medium whitespace-nowrap"
              >
                Continue
              </button>
              <button
                onClick={() => setDismissed(true)}
                aria-label="Dismiss"
                className="w-6 h-6 flex items-center justify-center text-[#ABABAB] hover:text-[#6B6B6B] transition-colors text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function formatRelative(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)    return 'just now';
  if (mins < 60)   return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days === 1)  return 'yesterday';
  return `${days}d ago`;
}
