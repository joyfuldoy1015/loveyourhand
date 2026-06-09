import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Header } from '@/components/layout';
import { CreateFlow } from '@/features/create-flow/CreateFlow';

export const metadata: Metadata = {
  title: 'Create Your Font',
  description: 'Draw your handwriting letter by letter to create your personal font.',
};

export default function CreatePage() {
  return (
    <>
      <Header minimal />
      <main className="flex-1 pt-16">
        <Suspense fallback={
          <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <CreateFlow />
        </Suspense>
      </main>
    </>
  );
}
