'use client';

import { useEffect } from 'react';
import { useDrawingStore } from '@/stores/drawingStore';

export function useMobile() {
  const setIsMobile = useDrawingStore((s) => s.setIsMobile);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [setIsMobile]);
}
