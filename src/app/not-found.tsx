import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[10px] font-medium tracking-widest uppercase text-[#ABABAB] mb-4">
        404
      </p>
      <h1 className="text-2xl font-normal text-[#1A1A1A] mb-3">
        Page not found
      </h1>
      <p className="text-sm text-[#6B6B6B] mb-10">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="h-10 px-6 rounded-full bg-[#1A1A1A] text-[#FAFAF8] text-sm font-medium inline-flex items-center"
      >
        Back to home
      </Link>
    </div>
  );
}
