'use client';

import { useEffect, useRef } from 'react';
import { useFontStore } from '@/stores/fontStore';

const INTERVAL_MS = 5000;

export function useAutoSave() {
  const { currentFont, saveCurrentFont } = useFontStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!currentFont) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      saveCurrentFont();
    }, INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentFont?.id, saveCurrentFont]);
}
