import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto py-8 px-6 border-t border-[#EAEAEA]">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-[#6B6B6B] tracking-wide">loveyourhand.app</span>
        <nav className="flex items-center gap-6" aria-label="Footer navigation">
          <Link href="/create" className="text-xs text-[#ABABAB] hover:text-[#6B6B6B] transition-colors">
            Create
          </Link>
          <Link href="/fonts" className="text-xs text-[#ABABAB] hover:text-[#6B6B6B] transition-colors">
            My Fonts
          </Link>
        </nav>
        <span className="text-xs text-[#ABABAB]">Love your hand.</span>
      </div>
    </footer>
  );
}
