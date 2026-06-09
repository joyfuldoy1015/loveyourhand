import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardPageClient } from './CardPageClient';

export const metadata: Metadata = {
  title: 'Create Card',
  description: 'Turn your handwriting into a beautiful shareable card.',
};

export default function CardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8]" />}>
      <CardPageClient />
    </Suspense>
  );
}
