'use client';

import { motion } from 'framer-motion';
import { pageVariants } from '@/lib/animations';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`min-h-screen bg-[#FAFAF8] ${className}`}
    >
      {children}
    </motion.div>
  );
}
