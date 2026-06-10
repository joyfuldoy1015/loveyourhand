'use client';

import { useState } from 'react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui';
import { CARD_SIZE } from './PostitCard';
import { analytics } from '@/lib/analytics';

interface Props {
  cardRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
}

export function CardExporter({ cardRef, filename = 'loveyourhand-card' }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [justDone, setJustDone]       = useState(false);

  const handleExport = async () => {
    const el = cardRef.current;
    if (!el || isExporting) return;

    setIsExporting(true);
    try {
      const dataUrl = await toPng(el, {
        pixelRatio: 2,
        width:  CARD_SIZE,
        height: el.offsetHeight,
        quality: 1,
        cacheBust: true,
      });
      const a = document.createElement('a');
      a.download = `${filename}.png`;
      a.href = dataUrl;
      a.click();
      analytics.cardDownloaded();
      setJustDone(true);
      setTimeout(() => setJustDone(false), 2500);
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        size="lg"
        variant="primary"
        isLoading={isExporting}
        onClick={handleExport}
        className="w-full"
      >
        {justDone ? '✓ Downloaded!' : 'Download PNG'}
      </Button>

      <p className="text-center text-[10px] text-[#ABABAB]">
        1200px wide · 2× retina · PNG
      </p>
    </div>
  );
}
