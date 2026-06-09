'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, fadeUp } from '@/lib/animations';
import { Button } from '@/components/ui';

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Subtle grid background */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-2xl w-full text-center"
      >
        {/* Tagline */}
        <motion.p variants={staggerItem} className="text-label text-[#6B6B6B] mb-8">
          Handwriting → Font → Card
        </motion.p>

        {/* Hero heading */}
        <motion.h1
          variants={staggerItem}
          className="text-display font-normal text-[#1A1A1A] mb-6 leading-none tracking-[-0.04em]"
        >
          LOVE
          <br />
          YOUR
          <br />
          HAND.
        </motion.h1>

        {/* Sub copy */}
        <motion.p
          variants={staggerItem}
          className="text-body text-[#6B6B6B] max-w-sm mx-auto mb-12"
        >
          Turn your handwriting into a font
          <br />
          and something worth sharing.
        </motion.p>

        {/* CTA */}
        <motion.div
          variants={staggerItem}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            size="lg"
            variant="primary"
            onClick={() => router.push('/create')}
          >
            Make Your Font
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={() => {
              document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            See Examples
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-0 right-0 flex justify-center"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-medium tracking-widest uppercase text-[#6B6B6B]">Scroll</span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-px h-6 bg-[#EAEAEA]"
          />
        </div>
      </motion.div>
    </section>
  );
}
