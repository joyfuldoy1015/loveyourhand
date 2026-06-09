'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[GlobalError]', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[10px] font-medium tracking-widest uppercase text-[#ABABAB] mb-4">
        Error
      </p>
      <h1 className="text-2xl font-normal text-[#1A1A1A] mb-3">
        Something went wrong
      </h1>
      <p className="text-sm text-[#6B6B6B] mb-10 max-w-sm">
        {error.message || 'An unexpected error occurred. Your work is saved locally.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="h-10 px-6 rounded-full bg-[#1A1A1A] text-[#FAFAF8] text-sm font-medium"
        >
          Try again
        </button>
        <button
          onClick={() => router.push('/')}
          className="h-10 px-6 rounded-full border border-[#EAEAEA] text-sm text-[#1A1A1A]"
        >
          Go home
        </button>
      </div>
    </div>
  );
}
