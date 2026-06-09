'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { analytics } from '@/lib/analytics';

interface Props {
  fontId:      string;
  ttfBuffer:   ArrayBuffer | null;
  fontName:    string;
  isGenerating: boolean;
  onGenerate:  () => void;
}

export function FontActions({ fontId, ttfBuffer, fontName, isGenerating, onGenerate }: Props) {
  const router = useRouter();
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    if (!ttfBuffer) return;
    const blob = new Blob([ttfBuffer], { type: 'font/ttf' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${fontName.replace(/\s+/g, '-').toLowerCase()}.ttf`;
    a.click();
    URL.revokeObjectURL(url);
    analytics.fontDownloaded();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Generate / Regenerate */}
      <Button
        variant="primary"
        size="md"
        className="w-full"
        onClick={onGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating font…
          </span>
        ) : ttfBuffer ? (
          'Regenerate Font'
        ) : (
          'Generate Font'
        )}
      </Button>

      {/* Download TTF */}
      {ttfBuffer && (
        <Button
          variant="secondary"
          size="md"
          className="w-full"
          onClick={handleDownload}
        >
          {downloaded ? 'Downloaded!' : 'Download .ttf'}
        </Button>
      )}

      {/* Create Card */}
      <Button
        variant="ghost"
        size="md"
        className="w-full"
        onClick={() => router.push(`/card?fontId=${fontId}`)}
      >
        Create Card →
      </Button>

      {/* Start Over */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-[#ABABAB]"
        onClick={() => router.push('/create')}
      >
        Start Over
      </Button>
    </div>
  );
}
