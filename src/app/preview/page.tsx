import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FontPreviewClient } from '@/features/font-preview/FontPreviewClient';

export const metadata: Metadata = {
  title: 'Font Preview',
  description: 'Preview your handwriting font and download as a .ttf file.',
};

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8]" />}>
      <FontPreviewClient />
    </Suspense>
  );
}
