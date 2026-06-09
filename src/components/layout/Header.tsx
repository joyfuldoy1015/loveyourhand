'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface HeaderProps {
  minimal?: boolean;
}

export function Header({ minimal = false }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10"
    >
      <div className="h-16 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="text-sm font-medium tracking-tight text-[#1A1A1A] hover:opacity-70 transition-opacity">
          loveyourhand
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {!minimal && (
            <>
              <Link href="/create" className="text-xs font-medium tracking-widest uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                Create
              </Link>
            </>
          )}
          <Link href="/fonts" className="text-xs font-medium tracking-widest uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
            My Fonts
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
